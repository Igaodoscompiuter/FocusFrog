
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task, Subtask, Quadrant, TimeOfDay, Tag, TaskTemplate } from '../../types';
import { quadrants } from '../../constants';
import { todayISO, addDaysISO } from '../../utils/dates';
import styles from './TaskModal.module.css'; 
import { useClickOutside } from '../../hooks/useClickOutside';
import { TagEditorView } from './TagEditorView';

interface TaskModalProps {
    taskToEdit: Partial<Task> | null;
    onClose: () => void;
    tags: Tag[];
}

export const TaskModal: React.FC<TaskModalProps> = ({ taskToEdit, onClose, tags }) => {
    const { handleAddTask, handleUpdateTask, handleDeleteTask, handleCreateTemplateFromTask, taskTemplates } = useTasks();
    const { handleNavigate } = useUI();
    const [task, setTask] = useState<Partial<Task>>({});
    const [category, setCategory] = useState<string>('Personalizado');
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCategoryInput, setNewCategoryInput] = useState('');

    const [newSubtask, setNewSubtask] = useState('');
    const [showMore, setShowMore] = useState(false);            // descrição + duração
    const [savingTemplate, setSavingTemplate] = useState(false); // painel de categoria do modelo
    const [pickingDate, setPickingDate] = useState(false);
    const [currentView, setCurrentView] = useState<'task' | 'tags'>('task');
    const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

    const modalRef = useClickOutside(onClose);

    useEffect(() => {
        const allCategories = taskTemplates.map(t => t.category);
        const uniqueCategories = ['Personalizado', ...Array.from(new Set(allCategories)).filter(c => c !== 'Personalizado')];
        setAvailableCategories(uniqueCategories);
    }, [taskTemplates]);

    const isQuickTask = task.pomodoroEstimate === 0;

    useEffect(() => {
        const getInitialTaskState = (taskData: Partial<Task> | null): Partial<Task> => {
            // [CORREÇÃO] "Nova Tarefa" passa { quadrant: 'inbox' } — não vazio,
            // então caía aqui como se fosse edição e ficava sem a data de hoje.
            // Edição de verdade é só quando a tarefa já tem id (ou vem de modelo).
            if (taskData && (taskData.id || taskData.templateId)) {
                if (taskData.templateId) {
                    const template = taskTemplates.find(t => t.id === taskData.templateId);
                    if (template) setCategory(template.category);
                }
                return { ...taskData, subtasks: taskData.subtasks ? [...taskData.subtasks] : [], pomodoroEstimate: taskData.pomodoroEstimate !== undefined ? taskData.pomodoroEstimate : 1 };
            }
            setCategory('Personalizado');
            return { title: '', description: '', quadrant: 'inbox', subtasks: [], status: 'todo', pomodoroEstimate: 1, dueDate: todayISO(), ...(taskData || {}) };
        };

        const initialState = getInitialTaskState(taskToEdit);
        setTask(initialState);
        setCurrentView('task');
        setSavingTemplate(false); setShowMore(false); setPickingDate(false);
        setModalRoot(document.getElementById('modal-root')); 
    }, [taskToEdit, taskTemplates]);

    const handleChange = (field: keyof Task, value: any) => setTask(prev => ({ ...prev, [field]: value }));
    const handleTaskTypeChange = (type: 'focus' | 'quick') => {
        handleChange('pomodoroEstimate', type === 'quick' ? 0 : 1);
        if (type === 'quick') handleChange('customDuration', undefined);
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const subtask: Subtask = { id: `sub-${Date.now()}`, text: newSubtask, completed: false };
            handleChange('subtasks', [...(task.subtasks || []), subtask]);
            setNewSubtask('');
        }
    };
    const handleRemoveSubtask = (id: string) => handleChange('subtasks', task.subtasks?.filter(st => st.id !== id));

    const handleUpsertTask = () => {
        if (!task.title?.trim()) return alert('O título da tarefa é obrigatório.');
        // [CORREÇÃO] não força mais a data de hoje: "Sem data" é uma escolha válida
        const taskToSave = { ...task, dueDate: task.dueDate || undefined };
        if (taskToSave.id) handleUpdateTask(taskToSave as Task);
        else handleAddTask(taskToSave as Omit<Task, 'id' | 'status'>);
        onClose();
    };

    const handleSaveAsTemplate = () => {
        if (!task.title?.trim()) return alert('O título é obrigatório para salvar um modelo.');
        // Passa a própria tarefa (já no formato correto, com subtarefas completas):
        // handleCreateTemplateFromTask extrai só os campos relevantes para o modelo.
        if (!savingTemplate) { setSavingTemplate(true); return; } // 1º toque: escolher a categoria
        // [CORREÇÃO] a categoria escolhida não era enviada — todo modelo caía em 'Personalizado'
        handleCreateTemplateFromTask(task, category);
        onClose();
    };
    
    const handleConfirmNewCategory = () => {
        const newCategory = newCategoryInput.trim();
        if (newCategory && !availableCategories.includes(newCategory)) {
            setAvailableCategories(prev => [...prev, newCategory]);
            setCategory(newCategory);
        } else if (availableCategories.includes(newCategory)) {
            setCategory(newCategory);
        }
        setIsCreatingCategory(false);
        setNewCategoryInput('');
    };

    const handleDelete = () => {
        if (task.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            handleDeleteTask(task.id);
            onClose();
        }
    };

    if (!taskToEdit || !modalRoot) return null;
    
    const today = todayISO(), tomorrow = addDaysISO(1);
    const dateMode = !task.dueDate ? 'none' : task.dueDate === today ? 'today' : task.dueDate === tomorrow ? 'tomorrow' : 'custom';
    const formatDate = (iso: string) => { const [y, m, d] = iso.split('-'); return `${d}/${m}/${y}`; };
    const pomos = task.pomodoroEstimate || 1;

    const renderTaskForm = () => (
        <>
            <header className="g-modal-header">
                <h3><Icon path={icons.pencil} /> {task.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                <button onClick={onClose} className="btn btn-secondary btn-icon"><Icon path={icons.close} /></button>
            </header>
            <main className="g-modal-body">
                <input
                    type="text"
                    className={styles.titleInput}
                    placeholder="O que precisa ser feito?"
                    value={task.title || ''}
                    onChange={e => handleChange('title', e.target.value)}
                    autoFocus
                />

                {/* PASSOS — quebrar a tarefa em pedaços pequenos é o núcleo do app */}
                <section className={styles.block}>
                    <span className={styles.blockLabel}>Passos <small>(opcional)</small></span>
                    {task.subtasks && task.subtasks.length > 0 && (
                        <ul className={styles.subtaskList}>
                            {task.subtasks.map(sub => (
                                <li key={sub.id} className={styles.subtaskItem}>
                                    <span className={styles.stepDot} />
                                    <input type="text" value={sub.text} onChange={e => handleChange('subtasks', task.subtasks?.map(s => s.id === sub.id ? { ...s, text: e.target.value } : s))} className={styles.subtaskInput} />
                                    <button onClick={() => handleRemoveSubtask(sub.id)} className="btn btn-tertiary btn-icon btn-sm" aria-label="Remover passo"><Icon path={icons.trash} /></button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className={styles.subtaskAddGroup}>
                        <input type="text" placeholder="Ex.: abrir o material" value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSubtask()} />
                        <button onClick={handleAddSubtask} className="btn btn-primary btn-icon btn-sm" aria-label="Adicionar passo"><Icon path={icons.plus} /></button>
                    </div>
                </section>

                {/* QUANDO — atalhos em vez de um calendário logo de cara */}
                <section className={styles.block}>
                    <span className={styles.blockLabel}>Quando</span>
                    <div className={styles.chipRow}>
                        <button className={`${styles.chip} ${dateMode === 'today' ? styles.chipOn : ''}`} onClick={() => { handleChange('dueDate', today); setPickingDate(false); }}>Hoje</button>
                        <button className={`${styles.chip} ${dateMode === 'tomorrow' ? styles.chipOn : ''}`} onClick={() => { handleChange('dueDate', tomorrow); setPickingDate(false); }}>Amanhã</button>
                        <button className={`${styles.chip} ${dateMode === 'none' ? styles.chipOn : ''}`} onClick={() => { handleChange('dueDate', undefined); setPickingDate(false); }}>Sem data</button>
                        <button className={`${styles.chip} ${dateMode === 'custom' ? styles.chipOn : ''}`} onClick={() => setPickingDate(true)}>
                            {dateMode === 'custom' ? formatDate(task.dueDate!) : 'Escolher…'}
                        </button>
                    </div>
                    {pickingDate && (
                        <input type="date" className="g-input" style={{ marginTop: 8 }} value={task.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value || undefined)} autoFocus />
                    )}
                </section>

                {/* TIPO + POMODOROS numa linha só */}
                <section className={styles.block}>
                    <span className={styles.blockLabel}>Tipo</span>
                    <div className={styles.typeRow}>
                        <div className={styles.segment}>
                            <button className={!isQuickTask ? styles.segmentOn : ''} onClick={() => handleTaskTypeChange('focus')}>⏱ Foco</button>
                            <button className={isQuickTask ? styles.segmentOn : ''} onClick={() => handleTaskTypeChange('quick')}>✓ Rápida</button>
                        </div>
                        {!isQuickTask && (
                            <div className={styles.stepper} aria-label="Pomodoros">
                                <button onClick={() => handleChange('pomodoroEstimate', Math.max(1, pomos - 1))} aria-label="Menos">−</button>
                                <span>{pomos} × {task.customDuration || 25}min</span>
                                <button onClick={() => handleChange('pomodoroEstimate', Math.min(8, pomos + 1))} aria-label="Mais">+</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* ONDE — os 4 destinos da matriz direto, sem as perguntas */}
                <section className={styles.block}>
                    <span className={styles.blockLabel}>Onde fica</span>
                    <div className={styles.quadrantGrid}>
                        {quadrants.map(q => (
                            <button key={q.id} className={`${styles.quadrantChip} ${task.quadrant === q.id ? styles.chipOn : ''}`} onClick={() => handleChange('quadrant', q.id)}>
                                <Icon path={icons[q.icon]} />
                                <span><strong>{q.title}</strong><small>{q.subtitle}</small></span>
                            </button>
                        ))}
                    </div>
                </section>

                <button className={styles.moreToggle} onClick={() => setShowMore(v => !v)}>
                    {showMore ? '− Menos opções' : '+ Mais opções'} <small>(descrição, duração)</small>
                </button>
                {showMore && (
                    <section className={styles.block}>
                        <textarea
                            className={styles.descriptionTextarea}
                            placeholder="Descrição, links, notas..."
                            value={task.description || ''}
                            onChange={e => handleChange('description', e.target.value)}
                        />
                        {!isQuickTask && (
                            <label className={styles.inlineField}>
                                Duração de cada foco (min)
                                <input type="number" className="g-input" value={task.customDuration || ''} onChange={e => handleChange('customDuration', e.target.value ? parseInt(e.target.value) : undefined)} min="1" placeholder="25" />
                            </label>
                        )}
                    </section>
                )}

                {/* categoria só existe pra MODELOS — aparece ao tocar em "Salvar modelo" */}
                {savingTemplate && (
                    <section className={`${styles.block} ${styles.templatePanel}`}>
                        <span className={styles.blockLabel}>Salvar na biblioteca em qual categoria?</span>
                        {isCreatingCategory ? (
                            <div className={styles.subtaskAddGroup}>
                                <input type="text" className="g-input" placeholder="Nome da nova categoria" value={newCategoryInput}
                                    onChange={e => setNewCategoryInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleConfirmNewCategory()} autoFocus />
                                <button onClick={handleConfirmNewCategory} className="btn btn-primary btn-icon btn-sm"><Icon path={icons.check} /></button>
                                <button onClick={() => setIsCreatingCategory(false)} className="btn btn-secondary btn-icon btn-sm"><Icon path={icons.close} /></button>
                            </div>
                        ) : (
                            <div className={styles.chipRow}>
                                {availableCategories.map(cat => (
                                    <button key={cat} className={`${styles.chip} ${category === cat ? styles.chipOn : ''}`} onClick={() => setCategory(cat)}>{cat}</button>
                                ))}
                                <button className={`${styles.chip} ${styles.chipAdd}`} onClick={() => setIsCreatingCategory(true)}>+ Nova</button>
                            </div>
                        )}
                    </section>
                )}
            </main>
            <footer className={`g-modal-footer ${styles.footerWrap}`}>
                {task.id && (
                    <button className="btn btn-tertiary btn-danger btn-icon" onClick={handleDelete} aria-label="Excluir tarefa" title="Excluir">
                        <Icon path={icons.trash} />
                    </button>
                )}
                <div className={styles.footerActions}>
                    {savingTemplate ? (
                        <>
                            <button className="btn btn-secondary" onClick={() => setSavingTemplate(false)}>Voltar</button>
                            <button className="btn btn-primary" onClick={handleSaveAsTemplate}><Icon path={icons.bookOpen} /> Salvar em {category}</button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={handleSaveAsTemplate}><Icon path={icons.bookOpen} /> Salvar modelo</button>
                            <button className="btn btn-primary" onClick={handleUpsertTask}><Icon path={icons.plus} /> {task.id ? 'Atualizar' : 'Adicionar'}</button>
                        </>
                    )}
                </div>
            </footer>
        </>
    );

    return createPortal(
        <div className="g-modal-overlay">
            <div className="g-modal" ref={modalRef}>
                {currentView === 'task' ? renderTaskForm() : <TagEditorView onBack={() => setCurrentView('task')} />}
            </div>
        </div>,
        modalRoot
    );
};

