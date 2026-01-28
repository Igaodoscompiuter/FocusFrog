
import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useTasks } from '../../context/TasksContext';
import { useUI } from '../../context/UIContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task, Subtask, Quadrant, TimeOfDay, Tag, TaskTemplate } from '../../types';
import { quadrants } from '../../constants';
import styles from './TaskModal.module.css'; 
import { useClickOutside } from '../../hooks/useClickOutside';
import { CustomTagSelector } from './CustomTagSelector';
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
            if (taskData && Object.keys(taskData).length > 0) {
                if (taskData.templateId) {
                    const template = taskTemplates.find(t => t.id === taskData.templateId);
                    if (template) setCategory(template.category);
                }
                return { ...taskData, subtasks: taskData.subtasks ? [...taskData.subtasks] : [], pomodoroEstimate: taskData.pomodoroEstimate !== undefined ? taskData.pomodoroEstimate : 1 };
            }
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            setCategory('Personalizado');
            return { title: '', description: '', quadrant: 'inbox', subtasks: [], status: 'todo', pomodoroEstimate: 1, dueDate: `${yyyy}-${mm}-${dd}` };
        };

        const initialState = getInitialTaskState(taskToEdit);
        setTask(initialState);
        setCurrentView('task');
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
        const taskToSave = { ...task };
        if (!taskToSave.dueDate) {
            const today = new Date();
            taskToSave.dueDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
        if (taskToSave.id) handleUpdateTask(taskToSave as Task);
        else handleAddTask(taskToSave as Omit<Task, 'id' | 'status'>);
        onClose();
    };

    const handleSaveAsTemplate = () => {
        if (!task.title?.trim()) return alert('O título é obrigatório para salvar um modelo.');
        const templateData: Omit<TaskTemplate, 'id'> = {
            title: task.title,
            description: task.description,
            quadrant: task.quadrant,
            pomodoroEstimate: task.pomodoroEstimate,
            customDuration: task.customDuration,
            subtasks: task.subtasks?.map(st => ({ text: st.text })),
            category: category || 'Personalizado'
        };
        handleCreateTemplateFromTask(templateData);
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
    
    const timeOfDayOptions: { id: TimeOfDay | '', label: string }[] = [
        { id: 'morning', label: 'Manhã' },
        { id: 'afternoon', label: 'Tarde' },
        { id: 'night', label: 'Noite' },
        { id: '', label: 'Nenhum' },
    ];

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
                <div className={styles.detailedFields}>
                    <textarea
                        className={styles.descriptionTextarea}
                        placeholder="Descrição, links, notas..."
                        value={task.description || ''}
                        onChange={e => handleChange('description', e.target.value)}
                    />
                    <MatrixSelector task={task} setTask={setTask} />
                    
                    <div className={styles.formGroup}>
                        <label className={styles.categoryTitle}>Categoria do Modelo</label>
                        {isCreatingCategory ? (
                            <div className={styles.subtaskAddGroup}>
                                <input
                                    type="text"
                                    className="g-input"
                                    placeholder="Nome da nova categoria"
                                    value={newCategoryInput}
                                    onChange={e => setNewCategoryInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleConfirmNewCategory()}
                                    autoFocus
                                />
                                <button onClick={handleConfirmNewCategory} className="btn btn-primary btn-icon btn-sm"><Icon path={icons.check}/></button>
                                <button onClick={() => setIsCreatingCategory(false)} className="btn btn-secondary btn-icon btn-sm"><Icon path={icons.close}/></button>
                            </div>
                        ) : (
                            <div className={styles.categorySelector}>
                                {availableCategories.map(cat => (
                                    <div 
                                        key={cat} 
                                        className={`${styles.categoryCard} ${category === cat ? styles.selected : ''}`}
                                        onClick={() => setCategory(cat)}
                                    >
                                        {cat}
                                    </div>
                                ))}
                                <div 
                                    className={`${styles.categoryCard} ${styles.add}`}
                                    onClick={() => setIsCreatingCategory(true)}
                                >
                                    <Icon path={icons.plus} />
                                    Criar Nova
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.grid}>
                         <div className={styles.formGroup}>
                            <label><Icon path={icons.calendar} /> Data</label>
                            <input type="date" className="g-input" value={task.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} />
                        </div>
                        <div className={styles.formGroup}>
                            <label><Icon path={icons.sun} /> Período</label>
                            <div className={styles.buttonSelector}>
                                {timeOfDayOptions.map(opt => (
                                    <button key={opt.id} className={task.timeOfDay === opt.id ? styles.selected : ''} onClick={() => handleChange('timeOfDay', opt.id)}>{opt.label}</button>
                                ))}
                            </div>
                        </div>
                    </div>

                     <div className={styles.formGroup}>
                        <label><Icon path={icons.target} /> Tipo de Tarefa</label>
                        <div className={styles.buttonSelector}>
                            <button className={!isQuickTask ? styles.selected : ''} onClick={() => handleTaskTypeChange('focus')}>Foco (Timer)</button>
                            <button className={isQuickTask ? styles.selected : ''} onClick={() => handleTaskTypeChange('quick')}>Rápida (Check)</button>
                        </div>
                    </div>

                    {!isQuickTask && (
                        <div className={styles.grid}>
                            <div className={styles.formGroup}>
                                <label><Icon path={icons.timer} /> Pomodoros (25min)</label>
                                <input type="number" className="g-input" value={task.pomodoroEstimate || ''} onChange={e => handleChange('pomodoroEstimate', parseInt(e.target.value) || 1)} min="1" placeholder="1" />
                            </div>
                            <div className={styles.formGroup}>
                                <label><Icon path={icons.clock} /> Duração Custom. (min)</label>
                                <input type="number" className="g-input" value={task.customDuration || ''} onChange={e => handleChange('customDuration', e.target.value ? parseInt(e.target.value) : undefined)} min="1" placeholder="25" />
                            </div>
                        </div>
                    )}
                    
                    <div className={styles.formGroup}>
                        <label><Icon path={icons.checkSquare} /> Subtarefas</label>
                        <ul className={styles.subtaskList}>
                            {task.subtasks?.map(sub => (
                                <li key={sub.id} className={styles.subtaskItem}>
                                    <input type="checkbox" checked={sub.completed} readOnly className="task-complete-button"/>
                                    <input type="text" value={sub.text} onChange={e => handleChange('subtasks', task.subtasks?.map(s => s.id === sub.id ? {...s, text: e.target.value} : s))} className={styles.subtaskInput}/>
                                    <button onClick={() => handleRemoveSubtask(sub.id)} className="btn btn-tertiary btn-icon btn-sm"><Icon path={icons.trash}/></button>
                                </li>
                            ))}
                        </ul>
                        <div className={styles.subtaskAddGroup}>
                            <input type="text" placeholder="Adicionar subtarefa..." value={newSubtask} onChange={e => setNewSubtask(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddSubtask()} />
                            <button onClick={handleAddSubtask} className="btn btn-primary btn-icon btn-sm"><Icon path={icons.plus}/></button>
                        </div>
                    </div>
                </div>
            </main>
            <footer className="g-modal-footer">
                <div> 
                    {task.id && <button className="btn btn-tertiary btn-danger" onClick={handleDelete}><Icon path={icons.trash} /> Excluir</button>}
                </div>
                <div className={styles.footerActions}>
                    <button className="btn btn-secondary" onClick={handleSaveAsTemplate}><Icon path={icons.bookOpen} /> Salvar como Modelo</button>
                    <button className="btn btn-primary" onClick={handleUpsertTask}><Icon path={icons.plus} /> {task.id ? 'Atualizar Tarefa' : 'Adicionar Tarefa'}</button>
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

const MatrixSelector: React.FC<{ task: Partial<Task>, setTask: React.Dispatch<React.SetStateAction<Partial<Task>>> }> = ({ task, setTask }) => {
    const [urgency, setUrgency] = useState<'urgent' | 'not-urgent' | null>(null);
    const [importance, setImportance] = useState<'important' | 'not-important' | null>(null);
    
    const currentQuadrantInfo = quadrants.find(q => q.id === task.quadrant) || quadrants.find(q => q.id === 'inbox');

    useEffect(() => {
        const q = task.quadrant;
        if (q === 'do') { setUrgency('urgent'); setImportance('important'); } 
        else if (q === 'schedule') { setUrgency('not-urgent'); setImportance('important'); } 
        else if (q === 'someday') { setUrgency('not-urgent'); setImportance('not-important'); } 
        else { setUrgency(null); setImportance(null); }
    }, [task.quadrant]);

    const updateMatrix = (u: typeof urgency, i: typeof importance) => {
        setUrgency(u); 
        setImportance(i);
        if (u && i) {
             let newQ: Quadrant = 'inbox';
             if (u === 'urgent' && i === 'important') newQ = 'do';
             else if (u === 'not-urgent' && i === 'important') newQ = 'schedule';
             else if (u === 'not-urgent' && i === 'not-important') newQ = 'someday';
             else if (u === 'urgent' && i === 'not-important') newQ = 'do';

             setTask(prev => ({ ...prev, quadrant: newQ }));
        }
    };

    return (
        <div className={styles.formGroup}>
            <label><Icon path={icons.layoutGrid} /> Matriz de Prioridade</label>
            <div className={styles.matrixSelectorContainer}>
                <div className={styles.matrixRow}>
                    <span className={styles.matrixLabel}>É urgente?</span>
                    <div className={styles.matrixToggleGroup}>
                        <button className={`${styles.matrixToggleBtn} ${urgency === 'not-urgent' ? styles.active : ''}`} onClick={() => updateMatrix('not-urgent', importance)}>Pode esperar</button>
                        <button className={`${styles.matrixToggleBtn} ${urgency === 'urgent' ? styles.active : ''}`} onClick={() => updateMatrix('urgent', importance)}>É pra já!</button>
                    </div>
                </div>
                <div className={styles.matrixRow}>
                    <span className={styles.matrixLabel}>É importante?</span>
                    <div className={styles.matrixToggleGroup}>
                        <button className={`${styles.matrixToggleBtn} ${importance === 'not-important' ? styles.active : ''}`} onClick={() => updateMatrix(urgency, 'not-important')}>Baixo impacto</button>
                        <button className={`${styles.matrixToggleBtn} ${importance === 'important' ? styles.active : ''}`} onClick={() => updateMatrix(urgency, 'important')}>Alto impacto</button>
                    </div>
                </div>
                {currentQuadrantInfo &&
                    <div className={`${styles.matrixResult} ${styles[`quadrant-${currentQuadrantInfo.id}`]}`}>
                        <div className={styles.resultIcon}><Icon path={icons[currentQuadrantInfo.icon]} /></div>
                        <div className={styles.resultText}>
                            <span className={styles.resultTitle}>{currentQuadrantInfo.title}</span>
                            <span className={styles.resultSubtitle}>{currentQuadrantInfo.subtitle}</span>
                        </div>
                    </div>
                }
            </div>
        </div>
    );
}
