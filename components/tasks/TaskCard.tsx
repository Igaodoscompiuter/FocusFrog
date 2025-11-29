import React, { useState } from 'react';
import type { Task } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { usePomodoro } from '../../context/PomodoroContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TaskCard.module.css';

import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';

const SubtaskItem: React.FC<any> = ({ subtask, onToggle, onFocus }) => (
    <div className={`${styles.subtaskItem} ${subtask.completed ? styles.completed : ''}`}>
        <div className={`${styles.subtaskCheckbox} ${subtask.completed ? styles.checked : ''}`} onClick={(e) => { e.stopPropagation(); onToggle(); }}>
            {subtask.completed && <Icon path={icons.check} />}
        </div>
        <span onClick={(e) => { e.stopPropagation(); onFocus(); }}>{subtask.text}</span>
    </div>
);

const energyLevelMap: Record<any, any> = { low: { label: 'Baixa', icon: 'battery' }, medium: { label: 'Média', icon: 'battery' }, high: { label: 'Alta', icon: 'battery' } };

export const TaskCard: React.FC<any> = ({ task, onEdit, onSubtaskClick, onToggleSubtask }) => {
    const { tags, handleCompleteTask, setFrogTaskId, frogTaskId, handleDeleteTask } = useTasks();
    const { startFocusOnTask } = usePomodoro();

    const [subtasksVisible, setSubtasksVisible] = useState(true);
    const swipeThreshold = 120;

    const [{ x, scale }, api] = useSpring(() => ({
        x: 0,
        scale: 1,
        config: { tension: 250, friction: 30 },
    }));

    const bind = useDrag(({ active, movement: [mx], direction: [dx], cancel, tap }) => {

        if (tap) {
            onEdit(task);
            return;
        }

        if (active) {
            api.start({ x: mx, scale: 1.05, immediate: true });
        } else {
            if (Math.abs(mx) > swipeThreshold) {
                // CORREÇÃO: Usar a posição final (mx) em vez da direção instantânea (dx)
                const isSwipeRight = mx > 0;
                const targetX = isSwipeRight ? window.innerWidth : -window.innerWidth;
                const action = isSwipeRight ? handleCompleteTask : handleDeleteTask;

                api.start({
                    x: targetX,
                    config: { tension: 200, friction: 25 },
                    onResolve: () => { action(task.id); },
                });
            } else {
                api.start({ x: 0, scale: 1 });
            }
        }
    }, { filterTaps: true, preventScroll: true, threshold: 10 });

    const taskTag = task.tagId ? tags.find(t => t.id === task.id) : null;
    const isFrog = frogTaskId === task.id;
    const isQuickAction = (task.pomodoroEstimate ?? 0) === 0;
    const energyInfo = task.energyNeeded ? energyLevelMap[task.energyNeeded] : null;

    const rightBgOpacity = x.to(val => (val > 0 ? val / swipeThreshold : 0), [0, 1], 'clamp');
    const leftBgOpacity = x.to(val => (val < 0 ? Math.abs(val) / swipeThreshold : 0), [0, 1], 'clamp');

    return (
        <div className={styles.cardWrapper}>
            <animated.div className={`${styles.swipeBackground} ${styles.completeBackground}`} style={{ opacity: rightBgOpacity }}>
                <div className={styles.swipeIcon}><Icon path={icons.check} /><span>Concluir</span></div>
            </animated.div>
            <animated.div className={`${styles.swipeBackground} ${styles.deleteBackground}`} style={{ opacity: leftBgOpacity }}>
                <div className={styles.swipeIcon}><Icon path={icons.trash} /><span>Excluir</span></div>
            </animated.div>

            <animated.div {...bind()} className={`${styles.cardContent} ${styles.taskCard} ${task.status === 'done' ? styles.statusDone : ''}`} style={{ x, scale }}>
                
                <div className={styles.taskCardHeader}>
                    <div className={styles.taskCardTitleGroup}>
                        <div className={`${styles.taskCompleteButton} ${task.status === 'done' ? styles.completed : ''}`} />
                        <h4>{task.title}</h4>
                    </div>
                    <div className={styles.taskCardActions}>
                        {task.status !== 'done' && !isQuickAction && (
                            <button onClick={(e) => { e.stopPropagation(); startFocusOnTask(task.id, task.title); }} className="icon-button focus-task-button"><Icon path={icons.play} /></button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); setFrogTaskId(isFrog ? null : task.id); }} className="icon-button">
                            <Icon path={icons.frog} className={isFrog ? 'frog-icon-active' : 'frog-icon'} />
                        </button>
                    </div>
                </div>

                {task.description && <p className={styles.taskCardDescription}>{task.description}</p>}

                {task.subtasks && task.subtasks.length > 0 && (
                     <div className={`${styles.subtasksSection} ${!subtasksVisible ? styles.collapsed : ''}`}>
                         <div className={styles.subtasksHeader} onClick={(e) => { e.stopPropagation(); setSubtasksVisible(!subtasksVisible); }}>
                            <div>Subtarefas</div>
                            <Icon path={icons.chevronDown} className={styles.collapsibleChevron} />
                        </div>
                        {subtasksVisible && (
                            <div className={styles.subtasksContent}>
                                {task.subtasks.map(subtask => (<SubtaskItem key={subtask.id} subtask={subtask} onToggle={() => onToggleSubtask(task.id, subtask.id)} onFocus={() => { if (!subtask.completed) onSubtaskClick(task.id, subtask.id) }}/>))}
                            </div>
                        )}
                    </div>
                )}

                <div className={styles.taskCardFooter}>
                    {task.dueDate && <div className={styles.taskCardBadge}><Icon path={icons.calendar} /><span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span></div>}
                    {!isQuickAction && (<div className={styles.taskCardBadge}><Icon path={icons.timer} /><span>{task.pomodoroEstimate} Pomodoro(s)</span></div>)}
                    {energyInfo && <div className={`${styles.taskCardBadge}`}><Icon path={energyInfo.icon} /><span>{energyInfo.label}</span></div>}
                    {taskTag && <div className={`${styles.taskCardBadge} ${styles.tagBadge}`} style={{ backgroundColor: taskTag.color }}><span>{taskTag.name}</span></div>}
                </div>
            </animated.div>
        </div>
    );
};