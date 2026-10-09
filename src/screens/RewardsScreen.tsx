import React, { useState, useRef, useEffect } from 'react';
import { useUI } from '../context/UIContext';
import { useTour } from '../components/tour/TourContext';
import { getInstalledVersion } from '../utils/updateCheck';
import { UPDATE_CHECK_EVENT } from '../components/UpdateAvailableModal';
import { Capacitor } from '@capacitor/core';
import { isDistractionGuardOn, setDistractionGuard } from '../notifications';
import { useUserData } from '../hooks/useUserData';
import { useAuth, AuthProviderName } from '../hooks/useAuth';
import { getLocalBackup, restoreLocalBackup } from '../sync/cloudSync';
import { GoogleIcon, FacebookIcon } from './OnboardingAccountScreen';
import './OnboardingAccountScreen.css';
import { User } from '@supabase/supabase-js';
import styles from './RewardsScreen.module.css';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import UpdatePrompt from '../components/UpdatePrompt';
import { FiCloudLightning, FiUpload, FiChevronRight, FiLayout, FiDatabase, FiInfo, FiVolume2, FiZap, FiArrowLeft, FiDownload, FiTrash2, FiInstagram, FiType, FiUser, FiLogIn, FiLogOut, FiCheckCircle, FiHeart, FiCoffee, FiHardDrive, FiHelpCircle, FiShield } from 'react-icons/fi';
import focusfrogCoffee from '../assets/focusfrog-coffee.png';
import { FontSize } from '../context/UIContext';
import { useBackHandler } from '../hooks/useBackHandler';

// Chave Pix (telefone) do apoio ao projeto
const PIX_KEY = '41988094386';

// --- COMPONENTES DE NAVEGAÇÃO E CABEÇALHO ---
const SettingsNavRow: React.FC<{icon: React.ElementType, title: string, description: string, onClick?: () => void}> = ({ icon: Icon, title, description, onClick }) => (
    <div className={styles.settingsGroup} onClick={onClick}>
        <div className={styles.navRow}>
            <div className={styles.navRowIconWrapper}><Icon /></div>
            <div className={styles.navRowText}>
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
            {onClick && <span className={styles.navRowChevron}><FiChevronRight /></span>}
        </div>
    </div>
);

const SubScreenHeader: React.FC<{title: string, onBack: () => void}> = ({ title, onBack }) => (
    <div className={styles.subScreenHeader}>
        <button onClick={onBack} className={styles.backButton}><FiArrowLeft /></button>
        <h3>{title}</h3>
    </div>
);

const SegmentedControl: React.FC<{options: {label: string, value: FontSize}[], value: FontSize, onChange: (value: FontSize) => void}> = ({ options, value, onChange }) => (
    <div className={styles.segmentedControl}>
        {options.map(opt => (
            <button 
                key={opt.value} 
                className={opt.value === value ? styles.active : ''} 
                onClick={() => onChange(opt.value)}
            >
                {opt.label}
            </button>
        ))}
    </div>
);


// --- SUB-TELAS DE CONFIGURAÇÕES ---

const PROVIDER_LABEL: Record<string, string> = { google: 'Google', facebook: 'Facebook' };

const formatWhen = (ts: number | null) => {
    if (!ts) return 'ainda não sincronizou';
    const d = new Date(ts);
    const today = new Date();
    const sameDay = d.toDateString() === today.toDateString();
    const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return sameDay ? `hoje às ${hm}` : `${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${hm}`;
};

const SYNC_MSG: Record<string, [string, string, 'success' | 'info' | 'error']> = {
    pushed: ['Tudo salvo na nuvem.', '☁️', 'success'],
    pulled: ['Dados atualizados de outro aparelho. Recarregando…', '🔄', 'success'],
    offline: ['Sem internet agora. Tentamos de novo depois.', '📶', 'info'],
    error: ['Não deu pra sincronizar agora. Tente mais tarde.', '❌', 'error'],
    skipped: ['Nada pra sincronizar.', 'ℹ️', 'info'],
};

