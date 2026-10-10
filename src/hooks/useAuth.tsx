import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { handleLogin, syncNow, clearSyncMeta, pushLocal, getLastSyncAt, SyncOutcome } from '../sync/cloudSync';
import { trackLogin, trackUserCreation } from '../analytics';

export type AuthProviderName = 'google' | 'facebook';
export type LoginOrigin = 'onboarding' | 'settings';

const ORIGIN_KEY = 'focusfrog_auth_origin';            // de onde o login partiu (sobrevive ao vaivém do navegador)
export const PENDING_UPLOAD_KEY = 'focusfrog_pending_first_upload'; // conta nova: sobe após salvar o nome
const NATIVE_REDIRECT = 'com.focusfrog.app://auth-callback';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isConfigured: boolean;
    /** login em andamento (entre tocar no botão e voltar pro app) */
    isSigningIn: boolean;
    lastSyncAt: number | null;
    signIn: (provider: AuthProviderName, origin: LoginOrigin) => Promise<void>;
    signOut: () => Promise<void>;
    syncNowManual: () => Promise<SyncOutcome>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Recarrega o app pra todos os contextos lerem os dados que vieram da nuvem. */
const reloadWithData = () => setTimeout(() => window.location.reload(), 150);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [lastSyncAt, setLastSyncAt] = useState<number | null>(getLastSyncAt());
    const handled = useRef<string | null>(null);

    // Depois do login: decide restaurar / pedir nome / subir, conforme a origem.
    const afterSignIn = useCallback(async (u: User) => {
        const origin = localStorage.getItem(ORIGIN_KEY) as LoginOrigin | null;
        if (!origin || handled.current === u.id) return;
        handled.current = u.id;
        localStorage.removeItem(ORIGIN_KEY);
        try {
            const outcome = await handleLogin(u.id, origin);
            const provider = (u.app_metadata?.provider as string) || 'unknown';
            if (outcome === 'new-account' || outcome === 'uploaded') trackUserCreation(provider); else trackLogin(provider);
            setLastSyncAt(getLastSyncAt());
            if (outcome === 'restored') { reloadWithData(); return; }
            if (outcome === 'new-account') {
                // conta nova vinda da 1ª abertura: o nome fica VAZIO na tela
                // seguinte e a conta só sobe depois que a pessoa salvar o nome
                localStorage.removeItem('focusfrog_userName');
                localStorage.setItem(PENDING_UPLOAD_KEY, u.id);
                localStorage.setItem('focusfrog_account_choice', 'cloud');
                reloadWithData();
            }
        } catch (e) {
            console.warn('[auth] pós-login falhou:', e);
        } finally {
            setIsSigningIn(false);
        }
    }, []);

    useEffect(() => {
        if (!isSupabaseConfigured) { setIsLoading(false); return; }

        supabase.auth.getSession().then(({ data: { session } }) => {
            const u = session?.user ?? null;
            setUser(u);
            setIsLoading(false);
            // sincronização diária ao abrir (pula se já sincronizou nas últimas 24h)
            if (u && !localStorage.getItem(ORIGIN_KEY) && !localStorage.getItem(PENDING_UPLOAD_KEY)) {
                syncNow(u.id).then(r => { setLastSyncAt(getLastSyncAt()); if (r === 'pulled') reloadWithData(); });
            }
        });

        const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
            const u = session?.user ?? null;
            setUser(u);
            setIsLoading(false);
            if (event === 'SIGNED_IN' && u) afterSignIn(u);
        });

        // Android: o navegador devolve com.focusfrog.app://auth-callback?code=...
        let urlSub: { remove: () => void } | undefined;
        if (Capacitor.isNativePlatform()) {
            CapApp.addListener('appUrlOpen', async ({ url }) => {
                if (!url.startsWith(NATIVE_REDIRECT)) return;
                Browser.close().catch(() => {});
                const params = new URL(url.replace(NATIVE_REDIRECT, 'https://x/cb')).searchParams;
                const code = params.get('code');
                if (code) {
                    const { error } = await supabase.auth.exchangeCodeForSession(code);
                    if (error) { console.warn('[auth] troca do código falhou:', error.message); setIsSigningIn(false); }
                } else {
                    setIsSigningIn(false); // cancelou ou deu erro no provedor
                }
            }).then(h => { urlSub = h; });
            // voltou pro app sem concluir o login (fechou a aba): libera o botão
            CapApp.addListener('appStateChange', ({ isActive }) => {
                if (isActive) setTimeout(() => setIsSigningIn(s => (s && !localStorage.getItem(ORIGIN_KEY) ? false : s)), 1500);
            });
        }

        return () => { sub.subscription.unsubscribe(); urlSub?.remove(); };
    }, [afterSignIn]);

    const signIn = useCallback(async (provider: AuthProviderName, origin: LoginOrigin) => {
        if (!isSupabaseConfigured) return;
        setIsSigningIn(true);
        localStorage.setItem(ORIGIN_KEY, origin);
        handled.current = null;
        const native = Capacitor.isNativePlatform();
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: native ? NATIVE_REDIRECT : window.location.origin,
                skipBrowserRedirect: native, // no Android abrimos numa aba do navegador
                queryParams: provider === 'google' ? { prompt: 'select_account' } : undefined,
            },
        });
        if (error || !data?.url) {
            console.warn('[auth] login falhou:', error?.message);
            localStorage.removeItem(ORIGIN_KEY);
            setIsSigningIn(false);
            return;
        }
        if (native) await Browser.open({ url: data.url, presentationStyle: 'popover' });
    }, []);

    const signOut = useCallback(async () => {
        // sobe o que tem antes de sair, pra não perder o dia
        if (user) { try { await pushLocal(user.id); } catch { /* offline: sai mesmo assim */ } }
        await supabase.auth.signOut();
        clearSyncMeta();
        localStorage.removeItem(PENDING_UPLOAD_KEY);
        setLastSyncAt(null);
    }, [user]);

    const syncNowManual = useCallback(async () => {
        if (!user) return 'skipped' as SyncOutcome;
        const r = await syncNow(user.id, { force: true });
        setLastSyncAt(getLastSyncAt());
        if (r === 'pulled') reloadWithData();
        return r;
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, isLoading, isConfigured: isSupabaseConfigured, isSigningIn, lastSyncAt, signIn, signOut, syncNowManual }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    return context;
};
