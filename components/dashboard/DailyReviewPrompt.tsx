import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';

export const DailyReviewPrompt: React.FC = () => {
    const { needsOverdueReview, overdueTasksForReview, needsMorningPlan } = useTasks();
    const { setIsReviewModalOpen, handleNavigate } = useUI();

    const handleOpenReview = () => {
        setIsReviewModalOpen(true);
    };

    const handleGoToMatrix = () => {
        handleNavigate('tasks');
    };

    if (needsOverdueReview) {
        return (
            <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h3>Revisão Pendente</h3>
                    <p>Você tem {overdueTasksForReview.length} tarefa(s) atrasada(s). Vamos reorganizá-las!</p>
                </div>
                <button className="control-button" onClick={handleOpenReview}>
                    <Icon path={icons.calendar} />
                    Revisar Tarefas
                </button>
            </div>
        );
    }

    if (needsMorningPlan) {
        return (
            <div className="card" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>Bom dia! ☀️</h3>
                    <p>Vamos organizar sua mente e definir o que é prioridade hoje?</p>
                </div>
                <button className="control-button secondary" onClick={handleGoToMatrix}>
                    <Icon path={icons.layoutGrid} />
                    Planejar Agora
                </button>
            </div>
        );
    }

    return null;
};