
import React, { useState, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { useUserData } from '../hooks/useUserData';
import { useAuth, AuthState } from '../hooks/useAuth';
import styles from './RewardsScreen.module.css';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { FiChevronRight, FiLayout, FiDatabase, FiInfo, FiVolume2, FiZap, FiArrowLeft, FiDownload, FiUpload, FiTrash2, FiCheck, FiInstagram, FiType, FiUser, FiLogIn, FiLogOut, FiCheckCircle, FiHeart, FiCoffee } from 'react-icons/fi';
import focusfrogCoffee from '../assets/focusfrog-coffee.png'; // Alterado de appIcon
import { FontSize } from '../context/UIContext';

// --- COMPONENTES INTERNOS ---
const SettingsNavRow: React.FC<{icon: React.ElementType, title: string, description: string, onClick?: () => void}> = ({ icon: Icon, title, description, onClick }) => (
    <div className={styles.settingsGroup} onClick={onClick}>
        <div className={styles.navRow}>
            <div className={styles.navRowIconWrapper}><Icon /></div>
            <div className={styles.navRowText}>
                <h4>{title}</h4>
                <p>{description}</p>
            </div>
            <FiChevronRight className={styles.navRowChevron} />
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

const ProfileScreen: React.FC<{auth: AuthState, onBack: () => void}> = ({ auth, onBack }) => {
    const { user, isAnonymous, upgradeToGoogle, signOut } = auth;

    if (isAnonymous) {
        return (
            <div className={`${styles.tabContent} ${styles.profileScreen}`}>
                <SubScreenHeader title="Perfil e Sincronização" onBack={onBack} />
                <div className={styles.authCard}>
                    <FiLogIn size={40} className={styles.authIcon} />
                    <h3>Salve seu Progresso</h3>
                    <p>Crie uma conta gratuita para fazer backup e sincronizar suas tarefas e conquistas em todos os seus dispositivos.</p>
                    <button onClick={upgradeToGoogle} className="g-button">
                        <img src="/google-logo.svg" alt="Google" style={{width: 20, height: 20, marginRight: 10}}/>
                        Continuar com Google
                    </button>
                </div>
            </div>
        );
    }

    return (
         <div className={`${styles.tabContent} ${styles.profileScreen}`}>
            <SubScreenHeader title="Perfil e Sincronização" onBack={onBack} />
            <div className={styles.authCard}>
                <FiCheckCircle size={40} className={styles.authIconSuccess} />
                <h3>Tudo Sincronizado!</h3>
                <p>Você está logado como:</p>
                <strong>{user?.displayName || 'Usuário'}</strong>
                <small>{user?.email}</small>
                <button onClick={signOut} className={`btn ${styles.buttonDanger} ${styles.signOutButton}`}>
                    <FiLogOut/> Sair
                </button>
            </div>
        </div>
    );
}


// --- COMPONENTE PRINCIPAL ---
export const RewardsScreen: React.FC = () => {
    const { 
        addNotification, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled, 
        setDevModeEnabled, fontSize, setFontSize
    } = useUI();
    const { exportData, importData, resetData } = useUserData();
    const auth = useAuth();
    
    const [activeSettingsScreen, setActiveSettingsScreen] = useState('main');
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
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
    
    const handleImportClick = () => fileInputRef.current?.click();
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) importData(file);
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

    const handleCoffeeClick = () => {
        window.open('https://shop.beacons.ai/focus.frog/667fee49-a713-4a08-b541-e40ae2321696?pageViewSource=lib_view&referrer=https%3A%2F%2Fbeacons.ai%2Ffocus.frog&show_back_button=true', '_blank');
    };

    const renderSettingsContent = () => {
        switch (activeSettingsScreen) {
            case 'profile':
                return <ProfileScreen auth={auth} onBack={() => setActiveSettingsScreen('main')} />;
            case 'appearance':
                return (
                    <div className={styles.tabContent}>
                        <SubScreenHeader title="Aparência" onBack={() => setActiveSettingsScreen('main')} />
                        <div className={styles.settingRow}>
                            <label><FiVolume2 /> Efeitos sonoros</label>
                            <label className={styles.switch}>
                                <input type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
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
                 return (
                    <div className={styles.tabContent}>
                        <SubScreenHeader title="Dados do Aplicativo" onBack={() => setActiveSettingsScreen('main')} />
                        <div className={styles.dataActions}>
                            <button className="btn btn-secondary" onClick={exportData}><FiDownload /> Exportar Dados</button>
                            <button className="btn btn-secondary" onClick={handleImportClick}><FiUpload /> Importar Dados</button>
                            <button className={`btn ${styles.buttonDanger}`} onClick={showResetModal}><FiTrash2 /> Resetar Dados</button>
                        </div>
                    </div>
                );
            case 'about':
                 return (
                    <div className={`${styles.tabContent} ${styles.aboutScreen}`}>
                        <SubScreenHeader title="De Usuário para Usuário 🐸" onBack={() => setActiveSettingsScreen('main')} />
                        <div className={styles.aboutContentWrapper}>
                            <img src={focusfrogCoffee} alt="Mascote FocusFrog com café" style={{borderRadius: '50%', objectFit: 'cover'}} className={styles.aboutAppIcon} />
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
                            </div>

                            <div className={styles.appVersion} onClick={handleVersionClick}>FocusFrog v2.0.0 • Feito com 💚🐸</div>
                        </div>
                    </div>
                );
            case 'main':
            default:
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.header}><h2>Configurações</h2></div>
                        <SettingsNavRow icon={FiUser} title="Perfil e Sincronização" description="Faça backup e acesse seus dados em qualquer lugar." onClick={() => setActiveSettingsScreen('profile')} />
                        <SettingsNavRow icon={FiLayout} title="Preferências" description="Ajuste sons, vibração e aparência." onClick={() => setActiveSettingsScreen('appearance')} />
                        <SettingsNavRow icon={FiDatabase} title="Dados do Aplicativo" description="Exporte, importe ou resete seus dados." onClick={() => setActiveSettingsScreen('data')} />
                        <SettingsNavRow icon={FiInfo} title="Sobre" description="Nossa história e missão." onClick={() => setActiveSettingsScreen('about')} />
                    </div>
                );
        }
    }

    return (
        <main className="screen-content">
             {isResetModalVisible && <ConfirmationModal title="Resetar Todos os Dados" message="Tem a certeza? Esta ação é irreversível e irá apagar todas as suas tarefas, pontos e personalizações." confirmText="Sim, Resetar Tudo" cancelText="Cancelar" onConfirm={confirmReset} onCancel={hideResetModal} variant="danger" icon="trash" />}
            {auth.isLoading ? <p>Carregando...</p> : renderSettingsContent()}
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
        </main>
    );
};
