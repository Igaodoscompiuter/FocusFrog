import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { usePomodoro } from '../context/PomodoroContext';
import { useUser } from '../context/UserContext';
import { TaskModal } from '../components/modals/TaskModal';
import { MorningReviewModal } from '../components/modals/MorningReviewModal';
import { QuickCompleteModal } from '../components/modals/QuickCompleteModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task } from '../types';
import { LeavingHomeChecklist } from '../components/dashboard/LeavingHomeChecklist';
import { AgendaDeHoje } from '../components/dashboard/AgendaDeHoje';
import styles from './HomeScreen.module.css';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', icon: icons.sun, gradient: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' };
    if (hour < 18) return { text: 'Boa tarde', icon: icons.sun, gradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)' };
    return { text: 'Boa noite', icon: icons.moon, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
};

export const HomeScreen: React.FC = () => {
    const { tasks, frogTaskId, handleSetFrog, handleCompleteTask, handleAddTask, handleUnsetFrog, handleToggleLeavingHomeItem, leavingHomeItems, handleAddLeavingHomeItem, handleRemoveLeavingHomeItem, handleResetLeavingHomeItems } = useTasks();
    const { handleNavigate, addNotification, setQuickTaskForCompletion } = useUI();
    const { startFocusOnTask, activeTaskId, status } = usePomodoro(); 
    const { userName } = useUser();
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [brainDumpText, setBrainDumpText] = useState('');
    const [isMorningReviewOpen, setIsMorningReviewOpen] = useState(false);
    const [selectedFrogId, setSelectedFrogId] = useState<string | null>(null);

    const greeting = getGreeting();
    const frogTask = useMemo(() => tasks.find(t => t.id === frogTaskId && t.status !== 'done'), [tasks, frogTaskId]);
    const eligibleFrogTasks = useMemo(() => tasks.filter(t => t.status !== 'done'), [tasks]);
    
    const isFrogFocused = useMemo(() => {
        if (!frogTask) return false;
        return frogTask.id === activeTaskId && status !== 'idle';
    }, [frogTask, activeTaskId, status]);

    const handleBrainDumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (brainDumpText.trim()) {
            handleAddTask({ title: brainDumpText, quadrant: 'inbox', pomodoroEstimate: 1, energyNeeded: 'medium' });
            setBrainDumpText('');
        }
    };
    
    const handleFrogTaskClick = (task: Task) => {
        if (task.status === 'done') {
            handleCompleteTask(task.id); 
            return;
        }

        if (task.pomodoroEstimate && task.pomodoroEstimate > 0) {
            // **CORREÇÃO APLICADA AQUI**
            startFocusOnTask(task.id, task.title, task.pomodoroEstimate, task.customDuration);
            handleNavigate('focus');
        } else {
            setQuickTaskForCompletion(task);
        }
    };

    const handleConfirmFrog = () => {
        if (selectedFrogId) {
            handleSetFrog(selectedFrogId);
            addNotification('Sapo do Dia definido', '🐸', 'success');
            setIsMorningReviewOpen(false);
            setSelectedFrogId(null);
        }
    };

    const handleNavigateToTasks = () => {
        setIsMorningReviewOpen(false);
        handleNavigate('tasks');
    };

    return (
        <div className={styles.container}> 
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={() => setEditingTask(null)} />}
            <QuickCompleteModal />
            
            <MorningReviewModal 
                isOpen={isMorningReviewOpen} 
                onClose={() => setIsMorningReviewOpen(false)}
                tasks={eligibleFrogTasks}       
                selectedTask={selectedFrogId}   
                onSelectTask={setSelectedFrogId}  
                onConfirm={handleConfirmFrog}   
                onNavigateToTasks={handleNavigateToTasks}
            />
            
            <div className={styles.dashboardHeader} style={{ background: greeting.gradient }}>
                <div className={styles.greetingContent}>
                    <div>
                        <h2>{greeting.text}, {userName || 'Usuário'}!</h2>
                        <p>Vamos fazer acontecer hoje?</p>
                    </div>
                    <img src="/icon-192.png" alt="FocusFrog App Icon" className={styles.headerIcon} />
                </div>
            </div>

            <div className={styles.contentWrapper}>
                <form onSubmit={handleBrainDumpSubmit} className={styles.brainDumpForm}>
                    <input 
                        type="text" 
                        placeholder="O que está na sua mente? (Despejo Mental)"
                        value={brainDumpText}
                        onChange={(e) => setBrainDumpText(e.target.value)}
                    />
                    <button type="submit" disabled={!brainDumpText.trim()}>
                        <Icon path={icons.plus} />
                    </button>
                </form>

                <div className={`${styles.frogCard} ${frogTask ? styles.hasFrog : ''} ${isFrogFocused ? styles.frogFocused : ''}`}>
                    <div className={styles.frogCardHeader}>
                        <h3><Icon path={icons.frog} /> Sapo do Dia</h3>
                        {frogTask && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <button className="btn btn-secondary btn-small" onClick={() => setIsMorningReviewOpen(true)}>
                                    Alterar
                                </button>
                                <button className="btn btn-secondary btn-icon btn-small" onClick={handleUnsetFrog} title="Remover Sapo">
                                    <Icon path={icons.close} />
                                </button>
                            </div>
                        )}
                    </div>
                    {frogTask ? (
                        <div>
                            <p className={styles.frogTaskTitle}>{frogTask.title}</p>
                            <button 
                                className="btn btn-primary" 
                                style={{width: '100%'}} 
                                onClick={() => handleFrogTaskClick(frogTask)}
                                disabled={isFrogFocused}
                            >
                                {isFrogFocused ? (
                                    <><Icon path={icons.zap} /> Focando no Sapo</>
                                ) : 'Comer o Sapo'}
                            </button>
                        </div>
                    ) : (
                        <div className={styles.frogCardContentEmpty} onClick={() => setIsMorningReviewOpen(true)}>
                            <Icon path={icons.target} size={24} />
                            <strong>Escolha seu Sapo</strong>
                            <p>Selecione a tarefa que vai destravar seu dia</p>
                        </div>
                    )}
                </div>

                <LeavingHomeChecklist 
                    items={leavingHomeItems}
                    onToggleItem={handleToggleLeavingHomeItem}
                    onAddItem={handleAddLeavingHomeItem}
                    onRemoveItem={handleRemoveLeavingHomeItem}
                    onResetItems={handleResetLeavingHomeItems}
                />

                <AgendaDeHoje onEditTask={setEditingTask} />
                
            </div>

        </div>
    );
};