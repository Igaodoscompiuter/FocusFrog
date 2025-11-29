import React, { useState } from 'react';
import { BottomNav } from './BottomNav';
import { Toast } from './Toast';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TasksScreen } from '../screens/TasksScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { useUI } from '../context/UIContext';
import type { Screen } from '../types';
import { MorningReviewModal } from './modals/MorningReviewModal';
import { useTasks } from '../context/TasksContext';
import styles from './Toast.module.css'; // Importando os estilos modulares

const screenMap: Record<Screen, React.ComponentType> = {
    dashboard: DashboardScreen,
    tasks: TasksScreen,
    focus: FocusScreen,
    stats: StatsScreen,
    rewards: RewardsScreen,
};

export const AppLayout: React.FC = () => {
    const { 
        activeScreen, 
        notifications, 
        removeNotification, 
        density, 
        isImmersiveMode, 
        isMorningReviewOpen, 
        setIsMorningReviewOpen 
    } = useUI();

    const { tasks, setFrogTaskId } = useTasks();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const handleConfirmFrog = () => {
        if (selectedTask) {
            setFrogTaskId(selectedTask);
            setIsMorningReviewOpen(false);
            setSelectedTask(null);
        }
    };

    const handleCloseModal = () => {
        setIsMorningReviewOpen(false);
        setSelectedTask(null);
    };

    const ActiveScreenComponent = screenMap[activeScreen];

    return (
        <div className={`app-container screen-${activeScreen} density-${density} ${isImmersiveMode ? 'immersive-mode' : ''}`}>
            <div className="screen-content">
                <ActiveScreenComponent />
            </div>
            {!isImmersiveMode && <BottomNav />}
            
            {/* Container de notificações agora usa o estilo modular */}
            <div className={styles.toastContainer}>
                {notifications.map(notification => (
                    <Toast key={notification.id} notification={notification} onDismiss={removeNotification} />
                ))}
            </div>

            {isMorningReviewOpen && (
                <MorningReviewModal 
                    tasks={tasks.filter(t => t.status === 'todo')}
                    selectedTask={selectedTask}
                    onSelectTask={setSelectedTask}
                    onConfirm={handleConfirmFrog}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};