
import React, { useState, useMemo, useEffect } from 'react';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/modals/TaskModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task } from '../types';
import { FocusConfirmationModal } from '../components/modals/FocusConfirmationModal';
import { FinalizeTaskModal } from '../components/modals/FinalizeTaskModal';
import { DailyAgenda } from '../components/tasks/DailyAgenda';
import { LeavingHomeChecklist } from '../components/dashboard/LeavingHomeChecklist';
import { MorningReviewModal } from '../components/modals/MorningReviewModal';
import { EndDayReviewModal } from '../components/modals/EndDayReviewModal';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Bom dia', icon: icons.sun, gradient: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)' }; // Sunrise
    if (hour < 18) return { text: 'Boa tarde', icon: icons.sun, gradient: 'linear-gradient(135deg, #56CCF2 0%, #2F80ED 100%)' }; // Blue Sky
    return { text: 'Boa noite', icon: icons.moon, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }; // Night Purple
};

export const DashboardScreen: React.FC = () => {
    const { tasks, frogTaskId, handleCompleteTask, handleToggleSubtask, handleAddTask } = useTasks();
    const { handleNavigate, setTaskInFocus, setSubtaskInFocusId, installPrompt, handleInstallApp, setIsMorningReviewOpen, addNotification } = useUI();
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [subtaskToFocus, setSubtaskToFocus] = useState<{task: Task, subtask: Task['subtasks'][0]} | null>(null);
    const [taskToFinalize, setTaskToFinalize] = useState<Task | null>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);
    
    // Brain Dump State
    const [brainDumpText, setBrainDumpText] = useState('');

    const greeting = getGreeting();

    useEffect(() => {
        const checkStandalone = () => {
            const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
                                     (window.navigator as any).standalone === true;
            setIsStandalone(isStandaloneMode);
        };
        checkStandalone();
        window.addEventListener('resize', checkStandalone);
        return () => window.removeEventListener('resize', checkStandalone);
    }, []);

    const frogTask = useMemo(() => tasks.find(t => t.id === frogTaskId && t.status !== 'done'), [tasks, frogTaskId]);
    
    const todayTasks = useMemo(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;
        
        return tasks.filter(task => task.dueDate === todayString && task.status !== 'done');
    }, [tasks]);

    const handleSubtaskClick = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const subtask = task?.subtasks?.find(st => st.id === subtaskId);
        if (task && subtask && !subtask.completed) {
            setSubtaskToFocus({task, subtask});
        } else if (task && subtask && subtask.completed) {
            handleCompleteTask(taskId, subtaskId);
        }
    };
    
    const handleStartFocus = () => {
        if (subtaskToFocus) {
            setTaskInFocus(subtaskToFocus.task);
            setSubtaskInFocusId(subtaskToFocus.subtask.id);
            handleNavigate('focus');
            setSubtaskToFocus(null);
        }
    };

    const handleConfirmCompleteSubtask = () => {
        if(subtaskToFocus){
            handleCompleteTask(subtaskToFocus.task.id, subtaskToFocus.subtask.id);
            setSubtaskToFocus(null);
        }
    };

    const handleAgendaTaskClick = (task: Task) => {
        if (task.status === 'done') {
            handleCompleteTask(task.id);
            return;
        }
        if (task.pomodoroEstimate && task.pomodoroEstimate > 0) {
            setTaskInFocus(task);
            setSubtaskInFocusId(null);
            handleNavigate('focus');
        } else {
            handleCompleteTask(task.id);
        }
    };

    const handleBrainDumpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (brainDumpText.trim()) {
            handleAddTask({
                title: brainDumpText,
                quadrant: 'inbox',
                pomodoroEstimate: 1,
                energyNeeded: 'medium'
            });
            setBrainDumpText('');
            addNotification('Enviado para Caixa de Entrada!', '📥');
        }
    };

    const handleInstallClick = () => {
        if (installPrompt) {
            handleInstallApp();
        } else {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
            if (isIOS) {
                setShowIOSInstructions(true);
            } else {
                alert('Para instalar: Toque no menu do seu navegador (três pontinhos) e selecione "Adicionar à Tela Inicial" ou "Instalar Aplicativo".');
            }
        }
    };

    return (
        <main className="dashboard-screen">
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={() => setEditingTask(null)} />}
            {subtaskToFocus && (
                <FocusConfirmationModal 
                    task={subtaskToFocus.task}
                    subtask={subtaskToFocus.subtask}
                    onConfirmFocus={handleStartFocus}
                    onConfirmComplete={handleConfirmCompleteSubtask}
                    onCancel={() => setSubtaskToFocus(null)}
                />
            )}
            {taskToFinalize && (
                <FinalizeTaskModal
                    task={taskToFinalize}
                    onConfirm={() => {
                        handleCompleteTask(taskToFinalize.id);
                        setTaskToFinalize(null);
                    }}
                    onCancel={() => setTaskToFinalize(null)}
                />
            )}
            <MorningReviewModal />
            <EndDayReviewModal />

            {/* Header Dinâmico */}
            <div className="dashboard-header" style={{ background: greeting.gradient }}>
                <div className="greeting-content">
                    <Icon path={greeting.icon} />
                    <h2>{greeting.text}!</h2>
                    <p style={{ opacity: 0.9 }}>Vamos fazer acontecer hoje?</p>
                </div>
            </div>

            {/* Brain Dump Input */}
            <div className="brain-dump-container">
                <form onSubmit={handleBrainDumpSubmit} className="brain-dump-form">
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
            </div>

            {/* Install Prompt (Hidden if standalone) */}
            {!isStandalone && (
                <div className="card install-card" style={{borderColor: 'var(--success-color)'}}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                             <h3 style={{ fontSize: '1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success-color)' }}>
                                <Icon path={icons.rocket} /> Instalar App
                             </h3>
                        </div>
                        <button className="control-button primary small" onClick={handleInstallClick}>
                            {installPrompt ? 'Instalar' : 'Como?'}
                        </button>
                    </div>
                    {showIOSInstructions && (
                        <div className="ios-instructions">
                            <p>Toque em <strong>Compartilhar</strong> <Icon path="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /> e depois em <strong>"Adicionar à Tela de Início"</strong>.</p>
                            <button onClick={() => setShowIOSInstructions(false)}>Entendi</button>
                        </div>
                    )}
                </div>
            )}
            
            <div className="card frog-card">
                <div className="frog-card-header">
                    <h3><Icon path={icons.frog} /> Sapo do Dia</h3>
                    {frogTask && (
                        <button className="control-button secondary small" onClick={() => setIsMorningReviewOpen(true)}>
                            Alterar
                        </button>
                    )}
                </div>
                {frogTask ? (
                    <>
                        <p>Sua prioridade #1. Completar isso muda o jogo.</p>
                        <TaskCard 
                            task={frogTask} 
                            onEdit={setEditingTask} 
                            onSubtaskClick={handleSubtaskClick}
                            onToggleSubtask={handleToggleSubtask}
                            isDragging={false}
                        />
                    </>
                ) : (
                    <div className="empty-state">
                        <p>Ainda não escolheu seu Sapo?</p>
                        <button className="control-button" onClick={() => setIsMorningReviewOpen(true)}>
                            <Icon path={icons.target} />
                            <span>Definir Foco Agora</span>
                        </button>
                    </div>
                )}
            </div>

            <LeavingHomeChecklist />
            
            <div style={{ marginTop: '1rem' }}>
                <button 
                    className="control-button secondary" 
                    style={{ width: '100%', marginBottom: '1.5rem', justifyContent: 'center' }} 
                    onClick={() => handleNavigate('tasks')}
                >
                    <Icon path={icons.layoutGrid} /> Organizar Matriz Completa
                </button>
            </div>

            <DailyAgenda tasks={todayTasks} frogTaskId={frogTaskId} onTaskClick={handleAgendaTaskClick} />
            
        </main>
    );
};
