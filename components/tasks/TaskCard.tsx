
import React, { useState, useRef, useMemo } from 'react';
import type { Task, Tag } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskCard.module.css';

import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

// CORREÇÃO: Lógica de clique da Subtarefa refatorada
const SubtaskItem: React.FC<any> = ({ subtask, onToggle, onStartFocus, isPomodoroActive, isThisSubtaskFocused }) => {

    const isTimerTrigger = useMemo(() => subtask.text.toLowerCase().includes("iniciar pomodoro"), [subtask.text]);

    // Ação para o item inteiro (apenas para subtarefas normais)
    const handleItemClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isTimerTrigger) {
            onToggle();
        }
    };

    // Ação específica para o ícone de play
    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!subtask.completed && !isPomodoroActive) {
            onStartFocus();
        }
    };

    // Ação específica para o texto (marcar como feito)
    const handleTextClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggle();
    };

    const isEffectivelyDisabled = isPomodoroActive && !isThisSubtaskFocused;

    return (
        <div 
            className={`${styles.subtaskItem} ${subtask.completed ? styles.completed : ''} ${isTimerTrigger ? '' : styles.clickable}`}
            // Click no item inteiro só funciona para subtarefas normais
            onClick={!isTimerTrigger && !subtask.completed ? handleItemClick : undefined}
        >
            <div className={styles.subtaskCheckOrPlay}>
                {isTimerTrigger ? (
                     <div 
                        // Click no ícone só funciona para subtarefas de timer
                        onClick={handleIconClick}
                        className={`icon-button ${styles.subtaskPlayButton} ${isThisSubtaskFocused ? styles.activeFocus : ''} ${isEffectivelyDisabled ? styles.disabled : ''}`}>
                        <Icon path={isThisSubtaskFocused ? icons.zap : icons.play} />
                    </div>
                ) : (
                    <div className={styles.subtaskCheckbox}></div>
                )}
            </div>
            <span 
                // Click no texto só é separado para subtarefas de timer
                onClick={isTimerTrigger ? handleTextClick : undefined}
                className={isTimerTrigger ? styles.clickableText : ''}
            >
                {subtask.text.replace(/\(iniciar pomodoro\)/gi, '').trim()}
            </span>
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
    onEdit: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, tags, onEdit }) => {
    const { handleCompleteTask, setFrogTaskId, frogTaskId, handleDeleteTask, handleToggleSubtask } = useTasks();
    const { startFocusOnTask, activeTaskId, activeSubtaskId, status } = usePomodoro(); 

    const [subtasksVisible, setSubtasksVisible] = useState(true);
    const [isTooltipActive, setIsTooltipActive] = useState(false);
    const longPressTimer = useRef<NodeJS.Timeout>();
    const swipeThreshold = 80;

    const hasPendingSubtasks = useMemo(() => task.subtasks?.some(st => !st.completed) ?? false, [task.subtasks]);
    const isPomodoroActive = status !== 'idle';
    
    const mainActionType = useMemo(() => {
        const focusMustBeTriggeredBySubtask = task.subtasks?.some(st => st.text.toLowerCase().includes("iniciar pomodoro")) ?? false;
        const isPomodoroTask = task.pomodoroEstimate > 0;

        if (focusMustBeTriggeredBySubtask) {
            return 'subtask_focus';
        }
        if (isPomodoroTask) {
            return 'focus';
        }
        return 'check';
    }, [task.pomodoroEstimate, task.subtasks]);


    const [{ x, scale }, api] = useSpring(() => ({ 
        x: 0, 
        scale: 1, 
    }));

    const bind = useDrag(({ down, movement: [mx], cancel, canceled }) => {
        if (canceled) return;
        if (down) {
            api.start({ x: mx, scale: 1.05, immediate: true });
        } else {
            if (mx > swipeThreshold && !hasPendingSubtasks) {
                api.start({ 
                    x: window.innerWidth, 
                    onRest: () => handleCompleteTask(task.id)
                });
                return;
            } else if (mx < -swipeThreshold) {
                api.start({ 
                    x: -window.innerWidth, 
                    onRest: () => handleDeleteTask(task.id)
                });
                return;
            }
            api.start({ x: 0, scale: 1 });
        }
    }, { axis: 'x', filterTaps: true, rubberband: true, from: () => [x.get(), 0] });

    const handleCompleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (hasPendingSubtasks) return;
        handleCompleteTask(task.id);
    };

    const handleFocusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPomodoroActive) return;
        startFocusOnTask(task.id, task.title, task.customDuration);
    };

    const handleMouseDown = () => {
        if (!hasPendingSubtasks) return;
        longPressTimer.current = setTimeout(() => setIsTooltipActive(true), 400);
    };
    const handleMouseUp = () => {
        clearTimeout(longPressTimer.current);
        setIsTooltipActive(false);
    };

    const cardWrapperClasses = `${styles.cardWrapper} ${hasPendingSubtasks && isTooltipActive ? styles.tooltipActive : ''}`;

    const taskTag = task.tagId ? tags.find(t => t.id === task.tagId) : null;
    const isFrog = frogTaskId === task.id;
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;
    const isCurrentlyFocusedOnThisTask = activeTaskId === task.id;

    const rightBgOpacity = x.to(val => (hasPendingSubtasks ? 0 : Math.max(0, val / swipeThreshold) * 0.7));
    const leftBgOpacity = x.to(val => Math.max(0, -val / swipeThreshold) * 0.7);

    return (
        <div className={cardWrapperClasses} data-tooltip="Complete as subtarefas primeiro">
            <animated.div className={`${styles.swipeBackground} ${styles.completeBackground}`} style={{ opacity: rightBgOpacity }}><div className={styles.swipeIcon}><Icon path={icons.check} /><span>Concluir</span></div></animated.div>
            <animated.div className={`${styles.swipeBackground} ${styles.deleteBackground}`} style={{ opacity: leftBgOpacity }}><div className={styles.swipeIcon}><Icon path={icons.trash} /><span>Excluir</span></div></animated.div>

            <animated.div {...bind()} className={`${styles.cardContent} ${styles.taskCard} ${task.status === 'done' ? styles.statusDone : ''}`} style={{ x, scale }}>
                <div className={styles.taskCardHeader}>
                    <div className={styles.taskCardTitleGroup}>
                        <div className={styles.mainActionContainer}>
                            {mainActionType === 'focus' && (
                                <button 
                                    title={isCurrentlyFocusedOnThisTask && isPomodoroActive ? "Focando nesta tarefa" : "Iniciar Foco"} 
                                    onClick={handleFocusClick}
                                    className={`icon-button ${styles.mainPlayButton} ${isCurrentlyFocusedOnThisTask && isPomodoroActive ? styles.activeFocus : ''}`}
                                    disabled={isPomodoroActive}
                                >
                                    <Icon path={isCurrentlyFocusedOnThisTask && isPomodoroActive ? icons.zap : icons.play} />
                                </button>
                            )}
                            {mainActionType === 'check' && (
                                <div 
                                    className={`${styles.checkbox} ${hasPendingSubtasks ? styles.disabled : ''}`}
                                    onClick={handleCompleteClick}
                                    onMouseDown={handleMouseDown}
                                    onMouseUp={handleMouseUp}
                                    onTouchStart={handleMouseDown}
                                    onTouchEnd={handleMouseUp}
                                ></div>
                            )}
                            {mainActionType === 'subtask_focus' && (
                                <div className={styles.actionPlaceholder}></div>
                            )}
                        </div>
                        <h4>{task.title}</h4>
                    </div>
                    <div className={styles.taskCardActions}>
                        <button title={isFrog ? "Desmarcar Sapo do Dia" : "Marcar como Sapo do Dia"} onClick={(e) => {e.stopPropagation(); setFrogTaskId(isFrog ? null : task.id);}} className={`icon-button ${isFrog ? styles.frogIconActive : ''}`}><Icon path={icons.frog} /></button>
                        <button title="Editar Tarefa" onClick={(e) => {e.stopPropagation(); onEdit(task);}} className="icon-button"><Icon path={icons.pencil} /></button>
                    </div>
                </div>

                {task.description && <p className={styles.taskCardDescription}>{task.description}</p>}

                {task.subtasks && task.subtasks.length > 0 && (
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
                                        onStartFocus={() => startFocusOnTask(task.id, task.title, task.customDuration, subtask.id, subtask.text.replace(/\(iniciar pomodoro\)/gi, '').trim())}
                                        isPomodoroActive={isPomodoroActive}
                                        isThisSubtaskFocused={isCurrentlyFocusedOnThisTask && activeSubtaskId === subtask.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {(task.pomodoroEstimate > 0 || taskTag || energyInfo) &&
                    <div className={styles.taskCardFooter}>
                        <div className={styles.footerTags}>
                            {task.pomodoroEstimate > 0 && 
                                <div className={`${styles.footerTag} ${styles.pomodoroTag}`}>
                                    <Icon path={icons.pomodoro} />
                                    <span>{task.pomodoroEstimate}</span>
                                </div>
                            }
                            {taskTag && 
                                <div className={styles.footerTag} style={{ backgroundColor: taskTag.color }}>
                                    {taskTag.name}
                                </div>
                            }
                        </div>
                        {energyInfo && 
                            <div title={`Energia: ${energyInfo.label}`} className={`${styles.footerTag} ${styles.energyTag}`}>
                                <Icon path={energyInfo.icon} />
                            </div>
                        }
                    </div>
                }
            </animated.div>
        </div>
    );
};
