import React, { useState, useRef } from 'react';
import { useUI } from '../context/UIContext';
import { useUserData } from '../hooks/useUserData';
import { useAuth } from '../hooks/useAuth';
import { User } from '@supabase/supabase-js';
import styles from './RewardsScreen.module.css';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import UpdatePrompt from '../components/UpdatePrompt';
import { FiCloudLightning, FiUpload, FiChevronRight, FiLayout, FiDatabase, FiInfo, FiVolume2, FiZap, FiArrowLeft, FiDownload, FiTrash2, FiInstagram, FiType, FiUser, FiLogIn, FiLogOut, FiCheckCircle, FiHeart, FiCoffee, FiHardDrive } from 'react-icons/fi';
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

const ProfileScreen: React.FC<{onBack: () => void}> = ({ onBack }) => {
    return (
        <div className={`${styles.tabContent} ${styles.profileScreen}`}>
            <SubScreenHeader title="Perfil e Sincronização" onBack={onBack} />
            <div className={styles.authCard}>
                <span className={styles.authIcon}><FiCloudLightning size={40} /></span>
                <h3>Backup na Nuvem (Em Breve)</h3>
                <p>Estamos trabalhando para permitir que você salve seu progresso na nuvem e o acesse de qualquer lugar. Fique de olho nas próximas atualizações!</p>
            </div>
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
    const { isLoading } = useAuth(); // Removido user, signIn, signOut pois não são mais usados diretamente aqui
    
    const [activeSettingsScreen, setActiveSettingsScreen] = useState('main');
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

    const handleCoffeeClick = () => {
        window.open('https://shop.beacons.ai/focus.frog/667fee49-a713-4a08-b541-e40ae2321696', '_blank');
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
                    importDataFromFile={importDataFromFile} // Passando a função sem o parâmetro 'user'
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
                            </div>

                            <div className={styles.appVersion} onClick={handleVersionClick}>FocusFrog v2.2.0 • Feito com 💚🐸</div>
                        </div>
                    </div>
                );
            case 'main':
            default:
                return (
                    <div className={styles.tabContent}>
                        <div className={styles.header}><h2>Configurações</h2></div>
                        <SettingsNavRow icon={FiUser} title="Perfil e Sincronização" description={"Backup na nuvem (em breve)"} onClick={() => setActiveSettingsScreen('profile')} />
                        <SettingsNavRow icon={FiLayout} title="Aparência" description="Ajuste tema, sons e outros." onClick={() => setActiveSettingsScreen('appearance')} />
                        <SettingsNavRow icon={FiDatabase} title="Gerenciar Dados" description="Backup, restauração e reset." onClick={() => setActiveSettingsScreen('data')} />
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
