
import React, { useState } from 'react';
import type { Task, Subtask, Quadrant, EnergyLevel } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskCard.module.css'; // Nosso novo CSS Module

// --- Sub-componentes e Constantes (mantidos para o conteúdo do card) ---
const SubtaskItem: React.FC<any> = ({ subtask, onToggle, onFocus }) => (
    <div className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
        <div className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`} onClick={onToggle}><Icon path={icons.check} /></div>
        <span onClick={onFocus}>{subtask.text}</span>
    </div>
);
const energyLevelMap: Record<EnergyLevel, any> = { low: { label: 'Baixa', icon: 'battery' }, medium: { label: 'Média', icon: 'battery' }, high: { label: 'Alta', icon: 'battery' } };


// --- O Novo e Reimaginado TaskCard ---
export const TaskCard: React.FC<any> = ({ task, onEdit, onSubtaskClick, onToggleSubtask, onDragStart, onDragEnd, isDragging }) => {
    const { tags, handleCompleteTask, setFrogTaskId, frogTaskId, handleDeleteTask, handleDuplicateTask } = useTasks();
    const { handleNavigate, setTaskInFocus, setSubtaskInFocusId } = useUI();

    // Estado simplificado: o painel de ações está visível?
    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [subtasksVisible, setSubtasksVisible] = useState(true);

    const taskTag = task.tagId ? tags.find(t => t.id === task.tagId) : null;
    const isFrog = frogTaskId === task.id;
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isOverdue = task.dueDate && new Date(task.dueDate + 'T00:00:00') < today && task.status !== 'done';
    const isQuickAction = (task.pomodoroEstimate ?? 0) === 0;
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;

    const cardBaseClass = ['task-card', `status-${task.status}`, isDragging ? 'dragging' : '', isFrog ? 'frog-task-card' : '' ].join(' ').trim();

    const handleStartFocus = () => {
        setTaskInFocus(task);
        const firstIncompleteSubtask = task.subtasks?.find(st => !st.completed);
        setSubtaskInFocusId(firstIncompleteSubtask ? firstIncompleteSubtask.id : null);
        handleNavigate('focus');
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            handleDeleteTask(task.id);
        }
    };

    return (
        <div className={`${styles.cardWrapper} ${isActionsVisible ? styles.actionsPanelVisible : ''}`}>
            {/* Painel de Ações (inicialmente oculto fora da tela) */}
            <div className={styles.actionsPanel}>
                <button className={styles.actionButton} onClick={() => { onEdit(task); setIsActionsVisible(false); }}>
                    <Icon path={icons.pencil} />
                    <span>Editar</span>
                </button>
                <button className={styles.actionButton} onClick={() => { handleDuplicateTask(task.id); setIsActionsVisible(false); }}>
                    <Icon path={icons.copy} />
                    <span>Duplicar</span>
                </button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => { handleDelete(); setIsActionsVisible(false); }}>
                    <Icon path={icons.trash} />
                    <span>Excluir</span>
                </button>
            </div>

            {/* Conteúdo do Card (que desliza) */}
            <div 
                className={`${styles.cardContent} ${cardBaseClass}`}
                draggable={!!onDragStart}
                onDragStart={(e) => onDragStart?.(e, task)}
                onDragEnd={onDragEnd}
            >
                {taskTag && <div className="task-card-top-border" style={{ backgroundColor: taskTag.color }}></div>}

                <div className="task-card-header">
                    <div className="task-card-title-group">
                        <button className={`task-complete-button ${task.status === 'done' ? 'completed' : ''}`} onClick={() => handleCompleteTask(task.id)}>
                            {task.status === 'done' && <Icon path={icons.check} />}
                        </button>
                        <h4 onClick={() => onEdit(task)}>{task.title}</h4>
                    </div>
                    <div className="task-card-actions">
                        {task.status !== 'done' && !isQuickAction && (
                            <button onClick={handleStartFocus} className="icon-button focus-task-button"><Icon path={icons.play} /></button>
                        )}
                        <button onClick={() => setFrogTaskId(isFrog ? null : task.id)} className="icon-button">
                            <Icon path={icons.frog} className={isFrog ? 'frog-icon-active' : 'frog-icon'} />
                        </button>
                        {/* O botão de 3 pontinhos agora controla o painel */}
                        <button onClick={() => setIsActionsVisible(!isActionsVisible)} className="icon-button">
                            <Icon path={isActionsVisible ? icons.close : icons.ellipsis} />
                        </button>
                    </div>
                </div>

                {task.description && <p className="task-card-description">{task.description}</p>}

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className={`subtasks-section ${!subtasksVisible ? 'collapsed' : ''}`}>
                         <div className="subtasks-header" onClick={() => setSubtasksVisible(!subtasksVisible)}>
                            <div className="subtasks-header-title">Subtarefas ({completedSubtasks}/{totalSubtasks})</div>
                            <Icon path={icons.chevronDown} className="collapsible-chevron" />
                        </div>
                        <div className="subtasks-content">
                            {task.subtasks.map(subtask => (<SubtaskItem key={subtask.id} subtask={subtask} onToggle={() => onToggleSubtask(task.id, subtask.id)} onFocus={() => { if (!subtask.completed) onSubtaskClick(task.id, subtask.id) }}/>))}
                            <div className="subtasks-progress"><div className="subtasks-progress-bar-container"><div className="subtasks-progress-bar" style={{ width: `${progressPercentage}%` }}></div></div><span className="subtasks-progress-text">{Math.round(progressPercentage)}%</span></div>
                        </div>
                    </div>
                )}

                <div className="task-card-footer">
                    {isOverdue && <div className="task-card-badge overdue-badge"><Icon path={icons.alertTriangle} /><span>Atrasada</span></div>}
                    {task.dueDate && <div className="task-card-badge"><Icon path={icons.calendar} /><span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>}
                    {!isQuickAction ? (<div className="task-card-badge pomodoro-badge"><Icon path={icons.timer} /><span>{task.pomodoroEstimate} Pomodoro(s)</span></div>) : (<div className="task-card-badge" style={{opacity: 0.8, borderColor: 'var(--success-color)', color: 'var(--success-color)'}}><Icon path={icons.checkCircle} /><span>Rápida</span></div>)}
                    {energyInfo && <div className={`task-card-badge energy-badge-${task.energyNeeded}`}><Icon path={energyInfo.icon} /><span>{energyInfo.label}</span></div>}
                    {taskTag && <div className="task-card-badge tag-badge" style={{ backgroundColor: taskTag.color }}><span>{taskTag.name}</span></div>}
                </div>
            </div>
        </div>
    );
};
