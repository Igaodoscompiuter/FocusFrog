
import React, { useState, createContext, useContext, ReactNode, useEffect } from 'react';
import type { Screen, Task, Notification } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Density = 'compact' | 'normal' | 'spaced';

interface UIContextType {
    activeScreen: Screen;
    handleNavigate: (screen: Screen) => void;
    
    taskInFocus: Task | null;
    setTaskInFocus: React.Dispatch<React.SetStateAction<Task | null>>;
    subtaskInFocusId: string | null;
    setSubtaskInFocusId: React.Dispatch<React.SetStateAction<string | null>>;
    
    notifications: Notification[];
    addNotification: (message: string, icon: string, action?: Notification['action']) => void;
    removeNotification: (id: number) => void;

    density: Density;
    setDensity: React.Dispatch<React.SetStateAction<Density>>;
    
    soundEnabled: boolean;
    setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    hapticsEnabled: boolean;
    setHapticsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    
    isImmersiveMode: boolean;
    setIsImmersiveMode: React.Dispatch<React.SetStateAction<boolean>>;

    isReviewModalOpen: boolean;
    setIsReviewModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isMorningReviewOpen: boolean;
    setIsMorningReviewOpen: React.Dispatch<React.SetStateAction<boolean>>;

    installPrompt: any;
    handleInstallApp: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [taskInFocus, setTaskInFocus] = useState<Task | null>(null);
    const [subtaskInFocusId, setSubtaskInFocusId] = useState<string | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    
    // Persisted Settings
    const [density, setDensity] = useLocalStorage<Density>('focusfrog_density', 'normal');
    const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('focusfrog_sound_enabled', true);
    const [hapticsEnabled, setHapticsEnabled] = useLocalStorage<boolean>('focusfrog_haptics_enabled', true);
    
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isMorningReviewOpen, setIsMorningReviewOpen] = useState(false);
    
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallApp = async () => {
        if (!installPrompt) return;
        
        // Show the install prompt
        installPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await installPrompt.userChoice;
        
        if (outcome === 'accepted') {
            addNotification('Instalando aplicativo...', '📲');
        }
        
        // We've used the prompt, and can't use it again, throw it away
        setInstallPrompt(null);
    };

    const addNotification = (message: string, icon: string, action?: Notification['action']) => {
        const newNotification: Notification = { id: Date.now(), message, icon, action };
        setNotifications(prev => [...prev, newNotification]);
        
        // Haptic Feedback for notification
        if (hapticsEnabled && navigator.vibrate) {
            navigator.vibrate(50);
        }
    };

    const removeNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };
    
    const handleNavigate = (screen: Screen) => {
        if (activeScreen === 'focus' && screen !== 'focus') {
            setTaskInFocus(null);
            setSubtaskInFocusId(null);
            setIsImmersiveMode(false); // Reset immersive when leaving focus
        }
        setActiveScreen(screen);
        
        // Light Haptic on navigation
        if (hapticsEnabled && navigator.vibrate) {
            navigator.vibrate(5);
        }
    }

    const value: UIContextType = {
        activeScreen,
        handleNavigate,
        taskInFocus,
        setTaskInFocus,
        subtaskInFocusId,
        setSubtaskInFocusId,
        notifications,
        addNotification,
        removeNotification,
        density,
        setDensity,
        soundEnabled,
        setSoundEnabled,
        hapticsEnabled,
        setHapticsEnabled,
        isImmersiveMode,
        setIsImmersiveMode,
        isReviewModalOpen,
        setIsReviewModalOpen,
        isMorningReviewOpen,
        setIsMorningReviewOpen,
        installPrompt,
        handleInstallApp
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
