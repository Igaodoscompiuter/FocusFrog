import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { formatMinutes, routineTemplates, templateMinutes } from '../../domain/routines';
import styles from './RoutinePickSheet.module.css';

/** Escolha das partes de uma rotina "escolher partes" (ex.: Dia de Faxina) antes de adicionar. */
export const RoutinePickSheet: React.FC = () => {
    const { routineToPick, closeRoutinePick, handleAddRoutine, taskTemplates } = useTasks();
    const parts = routineToPick ? routineTemplates(routineToPick, taskTemplates) : [];
    const [picked, setPicked] = useState<number[] | null>(null);
    if (!routineToPick) return null;
    const sel = picked ?? parts.map(p => p.id);
    const toggle = (id: number) => setPicked(sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]);
    const total = parts.filter(p => sel.includes(p.id)).reduce((s, p) => s + templateMinutes(p), 0);
    const close = () => { setPicked(null); closeRoutinePick(); };
    return (
        <div className={styles.backdrop} onClick={close}>
            <div className={styles.sheet} role="dialog" aria-label={routineToPick.name} onClick={e => e.stopPropagation()}>
                <h3>{routineToPick.name}</h3>
                <p className={styles.hint}>Hoje não precisa ser tudo. Escolha só o que cabe no seu dia.</p>
                {parts.map(p => (
                    <label key={p.id} className={styles.row}>
                        <input type="checkbox" checked={sel.includes(p.id)} onChange={() => toggle(p.id)} />
                        <span className={styles.name}>{p.title}</span>
                        <span className={styles.min}>{formatMinutes(templateMinutes(p))}</span>
                    </label>
                ))}
                <div className={styles.actions}>
                    <button type="button" className={styles.cancel} onClick={close}>Cancelar</button>
                    <button type="button" className={styles.confirm} disabled={sel.length === 0}
                        onClick={() => { handleAddRoutine(routineToPick, sel); close(); }}>
                        Adicionar {sel.length}{total ? ` · ${formatMinutes(total)}` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};
