
import React, { useState, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../hooks/useAuth';
import { User } from '@supabase/supabase-js';
import styles from './RewardsScreen.module.css';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { FiCloudLightning, FiUpload, FiChevronRight, FiLayout, FiDatabase, FiInfo, FiVolume2, FiZap, FiArrowLeft, FiDownload, FiTrash2, FiInstagram, FiType, FiUser, FiLogIn, FiLogOut, FiCheckCircle, FiHeart, FiCoffee } from 'react-icons/fi';
import focusfrogCoffee from '../assets/focusfrog-coffee.png';
import { FontSize } from '../context/UIContext';

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

// --- SUB-TELAS DE CONFIGURAÇÕES ---

const ProfileScreen: React.FC<{user: User | null, signIn: () => void, signOut: () => void, onBack: () => void}> = ({ user, signIn, signOut, onBack }) => {
    if (user) {
        return (
             <div className={`${styles.tabContent} ${styles.profileScreen}`}>
                <SubScreenHeader title="Perfil e Sincronização" onBack={onBack} />
                <div className={styles.authCard}>
                    <span className={styles.authIconSuccess}><FiCheckCircle size={40} /></span>
                    <h3>Tudo Sincronizado!</h3>
                    <p>Você está logado como:</p>
                    <strong>{user.user_metadata?.full_name || 'Usuário'}</strong>
                    <small>{user.email}</small>
                    <button onClick={signOut} className={`btn ${styles.buttonDanger} ${styles.signOutButton}`}>
                        <FiLogOut/> Sair
                    </button>
                </div>
            </div>
        );
    }
    return (
        <div className={`${styles.tabContent} ${styles.profileScreen}`}>
            <SubScreenHeader title="Perfil e Sincronização" onBack={onBack} />
            <div className={styles.authCard}>
                <span className={styles.authIcon}><FiLogIn size={40} /></span>
                <h3>Salve seu Progresso</h3>
                <p>Crie uma conta gratuita para fazer backup na nuvem e sincronizar suas tarefas entre dispositivos.</p>
                <button onClick={signIn} className="g-button">
                    <img src="/google-logo.svg" alt="Google" style={{width: 20, height: 20, marginRight: 10}}/>
                    Continuar com Google
                </button>
            </div>
        </div>
    );
};

const DataScreen: React.FC<{ 
    user: User | null; 
    onBack: () => void;
    exportData: () => void;
    importDataFromFile: (file: File, user: User | null) => void;
    downloadAndRestoreFromSupabase: (user: User) => void;
    showResetModal: () => void;
}> = ({ user, onBack, exportData, importDataFromFile, downloadAndRestoreFromSupabase, showResetModal }) => {
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleImportClick = () => {
        if (user) {
            downloadAndRestoreFromSupabase(user);
        } else {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            importDataFromFile(file, user);
        }
    };

    return (
        <div className={styles.tabContent}>
            <SubScreenHeader title="Dados do Aplicativo" onBack={onBack} />
            <div className={styles.dataActions}>
                 <p className={styles.dataDescription}>
                    {user 
                        ? 'Seu backup na nuvem é atualizado ao fazer login. Restaure a partir dele ou exporte um arquivo local a qualquer momento.'
                        : 'Crie uma conta para habilitar o backup na nuvem. Por enquanto, você só pode gerenciar backups locais.'
                    }
                </p>
                <button className="btn btn-secondary" onClick={exportData}>
                    <FiDownload /> Exportar para Arquivo
                </button>
                <button className="btn btn-secondary" onClick={handleImportClick}>
                    {user ? <FiCloudLightning /> : <FiUpload />}
                    {user ? 'Restaurar da Nuvem' : 'Importar de Arquivo'}
                </button>
                <button className={`btn ${styles.buttonDanger}`} onClick={showResetModal}>
                    <FiTrash2 /> Resetar Dados Locais
                </button>
            </div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
        </div>
    );
};

// ... Outros sub-componentes como AppearanceScreen, AboutScreen podem ser criados aqui da mesma forma.

// --- COMPONENTE PRINCIPAL ---
export const RewardsScreen: React.FC = () => {
    const { addNotification, setDevModeEnabled } = useUI(); // Apenas o que é usado diretamente aqui
    const { exportData, importDataFromFile, resetData, downloadAndRestoreFromSupabase } = useUserData();
    const { user, isLoading, signInWithGoogle, signOut } = useAuth(); // Hook 100% Supabase
    
    const [activeSettingsScreen, setActiveSettingsScreen] = useState('main');
    const [isResetModalVisible, setIsResetModalVisible] = useState(false);

    const showResetModal = () => setIsResetModalVisible(true);
    const hideResetModal = () => setIsResetModalVisible(false);
    const confirmReset = () => {
        resetData();
        hideResetModal();
    };

    const renderSettingsContent = () => {
        switch (activeSettingsScreen) {
            case 'profile':
                return <ProfileScreen user={user} signIn={signInWithGoogle} signOut={signOut} onBack={() => setActiveSettingsScreen('main')} />;
            case 'data':
                 return <DataScreen 
                    user={user} 
                    onBack={() => setActiveSettingsScreen('main')}
                    exportData={exportData}
                    importDataFromFile={importDataFromFile}
                    downloadAndRestoreFromSupabase={downloadAndRestoreFromSupabase}
                    showResetModal={showResetModal}
                />;
            // Adicionar casos para 'appearance' e 'about' aqui se forem refatorados para sub-componentes
            case 'main':
            default:
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.header}><h2>Configurações</h2></div>
                        <SettingsNavRow icon={FiUser} title="Perfil e Sincronização" description={user ? `Logado como ${user.user_metadata?.full_name}` : "Backup na nuvem e multi-dispositivo"} onClick={() => setActiveSettingsScreen('profile')} />
                        <SettingsNavRow icon={FiLayout} title="Aparência" description="Ajuste tema, sons e outros." onClick={() => alert('Tela de Aparência em breve!')} />
                        <SettingsNavRow icon={FiDatabase} title="Gerenciar Dados" description="Backup, restauração e reset." onClick={() => setActiveSettingsScreen('data')} />
                        <SettingsNavRow icon={FiInfo} title="Sobre" description="Nossa história e missão." onClick={() => alert('Tela Sobre em breve!')} />
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
