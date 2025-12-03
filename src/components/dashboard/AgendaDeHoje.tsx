
import React, { useMemo } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { TaskCard } from '../tasks/TaskCard';
import styles from './AgendaDeHoje.module.css';
import type { Task } from '../../types';

const getLocalTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const AgendaDeHoje: React.FC = () => { // A prop onEditTask foi removida
    const { tasks, tags } = useTasks();

    const todayString = getLocalTodayString();
    const tasksDeHoje = useMemo(() => {
        return tasks.filter(task => task.dueDate === todayString && task.status !== 'done');
    }, [tasks, todayString]);

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <h3><Icon path={icons.calendar} /> Agenda de Hoje</h3>
            </div>
            {tasksDeHoje.length > 0 ? (
                <div className={styles.taskList}>
                    {tasksDeHoje.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            tags={tags}
                            quadrant={task.quadrant} // Adicionado para consistência
                            // A prop onEdit foi removida daqui
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>Nenhuma tarefa agendada para hoje. Aproveite o dia ou adicione novas tarefas!</p>
                </div>
            )}
        </div>
    );
};
