
import React, { useState, createContext, useContext, ReactNode, useCallback, useEffect, useReducer } from 'react';
import type { Screen, Task, Notification as NotificationType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { notificationConfig } from '../config/notificationConfig'; // Importa a configuração

export type NotificationCategory = 'victory' | 'success' | 'info' | 'error';

export interface Notification extends NotificationType {
    category: NotificationCategory;
}

// --- Reducer ---
interface NotificationsState {
    visible: Notification[];
    queue: Notification[];
    showClearAll: boolean;
}

type NotificationsAction = 
    | { type: 'ADD_TO_VISIBLE'; payload: Notification }
    | { type: 'ADD_TO_QUEUE'; payload: Notification } 
    | { type: 'REMOVE'; payload: { id: number } }
    | { type: 'PROMOTE' }
    | { type: 'CLEAR_ALL' };

// O reducer agora pode ser uma função pura, sem depender de constantes externas diretamente.
const createNotificationReducer = (config: typeof notificationConfig) => 
    (state: NotificationsState, action: NotificationsAction): NotificationsState => {
    
    let nextState: NotificationsState;

    switch (action.type) {
        case 'ADD_TO_VISIBLE':
            nextState = { ...state, visible: [...state.visible, action.payload] };
            break;
        case 'ADD_TO_QUEUE':
            nextState = { ...state, queue: [...state.queue, action.payload] };
            break;
        case 'REMOVE':
            nextState = { ...state, visible: state.visible.filter(n => n.id !== action.payload.id) };
            break;
        case 'PROMOTE':
            if (state.visible.length < config.maxVisible && state.queue.length > 0) {
                const [nextInQueue, ...remainingQueue] = state.queue;
                nextState = { ...state, visible: [...state.visible, nextInQueue], queue: remainingQueue };
            } else {
                nextState = state;
            }
            break;
        case 'CLEAR_ALL':
            return { visible: [], queue: [], showClearAll: false };
        default:
            return state;
    }

    // Recalcula a visibilidade do botão "Limpar" após cada ação
    const total = nextState.visible.length + nextState.queue.length;
    nextState.showClearAll = total >= config.minForClearAll;
    
    return nextState;
};


// --- Tipos e Contexto ---
export type Density = 'compact' | 'normal' | 'spaced';

export interface UIContextType {
    activeScreen: Screen;
    handleNavigate: (screen: Screen, options?: any) => void;
    taskInFocus: Task | null;
    setTaskInFocus: React.Dispatch<React.SetStateAction<Task | null>>;
    subtaskInFocusId: string | null;
    setSubtaskInFocusId: React.Dispatch<React.SetStateAction<string | null>>;
    notifications: Notification[];
    queueCount: number;
    showClearAllButton: boolean;
    addNotification: (message: string, icon: string, category: NotificationCategory) => void;
    removeNotification: (id: number) => void;
    promoteNotification: () => void;
    clearAllNotifications: () => void;
    density: Density;
    setDensity: React.Dispatch<React.SetStateAction<Density>>;
    soundEnabled: boolean;
    setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    hapticsEnabled: boolean;
    setHapticsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    isImmersiveMode: boolean;
    setIsImmersiveMode: React.Dispatch<React.SetStateAction<boolean>>;
    installPrompt: any;
    handleInstallApp: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within a UIProvider');
    return context;
};

// --- Provedor ---
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [activeScreen, setActiveScreen] = useState<Screen>('dashboard');
    const [taskInFocus, setTaskInFocus] = useState<Task | null>(null);
    const [subtaskInFocusId, setSubtaskInFocusId] = useState<string | null>(null);
    const [density, setDensity] = useLocalStorage<Density>('focusfrog_density', 'normal');
    const [hapticsEnabled, setHapticsEnabled] = useLocalStorage<boolean>('focusfrog_haptics_enabled', true);
    const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('focusfrog_sound_enabled', true);
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);

    // Cria o reducer passando a configuração importada
    const notificationReducer = createNotificationReducer(notificationConfig);
    const [notificationsState, dispatch] = useReducer(notificationReducer, { visible: [], queue: [], showClearAll: false });

    const addNotification = useCallback((message: string, icon: string, category: NotificationCategory) => {
        const newNotification: Notification = { id: Date.now() + Math.random(), message, icon, category };

        if (notificationsState.visible.length < notificationConfig.maxVisible) {
            dispatch({ type: 'ADD_TO_VISIBLE', payload: newNotification });
        } else {
            dispatch({ type: 'ADD_TO_QUEUE', payload: newNotification });
        }

        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(50);
    }, [notificationsState.visible.length, hapticsEnabled]);

    const removeNotification = useCallback((id: number) => {
        dispatch({ type: 'REMOVE', payload: { id } });
    }, []);

    const promoteNotification = useCallback(() => {
        dispatch({ type: 'PROMOTE' });
    }, []);

    const clearAllNotifications = useCallback(() => {
        dispatch({ type: 'CLEAR_ALL' });
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(20);
    }, [hapticsEnabled]);

    const handleInstallApp = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        await installPrompt.userChoice;
        setInstallPrompt(null);
    };
    
    const handleNavigate = (screen: Screen, options?: any) => {
        if (activeScreen === 'focus' && screen !== 'focus') {
            setIsImmersiveMode(false);
        }
        setActiveScreen(screen);
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(5);
    }

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const value: UIContextType = {
        activeScreen,
        handleNavigate,
        taskInFocus, setTaskInFocus,
        subtaskInFocusId, setSubtaskInFocusId,
        notifications: notificationsState.visible,
        queueCount: notificationsState.queue.length,
        showClearAllButton: notificationsState.showClearAll,
        addNotification,
        removeNotification,
        promoteNotification,
        clearAllNotifications,
        density, setDensity,
        soundEnabled, setSoundEnabled,
        hapticsEnabled, setHapticsEnabled,
        isImmersiveMode, setIsImmersiveMode,
        installPrompt,
        handleInstallApp,
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
