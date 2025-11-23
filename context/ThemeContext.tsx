import React, { useEffect, createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { themes, Theme } from '../themes';

const THEME_STORAGE_KEY = 'focusfrog_theme_data_v2';

interface ThemeData {
    activeThemeId: string;
    activeSoundId: string;
    pontosFoco: number;
    unlockedRewards: string[];
}

interface ThemeContextType extends ThemeData {
    setActiveThemeId: (updater: string | ((prev: string) => string)) => void;
    setActiveSoundId: (updater: string | ((prev: string) => string)) => void;
    setPontosFoco: (updater: number | ((prev: number) => number)) => void;
    setUnlockedRewards: (updater: string[] | ((prev: string[]) => string[])) => void;
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
        Object.entries(theme.colors).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
    }, [themeData.activeThemeId]);

    // Explicitly define and memorize setters to ensure stability
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
    
    const value: ThemeContextType = {
        ...themeData,
        setActiveThemeId,
        setActiveSoundId,
        setPontosFoco,
        setUnlockedRewards,
        loadingTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};