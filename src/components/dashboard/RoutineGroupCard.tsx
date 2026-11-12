import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { formatMinutes, routineProgress, shortVersion } from '../../domain/routines';
import type { Task } from '../../types';
import styles from './RoutineGroupCard.module.css';

const SHORT_COUNT = 2;

/** Uma rotina adicionada como UMA tarefa: progresso, partes e modo guiado (uma parte por vez). */
export const RoutineGroupCard: React.FC<{ task: Task }> = ({ task }) => {
    const { handleCompleteTask, handleSkipSubtask } = useTasks();
    const [open, setOpen] = useState(false);
    const [guided, setGuided] = useState(false);
    const [short, setShort] = useState(false);

    const subs = task.subtasks ?? [];
    const { done, total, minutesLeft } = routineProgress(task);
    const pending = subs.filter(s => !s.completed);
    // Versão curta: só as primeiras partes que faltam; o resto fica de lado, sem sumir.
    const visiblePending = short ? shortVersion(pending, SHORT_COUNT) : pending;
    const current = visiblePending[0];
    const leftLabel = formatMinutes(visiblePending.reduce((s, p) => s + (p.minutes ?? 0), 0) || minutesLeft);
    const pct = total ? Math.round((done / total) * 100) : 0;

    const finish = (id: string) => handleCompleteTask(task.id, 'subtask', id);

    if (guided && current) {
        const idx = subs.findIndex(s => s.id === current.id) + 1;
        return (
            <div className={styles.card}>
                <div className={styles.guided}>
                    <span className={styles.step}>{task.title} · parte {idx} de {total}</span>
                    <span className={styles.now}>{current.text}</span>
                    {current.minutes ? <span className={styles.meta}>{formatMinutes(current.minutes)}</span> : null}
                    <div className={styles.row}>
                        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => finish(current.id)}>Feito</button>
                        <button type="button" className={styles.btn} onClick={() => handleSkipSubtask(task.id, current.id)}>Pular</button>
                    </div>
                    <button type="button" className={styles.btn} onClick={() => setGuided(false)}>Ver tudo</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card}>
            <button type="button" className={styles.head} aria-expanded={open} onClick={() => setOpen(o => !o)}>
                <span className={styles.title}>{task.title}</span>
                <span className={styles.meta}>{done}/{total}{leftLabel ? ` · ${leftLabel} restantes` : ''}</span>
                <span className={`${styles.chev} ${open ? styles.chevOpen : ''}`}>›</span>
            </button>
            <div className={styles.bar} aria-hidden><div className={styles.fill} style={{ width: `${pct}%` }} /></div>
            {open && (
                <>
                    <ul className={styles.parts}>
                        {subs.map(s => (
                            <li key={s.id} className={`${styles.part} ${s.completed ? styles.partDone : ''}`}>
                                <input type="checkbox" checked={s.completed} disabled={s.completed} onChange={() => finish(s.id)} aria-label={s.text} />
                                <span>{s.text}</span>
                                {s.minutes ? <span className={styles.min}>{formatMinutes(s.minutes)}</span> : null}
                            </li>
                        ))}
                    </ul>
                    <div className={styles.row}>
                        {current && <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={() => setGuided(true)}>Uma parte por vez</button>}
                        {pending.length > SHORT_COUNT && (
                            <button type="button" className={styles.btn} onClick={() => setShort(v => !v)}>
                                {short ? 'Versão completa' : 'Dia ruim? Versão curta'}
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
