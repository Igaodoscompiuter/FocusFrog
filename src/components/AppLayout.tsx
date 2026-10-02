
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
import UpdatePrompt from './UpdatePrompt';

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
    const { activeScreen, isImmersiveMode } = useUI();

    const ActiveScreenComponent = screenMap[activeScreen];

    return (
        <div className={`app-container screen-${activeScreen} ${isImmersiveMode ? 'immersive-mode' : ''}`}>
            <div className="screen-content">
                {ActiveScreenComponent ? <ActiveScreenComponent /> : <div>Ecrã não encontrado</div>}
            </div>

            {!isImmersiveMode && <BottomNav />}

            {/* Containers de notificação globais */}
            <NotificationContainer />
            <FrogRewardModal />
            <UpdatePrompt />
        </div>
    );
};
