import React, { useState } from 'react'; // Importa o useState
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
import { useTasks } from '../context/TasksContext'; // Importa o useTasks

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

    // Trazendo a lógica para o componente pai (AppLayout)
    const { tasks, setFrogTaskId } = useTasks();
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    const handleConfirmFrog = () => {
        if (selectedTask) {
            setFrogTaskId(selectedTask);
            setIsMorningReviewOpen(false); // Fecha a modal
            setSelectedTask(null); // Reseta a seleção
        }
    };

    const handleCloseModal = () => {
        setIsMorningReviewOpen(false);
        setSelectedTask(null); // Reseta a seleção ao fechar
    };

    const ActiveScreenComponent = screenMap[activeScreen];

    return (
        <div className={`app-container screen-${activeScreen} density-${density} ${isImmersiveMode ? 'immersive-mode' : ''}`}>
            <div className="screen-content">
                <ActiveScreenComponent />
            </div>
            {!isImmersiveMode && <BottomNav />}
            
            <div className="toast-container">
                {notifications.map(notification => (
                    <Toast key={notification.id} notification={notification} onDismiss={removeNotification} />
                ))}
            </div>

            {/* A Modal agora é controlada completamente pelo AppLayout */}
            {isMorningReviewOpen && (
                <MorningReviewModal 
                    tasks={tasks.filter(t => t.status === 'todo')}
                    selectedTask={selectedTask}
                    onSelectTask={setSelectedTask} // Passa a função de seleção
                    onConfirm={handleConfirmFrog} // Passa a função de confirmação
                    onClose={handleCloseModal} // Passa a função de fechamento
                />
            )}
        </div>
    );
};
