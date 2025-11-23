
import React, { useState, useRef, useEffect } from 'react';
import type { Task, Subtask, Quadrant, EnergyLevel } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { quadrants } from '../../constants';

interface TaskCardProps {
    task: Task;
    onEdit: (task: Partial<Task>) => void;
    onSubtaskClick: (taskId: string, subtaskId: string) => void;
    onToggleSubtask: (taskId: string, subtaskId: string) => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
    isDragging?: boolean;
}

const SubtaskItem: React.FC<{ 
    subtask: Subtask, 
    onToggle: () => void, 
    onFocus: () => void 
}> = ({ subtask, onToggle, onFocus }) => (
    <div className={`subtask-item ${subtask.completed ? 'completed' : ''}`}>
        <div 
            className={`subtask-checkbox ${subtask.completed ? 'checked' : ''}`}
            onClick={onToggle}
            role="checkbox"
            aria-checked={subtask.completed}
            tabIndex={0}
            onKeyPress={(e) => (e.key === ' ' || e.key === 'Enter') && onToggle()}
        >
            <Icon path={icons.check} />
        </div>
        <span onClick={onFocus}>{subtask.text}</span>
    </div>
);

const energyLevelMap: Record<EnergyLevel, { label: string; icon: keyof typeof icons }> = {
    low: { label: 'Baixa', icon: 'battery' },
    medium: { label: 'Média', icon: 'battery' },
    high: { label: 'Alta', icon: 'battery' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onSubtaskClick, onToggleSubtask, onDragStart, onDragEnd, isDragging }) => {
    const { tasks, tags, handleCompleteTask, setFrogTaskId, frogTaskId, handleDeleteTask, handleUpdateTaskQuadrant, handleDuplicateTask, handlePostponeTask } = useTasks();
    const { handleNavigate, setTaskInFocus, setSubtaskInFocusId } = useUI();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [subtasksVisible, setSubtasksVisible] = useState(true);
    const menuRef = useRef<HTMLDivElement>(null);
    
    const taskTag = task.tagId ? tags.find(t => t.id === task.tagId) : null;
    const isFrog = frogTaskId === task.id;

    // Subtask progress calculation
    const totalSubtasks = task.subtasks?.length || 0;
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const progressPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isOverdue = task.dueDate && new Date(task.dueDate + 'T00:00:00') < today && task.status !== 'done';
    
    // Check if it's a quick action (0 pomodoros)
    const isQuickAction = (task.pomodoroEstimate ?? 0) === 0;

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        onDragStart?.(e, task);
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    const handleStartFocus = () => {
        setTaskInFocus(task);
        const firstIncompleteSubtask = task.subtasks?.find(st => !st.completed);
        if (firstIncompleteSubtask) {
            setSubtaskInFocusId(firstIncompleteSubtask.id);
        } else {
            setSubtaskInFocusId(null);
        }
        handleNavigate('focus');
    };

    const cardClass = [
        'task-card',
        `status-${task.status}`,
        isDragging ? 'dragging' : '',
        isFrog ? 'frog-task-card' : '',
        isMenuOpen ? 'menu-open' : ''
    ].join(' ').trim();

    const availableQuadrants = quadrants.filter(q => q.id !== task.quadrant && q.id !== 'inbox');
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;

    return (
        <div 
            className={cardClass}
            draggable={!!onDragStart && task.status !== 'done'}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
        >
            {taskTag && <div className="task-card-top-border" style={{ backgroundColor: taskTag.color }}></div>}

            <div className="task-card-header">
                <div className="task-card-title-group">
                    <button 
                        className={`task-complete-button ${task.status === 'done' ? 'completed' : ''}`}
                        onClick={() => handleCompleteTask(task.id)}
                        aria-label={task.status === 'done' ? 'Marcar como não concluída' : 'Marcar como concluída'}
                    >
                        {task.status === 'done' && <Icon path={icons.check} />}
                    </button>
                    <h4 onClick={() => onEdit(task)}>{task.title}</h4>
                </div>
                <div className="task-card-actions">
                     {task.status !== 'done' && !isQuickAction && (
                        <button onClick={handleStartFocus} className="icon-button focus-task-button" aria-label="Iniciar Foco" title="Iniciar Foco">
                            <Icon path={icons.play} />
                        </button>
                    )}
                    <button 
                        onClick={() => setFrogTaskId(isFrog ? null : task.id)} 
                        className="icon-button" 
                        aria-label={isFrog ? 'Remover como Sapo do Dia' : 'Marcar como Sapo do Dia'}
                        title={isFrog ? 'Remover como Sapo do Dia' : 'Marcar como Sapo do Dia'}
                    >
                        <Icon path={icons.frog} className={isFrog ? 'frog-icon-active' : 'frog-icon'} />
                    </button>
                    <div className="dropdown" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="icon-button" aria-label="Mais opções">
                            <Icon path={icons.ellipsis} />
                        </button>
                        {isMenuOpen && (
                            <div className="dropdown-menu">
                                <button className="dropdown-item" onClick={() => { onEdit(task); setIsMenuOpen(false); }}>
                                    <Icon path={icons.pencil} /> Editar
                                </button>
                                <button className="dropdown-item" onClick={() => { handleDuplicateTask(task.id); setIsMenuOpen(false); }}>
                                    <Icon path={icons.copy} /> Duplicar
                                </button>
                                <div className="dropdown-divider"></div>
                                <div className="dropdown-header-label">Mover para:</div>
                                {availableQuadrants.map(q => (
                                     <button key={q.id} className="dropdown-item" onClick={() => { handleUpdateTaskQuadrant(task.id, q.id as Quadrant, tasks.filter(t => t.quadrant === q.id).length); setIsMenuOpen(false); }}>
                                        <Icon path={icons[q.icon as keyof typeof icons]} /> {q.title}
                                    </button>
                                ))}
                                {task.quadrant !== 'inbox' && (
                                     <button className="dropdown-item" onClick={() => { handleUpdateTaskQuadrant(task.id, 'inbox', 0); setIsMenuOpen(false); }}>
                                        <Icon path={icons.list} /> Inbox
                                    </button>
                                )}
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" onClick={() => { handlePostponeTask(task.id, 1); setIsMenuOpen(false); }}>
                                    <Icon path={icons.calendar} /> Adiar 1 Dia
                                </button>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item delete-item" onClick={() => { handleDeleteTask(task.id); setIsMenuOpen(false); }}>
                                    <Icon path={icons.trash} /> Excluir
                                </button>
                            </div>
                        )}
                    </div>
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
                        {task.subtasks.map(subtask => (
                            <SubtaskItem 
                                key={subtask.id} 
                                subtask={subtask} 
                                onToggle={() => onToggleSubtask(task.id, subtask.id)}
                                onFocus={() => { if (!subtask.completed) onSubtaskClick(task.id, subtask.id) }}
                            />
                        ))}
                        <div className="subtasks-progress">
                            <div className="subtasks-progress-bar-container">
                                <div className="subtasks-progress-bar" style={{ width: `${progressPercentage}%` }}></div>
                            </div>
                            <span className="subtasks-progress-text">{Math.round(progressPercentage)}%</span>
                        </div>
                    </div>
                </div>
            )}


            <div className="task-card-footer">
                {isOverdue && (
                    <div className="task-card-badge overdue-badge">
                        <Icon path={icons.alertTriangle} />
                        <span>Atrasada</span>
                    </div>
                )}
                {task.dueDate && (
                    <div className="task-card-badge">
                        <Icon path={icons.calendar} />
                        <span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                    </div>
                )}
                 {!isQuickAction ? (
                    <div className="task-card-badge pomodoro-badge">
                        <Icon path={icons.timer} />
                        <span>{task.pomodoroEstimate} {task.pomodoroEstimate && task.pomodoroEstimate > 1 ? 'Pomodoros' : 'Pomodoro'}</span>
                    </div>
                ) : (
                     <div className="task-card-badge" style={{opacity: 0.8, borderColor: 'var(--success-color)', color: 'var(--success-color)'}}>
                        <Icon path={icons.checkCircle} />
                        <span>Rápida</span>
                    </div>
                )}
                {energyInfo && (
                    <div className={`task-card-badge energy-badge-${task.energyNeeded}`}>
                        <Icon path={energyInfo.icon} />
                        <span>{energyInfo.label}</span>
                    </div>
                )}
                {taskTag && (
                     <div className="task-card-badge tag-badge" style={{ backgroundColor: taskTag.color }}>
                        <span>{taskTag.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
