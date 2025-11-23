
import React, { useState, useRef } from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { themes } from '../themes';

// --- Types & Interfaces ---

interface ShopItem {
    id: string;
    type: 'theme' | 'sound';
    name: string;
    description: string;
    cost: number;
    previewColor?: string;
    icon?: keyof typeof icons;
}

const shopCatalog: ShopItem[] = [
    // Themes
    { id: 'light-theme', type: 'theme', name: 'Claro (Padrão)', description: 'O clássico limpo.', cost: 0, previewColor: '#ffffff' },
    { id: 'dark-theme', type: 'theme', name: 'Modo Escuro', description: 'Descanso para os olhos.', cost: 0, previewColor: '#1F2937' },
    { id: 'forest-theme', type: 'theme', name: 'Floresta Zen', description: 'Tons de verde calmos.', cost: 150, previewColor: '#F0FFF4' },
    { id: 'ocean-theme', type: 'theme', name: 'Oceano Profundo', description: 'Azul para fluxo.', cost: 300, previewColor: '#EBF8FF' },
    { id: 'sunset-theme', type: 'theme', name: 'Pôr do Sol', description: 'Energia vibrante.', cost: 500, previewColor: '#FFF5F7' },

    // Sounds
    { id: 'none', type: 'sound', name: 'Silêncio', description: 'Zero ruído.', cost: 0, icon: 'volumeX' },
    { id: 'rain-sound', type: 'sound', name: 'Chuva Suave', description: 'Mascarar distrações.', cost: 100, icon: 'cloudRain' as any }, 
    { id: 'waves-sound', type: 'sound', name: 'Ondas do Mar', description: 'Ritmo constante.', cost: 200, icon: 'water' as any },
    { id: 'forest-sound', type: 'sound', name: 'Floresta Viva', description: 'Natureza imersiva.', cost: 250, icon: 'tree' as any },
    { id: 'piano-sound', type: 'sound', name: 'Piano Lo-Fi', description: 'Foco cognitivo.', cost: 400, icon: 'music' },
];

// --- Components ---

const SettingToggle = ({ label, description, checked, onChange, icon }: { label: string, description?: string, checked: boolean, onChange: (v: boolean) => void, icon: keyof typeof icons }) => (
    <div className="setting-item" onClick={() => onChange(!checked)}>
        <div className="setting-icon-wrapper">
            <Icon path={icons[icon]} />
        </div>
        <div className="setting-info">
            <span className="setting-label">{label}</span>
            {description && <span className="setting-description">{description}</span>}
        </div>
        <div className={`toggle-switch ${checked ? 'checked' : ''}`}>
            <div className="toggle-thumb"></div>
        </div>
    </div>
);

const SettingAction = ({ label, description, onClick, icon, value, danger }: { label: string, description?: string, onClick: () => void, icon: keyof typeof icons, value?: string, danger?: boolean }) => (
    <div className={`setting-item ${danger ? 'danger' : ''}`} onClick={onClick}>
        <div className="setting-icon-wrapper">
            <Icon path={icons[icon]} />
        </div>
        <div className="setting-info">
            <span className="setting-label">{label}</span>
            {description && <span className="setting-description">{description}</span>}
        </div>
        {value && <span className="setting-value">{value}</span>}
        <Icon path={icons.chevronDown} className="setting-chevron" style={{ transform: 'rotate(-90deg)', width: 16, height: 16, opacity: 0.5 }} />
    </div>
);

