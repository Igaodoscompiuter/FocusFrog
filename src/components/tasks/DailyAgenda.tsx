
import React, { useMemo } from 'react';
import type { Task, TimeOfDay, Quadrant } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';

const AgendaTaskItem: React.FC<{ 
    task: Task, 
    isFrog: boolean, 
    isSecondaryDo: boolean, 
    onTaskClick: (task: Task) => void,
    onComplete: (taskId: string) => void 
}> = ({ task, isFrog, isSecondaryDo, onTaskClick, onComplete }) => {
    const { tags } = useTasks();
    const taskTag = task.tagId ? tags.find(t => t.id === task.tagId) : null;

    const classNames = [
        'agenda-task-item',
        `quadrant-${task.quadrant}`,
        isFrog ? 'is-frog' : '',
        isSecondaryDo ? 'is-secondary-do' : ''
    ].join(' ').trim();

    const style = taskTag ? { borderColor: taskTag.color } : {};

    const handleCheckboxClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onComplete(task.id);
    }
    
    // Lógica visual: Tarefa de Foco ou Tarefa Rápida
    const isFocusTask = task.pomodoroEstimate && task.pomodoroEstimate > 0;

    return (
        <div className={classNames} style={style} onClick={() => onTaskClick(task)}>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%'}}>
                <div 
                    className={`subtask-checkbox ${task.status === 'done' ? 'checked' : ''}`}
                    onClick={handleCheckboxClick}
                    style={{
                        width: '28px', 
                        height: '28px', 
                        flexShrink: 0, 
                        cursor: 'pointer',
                        borderRadius: '50%',
                        borderWidth: '2px'
                    }}
                    title="Concluir Tarefa"
                >
                     <Icon path={icons.check} style={{width: '18px', height: '18px'}} />
                </div>
                
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', flexGrow: 1}}>
                    {isFrog && <Icon path={icons.frog} style={{width: 16, height: 16, color: 'var(--accent-color)'}} />}
                    <span className="agenda-task-item-title" style={{textDecoration: task.status === 'done' ? 'line-through' : 'none', opacity: task.status === 'done' ? 0.6 : 1}}>
                        {task.title}
                    </span>
                </div>
                
                {/* Indicador de Ação */}
                {task.status !== 'done' && (
                    isFocusTask ? (
                        <div style={{
                            fontSize: '0.75rem', 
                            opacity: 0.9, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: 'var(--primary-color)',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 600,
                            border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                            <Icon path={icons.play} style={{width: 10, height: 10}} /> 
                            <span>{task.customDuration ? `${task.customDuration}m` : 'Focar'}</span>
                        </div>
                    ) : (
                         <div style={{
                            fontSize: '0.75rem', 
                            opacity: 0.6, 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            color: 'var(--text-secondary-color)',
                            backgroundColor: 'var(--surface-color)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)'
                        }}>
                            <Icon path={icons.check} style={{width: 10, height: 10}} /> 
                            <span>Concluir</span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export const DailyAgenda: React.FC<{ tasks: Task[], frogTaskId: string | null, onTaskClick: (task: Task) => void }> = ({ tasks, frogTaskId, onTaskClick }) => {
    const { handleCompleteTask } = useTasks();
    
    const todayString = useMemo(() => {
        const today = new Date();
        return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    }, []);

    const priorityOrder: Quadrant[] = ['do', 'schedule', 'delegate', 'eliminate'];

    const todayTasks = useMemo(() => 
        tasks.filter(t => t.dueDate === todayString), 
    [tasks, todayString]);

    const scheduledTasks = useMemo(() => 
        todayTasks.filter(t => !!t.timeOfDay && t.status !== 'done'), 
    [todayTasks]);
    
    const unscheduledTasks = useMemo(() => 
        todayTasks
            .filter(t => !t.timeOfDay && t.status !== 'done')
            .sort((a, b) => priorityOrder.indexOf(a.quadrant) - priorityOrder.indexOf(b.quadrant)),
    [todayTasks]);

    const getTasksForPeriod = (period: TimeOfDay) => {
        return scheduledTasks
            .filter(t => t.timeOfDay === period)
            .sort((a, b) => priorityOrder.indexOf(a.quadrant) - priorityOrder.indexOf(b.quadrant));
    };

    const periodConfig: { id: TimeOfDay, title: string, icon: keyof typeof icons }[] = [
        { id: 'morning', title: 'Manhã', icon: 'sun' },
        { id: 'afternoon', title: 'Tarde', icon: 'coffee' },
        { id: 'night', title: 'Noite', icon: 'moon' }
    ];
    
    const allScheduledTasks = useMemo(() => 
        todayTasks.filter(t => !!t.timeOfDay), 
    [todayTasks]);

    const allUnscheduledTasks = useMemo(() => 
        todayTasks
            .filter(t => !t.timeOfDay)
            .sort((a, b) => {
                if (a.status === b.status) return priorityOrder.indexOf(a.quadrant) - priorityOrder.indexOf(b.quadrant);
                return a.status === 'done' ? 1 : -1; // Done tasks at bottom
            }),
    [todayTasks]);
    
    const getAllTasksForPeriod = (period: TimeOfDay) => {
         return allScheduledTasks
            .filter(t => t.timeOfDay === period)
            .sort((a, b) => {
                if (a.status === b.status) return priorityOrder.indexOf(a.quadrant) - priorityOrder.indexOf(b.quadrant);
                return a.status === 'done' ? 1 : -1;
            });
    };

    if (todayTasks.length === 0) {
        return (
             <div className="card">
                <h3>Agenda de Hoje</h3>
                <p className="empty-agenda-message">Nenhuma tarefa para hoje. Adicione uma tarefa com a data de hoje para vê-la aqui!</p>
            </div>
        );
    }

    return (
        <div className="card">
            <h3>Agenda de Hoje</h3>
            <div className="daily-agenda">
                {allUnscheduledTasks.length > 0 && (
                    <div className="agenda-period-column">
                        <h4 className="period-header">
                            <Icon path={icons.calendar} />
                            <span>Tarefas do Dia</span>
                        </h4>
                        <div className="agenda-task-list">
                            {allUnscheduledTasks.map(task => (
                                <AgendaTaskItem
                                    key={task.id}
                                    task={task}
                                    isFrog={task.id === frogTaskId}
                                    isSecondaryDo={task.quadrant === 'do' && allUnscheduledTasks.some(t => t.id === frogTaskId) && task.id !== frogTaskId}
                                    onTaskClick={onTaskClick}
                                    onComplete={handleCompleteTask}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {periodConfig.map(period => {
                    const periodTasks = getAllTasksForPeriod(period.id);
                    if (periodTasks.length === 0) return null; 
                    
                    const hasFrogInPeriod = periodTasks.some(t => t.id === frogTaskId);

                    return (
                        <div key={period.id} className="agenda-period-column">
                            <h4 className="period-header">
                                <Icon path={icons[period.icon]} />
                                <span>{period.title}</span>
                            </h4>
                            <div className="agenda-task-list">
                                {periodTasks.map(task => (
                                    <AgendaTaskItem
                                        key={task.id}
                                        task={task}
                                        isFrog={task.id === frogTaskId}
                                        isSecondaryDo={task.quadrant === 'do' && hasFrogInPeriod && task.id !== frogTaskId}
                                        onTaskClick={onTaskClick}
                                        onComplete={handleCompleteTask}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