const ProfileScreen: React.FC<{onBack: () => void}> = ({ onBack }) => {
    const { user, isConfigured, isSigningIn, lastSyncAt, signIn, signOut, syncNowManual } = useAuth();
    const { addNotification } = useUI();
    const [pendingProvider, setPendingProvider] = useState<AuthProviderName | null>(null);
    const [confirmLogout, setConfirmLogout] = useState(false);
    const [confirmUndo, setConfirmUndo] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const backup = getLocalBackup();

    if (!isConfigured) {
        return (
            <div className={`${styles.tabContent} ${styles.profileScreen}`}>
                <SubScreenHeader title="Conta e Sincronização" onBack={onBack} />
                <div className={styles.authCard}>
                    <span className={styles.authIcon}><FiCloudLightning size={40} /></span>
                    <h3>Sincronização indisponível</h3>
                    <p>Esta versão do app não tem a nuvem configurada. Seus dados continuam salvos neste celular.</p>
                </div>
            </div>
        );
    }

    const handleSync = async () => {
        setSyncing(true);
        const r = await syncNowManual();
        setSyncing(false);
        const [msg, icon, kind] = SYNC_MSG[r];
        addNotification(msg, icon, kind);
    };

    const handleUndo = async () => {
        setConfirmUndo(false);
        if (await restoreLocalBackup()) {
            addNotification('Dados anteriores do aparelho restaurados. Recarregando…', '↩️', 'success');
            setTimeout(() => window.location.reload(), 800);
        }
    };

    const provider = (user?.app_metadata?.provider as string) || '';
    const name = (user?.user_metadata?.full_name || user?.user_metadata?.name) as string | undefined;

    return (
        <div className={`${styles.tabContent} ${styles.profileScreen}`}>
            <SubScreenHeader title="Conta e Sincronização" onBack={onBack} />

            {user ? (
                <div className={styles.authCard}>
                    <span className={styles.authIcon}><FiCheckCircle size={40} /></span>
                    <h3>{name || 'Conectado'}</h3>
                    <p className={styles.accountMeta}>
                        {user.email}{provider && PROVIDER_LABEL[provider] ? ` · ${PROVIDER_LABEL[provider]}` : ''}
                    </p>
                    <p className={styles.accountSync}>Última sincronização: <strong>{formatWhen(lastSyncAt)}</strong></p>
                    <p className={styles.accountNote}>O app sincroniza sozinho uma vez por dia ao abrir. Tarefas, rotinas, pontos e sapos ficam guardados na sua conta.</p>
                    <div className={styles.accountActions}>
                        <button className="btn btn-primary" onClick={handleSync} disabled={syncing}>
                            <FiCloudLightning /> {syncing ? 'Sincronizando…' : 'Sincronizar agora'}
                        </button>
                        <button className="btn btn-secondary" onClick={() => setConfirmLogout(true)}>
                            <FiLogOut /> Sair da conta
                        </button>
                    </div>
                </div>
            ) : (
                <div className={styles.authCard}>
                    <span className={styles.authIcon}><FiCloudLightning size={40} /></span>
                    <h3>Guarde seu progresso na nuvem</h3>
                    <p>Entre com uma conta pra não perder tarefas, rotinas, pontos e sapos se trocar de celular.</p>
                    <div className={styles.accountActions}>
                        <button className="account-btn account-google" onClick={() => setPendingProvider('google')} disabled={isSigningIn}>
                            <GoogleIcon /> Entrar com Google
                        </button>
                        <button className="account-btn account-facebook" onClick={() => setPendingProvider('facebook')} disabled={isSigningIn}>
                            <FacebookIcon /> Entrar com Facebook
                        </button>
                    </div>
                    {isSigningIn && <p className={styles.accountSync}>Esperando o login no navegador…</p>}
                    <p className={styles.accountNote}>Se a conta já tiver dados, eles substituem os deste celular. Uma cópia do que está aqui fica guardada por 7 dias.</p>
                </div>
            )}

            {backup && (
                <div className={styles.undoCard}>
                    <p>Cópia dos dados anteriores deste celular, de {formatWhen(backup.savedAt)}.</p>
                    <button className="btn btn-secondary" onClick={() => setConfirmUndo(true)}>Desfazer e voltar pra ela</button>
                </div>
            )}

            {pendingProvider && (
                <ConfirmationModal
                    title={`Entrar com ${PROVIDER_LABEL[pendingProvider]}?`}
                    message="Se essa conta já tiver dados salvos, eles vão substituir os deste celular (guardamos uma cópia por 7 dias, dá pra desfazer aqui). Se for uma conta nova, o que está neste celular sobe pra ela."
                    confirmText="Entrar"
                    onConfirm={() => { const p = pendingProvider; setPendingProvider(null); signIn(p, 'settings'); }}
                    onCancel={() => setPendingProvider(null)}
                />
            )}
            {confirmLogout && (
                <ConfirmationModal
                    title="Sair da conta?"
                    message="Antes de sair, salvamos tudo na nuvem. Seus dados continuam neste celular e você pode entrar de novo quando quiser."
                    confirmText="Sair"
                    onConfirm={async () => { setConfirmLogout(false); await signOut(); addNotification('Você saiu da conta.', '👋', 'info'); }}
                    onCancel={() => setConfirmLogout(false)}
                />
            )}
            {confirmUndo && (
                <ConfirmationModal
                    title="Desfazer o login?"
                    message="O celular volta pros dados que tinha antes de entrar na conta, e você sai da conta. A nuvem não é alterada."
                    confirmText="Desfazer"
                    variant="danger"
                    onConfirm={handleUndo}
                    onCancel={() => setConfirmUndo(false)}
                />
            )}
        </div>
    );
};

