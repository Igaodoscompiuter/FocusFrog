
import React, { useEffect, createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { themes, Theme } from '../themes';

const THEME_STORAGE_KEY = 'focusfrog_theme_data_v2';

interface ThemeData {
    activeThemeId: string;
    /** som de fundo durante o foco (ver src/store/soundCatalog.ts) */
    activeSoundId: string;
    /** som do fim do foco: 'default' ou 'croak' (Coaxo da vitória) */
    activeEffectId: string;
    pontosFoco: number;
    /** itens da Loja do Sapo já desbloqueados (ids de tema/som/efeito) */
    unlockedRewards: string[];
}

export type BuyResult = 'ok' | 'owned' | 'insufficient';

interface ThemeContextType extends ThemeData {
    setActiveThemeId: (updater: string | ((prev: string) => string)) => void;
    setActiveSoundId: (updater: string | ((prev: string) => string)) => void;
    setPontosFoco: (updater: number | ((prev: number) => number)) => void;
    setUnlockedRewards: (updater: string[] | ((prev: string[]) => string[])) => void;
    setActiveEffectId: (id: string) => void;
    /** Compra com pontos: desconta e desbloqueia de uma vez só. */
    buyItem: (id: string, price: number) => BuyResult;
    isUnlocked: (id: string, price: number) => boolean;
    loadingTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const defaultThemeData: ThemeData = {
    activeThemeId: 'dark-theme',
    activeSoundId: 'none',
    activeEffectId: 'default',
    pontosFoco: 0,
    unlockedRewards: ['dark-theme', 'none'],
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [themeData, setThemeData] = useState<ThemeData>(defaultThemeData);
    const [loadingTheme, setLoadingTheme] = useState(true);

    useEffect(() => {
        try {
            const savedData = localStorage.getItem(THEME_STORAGE_KEY);
            if (savedData) {
                setThemeData(prev => ({ ...prev, ...JSON.parse(savedData) }));
            }
        } catch (error) {
            console.error("Failed to load theme data from localStorage", error);
        }
        setLoadingTheme(false);
    }, []);
    
    useEffect(() => {
        const theme: Theme = themes[themeData.activeThemeId] || themes['dark-theme'];
        const root = document.documentElement;

        // medidas ficam em src/styles/tokens.css; aqui só as cores do tema
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

    }, [themeData.activeThemeId]);

    const updateField = useCallback(<K extends keyof ThemeData>(field: K, updater: any) => {
         setThemeData(prevData => {
            const oldValue = prevData[field];
            const newValue = typeof updater === 'function' 
                ? (updater as Function)(oldValue) 
                : updater;
            
            const newData = { ...prevData, [field]: newValue };
            try {
                localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newData));
            } catch (error) {
                console.error("Failed to save theme data", error);
            }
            return newData;
        });
    }, []);

    const setActiveThemeId = useCallback((updater: string | ((prev: string) => string)) => {
        updateField('activeThemeId', updater);
    }, [updateField]);

    const setActiveSoundId = useCallback((updater: string | ((prev: string) => string)) => {
        updateField('activeSoundId', updater);
    }, [updateField]);

    const setPontosFoco = useCallback((updater: number | ((prev: number) => number)) => {
        updateField('pontosFoco', updater);
    }, [updateField]);

    const setUnlockedRewards = useCallback((updater: string[] | ((prev: string[]) => string[])) => {
        updateField('unlockedRewards', updater);
    }, [updateField]);
    
    const setActiveEffectId = useCallback((id: string) => updateField('activeEffectId', id), [updateField]);

    const isUnlocked = useCallback((id: string, price: number) =>
        price === 0 || themeData.unlockedRewards.includes(id), [themeData.unlockedRewards]);

    const buyItem = useCallback((id: string, price: number): BuyResult => {
        if (price === 0 || themeData.unlockedRewards.includes(id)) return 'owned';
        if (themeData.pontosFoco < price) return 'insufficient';
        setThemeData(prev => {
            if (prev.unlockedRewards.includes(id) || prev.pontosFoco < price) return prev;
            const next = { ...prev, pontosFoco: prev.pontosFoco - price, unlockedRewards: [...prev.unlockedRewards, id] };
            try { localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next)); } catch { /* segue em memória */ }
            return next;
        });
        return 'ok';
    }, [themeData.pontosFoco, themeData.unlockedRewards]);

    const value: ThemeContextType = {
        ...themeData,
        setActiveThemeId,
        setActiveSoundId,
        setPontosFoco,
        setUnlockedRewards,
        setActiveEffectId,
        buyItem,
        isUnlocked,
        loadingTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
