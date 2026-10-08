
import { todayISO, carriedLabel } from '../../utils/dates';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import React, { useMemo } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { TaskCard } from '../tasks/TaskCard';
import styles from './AgendaDeHoje.module.css';
import type { Task } from '../../types';


export const AgendaDeHoje: React.FC = () => {
    const { tasks, tags } = useTasks();
    const [open, setOpen] = useLocalStorage<boolean>('focusfrog_agendaOpen', false);

    const todayString = todayISO();
    // [CORREÇÃO] Antes só entrava data EXATAMENTE igual a hoje — tarefa de
    // ontem não concluída sumia da Agenda sem aviso. Agora vem junto pra hoje
    // (as de dias anteriores primeiro), com uma etiqueta discreta.
    const tasksDeHoje = useMemo(() => tasks
        .filter(task => task.dueDate && task.dueDate <= todayString && task.status !== 'done')
        .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : a.dueDate! > b.dueDate! ? 1 : 0)),
    [tasks, todayString]);
    const carried = tasksDeHoje.filter(t => carriedLabel(t.dueDate)).length;

    return (
        <div className={styles.card}>
            <button className={styles.header} onClick={() => setOpen(!open)} aria-expanded={open}>
                <h3><Icon path={icons.calendar} /> Agenda de Hoje</h3>
                <span className={styles.summary}>
                    {tasksDeHoje.length === 0 ? 'livre' : `${tasksDeHoje.length} tarefa${tasksDeHoje.length > 1 ? 's' : ''}${carried ? ` · ${carried} de antes` : ''}`}
                    <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>›</span>
                </span>
            </button>
            {open && (tasksDeHoje.length > 0 ? (
                <div className={styles.taskList}>
                    {tasksDeHoje.map(task => (
                        <div key={task.id}>
                            {carriedLabel(task.dueDate) && <span className={styles.carried}>{carriedLabel(task.dueDate)}</span>}
                            <TaskCard task={task} tags={tags} quadrant={task.quadrant} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyState}>
                    <p>Nenhuma tarefa pra hoje. Aproveite o dia ou adicione novas tarefas!</p>
                </div>
            ))}
        </div>
    );
};
