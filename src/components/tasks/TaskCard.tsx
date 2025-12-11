
import React, { useState, useRef, useMemo, useEffect } from 'react';
import type { Task, Tag, Quadrant } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskCard.module.css';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const SubtaskItem: React.FC<any> = ({ subtask, onToggle }) => {
    return (
        <div 
            className={`${styles.subtaskItem} ${subtask.completed ? styles.completed : ''} ${styles.clickable}`}
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
            <div className={styles.subtaskCheckbox}></div>
            <span>{subtask.text}</span>
        </div>
    );
};

const energyLevelMap: Record<string, { label: string, icon: keyof typeof icons }> = {
    low: { label: 'Baixa', icon: 'batteryLow' },
    medium: { label: 'Média', icon: 'batteryMedium' },
    high: { label: 'Alta', icon: 'batteryFull' },
};

interface TaskCardProps {
    task: Task;
    tags: Tag[];
    onEdit?: (task: Task) => void;
    onDragStart?: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragEnd?: (e: React.DragEvent<HTMLDivElement>) => void;
    isDragging?: boolean;
    quadrant: Quadrant;
    onTriage?: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, tags, onEdit, onDragStart, onDragEnd, isDragging, quadrant, onTriage }) => {
    const { handleCompleteTask, handleSetFrog, frogTaskId, handleDeleteTask, handleToggleSubtask } = useTasks();
    const { startFocusOnTask, activeTaskId, status } = usePomodoro(); 
    const { addNotification, handleNavigate } = useUI(); // Adicionado handleNavigate

    const [subtasksVisible, setSubtasksVisible] = useState(true);
    const longPressTimer = useRef<NodeJS.Timeout>();
    const swipeThreshold = 80;

    const isInInbox = quadrant === 'inbox';
    const hasPendingSubtasks = useMemo(() => task.subtasks?.some(st => !st.completed) ?? false, [task.subtasks]);
    const isPomodoroActive = status !== 'idle';
    const [isDraggable, setIsDraggable] = useState(false);

    const isFrog = frogTaskId === task.id;

    const mainActionType = useMemo(() => {
        if (isInInbox) return 'check';
        if (task.pomodoroEstimate > 0) return 'focus';
        return 'check';
    }, [task.pomodoroEstimate, isInInbox]);

    const [{ x, scale }, api] = useSpring(() => ({ x: 0, scale: 1 }));

    const showSubtaskWarning = () => {
        addNotification(
            'Finalize as subtarefas antes de concluir a tarefa principal.', 
            '⚠️', 
            'info'
        );
    };

    const handleComplete = () => {
        if (isFrog) {
            addNotification("Sapo do Dia Concluído! VITÓRIA!", "🐸", "success");
        }
        handleCompleteTask(task.id);
    };

    const bind = useDrag(({
        down, movement: [mx], axis, first, last, event, cancel
    }) => {
        if (isDraggable) return;

        if (first) {
            longPressTimer.current = setTimeout(() => {
                if (onDragStart) {
                    setIsDraggable(true);
                    const newEvent = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
                    event.target.dispatchEvent(newEvent);
                    cancel();
                }
            }, 400);
        }

        if (axis) clearTimeout(longPressTimer.current);

        if (mx > 0 && hasPendingSubtasks && !isInInbox) {
            if (down) {
                const limitedX = Math.min(mx, swipeThreshold / 2);
                api.start({ x: limitedX, scale: 1.05, immediate: true });
            }
            if (last) {
                showSubtaskWarning();
                api.start({ x: 0, scale: 1 });
            }
            return;
        }

        if (axis === 'x' && down) {
            api.start({ x: mx, scale: 1.05, immediate: true });
        }
        
        if (last) {
            clearTimeout(longPressTimer.current);
            if (axis === 'x') {
                if (mx > swipeThreshold) {
                    api.start({ x: window.innerWidth, onRest: handleComplete });
                    return;
                } else if (mx < -swipeThreshold) {
                    api.start({ x: -window.innerWidth, onRest: () => handleDeleteTask(task.id) });
                    return;
                }
            }
            api.start({ x: 0, scale: 1 });
        }
    }, {
        axis: 'lock', filterTaps: true, rubberband: true,
        from: () => [x.get(), 0],
        eventOptions: { passive: false },
        threshold: 10,
    });

    useEffect(() => {
        if (!isDragging) setIsDraggable(false);
    }, [isDragging]);

    const handleMainActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPendingSubtasks && !isInInbox) {
            showSubtaskWarning();
            return;
        }
        handleComplete();
    };

    const handleFocusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPomodoroActive) return;
        startFocusOnTask(task.id, task.title, task.customDuration);
        handleNavigate('focus'); // Navega para a tela de foco
    };

    const taskTag = task.tagId ? tags.find(t => t.id === task.tagId) : null;
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;
    const isCurrentlyFocusedOnThisTask = activeTaskId === task.id;
    const canBeCompleted = !hasPendingSubtasks || isInInbox;
    
    const rightBgText = isInInbox ? "Vitória Rápida" : "Concluir";
    const rightBgOpacity = x.to(val => (canBeCompleted ? Math.max(0, val / swipeThreshold) * 0.7 : 0));
    const leftBgOpacity = x.to(val => Math.max(0, -val / swipeThreshold) * 0.7);

    const cardClassName = `
        ${styles.taskCard}
        ${task.status === 'done' ? styles.statusDone : ''}
        ${isDragging ? styles.dragging : ''}
        ${isInInbox ? styles.inboxCard : ''}
        ${isFrog ? styles.isFrog : ''}
    `;

    return (
        <div className={styles.cardWrapper}>
            <animated.div className={`${styles.swipeBackground} ${styles.completeBackground}`} style={{ opacity: rightBgOpacity }}>
                <div className={styles.swipeIcon}><Icon path={icons.check} /><span>{rightBgText}</span></div>
            </animated.div>
            <animated.div className={`${styles.swipeBackground} ${styles.deleteBackground}`} style={{ opacity: leftBgOpacity }}>
                <div className={styles.swipeIcon}><Icon path={icons.trash} /><span>Excluir</span></div>
            </animated.div>

            <animated.div 
                {...bind()} 
                draggable={isDraggable}
                onDragStart={isDraggable ? onDragStart : undefined}
                onDragEnd={isDraggable ? (e) => { onDragEnd && onDragEnd(e); setIsDraggable(false); } : undefined}
                className={cardClassName}
                style={{ x, scale, touchAction: 'pan-y' }}
            >
                <div className={styles.taskCardContent}>
                    <div className={styles.taskCardHeader}>
                        <div className={styles.taskCardTitleGroup}>
                            {mainActionType === 'check' && (
                                <div 
                                    className={`${styles.checkbox} ${!canBeCompleted ? styles.disabled : ''}`}
                                    onClick={handleMainActionClick}
                                ></div>
                            )}
                            {mainActionType === 'focus' && (
                                <button title={isCurrentlyFocusedOnThisTask && isPomodoroActive ? "Focando" : "Iniciar Foco"} onClick={handleFocusClick}
                                    className={`icon-button ${styles.headerPlayButton} ${isCurrentlyFocusedOnThisTask && isPomodoroActive ? styles.activeFocus : ''}`}
                                    disabled={isPomodoroActive}>
                                    <Icon path={isCurrentlyFocusedOnThisTask && isPomodoroActive ? icons.zap : icons.play} />
                                </button>
                            )}
                            <h4>{task.title}</h4>
                        </div>
                        <div className={styles.taskCardActions}>
                            {isInInbox && onTriage ? (
                                <button title="Organizar Tarefa" onClick={(e) => {e.stopPropagation(); onTriage(task);}} className="icon-button">
                                    <Icon path={icons.layoutGrid} />
                                </button>
                            ) : (
                                <> 
                                    <button 
                                        title={isFrog ? "Este é o Sapo do Dia" : "Marcar como Sapo do Dia"}
                                        onClick={(e) => {e.stopPropagation(); handleSetFrog(task.id);}}
                                        disabled={isFrog}
                                        className={`icon-button ${isFrog ? styles.frogIconActive : ''}`}>
                                        <Icon path={icons.frog} />
                                    </button>
                                </>                            
                            )}
                            {onEdit && task.templateId !== 50 && <button title="Editar Tarefa" onClick={(e) => {e.stopPropagation(); onEdit(task);}} className="icon-button"><Icon path={icons.pencil} /></button>}
                        </div>
                    </div>

                    {task.description && !isInInbox && <p className={styles.taskCardDescription}>{task.description}</p>}

                    {task.subtasks && task.subtasks.length > 0 && !isInInbox && (
                        <div className={`${styles.subtasksSection} ${!subtasksVisible ? styles.collapsed : ''}`}>
                            <div className={styles.subtasksHeader} onClick={() => setSubtasksVisible(!subtasksVisible)}>
                                <div>Subtarefas ({task.subtasks.filter(st => st.completed).length}/{task.subtasks.length})</div>
                                <Icon path={icons.chevronDown} className={styles.collapsibleChevron} />
                            </div>
                            {subtasksVisible && (
                                <div className={styles.subtasksContent}>
                                    {task.subtasks.map(subtask => (
                                        <SubtaskItem 
                                            key={subtask.id} 
                                            subtask={subtask} 
                                            onToggle={() => handleToggleSubtask(task.id, subtask.id)} 
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {(taskTag || energyInfo) && !isInInbox &&
                        <div className={styles.taskCardFooter}>
                            <div className={styles.footerTags}>
                                {taskTag && <div className={styles.footerTag} style={{ backgroundColor: taskTag.color }}>{taskTag.name}</div>}
                            </div>
                            {energyInfo && <div title={`Energia: ${energyInfo.label}`} className={`${styles.footerTag} ${styles.energyTag}`}><Icon path={icons[energyInfo.icon]} /></div>}
                        </div>
                    }
                </div>
            </animated.div>
        </div>
    );
};
