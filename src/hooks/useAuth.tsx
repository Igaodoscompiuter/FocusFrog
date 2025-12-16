
import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { User } from '@supabase/supabase-js';
import { useUserData } from './useUserData';

// 1. Definir a interface para o valor do contexto
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

// 2. Criar o Contexto de Autenticação com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Criar o componente Provedor (AuthProvider)
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { syncLocalToSupabase } = useUserData();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
            setIsLoading(false);
        };

        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user ?? null;
                setUser(currentUser);
                setIsLoading(false);

                if (event === 'SIGNED_IN' && currentUser) {
                    await syncLocalToSupabase(currentUser);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [syncLocalToSupabase]);

    const signInWithGoogle = async () => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) {
            console.error("Erro no login com Google:", error.message);
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        await supabase.auth.signOut();
        setUser(null); // Assegura que o estado do usuário seja limpo imediatamente
        setIsLoading(false);
    };

    // 4. Montar o valor a ser fornecido pelo contexto
    const value = {
        user,
        isLoading,
        signInWithGoogle,
        signOut
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 5. Criar o hook customizado useAuth para consumir o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
