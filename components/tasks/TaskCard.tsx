
import React, { useState } from 'react';
import type { Task } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { usePomodoro } from '../../context/PomodoroContext'; // Importe o hook do Pomodoro
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskCard.module.css';

const SubtaskItem: React.FC<any> = ({ subtask, onToggle, onFocus }) => (
    <div className={`${styles.subtaskItem} ${subtask.completed ? styles.completed : ''}`}>
        <div className={`${styles.subtaskCheckbox} ${subtask.completed ? styles.checked : ''}`} onClick={onToggle}>
            {subtask.completed && <Icon path={icons.check} />}
        </div>
        <span onClick={onFocus}>{subtask.text}</span>
    </div>
);

const energyLevelMap: Record<any, any> = { low: { label: 'Baixa', icon: 'battery' }, medium: { label: 'Média', icon: 'battery' }, high: { label: 'Alta', icon: 'battery' } };

export const TaskCard: React.FC<any> = ({ task, onEdit, onSubtaskClick, onToggleSubtask, onDragStart, onDragEnd, isDragging }) => {
    const { tags, handleCompleteTask, setFrogTaskId, frogTaskId, handleDeleteTask, handleDuplicateTask } = useTasks();
    const { handleNavigate, setTaskInFocus, setSubtaskInFocusId } = useUI();
    const { startFocusOnTask } = usePomodoro(); // Obtenha a função do contexto

    const [isActionsVisible, setIsActionsVisible] = useState(false);
    const [subtasksVisible, setSubtasksVisible] = useState(true);

    const taskTag = task.tagId ? tags.find(t => t.id === task.id) : null;
    const isFrog = frogTaskId === task.id;
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isOverdue = task.dueDate && new Date(task.dueDate + 'T00:00:00') < today && task.status !== 'done';
    const isQuickAction = (task.pomodoroEstimate ?? 0) === 0;
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;
    const energyBadgeClass = task.energyNeeded ? styles[`energyBadge${task.energyNeeded.charAt(0).toUpperCase() + task.energyNeeded.slice(1)}`] : '';

    const handleStartFocus = () => {
        startFocusOnTask(task.id, task.title);
    };

    return (
        <div className={`${styles.cardWrapper} ${isActionsVisible ? styles.actionsPanelVisible : ''} ${isDragging ? 'dragging' : ''}`}>
            <div className={styles.actionsPanel}>
                <button className={styles.actionButton} onClick={() => { onEdit(task); setIsActionsVisible(false); }}>
                    <Icon path={icons.pencil} />
                    <span>Editar</span>
                </button>
                <button className={styles.actionButton} onClick={() => { handleDuplicateTask(task.id); setIsActionsVisible(false); }}>
                    <Icon path={icons.copy} />
                    <span>Duplicar</span>
                </button>
                <button className={`${styles.actionButton} ${styles.danger}`} onClick={() => { handleDeleteTask(task.id); setIsActionsVisible(false); }}>
                    <Icon path={icons.trash} />
                    <span>Excluir</span>
                </button>
            </div>

            <div
                className={`${styles.cardContent} ${styles.taskCard} ${task.status === 'done' ? styles.statusDone : ''} ${isFrog ? 'frog-task-card' : ''}`}
                draggable={!!onDragStart}
                onDragStart={(e) => onDragStart?.(e, task)}
                onDragEnd={onDragEnd}
                style={taskTag ? { borderTop: `4px solid ${taskTag.color}` } : {}}
            >
                <div className={styles.taskCardHeader}>
                    <div className={styles.taskCardTitleGroup}>
                        <button className={`${styles.taskCompleteButton} ${task.status === 'done' ? styles.completed : ''}`} onClick={() => handleCompleteTask(task.id)}>
                            {task.status === 'done' && <Icon path={icons.check} />}
                        </button>
                        <h4 onClick={() => onEdit(task)}>{task.title}</h4>
                    </div>
                    <div className={styles.taskCardActions}>
                        {task.status !== 'done' && !isQuickAction && (
                            <button onClick={handleStartFocus} className="icon-button focus-task-button"><Icon path={icons.play} /></button>
                        )}
                        <button onClick={() => setFrogTaskId(isFrog ? null : task.id)} className="icon-button">
                            <Icon path={icons.frog} className={isFrog ? 'frog-icon-active' : 'frog-icon'} />
                        </button>
                        <button onClick={() => setIsActionsVisible(!isActionsVisible)} className="icon-button">
                            <Icon path={isActionsVisible ? icons.close : icons.ellipsis} />
                        </button>
                    </div>
                </div>

                {task.description && <p className={styles.taskCardDescription}>{task.description}</p>}

                {task.subtasks && task.subtasks.length > 0 && (
                    <div className={`${styles.subtasksSection} ${!subtasksVisible ? styles.collapsed : ''}`}>
                         <div className={styles.subtasksHeader} onClick={() => setSubtasksVisible(!subtasksVisible)}>
                            <div>Subtarefas ({completedSubtasks}/{totalSubtasks})</div>
                            <Icon path={icons.chevronDown} className={styles.collapsibleChevron} />
                        </div>
                        {subtasksVisible && (
                            <div className={styles.subtasksContent}>
                                {task.subtasks.map(subtask => (<SubtaskItem key={subtask.id} subtask={subtask} onToggle={() => onToggleSubtask(task.id, subtask.id)} onFocus={() => { if (!subtask.completed) onSubtaskClick(task.id, subtask.id) }}/>))}
                                <div className={styles.subtasksProgress}>
                                    <div className={styles.subtasksProgressBarContainer}>
                                        <div className={styles.subtasksProgressBar} style={{ width: `${progressPercentage}%` }}></div>
                                    </div>
                                    <span className={styles.subtasksProgressText}>{Math.round(progressPercentage)}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.taskCardFooter}>
                    {isOverdue && <div className={`${styles.taskCardBadge} ${styles.overdueBadge}`}><Icon path={icons.alertTriangle} /><span>Atrasada</span></div>}
                    {task.dueDate && <div className={styles.taskCardBadge}><Icon path={icons.calendar} /><span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>}
                    {!isQuickAction ? (<div className={styles.taskCardBadge}><Icon path={icons.timer} /><span>{task.pomodoroEstimate} Pomodoro(s)</span></div>) : (<div className={styles.taskCardBadge} style={{opacity: 0.8, borderColor: 'var(--success-color)', color: 'var(--success-color)'}}><Icon path={icons.checkCircle} /><span>Rápida</span></div>)}
                    {energyInfo && <div className={`${styles.taskCardBadge} ${energyBadgeClass}`}><Icon path={energyInfo.icon} /><span>{energyInfo.label}</span></div>}
                    {taskTag && <div className={`${styles.taskCardBadge} ${styles.tagBadge}`} style={{ backgroundColor: taskTag.color }}><span>{taskTag.name}</span></div>}
                </div>
            </div>
        </div>
    );
};
