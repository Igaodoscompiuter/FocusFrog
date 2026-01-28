
import React, { useState, useMemo, useEffect } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Routine, Task, Quadrant, TaskTemplate } from '../../types';
import { routineIcons, quadrants, defaultCategories } from '../../constants';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTasks } from '../../context/TasksContext';
import styles from './RoutineEditorModal.module.css';
import { trackNewRoutineCreated } from '../../analytics';

type NewTaskForRoutine = Pick<Task, 'title' | 'quadrant' | 'description'> & { pomodoroEstimate: number; tempId: string; isDefault?: boolean };

interface RoutineEditorModalProps {
    routineToEdit: Routine | null;
    onSave: (routineData: Omit<Routine, 'id' | 'taskTemplateIds'>, tasks: Omit<NewTaskForRoutine, 'tempId'>[]) => void;
    onClose: () => void;
}

const quadrantMap = quadrants.reduce((acc, q) => {
    acc[q.id] = q.title;
    return acc;
}, {} as Record<Quadrant, string>);

export const RoutineEditorModal = ({ routineToEdit, onSave, onClose }: RoutineEditorModalProps) => {
    const { taskTemplates } = useTasks();

    const [routine, setRoutine] = useState<Partial<Routine>>(
        routineToEdit || { name: '', description: '', icon: 'zap', isDefault: false }
    );
    
    const [newTasksForRoutine, setNewTasksForRoutine] = useState<NewTaskForRoutine[]>([]);
    const [taskName, setTaskName] = useState('');
    const [taskType, setTaskType] = useState<'quick' | 'focus'>('quick');
    const [taskQuadrant, setTaskQuadrant] = useState<Quadrant>('schedule');

    const isEditing = !!routineToEdit;
    const isDefaultRoutine = isEditing && routineToEdit.isDefault;

    const [activeTab, setActiveTab] = useState('library');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    useEffect(() => {
        if (isEditing && routineToEdit.taskTemplateIds && taskTemplates) {
            const tasksFromTemplates = routineToEdit.taskTemplateIds
                .map(templateId => taskTemplates.find(t => t.id === templateId))
                .filter((t): t is TaskTemplate => !!t)
                .map(template => ({
                    tempId: `template_${template.id}`,
                    title: template.title,
                    description: template.description,
                    pomodoroEstimate: template.pomodoroEstimate || 0,
                    quadrant: template.quadrant,
                    isDefault: template.isDefault, 
                }));
            setNewTasksForRoutine(tasksFromTemplates);
        }
    }, [isEditing, routineToEdit, taskTemplates]);

    const modalRef = useClickOutside(onClose);

    const { categories, filteredTasks } = useMemo(() => {
        if (!taskTemplates) return { categories: ['Todos'], filteredTasks: [] };

        const allTasks = (isDefaultRoutine ? taskTemplates.filter(t => !t.isDefault) : taskTemplates)
            .filter(t => 
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );

        const uniqueCategories = ['Todos', ...Array.from(new Set(taskTemplates.map(t => t.category || 'Outros')))];

        const tasksToShow = selectedCategory === 'Todos' 
            ? allTasks 
            : allTasks.filter(t => (t.category || 'Outros') === selectedCategory);

        return { categories: uniqueCategories, filteredTasks: tasksToShow };

    }, [searchTerm, taskTemplates, isDefaultRoutine, selectedCategory]);

    const addedTaskIds = useMemo(() => new Set(newTasksForRoutine.map(t => t.tempId)), [newTasksForRoutine]);

    const handleFieldChange = (field: keyof Routine, value: any) => {
        setRoutine(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTask = () => {
        if (!taskName.trim()) return;
        const newTask: NewTaskForRoutine = {
            tempId: `temp_${Date.now()}`,
            title: taskName.trim(),
            pomodoroEstimate: taskType === 'focus' ? 1 : 0,
            quadrant: taskQuadrant,
            description: '',
            isDefault: false,
        };
        setNewTasksForRoutine(prev => [...prev, newTask]);
        setTaskName('');
        setTaskType('quick');
        setTaskQuadrant('schedule');
    };

    const handleAddTaskFromLibrary = (template: TaskTemplate) => {
        const newTask: NewTaskForRoutine = {
            tempId: `template_${template.id}`,
            title: template.title,
            description: template.description,
            pomodoroEstimate: template.pomodoroEstimate || 0,
            quadrant: template.quadrant,
            isDefault: template.isDefault,
        };
        setNewTasksForRoutine(prev => [...prev, newTask]);
    };

    const handleRemoveTask = (tempId: string) => {
        setNewTasksForRoutine(prev => prev.filter(task => task.tempId !== tempId));
    };

    const handleSubmit = () => {
        if (!routine.name?.trim()) return;
        if (!isEditing) trackNewRoutineCreated();
        const { id, taskTemplateIds, ...routineData } = routine;
        onSave(routineData as Omit<Routine, 'id' | 'taskTemplateIds'>, newTasksForRoutine.map(({tempId, ...task}) => task));
    };

    const renderTaskCreationUI = () => (
        <div className={styles.taskCreatorForm}>
            <input type="text" className={`g-input ${styles.taskInput}`} placeholder="Nome da Nova Tarefa" value={taskName} onChange={(e) => setTaskName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />
            <div className={styles.taskControls}>
                <div className={styles.segmentedControl}>
                    <button className={`${styles.segment} ${taskType === 'quick' ? styles.active : ''}`} onClick={() => setTaskType('quick')}>Rápida</button>
                    <button className={`${styles.segment} ${taskType === 'focus' ? styles.active : ''}`} onClick={() => setTaskType('focus')}>Foco</button>
                </div>
                <div className={styles.quadrantSelector}>
                    <div>
                        <button className={taskQuadrant === 'do' ? styles.active : ''} onClick={() => setTaskQuadrant('do')}>Foco Imediato</button>
                        <button className={taskQuadrant === 'schedule' ? styles.active : ''} onClick={() => setTaskQuadrant('schedule')}>Tarefas do Dia</button>
                    </div>
                </div>
                <button className={`btn btn-secondary ${styles.addButton}`} onClick={handleAddTask}><Icon path={icons.plus} /> Adicionar</button>
            </div>
        </div>
    );
    
    const renderLibrary = () => (
        <div className={`${styles.tabContent} ${styles.libraryContainer}`}>
            <div className={styles.categoryScroller}>
                {categories.map(category => (
                    <button 
                        key={category} 
                        className={`${styles.categoryChip} ${selectedCategory === category ? styles.active : ''}`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>

            <input type="text" placeholder="🔎 Buscar em todas as tarefas..." className={`g-input ${styles.librarySearchInput}`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            
            <div className={styles.libraryTaskList}>
                {filteredTasks.map(task => {
                    const isAdded = addedTaskIds.has(`template_${task.id}`);
                    return (
                        <div key={task.id} className={styles.libraryTaskItem}>
                            <div className={styles.libraryTaskInfo}>
                                <h6>{task.title}</h6>
                                {task.description && <p>{task.description}</p>}
                            </div>
                            <button onClick={() => handleAddTaskFromLibrary(task)} disabled={isAdded} className={`${styles.addFromLibButton} ${isAdded ? styles.added : ''}`}>
                                <Icon path={isAdded ? icons.check : icons.plus} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="g-modal-overlay">
            <div className={`g-modal ${styles.routineEditorModal}`} ref={modalRef}>
                <header className="g-modal-header"><h3>{isEditing ? 'Editar Rotina' : 'Criar Nova Rotina'}</h3></header>
                <main className="g-modal-body">
                    <div className={styles.routineInfoBlock}>
                        {isDefaultRoutine ? (
                            <div className={styles.defaultRoutineInfo}>
                                <div className={styles.defaultRoutineIconContainer}><Icon path={icons[routine.icon as keyof typeof icons]} /></div>
                                <div className={styles.defaultRoutineTextContainer}>
                                    <h5>{routine.name}</h5>
                                    <p>{routine.description}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-group"><label>Nome da Rotina</label><input type="text" className="g-input" value={routine.name || ''} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Ex: Preparação para a Semana"/></div>
                                <div className="form-group"><label>Ícone</label><div className={styles.iconSelector}>{routineIcons.map(iconName => (<button key={iconName} className={routine.icon === iconName ? styles.active : ''} onClick={() => handleFieldChange('icon', iconName)}><Icon path={icons[iconName]} /></button>))}</div></div>
                            </>
                        )}
                    </div>

                    <div className={styles.taskCreationBlock}>
                        <div className={styles.taskAreaTabs}>
                            <button className={`${styles.tabButton} ${activeTab === 'library' ? styles.active : ''}`} onClick={() => setActiveTab('library')}>Biblioteca</button>
                            <button className={`${styles.tabButton} ${activeTab === 'quick_add' ? styles.active : ''}`} onClick={() => setActiveTab('quick_add')}>Criar Rápida</button>
                        </div>
                        {activeTab === 'library' ? renderLibrary() : <div className={styles.tabContent}>{renderTaskCreationUI()}</div>}
                    </div>

                    <div className={styles.taskListBlock}>
                         <h4 className={styles.sectionHeader}>Tarefas da Rotina</h4>
                        <div className={styles.newTasksList}>
                            {newTasksForRoutine.map((task) => {
                                // [CORREÇÃO CRÍTICA] A lógica de exclusão foi corrigida aqui
                                const canDelete = !isDefaultRoutine || !task.isDefault;
                                const quadrantTitle = quadrantMap[task.quadrant] || task.quadrant;
                                return (
                                    <div key={task.tempId} className={styles.newTaskItem}>
                                        <span style={{ flex: 1, marginRight: 'var(--sp-md)' }}>{task.title}</span>
                                        <div className={styles.taskItemDetails}>
                                            <span className={styles.taskBadge}>{quadrantTitle}</span>
                                            {canDelete && (
                                                <button onClick={() => handleRemoveTask(task.tempId)} className={styles.removeTaskButton}>
                                                    <Icon path={icons.close} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {newTasksForRoutine.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-secondary-color)'}}>Adicione tarefas da biblioteca ou crie uma nova.</p>}
                        </div>
                    </div>
                </main>
                <footer className="g-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={!routine.name?.trim() || newTasksForRoutine.length === 0}>{isEditing ? 'Salvar Alterações' : 'Criar Rotina'}</button>
                </footer>
            </div>
        </div>
    );
};
