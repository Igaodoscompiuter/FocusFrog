
import React from 'react';
import { BottomNav } from './BottomNav';
import { HomeScreen } from '../screens/HomeScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { MoodboardScreen } from '../screens/MoodboardScreen';
import { useUI } from '../context/UIContext';
import type { Screen } from '../types';
import { NotificationContainer } from './NotificationContainer';
import { FrogRewardModal } from './FrogRewardModal';
import { FrogScaredModal } from './FrogScaredModal';
import { UpdateAvailableModal } from './UpdateAvailableModal';
import { TourProvider } from './tour/TourContext';
import { TourOverlay } from './tour/TourOverlay';
import UpdatePrompt from './UpdatePrompt';
import { Capacitor } from '@capacitor/core';
import { useAndroidBackButton } from '../hooks/useBackHandler';
import { FrogWidgetSync } from './FrogWidgetSync';
import { AmbientSoundPlayer } from './AmbientSoundPlayer';
import { StoreScreen, OPEN_STORE_EVENT } from '../screens/store/StoreScreen';

// Nota de arquitetura: o TasksProvider NÃO é montado aqui — ele já envolve toda a
// árvore lá em cima, em index.tsx. Montá-lo de novo aqui criava um segundo estado de
// tarefas desconectado do resto do app.
const screenMap: Record<Screen, React.ComponentType> = {
    dashboard: HomeScreen,
    tasks: TasksScreen,
    focus: FocusScreen,
    stats: StatsScreen,
    rewards: RewardsScreen,
    moodboard: MoodboardScreen,
};

export const AppLayout: React.FC = () => {
    const { activeScreen, isImmersiveMode, handleNavigate } = useUI();
    const [storeOpen, setStoreOpen] = React.useState(false);
    React.useEffect(() => {
        const open = () => setStoreOpen(true);
        window.addEventListener(OPEN_STORE_EVENT, open);
        return () => window.removeEventListener(OPEN_STORE_EVENT, open);
    }, []);

    // voltar do Android: fecha o que estiver aberto; numa aba volta pra Home;
    // na Home (ou no meio de um foco) minimiza (ver hooks/useBackHandler.ts)
    useAndroidBackButton(() => {
        if (isImmersiveMode) return false;
        if (activeScreen !== 'dashboard') { handleNavigate('dashboard'); return true; }
        return false;
    });

    const ActiveScreenComponent = screenMap[activeScreen];

    return (
        <TourProvider>
        <div className={`app-container screen-${activeScreen} ${isImmersiveMode ? 'immersive-mode' : ''}`}>
            <div className="screen-content">
                {ActiveScreenComponent ? <ActiveScreenComponent /> : <div>Ecrã não encontrado</div>}
            </div>

            {!isImmersiveMode && <BottomNav />}

            {/* Containers de notificação globais */}
            <NotificationContainer />
            <FrogRewardModal />
            <FrogScaredModal />
            <UpdateAvailableModal />
            <FrogWidgetSync />
            <AmbientSoundPlayer />
            {storeOpen && <StoreScreen onClose={() => setStoreOpen(false)} />}
            {/* aviso de nova versão é só do PWA — no APK quem atualiza é a instalação */}
            {!Capacitor.isNativePlatform() && <UpdatePrompt />}
            <TourOverlay />
        </div>
        </TourProvider>
    );
};