const DataScreen: React.FC<{ 
    onBack: () => void;
    exportData: () => void;
    importDataFromFile: (file: File) => void;
    showResetModal: () => void;
}> = ({ onBack, exportData, importDataFromFile, showResetModal }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importDataFromFile(file);
        }
    };

    return (
        <div className={styles.tabContent}>
            <SubScreenHeader title="Dados do Aplicativo" onBack={onBack} />
            
            <div className={styles.dataInfoCard}>
                <FiHardDrive className={styles.dataInfoIcon} />
                <div>
                    <h4>Seu cofre de dados local</h4>
                    <p>
                        O FocusFrog salva tudo diretamente no seu dispositivo. Para evitar perdas, use os botões abaixo para <strong>Exportar (salvar)</strong> um arquivo de segurança e <strong>Importar (restaurar)</strong> seus dados.
                    </p>
                </div>
            </div>

            <div className={styles.dataActions}>
                <button className="btn btn-secondary" onClick={exportData}>
                    <FiDownload /> Exportar para Arquivo
                </button>
                <button className="btn btn-secondary" onClick={handleImportClick}>
                    <FiUpload /> Importar de Arquivo
                </button>
                <button className={`btn ${styles.buttonDanger}`} onClick={showResetModal}>
                    <FiTrash2 /> Resetar Dados Locais
                </button>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL ---
export const RewardsScreen: React.FC = () => {
    const { 
        addNotification, 
        soundEnabled, 
        toggleSoundEnabled, 
        hapticsEnabled, 
        setHapticsEnabled, 
        setDevModeEnabled, 
        fontSize, 
        setFontSize
    } = useUI();
    const { exportData, importDataFromFile, resetData } = useUserData();
    const { restart: restartTour } = useTour();
    // versão real instalada (APK) — antes o texto era fixo e desatualizava
    const [appVersion, setAppVersion] = useState(__APP_VERSION__);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest'>('idle');
    useEffect(() => { getInstalledVersion().then(v => { if (v) setAppVersion(v.versionName); }); }, []);
    useEffect(() => {
        const onResult = (e: Event) => setUpdateStatus((e as CustomEvent).detail?.found ? 'idle' : 'latest');
        window.addEventListener('focusfrog:update-result', onResult);
        return () => window.removeEventListener('focusfrog:update-result', onResult);
    }, []);
    const handleCheckUpdate = () => { setUpdateStatus('checking'); window.dispatchEvent(new Event(UPDATE_CHECK_EVENT)); };
    const [guardOn, setGuardOn] = useState(isDistractionGuardOn);
    const toggleGuard = (v: boolean) => { setGuardOn(v); setDistractionGuard(v); };
    const { user: authUser, isLoading } = useAuth();
    
    const [activeSettingsScreen, setActiveSettingsScreen] = useState('main');
    useBackHandler(() => setActiveSettingsScreen('main'), activeSettingsScreen !== 'main');
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const [devTapCount, setDevTapCount] = useState(0);
    const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleVersionClick = () => {
        if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
        const newCount = devTapCount + 1;
        setDevTapCount(newCount);
        if (newCount >= 7) {
            setDevModeEnabled(true);
            addNotification('Modo de Desenvolvedor Ativado', '👾', 'info');
            setDevTapCount(0);
        } else {
            tapTimeoutRef.current = setTimeout(() => setDevTapCount(0), 1500);
        }
    };
    
    const showResetModal = () => setIsResetModalVisible(true);
    const hideResetModal = () => setIsResetModalVisible(false);
    const confirmReset = () => {
        resetData();
        hideResetModal();
    };

    const handleHapticsChange = (enabled: boolean) => {
        setHapticsEnabled(enabled);
        if (enabled && navigator.vibrate) navigator.vibrate(50);
    };

    const handlePixClick = async () => {
        // Copia a chave (não existe um jeito padrão de abrir "o app do banco"
        // direto — o fluxo comum é copiar e colar no Pix do banco).
        try {
            await navigator.clipboard.writeText(PIX_KEY);
        } catch {
            const t = document.createElement('textarea');
            t.value = PIX_KEY; document.body.appendChild(t); t.select();
            document.execCommand('copy'); t.remove();
        }
        addNotification('Chave Pix copiada! Cole no Pix do seu banco. Obrigado pelo apoio 💚', '🐸', 'success');
    };

    const handleCoffeeClick = () => {
        window.open('https://focusfrog.netlify.app/', '_blank');
    };

    const renderSettingsContent = () => {
        switch (activeSettingsScreen) {
            case 'profile':
                return <ProfileScreen onBack={() => setActiveSettingsScreen('main')} />;
            // CONTEÚDO DA TELA DE APARÊNCIA RESTAURADO
            case 'appearance':
                return (
                    <div className={styles.tabContent}>
                        <SubScreenHeader title="Aparência" onBack={() => setActiveSettingsScreen('main')} />
                        <div className={styles.settingRow}>
                            <label><FiVolume2 /> Efeitos sonoros</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={soundEnabled} onChange={toggleSoundEnabled} />
                                <span className={styles.switchSlider}></span>
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <label><FiZap/> Vibração (Haptics)</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={hapticsEnabled} onChange={(e) => handleHapticsChange(e.target.checked)} />
                                <span className={styles.switchSlider}></span>
                            </label>
                        </div>
                        <div className={styles.settingRow}>
                            <label><FiType /> Tamanho do Texto</label>
                            <SegmentedControl 
                                options={[{label: 'P', value: 'small'}, {label: 'N', value: 'normal'}, {label: 'G', value: 'large'}]}
                                value={fontSize}
                                onChange={(value) => setFontSize(value as FontSize)}
                            />
                        </div>
                    </div>
                );
            case 'data':
                 return <DataScreen 
                    onBack={() => setActiveSettingsScreen('main')}
                    exportData={exportData}
                    importDataFromFile={(file) => importDataFromFile(file, null)} // Sync em nuvem ainda não existe — sempre local (user: null)
                    showResetModal={showResetModal}
                />;
            // CONTEÚDO DA TELA SOBRE RESTAURADO
            case 'about':
                 return (
                    <div className={`${styles.tabContent} ${styles.aboutScreen}`}>
                        <SubScreenHeader title="De Usuário para Usuário 🐸" onBack={() => setActiveSettingsScreen('main')} />
                        <div className={styles.aboutContentWrapper}>
                            <img src={focusfrogCoffee} alt="Mascote FocusFrog com café" className={styles.aboutAppIcon} />
                            <div className={styles.founderCard}>
                                <div className={styles.founderHeader}>
                                    <FiUser className={styles.founderIcon} />
                                    <p className={styles.founderGreeting}>Olá! Eu sou o Igor, e antes de ser o fundador, eu sou o<br /><strong>usuário #1</strong> do FocusFrog.</p>
                                </div>
                                <div className={styles.founderBody}>
                                    <p>Esta ferramenta não nasceu de um plano de negócios, mas da <strong>necessidade real</strong>. Eu luto diariamente contra a paralisia da escolha, o caos nas rotinas e o esquecimento constante, <strong>assim como você</strong>.</p>
                                    <p>Entendi que o cérebro com TDAH e criatividade precisa de <strong>apoio</strong>, não de cobrança. Por isso, construí o FocusFrog: um sistema que realmente funciona para mim.</p>
                                </div>
                            </div>

                            <div className={styles.supportCard}>
                                <div className={styles.missionStatement}>
                                     <FiHeart className={styles.missionIcon}/>
                                    <h3>Nossa Missão</h3>
                                    <p>Levar <strong>PRODUTIVIDADE CALMA</strong> e clareza para todos que se sentem sobrecarregados.</p>
                                </div>
                                <p>Ao apoiar esta missão, você garante que o FocusFrog permaneça <strong>livre de anúncios</strong> e continue a evoluir para a nossa comunidade.</p>
                            </div>

                            <div className={styles.socialActions}>
                                <button className={styles.coffeeButton} onClick={handleCoffeeClick}>
                                    <FiCoffee /> Apoie com um café
                                </button>
                                <a href="https://www.instagram.com/focus.frog" target="_blank" rel="noopener noreferrer" className={styles.instagramButton}>
                                    <FiInstagram /> Siga-nos
                                </a>
                                <button className={styles.pixButton} onClick={handlePixClick}>
                                    <span className={styles.pixIcon}>◆</span> Apoiar via Pix
                                </button>
                            </div>

                            {Capacitor.isNativePlatform() && (
                                <button className={styles.updateButton} onClick={handleCheckUpdate} disabled={updateStatus === 'checking'}>
                                    {updateStatus === 'checking' ? 'Verificando…' : updateStatus === 'latest' ? '✓ Você está na versão mais recente' : 'Verificar atualizações'}
                                </button>
                            )}
                            <div className={styles.appVersion} onClick={handleVersionClick}>FocusFrog v{appVersion} • Feito com 💚🐸</div>
                        </div>
                    </div>
                );
            case 'main':
            default:
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.header}><h2>Ajustes</h2></div>
                        <SettingsNavRow icon={FiUser} title="Conta e Sincronização" description={authUser ? `Conectado · ${authUser.email ?? 'conta'}` : 'Entrar com Google ou Facebook'} onClick={() => setActiveSettingsScreen('profile')} />
                        <SettingsNavRow icon={FiLayout} title="Aparência" description="Ajuste tema, sons e outros." onClick={() => setActiveSettingsScreen('appearance')} />
                        <SettingsNavRow icon={FiDatabase} title="Gerenciar Dados" description="Backup, restauração e reset." onClick={() => setActiveSettingsScreen('data')} />
                        <div className={styles.guardRow}>
                            <div className={styles.settingRow}>
                                <label><FiShield /> Proteger o foco</label>
                                <label className={styles.switch}>
                                    <input type="checkbox" checked={guardOn} onChange={e => toggleGuard(e.target.checked)} />
                                    <span className={styles.switchSlider}></span>
                                </label>
                            </div>
                            <p className={styles.guardHint}>
                                Te cutuca quando você sai pra outro app durante o foco, e o sapo só vem se o foco foi limpo.
                                Desligue se as suas tarefas são feitas no celular.
                            </p>
                        </div>
                        <SettingsNavRow icon={FiHelpCircle} title="Refazer tutorial" description="O sapinho te mostra o app de novo." onClick={restartTour} />
                        <SettingsNavRow icon={FiInfo} title="Sobre" description="Nossa história e missão." onClick={() => setActiveSettingsScreen('about')} />
                    </div>
                );
        }
    }

    return (
        <main className="screen-content">
             {isResetModalVisible && <ConfirmationModal title="Resetar Todos os Dados" message="Tem a certeza? Esta ação é irreversível e irá apagar todas as suas tarefas, pontos e personalizações." confirmText="Sim, Resetar Tudo" cancelText="Cancelar" onConfirm={confirmReset} onCancel={hideResetModal} variant="danger" icon="trash" />}
            {isLoading ? <p>Carregando...</p> : renderSettingsContent()}
        </main>
    );
};
