
import React, { useState, createContext, useContext, ReactNode, useCallback, useReducer } from 'react';
import type { Screen, Task, Notification as NotificationType } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { notificationConfig } from '../config/notificationConfig';

export type NotificationCategory = 'victory' | 'success' | 'info' | 'error';
export type FontSize = 'small' | 'normal' | 'large'; // NOVO TIPO

export interface Notification extends NotificationType {
    category: NotificationCategory;
}

// --- Reducer (sem alterações) ---
interface NotificationsState { visible: Notification[]; queue: Notification[]; showClearAll: boolean; }
type NotificationsAction = | { type: 'ADD_TO_VISIBLE'; payload: Notification } | { type: 'ADD_TO_QUEUE'; payload: Notification } | { type: 'REMOVE'; payload: { id: number } } | { type: 'PROMOTE' } | { type: 'CLEAR_ALL' };
const createNotificationReducer = (config: typeof notificationConfig) => (state: NotificationsState, action: NotificationsAction): NotificationsState => {
    let nextState: NotificationsState;
    switch (action.type) {
        case 'ADD_TO_VISIBLE': nextState = { ...state, visible: [...state.visible, action.payload] }; break;
        case 'ADD_TO_QUEUE': nextState = { ...state, queue: [...state.queue, action.payload] }; break;
        case 'REMOVE': nextState = { ...state, visible: state.visible.filter(n => n.id !== action.payload.id) }; break;
        case 'PROMOTE':
            if (state.visible.length < config.maxVisible && state.queue.length > 0) {
                const [nextInQueue, ...remainingQueue] = state.queue;
                nextState = { ...state, visible: [...state.visible, nextInQueue], queue: remainingQueue };
            } else { nextState = state; }
            break;
        case 'CLEAR_ALL': return { visible: [], queue: [], showClearAll: false };
        default: return state;
    }
    const total = nextState.visible.length + nextState.queue.length;
    if (total > 3) { nextState.showClearAll = true; } 
    else if (total < 2) { nextState.showClearAll = false; } 
    else { nextState.showClearAll = state.showClearAll; }
    return nextState;
};

// --- Tipos e Contexto ---
export interface UIContextType {
    activeScreen: Screen;
    handleNavigate: (screen: Screen, options?: any) => void;
    taskInFocus: Task | null;
    setTaskInFocus: React.Dispatch<React.SetStateAction<Task | null>>;
    subtaskInFocusId: string | null;
    setSubtaskInFocusId: React.Dispatch<React.SetStateAction<string | null>>;
    quickTaskForCompletion: Task | null;
    setQuickTaskForCompletion: React.Dispatch<React.SetStateAction<Task | null>>;
    notifications: Notification[];
    queueCount: number;
    showClearAllButton: boolean;
    addNotification: (message: string, icon: string, category?: NotificationCategory, action?: { label: string; onAction: () => void; }) => void;
    removeNotification: (id: number) => void;
    promoteNotification: () => void;
    clearAllNotifications: () => void;
    soundEnabled: boolean;
    setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    hapticsEnabled: boolean;
    setHapticsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
    isImmersiveMode: boolean;
    setIsImmersiveMode: React.Dispatch<React.SetStateAction<boolean>>;
    isPWAInstallPopupVisible: boolean;
    showPWAInstallPopup: () => void;
    hidePWAInstallPopup: () => void;

    // NOVOS ESTADOS ADICIONADOS
    fontSize: FontSize;
    setFontSize: React.Dispatch<React.SetStateAction<FontSize>>;
    devModeEnabled: boolean;
    setDevModeEnabled: React.Dispatch<React.SetStateAction<boolean>>;
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
    const [isImmersiveMode, setIsImmersiveMode] = useState(false);
    const [isPWAInstallPopupVisible, setIsPWAInstallPopupVisible] = useState(false);
    const [quickTaskForCompletion, setQuickTaskForCompletion] = useState<Task | null>(null);

    // ESTADOS COM PERSISTÊNCIA
    const [hapticsEnabled, setHapticsEnabled] = useLocalStorage<boolean>('focusfrog_haptics_enabled', true);
    const [soundEnabled, setSoundEnabled] = useLocalStorage<boolean>('focusfrog_sound_enabled', true);
    const [fontSize, setFontSize] = useLocalStorage<FontSize>('focusfrog_fontsize', 'normal'); // NOVO
    const [devModeEnabled, setDevModeEnabled] = useLocalStorage<boolean>('focusfrog_dev_mode', false); // NOVO

    const notificationReducer = createNotificationReducer(notificationConfig);
    const [notificationsState, dispatch] = useReducer(notificationReducer, { visible: [], queue: [], showClearAll: false });

    const addNotification = useCallback((message: string, icon: string, category: NotificationCategory = 'info', action?: { label: string; onAction: () => void; }) => {
        const newNotification: Notification = { id: Date.now() + Math.random(), message, icon, category, action };
        if (notificationsState.visible.length < notificationConfig.maxVisible) {
            dispatch({ type: 'ADD_TO_VISIBLE', payload: newNotification });
        } else {
            dispatch({ type: 'ADD_TO_QUEUE', payload: newNotification });
        }
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(50);
    }, [notificationsState.visible.length, hapticsEnabled]);

    const removeNotification = useCallback((id: number) => { dispatch({ type: 'REMOVE', payload: { id } }); }, []);
    const promoteNotification = useCallback(() => { dispatch({ type: 'PROMOTE' }); }, []);
    const clearAllNotifications = useCallback(() => { dispatch({ type: 'CLEAR_ALL' }); if (hapticsEnabled && navigator.vibrate) navigator.vibrate(20); }, [hapticsEnabled]);

    const handleNavigate = (screen: Screen, options?: any) => {
        if (activeScreen === 'focus' && screen !== 'focus') setIsImmersiveMode(false);
        setActiveScreen(screen);
        if (hapticsEnabled && navigator.vibrate) navigator.vibrate(5);
    }

    const showPWAInstallPopup = () => setIsPWAInstallPopupVisible(true);
    const hidePWAInstallPopup = () => setIsPWAInstallPopupVisible(false);

    const value: UIContextType = {
        activeScreen,
        handleNavigate,
        taskInFocus, setTaskInFocus,
        subtaskInFocusId, setSubtaskInFocusId,
        quickTaskForCompletion, setQuickTaskForCompletion, 
        notifications: notificationsState.visible,
        queueCount: notificationsState.queue.length,
        showClearAllButton: notificationsState.showClearAll,
        addNotification, removeNotification, promoteNotification, clearAllNotifications,
        soundEnabled, setSoundEnabled,
        hapticsEnabled, setHapticsEnabled,
        isImmersiveMode, setIsImmersiveMode,
        isPWAInstallPopupVisible, showPWAInstallPopup, hidePWAInstallPopup,
        // VALORES EXPOSTOS
        fontSize, setFontSize,
        devModeEnabled, setDevModeEnabled
    };

    return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
