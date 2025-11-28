
import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import type { Task } from '../../types';
import { TaskCard } from '../tasks/TaskCard';
import { TaskModal } from '../modals/TaskModal';
import styles from './AgendaDeHoje.module.css';

const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
};

export const AgendaDeHoje: React.FC = () => {
    const { tasks, handleToggleSubtask } = useTasks();
    const { handleNavigate, setTaskInFocus, setSubtaskInFocusId } = useUI();
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const todaysTasks = tasks.filter(task => 
        task.dueDate && isToday(new Date(task.dueDate + 'T00:00:00')) && task.status !== 'done'
    );

    const handleEdit = (task: Task) => {
        setEditingTask(task);
    };

    const handleSubtaskClick = (taskId: string, subtaskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            setTaskInFocus(task);
            setSubtaskInFocusId(subtaskId);
            handleNavigate('focus'); // FIX: Added the missing closing parenthesis
        }
    };

    return (
        <div className={styles.card}>
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={() => setEditingTask(null)} />}

            <div className={styles.header}>
                <h3>Agenda de Hoje</h3>
            </div>

            {todaysTasks.length > 0 ? (
                <div className={styles.tasksContainer}>
                    {todaysTasks.map(task => (
                        <TaskCard 
                            key={task.id}
                            task={task}
                            onEdit={handleEdit}
                            onToggleSubtask={handleToggleSubtask}
                            onSubtaskClick={handleSubtaskClick}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>Nenhuma tarefa para hoje. Adicione uma tarefa com a data de hoje para vê-la aqui!</p>
                </div>
            )}
        </div>
    );
};
