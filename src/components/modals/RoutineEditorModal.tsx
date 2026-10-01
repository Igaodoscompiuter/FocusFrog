
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Routine, Task, Quadrant, TaskTemplate } from '../../types';
import { routineIcons, quadrants, defaultCategories } from '../../constants';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useTasks } from '../../context/TasksContext';
import styles from './RoutineEditorModal.module.css';
import { trackNewRoutineCreated } from '../../analytics';

// A definição de tipo para tarefas dentro do editor.
// tempId é usado para rastrear tarefas na UI antes de serem salvas.
export type NewTaskForRoutine = Pick<Task, 'title' | 'quadrant' | 'description'> & { pomodoroEstimate: number; tempId: string; isDefault?: boolean };

interface RoutineEditorModalProps {
    routineToEdit: Routine | null;
    // [CORREÇÃO] A assinatura de onSave foi simplificada para passar os dados brutos para o componente pai.
    onSave: (routine: Partial<Routine>, tasks: NewTaskForRoutine[]) => void;
    onClose: () => void;
}

const quadrantMap = quadrants.reduce((acc, q) => {
    acc[q.id] = q.title;
    return acc;
}, {} as Record<Quadrant, string>);

export const RoutineEditorModal = ({ routineToEdit, onSave, onClose }: RoutineEditorModalProps) => {
    const { taskTemplates } = useTasks();
    // Contador para garantir IDs temporários únicos mesmo quando duas tarefas
    // são criadas no mesmo milissegundo (Date.now() sozinho pode colidir).
    const tempIdCounter = useRef(0);
    const generateTempId = () => {
        tempIdCounter.current += 1;
        return `temp_${Date.now()}_${tempIdCounter.current}`;
    };

    // Estado para os detalhes da rotina (nome, ícone, etc.)
    const [routine, setRoutine] = useState<Partial<Routine>>(
        routineToEdit || { name: '', description: '', icon: 'zap', isDefault: false, taskTemplateIds: [] }
    );
    
    // Estado para a lista de tarefas associadas a esta rotina no editor.
    const [newTasksForRoutine, setNewTasksForRoutine] = useState<NewTaskForRoutine[]>([]);
    const [taskName, setTaskName] = useState('');
    const [taskType, setTaskType] = useState<'quick' | 'focus'>('quick');
    const [taskQuadrant, setTaskQuadrant] = useState<Quadrant>('schedule');

    const isEditing = !!routineToEdit;
    const isDefaultRoutine = isEditing && routineToEdit.isDefault;

    const [activeTab, setActiveTab] = useState('library');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');

    // Efeito para popular a lista de tarefas quando se edita uma rotina existente.
    // Depende do ID da rotina (não do objeto inteiro) para não reexecutar à toa
    // caso o componente pai um dia passe uma nova referência do mesmo objeto.
    useEffect(() => {
        if (isEditing && routineToEdit.taskTemplateIds && taskTemplates) {
            const tasksFromTemplates = routineToEdit.taskTemplateIds
                .map(templateId => taskTemplates.find(t => t.id === templateId))
                .filter((t): t is TaskTemplate => !!t) // Garante que apenas templates encontrados sejam mapeados.
                .map(template => ({
                    tempId: `template_${template.id}`, // Prefixo `template_` para identificar tarefas de modelos existentes.
                    title: template.title,
                    description: template.description,
                    pomodoroEstimate: template.pomodoroEstimate || 0,
                    quadrant: template.quadrant,
                    isDefault: template.isDefault, 
                }));
            setNewTasksForRoutine(tasksFromTemplates);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEditing, routineToEdit?.id, taskTemplates]);

    const modalRef = useClickOutside(onClose);

    // Memoiza o cálculo das categorias e tarefas filtradas para a biblioteca.
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

    // Adiciona uma nova tarefa (ainda não salva) à lista da rotina.
    const handleAddTask = () => {
        if (!taskName.trim()) return;
        const newTask: NewTaskForRoutine = {
            tempId: generateTempId(), // Prefixo `temp_` + contador para identificar tarefas novas sem colisão.
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

    // Adiciona uma tarefa existente da biblioteca à lista da rotina.
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

    // [CORREÇÃO] A função agora passa o objeto `routine` completo e a lista de tarefas para o pai.
    const handleSubmit = () => {
        if (!routine.name?.trim()) return;
        if (!isEditing) trackNewRoutineCreated();
        onSave(routine, newTasksForRoutine);
    };

    const renderTaskCreationUI = () => (
        <div className={styles.taskCreatorForm}>
            <input type="text" className={`g-input ${styles.taskInput}`} placeholder="Nome da Nova Tarefa" value={taskName} onChange={(e) => setTaskName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTask()} />

            <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Tipo</span>
                <div className={styles.segmentedControl}>
                    <button className={`${styles.segment} ${taskType === 'quick' ? styles.active : ''}`} onClick={() => setTaskType('quick')}>Rápida</button>
                    <button className={`${styles.segment} ${taskType === 'focus' ? styles.active : ''}`} onClick={() => setTaskType('focus')}>Foco</button>
                </div>
            </div>

            <div className={styles.controlGroup}>
                <span className={styles.controlLabel}>Quadrante</span>
                <div className={styles.segmentedControl}>
                    <button className={`${styles.segment} ${taskQuadrant === 'do' ? styles.active : ''}`} onClick={() => setTaskQuadrant('do')}>Foco Imediato</button>
                    <button className={`${styles.segment} ${taskQuadrant === 'schedule' ? styles.active : ''}`} onClick={() => setTaskQuadrant('schedule')}>Tarefas do Dia</button>
                </div>
            </div>

            <button className={`btn btn-secondary ${styles.addButton}`} onClick={handleAddTask}><Icon path={icons.plus} /> Adicionar</button>
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

                        {/* [CORREÇÃO] Agendamento disponível pra QUALQUER rotina, inclusive as
                            padrão — antes ficava preso dentro do bloco "só rotina nova". */}
                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={!!routine.scheduledTime}
                                    onChange={e => handleFieldChange('scheduledTime', e.target.checked ? '07:00' : undefined)}
                                /> Lembrar todo dia num horário
                            </label>
                            {routine.scheduledTime && (
                                <>
                                    <input
                                        type="time"
                                        className="g-input"
                                        value={routine.scheduledTime}
                                        onChange={e => handleFieldChange('scheduledTime', e.target.value)}
                                    />
                                    <div className={styles.segmentedControl} style={{ marginTop: 'var(--sp-sm)' }}>
                                        <button
                                            type="button"
                                            className={`${styles.segment} ${routine.alarmMode !== 'alarm' ? styles.active : ''}`}
                                            onClick={() => handleFieldChange('alarmMode', 'normal')}
                                        >Normal</button>
                                        <button
                                            type="button"
                                            className={`${styles.segment} ${routine.alarmMode === 'alarm' ? styles.active : ''}`}
                                            onClick={() => handleFieldChange('alarmMode', 'alarm')}
                                        >⏰ Alarme</button>
                                    </div>
                                    <small style={{ color: 'var(--text-secondary-color)', display: 'block', marginTop: 'var(--sp-xs)' }}>
                                        {routine.alarmMode === 'alarm'
                                            ? 'Toca mais forte e aparece por cima de outros apps — pra rotinas que não podem ser ignoradas.'
                                            : 'Lembrete discreto, como as outras notificações do app.'}
                                    </small>
                                </>
                            )}
                        </div>
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
