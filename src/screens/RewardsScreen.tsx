
import React, { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { useUserData } from '../hooks/useUserData';
import styles from './RewardsScreen.module.css';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';

// --- TIPOS E DADOS ---
interface ShopItem { id: string; type: 'theme' | 'sound'; name: string; description: string; cost: number; previewColor?: string; icon?: keyof typeof icons; }

const shopCatalog: ShopItem[] = [
    { id: 'theme-forest', type: 'theme', name: 'Tema Floresta', description: 'Verdes profundos e tons de terra.', cost: 100, previewColor: '#2f5d62' },
    { id: 'theme-ocean', type: 'theme', name: 'Tema Oceano', description: 'Azuis serenos e cinzas suaves.', cost: 100, previewColor: '#3a5ba0' },
    { id: 'theme-sunset', type: 'theme', name: 'Tema Pôr do Sol', description: 'Gradientes quentes de laranja e roxo.', cost: 250, previewColor: '#ff8c61' },
    { id: 'theme-neon', type: 'theme', name: 'Tema Neon', description: 'Vibrante e elétrico para noites de codificação.', cost: 500, previewColor: '#c700ff' },
    { id: 'sound-rain', type: 'sound', name: 'Chuva Suave', description: 'Som ambiente de chuva calma.', cost: 50, icon: 'cloudRain' },
    { id: 'sound-keyboard', type: 'sound', name: 'Teclado Mecânico', description: 'Cliques satisfatórios para o foco.', cost: 150, icon: 'keyboard' },
];

// --- COMPONENTE PRINCIPAL ---
export const RewardsScreen: React.FC = () => {
    const { activeThemeId, setActiveThemeId, activeSoundId, setActiveSoundId, pontosFoco, setPontosFoco, unlockedRewards, setUnlockedRewards } = useTheme();
    const { addNotification, soundEnabled, setSoundEnabled, hapticsEnabled, setHapticsEnabled, setDevModeEnabled } = useUI();
    const { exportData, importData, resetData } = useUserData();
    
    const [activeTab, setActiveTab] = useState<'shop' | 'settings'>('shop');
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

    const handlePurchase = (item: ShopItem) => {
        if (pontosFoco >= item.cost) {
            setPontosFoco(pontosFoco - item.cost);
            setUnlockedRewards([...unlockedRewards, item.id]);
            addNotification(`Item ${item.name} comprado`, '🛍️', 'victory');
        } else {
            addNotification('Pontos de Foco insuficientes', '🪙', 'error');
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (item.type === 'theme') setActiveThemeId(item.id);
        if (item.type === 'sound') setActiveSoundId(item.id);
        addNotification(`${item.name} equipado`, '🎨', 'success');
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

    // Função para dar feedback tátil ao ativar a vibração
    const handleHapticsChange = (enabled: boolean) => {
        setHapticsEnabled(enabled);
        if (enabled && navigator.vibrate) {
            navigator.vibrate(50); // Vibração curta de confirmação
        }
    };

    return (
        <main className="screen-content">
             {isResetModalVisible && (
                <ConfirmationModal
                    title="Apagar Todos os Dados"
                    message="Tem a certeza? Esta ação é irreversível e irá apagar todas as suas tarefas, pontos e personalizações."
                    confirmText="Sim, Apagar Tudo"
                    cancelText="Cancelar"
                    onConfirm={confirmReset}
                    onCancel={hideResetModal}
                    variant="danger"
                    icon="trash"
                />
            )}

            <div className={styles.header}>
                <h2>Personalizar</h2>
                <div className={styles.pointsDisplay}><Icon path={icons.trophy} /> <span>{pontosFoco}</span></div>
            </div>

            <div className={styles.tabGroup}>
                 <button onClick={() => setActiveTab('shop')} className={`${styles.tabButton} ${activeTab === 'shop' ? styles.active : ''}`}>Loja</button>
                 <button onClick={() => setActiveTab('settings')} className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}>Configurações</button>
            </div>

            <div className={styles.tabContent}>
                {activeTab === 'shop' && <ShopTab {...{ shopCatalog, unlockedRewards, activeThemeId, activeSoundId, handlePurchase, handleEquip, pontosFoco }} />}
                {activeTab === 'settings' && <SettingsTab {...{ soundEnabled, setSoundEnabled, hapticsEnabled, handleHapticsChange, exportData, handleImportClick, showResetModal, handleVersionClick, fileInputRef, handleFileChange }} />}
            </div>
        </main>
    );
};

// --- ABA DA LOJA ---
const ShopTab: React.FC<any> = ({ shopCatalog, unlockedRewards, activeThemeId, activeSoundId, handlePurchase, handleEquip, pontosFoco }) => (
    <div className={styles.shopGrid}>
        {shopCatalog.map((item: ShopItem) => {
            const isUnlocked = unlockedRewards.includes(item.id);
            const isEquipped = item.type === 'theme' ? activeThemeId === item.id : activeSoundId === item.id;
            return (
                <div key={item.id} className={styles.shopItem}>
                    <div className={styles.itemHeader}>
                        {item.previewColor && <div className={styles.itemPreview} style={{ backgroundColor: item.previewColor }}></div>}
                        {item.icon && <Icon path={icons[item.icon]} className={styles.itemIcon} />}
                        <h4 className={styles.itemName}>{item.name}</h4>
                    </div>
                    <p className={styles.itemDescription}>{item.description}</p>
                    <div className={styles.itemFooter}>
                        {!isUnlocked ? (
                            <button className="btn btn-primary" onClick={() => handlePurchase(item)} disabled={pontosFoco < item.cost}>
                                <Icon path={icons.lock} /> Comprar ({item.cost})
                            </button>
                        ) : (
                            <button className="btn btn-secondary" onClick={() => handleEquip(item)} disabled={isEquipped}>
                                {isEquipped ? 'Equipado' : 'Equipar'}
                            </button>
                        )}
                    </div>
                </div>
            );
        })}
    </div>
);

// --- ABA DE CONFIGURAÇÕES (ATUALIZADA) ---
const SettingsTab: React.FC<any> = ({ soundEnabled, setSoundEnabled, hapticsEnabled, handleHapticsChange, exportData, handleImportClick, showResetModal, handleVersionClick, fileInputRef, handleFileChange }) => (
    <div>
        <div className={styles.settingsGroup}>
            <h3>Preferências</h3>
            <div className={styles.settingRow}>
                <label htmlFor="sound-toggle">Efeitos sonoros</label>
                <label className={styles.switch}>
                    <input id="sound-toggle" type="checkbox" checked={soundEnabled} onChange={(e) => setSoundEnabled(e.target.checked)} />
                    <span className={styles.switchSlider}></span>
                </label>
            </div>
            <div className={styles.settingRow}>
                <label htmlFor="haptics-toggle">Vibração (Haptics)</label>
                <label className={styles.switch}>
                    <input id="haptics-toggle" type="checkbox" checked={hapticsEnabled} onChange={(e) => handleHapticsChange(e.target.checked)} />
                    <span className={styles.switchSlider}></span>
                </label>
            </div>
        </div>
        <div className={styles.settingsGroup}>
             <h3>Gerenciamento de Dados</h3>
            <div className={styles.dataActions}>
                <button className="btn btn-secondary" onClick={exportData}><Icon path={icons.download} /> Exportar</button>
                <button className="btn btn-secondary" onClick={handleImportClick}><Icon path={icons.upload} /> Importar</button>
                <button className={`btn ${styles.buttonDanger}`} onClick={showResetModal}><Icon path={icons.trash} /> Resetar</button>
            </div>
        </div>
        <div className={styles.appVersion} onClick={handleVersionClick}>
            FocusFrog v1.1.0 • Feito com 💚
        </div>
        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".json" onChange={handleFileChange} />
    </div>
);
