import React, { useMemo, useRef, useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { IMPORT_EXAMPLE, parseImport } from '../../domain/taskImport';
import { describeDays, formatMinutes, templateMinutes } from '../../domain/routines';
import type { TaskTemplate } from '../../types';
import styles from './DevImportPanel.module.css';

const SHOW_LIMIT = 8;

/** Painel do modo desenvolvedor: cola/abre/baixa um JSON, mostra a prévia e só salva ao confirmar. */
export const DevImportPanel: React.FC = () => {
    const { tasks, tags, routines, handleApplyImport } = useTasks();
    const { addNotification } = useUI();
    const [text, setText] = useState('');
    const [url, setUrl] = useState('');
    const [busy, setBusy] = useState(false);
    const [skipDup, setSkipDup] = useState(true);
    const [showFormat, setShowFormat] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const preview = useMemo(
        () => (text.trim() ? parseImport(text, tasks, tags, routines) : null),
        [text, tasks, tags, routines],
    );

    const openFile = async (file?: File) => {
        if (!file) return;
        setText(await file.text());
    };
    const fetchUrl = async () => {
        if (!/^https:\/\//i.test(url.trim())) { addNotification('Use um link https://', '⚠️', 'error'); return; }
        setBusy(true);
        try {
            const res = await fetch(url.trim());
            if (!res.ok) throw new Error(String(res.status));
            setText(await res.text());
        } catch {
            addNotification('Não consegui baixar esse link.', '⚠️', 'error');
        } finally { setBusy(false); }
    };

    const importable = preview && !preview.fatal
        ? preview.ready.filter(r => !(skipDup && r.duplicate)).length + preview.routines.filter(r => !(skipDup && r.duplicate)).length
        : 0;
    const dups = preview ? preview.ready.filter(r => r.duplicate).length + preview.routines.filter(r => r.duplicate).length : 0;

    const confirm = () => {
        if (!preview) return;
        handleApplyImport(preview, { skipDuplicates: skipDup });
        setText('');
    };

    return (
        <div className={styles.panel}>
            <p className={styles.lead}>Cole um JSON, abra um arquivo ou busque de um link. Nada é salvo antes de você confirmar.</p>
            <div className={styles.sources}>
                <button type="button" className={styles.secondary} onClick={() => fileRef.current?.click()}>Abrir arquivo</button>
                <input ref={fileRef} type="file" accept=".json,application/json,text/plain" hidden onChange={e => { openFile(e.target.files?.[0]); e.target.value = ''; }} />
                <button type="button" className={styles.secondary} onClick={() => setText(IMPORT_EXAMPLE)}>Usar exemplo</button>
            </div>
            <div className={styles.urlRow}>
                <input className={styles.input} inputMode="url" placeholder="https://…/tarefas.json" value={url} onChange={e => setUrl(e.target.value)} />
                <button type="button" className={styles.secondary} disabled={busy || !url.trim()} onClick={fetchUrl}>{busy ? '…' : 'Buscar'}</button>
            </div>
            <textarea className={styles.code} spellCheck={false} placeholder='{ "tasks": [ … ], "routines": [ … ] }' value={text} onChange={e => setText(e.target.value)} />
            <button type="button" className={styles.link} onClick={() => setShowFormat(v => !v)}>{showFormat ? 'Esconder' : 'Ver'} formato aceito</button>
            {showFormat && <pre className={styles.format}>{IMPORT_EXAMPLE}</pre>}

            {preview?.fatal && <div className={styles.fatal}>{preview.fatal}</div>}

            {preview && !preview.fatal && (
                <div className={styles.preview}>
                    <div className={styles.counts}>
                        <span className={styles.ok}>{preview.ready.length} tarefa(s)</span>
                        {preview.routines.length > 0 && <span className={styles.ok}>{preview.routines.length} rotina(s)</span>}
                        {preview.errors.length > 0 && <span className={styles.bad}>{preview.errors.length} com erro</span>}
                        {dups > 0 && <span className={styles.dup}>{dups} repetida(s)</span>}
                    </div>

                    {preview.errors.length > 0 && (
                        <ul className={styles.issues}>
                            {preview.errors.slice(0, 10).map((e, i) => (
                                <li key={i}>{e.routine ? 'Rotina' : 'Item'} {e.item}{e.title ? ` “${e.title}”` : ''}: {e.message}</li>
                            ))}
                        </ul>
                    )}
                    {preview.warnings.length > 0 && (
                        <ul className={`${styles.issues} ${styles.warn}`}>
                            {preview.warnings.slice(0, 10).map((w, i) => <li key={i}>Item {w.item}{w.title ? ` “${w.title}”` : ''}: {w.message}</li>)}
                        </ul>
                    )}

                    <ul className={styles.list}>
                        {preview.routines.slice(0, SHOW_LIMIT).map(r => (
                            <li key={`r${r.item}`} className={skipDup && r.duplicate ? styles.skipped : ''}>
                                <div className={styles.title}>🔁 {r.routine.name}{r.duplicate ? ' · já existe' : ''}</div>
                                <div className={styles.meta}>
                                    {r.templates.length} partes · {describeDays(r.routine.days)}
                                    {r.routine.scheduledTime ? ` · ${r.routine.scheduledTime}` : ''}
                                    {formatMinutes(r.templates.reduce((s, t) => s + templateMinutes(t as TaskTemplate), 0)) ? ` · ${formatMinutes(r.templates.reduce((s, t) => s + templateMinutes(t as TaskTemplate), 0))}` : ''}
                                </div>
                            </li>
                        ))}
                        {preview.ready.slice(0, SHOW_LIMIT).map(r => (
                            <li key={r.item} className={skipDup && r.duplicate ? styles.skipped : ''}>
                                <div className={styles.title}>{r.task.title}{r.duplicate ? ' · repetida' : ''}</div>
                                <div className={styles.meta}>
                                    {r.task.quadrant}{r.task.dueDate ? ` · ${r.task.dueDate}` : ''}{r.task.subtasks?.length ? ` · ${r.task.subtasks.length} passos` : ''}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {preview.ready.length > SHOW_LIMIT && <div className={styles.more}>…e mais {preview.ready.length - SHOW_LIMIT} tarefa(s)</div>}

                    {dups > 0 && (
                        <label className={styles.check}>
                            <input type="checkbox" checked={skipDup} onChange={e => setSkipDup(e.target.checked)} /> Pular as repetidas
                        </label>
                    )}
                    <button type="button" className={styles.primary} disabled={importable === 0} onClick={confirm}>
                        Importar {importable} {importable === 1 ? 'item' : 'itens'}
                    </button>
                </div>
            )}
        </div>
    );
};