export const RewardsScreen: React.FC = () => {
    const { 
        activeThemeId, setActiveThemeId,
        activeSoundId, setActiveSoundId,
        pontosFoco, setPontosFoco,
        unlockedRewards, setUnlockedRewards
    } = useTheme();

    const { 
        density, setDensity, addNotification, 
        soundEnabled, setSoundEnabled, 
        hapticsEnabled, setHapticsEnabled 
    } = useUI();
    
    const [activeTab, setActiveTab] = useState<'shop' | 'settings'>('shop');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePurchase = (item: ShopItem) => {
        if (pontosFoco >= item.cost) {
            setPontosFoco(prev => prev - item.cost);
            setUnlockedRewards(prev => [...prev, item.id]);
            addNotification(`Item "${item.name}" desbloqueado!`, '🎉');
            
            if (item.type === 'theme') setActiveThemeId(item.id);
            if (item.type === 'sound') setActiveSoundId(item.id);
        } else {
            addNotification('Pontos insuficientes!', '🔒');
        }
    };

    const handleEquip = (item: ShopItem) => {
        if (item.type === 'theme') setActiveThemeId(item.id);
        if (item.type === 'sound') setActiveSoundId(item.id);
    };

    const handleResetData = () => {
        if (window.confirm('ATENÇÃO: Isso apagará TODAS as suas tarefas, progresso e itens comprados. Essa ação não pode ser desfeita. Tem certeza absoluta?')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleExportData = () => {
        const data = {
            tasks: localStorage.getItem('focusfrog_tasks'),
            tags: localStorage.getItem('focusfrog_tags'),
            theme: localStorage.getItem('focusfrog_theme_data_v2'),
            stats: localStorage.getItem('focusfrog_pomodorosCompleted'),
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `focusfrog-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        addNotification('Backup baixado!', '💾');
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content);
                if (data.tasks) localStorage.setItem('focusfrog_tasks', data.tasks);
                if (data.theme) localStorage.setItem('focusfrog_theme_data_v2', data.theme);
                alert('Dados restaurados! O app será recarregado.');
                window.location.reload();
            } catch (err) {
                alert('Erro ao ler arquivo.');
            }
        };
        reader.readAsText(file);
    };

    return (
        <main className="rewards-screen">
            {/* Header com Abas */}
            <div className="rewards-header-tabs">
                <div className="points-display-small">
                     <Icon path={icons.trophy} /> {pontosFoco}
                </div>
                <div className="tab-group">
                    <button 
                        className={`tab-button ${activeTab === 'shop' ? 'active' : ''}`}
                        onClick={() => setActiveTab('shop')}
                    >
                        Loja
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'settings' ? 'active' : ''}`}
                        onClick={() => setActiveTab('settings')}
                    >
                        Preferências
                    </button>
                </div>
            </div>

            {activeTab === 'shop' && (
                <div className="tab-content fade-in">
                    <div className="rewards-hero">
                        <div className="points-display">
                            <div className="points-icon-wrapper">
                                <Icon path={icons.trophy} />
                            </div>
                            <div className="points-text">
                                <span className="points-label">Saldo de Foco</span>
                                <span className="points-value">{pontosFoco}</span>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h4 className="section-title"><Icon path={icons.sparkles} /> Temas & Sons</h4>
                        <div className="shop-grid">
                            {shopCatalog.map(item => {
                                const isUnlocked = item.cost === 0 || unlockedRewards.includes(item.id);
                                const isActive = item.type === 'theme' ? activeThemeId === item.id : activeSoundId === item.id;
                                const canAfford = pontosFoco >= item.cost;

                                return (
                                    <div key={item.id} className={`shop-card ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''}`}>
                                        <div className="shop-card-preview" style={{ background: item.previewColor || 'var(--surface-secondary-color)', height: '80px' }}>
                                            {item.type === 'sound' && <Icon path={icons.music} className="preview-icon" />}
                                            {isActive && <div className="active-badge"><Icon path={icons.check} /></div>}
                                        </div>
                                        
                                        <div className="shop-card-content">
                                            <h4>{item.name}</h4>
                                            <p>{item.description}</p>
                                            <div className="shop-card-footer">
                                                {isUnlocked ? (
                                                    <button 
                                                        className={`control-button small ${isActive ? 'secondary' : ''}`} 
                                                        onClick={() => handleEquip(item)}
                                                        disabled={isActive}
                                                    >
                                                        {isActive ? 'Ativo' : 'Usar'}
                                                    </button>
                                                ) : (
                                                    <button 
                                                        className={`control-button small ${canAfford ? 'primary' : 'secondary'}`}
                                                        onClick={() => handlePurchase(item)}
                                                        disabled={!canAfford}
                                                    >
                                                        <Icon path={icons.trophy} style={{width: 12, height: 12}} /> {item.cost}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="tab-content fade-in">
                    <div className="settings-section">
                        <h4 className="section-title"><Icon path={icons.sliders} /> Interface</h4>
                        <div className="settings-group">
                            <SettingToggle 
                                label="Efeitos Sonoros" 
                                icon="music" 
                                checked={soundEnabled} 
                                onChange={setSoundEnabled} 
                            />
                            <SettingToggle 
                                label="Vibração (Haptics)" 
                                icon="zap" 
                                checked={hapticsEnabled} 
                                onChange={setHapticsEnabled} 
                            />
                            <div className="setting-item-stacked">
                                <div className="setting-info">
                                    <span className="setting-label">Tamanho do Texto</span>
                                </div>
                                <div className="density-selector-inline">
                                    <button className={density === 'compact' ? 'active' : ''} onClick={() => setDensity('compact')}>Peq</button>
                                    <button className={density === 'normal' ? 'active' : ''} onClick={() => setDensity('normal')}>Normal</button>
                                    <button className={density === 'spaced' ? 'active' : ''} onClick={() => setDensity('spaced')}>Gde</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h4 className="section-title"><Icon path={icons.briefcase} /> Dados</h4>
                        <div className="settings-group">
                            <SettingAction 
                                label="Fazer Backup" 
                                description="Salvar progresso." 
                                icon="copy" 
                                onClick={handleExportData}
                            />
                            <SettingAction 
                                label="Restaurar" 
                                description="Carregar backup." 
                                icon="briefcase" 
                                onClick={handleImportClick}
                            />
                            <SettingAction 
                                label="Resetar Tudo" 
                                description="Apagar dados." 
                                icon="trash" 
                                onClick={handleResetData}
                                danger
                            />
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{display: 'none'}} 
                                accept=".json" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                    
                    <div className="app-version">
                        FocusFrog v1.1.0 • Feito com 💚
                    </div>
                </div>
            )}
        </main>
    );
};
