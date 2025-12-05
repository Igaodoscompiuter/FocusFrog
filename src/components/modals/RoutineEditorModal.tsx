
import React, { useState, useMemo } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Routine, TaskTemplate } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { routineIcons } from '../../constants';
import { useClickOutside } from '../../hooks/useClickOutside';
import styles from './RoutineEditorModal.module.css';

// Componente da lista de seleção de tarefas
const TaskSelectionList = ({ 
    availableTemplates,
    selectedIds,
    onToggle,
    searchTerm,
    isRemovable = false,
    routineIsDefault = false,
    noResultsMessage = "Nenhuma tarefa encontrada."
}: { 
    availableTemplates: TaskTemplate[];
    selectedIds: number[];
    onToggle: (id: number) => void;
    searchTerm: string;
    isRemovable?: boolean;
    routineIsDefault?: boolean;
    noResultsMessage?: string;
}) => {
    const filtered = availableTemplates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <ul className={styles.templateSelectionList}>
            {filtered.length === 0 && <p className={styles.noResults}>{noResultsMessage}</p>}
            {filtered.map(template => {
                const isSelected = selectedIds.includes(template.id);
                const isRemovalDisabled = routineIsDefault && template.isDefault;

                return (
                    <li key={template.id} className={styles.templateItemContainer}>
                        {isRemovable ? (
                            <div className={styles.templateItem}>
                                <span className={styles.templateTitle}>{template.title}</span>
                                <button 
                                    className={styles.removeButton}
                                    onClick={() => onToggle(template.id)}
                                    disabled={isRemovalDisabled}
                                    title={isRemovalDisabled ? 'Tarefas padrão não podem ser removidas de rotinas padrão' : 'Remover Tarefa'}
                                >
                                    <Icon path={icons.trash} />
                                </button>
                            </div>
                        ) : (
                            <label className={`${styles.templateItem} ${styles.checkboxLabel} ${isSelected ? styles.selected : ''}`}>
                                <input 
                                    type="checkbox" 
                                    checked={isSelected} 
                                    onChange={() => onToggle(template.id)} 
                                />
                                <span className={styles.checkboxVisual}><Icon path={icons.check} /></span>
                                <span className={styles.templateTitle}>{template.title}</span>
                            </label>
                        )}
                    </li>
                )
            })}
        </ul>
    );
};

// Modal de Adição de Tarefa
const AddTaskModal = ({ onToggleTask, tasksNotInRoutine, onClose, searchTerm, setSearchTerm, routineTaskIds, isDefaultRoutine }: {
    onToggleTask: (id: number) => void;
    tasksNotInRoutine: TaskTemplate[];
    onClose: () => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    routineTaskIds: number[];
    isDefaultRoutine: boolean;
}) => {
    const modalRef = useClickOutside(onClose);

    const availableTasks = isDefaultRoutine 
        ? tasksNotInRoutine.filter(task => !task.isDefault)
        : tasksNotInRoutine;

    const noResultsMessage = isDefaultRoutine
        ? "Nenhuma tarefa personalizada disponível para adicionar."
        : "Nenhuma tarefa encontrada.";

    return (
        <div className="g-modal-overlay">
            <div className={`g-modal ${styles.addTaskModal}`} ref={modalRef}>
                <header className="g-modal-header">
                    <h3>Adicionar Tarefas à Rotina</h3>
                    <button onClick={onClose} className={styles.closePaneButton}><Icon path={icons.x}/></button>
                </header>
                <main className="g-modal-body" style={{flexDirection: 'column'}}>
                    <input 
                        type="text" 
                        placeholder="Buscar tarefas personalizadas..." 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        className="g-input"
                    />
                    <TaskSelectionList
                        availableTemplates={availableTasks}
                        selectedIds={routineTaskIds}
                        onToggle={onToggleTask}
                        searchTerm={searchTerm}
                        noResultsMessage={noResultsMessage}
                    />
                </main>
                <footer className="g-modal-footer">
                    <button className="btn btn-primary" onClick={onClose}>Concluído</button>
                </footer>
            </div>
        </div>
    );
}

// Modal Principal (Editor de Rotina)
export const RoutineEditorModal = ({ routineToEdit, onSave, onClose }: {
    routineToEdit: Routine | null;
    onSave: (routine: Routine) => void;
    onClose: () => void;
}) => {
    const { taskTemplates } = useTasks();
    const [routine, setRoutine] = useState<Routine>(routineToEdit || { id: '', name: '', description: '', icon: 'zap', taskTemplateIds: [], isDefault: false });
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    
    const isEditing = !!routineToEdit;
    const isDefaultRoutine = routine.isDefault;

    const modalRef = useClickOutside(() => {
        if (!isAddTaskModalOpen) {
            onClose();
        }
    });

    const handleFieldChange = (field: keyof Routine, value: any) => {
        setRoutine(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleTask = (templateId: number) => {
        setRoutine(prev => {
            const taskIds = prev.taskTemplateIds;
            const newIds = taskIds.includes(templateId) 
                ? taskIds.filter(id => id !== templateId)
                : [...taskIds, templateId];
            return { ...prev, taskTemplateIds: newIds };
        });
    };

    const handleSubmit = () => {
        if (!routine.name.trim()) {
            return;
        }
        onSave(routine);
    };

    const tasksInRoutine = useMemo(() => 
        taskTemplates.filter(t => routine.taskTemplateIds.includes(t.id)), 
    [taskTemplates, routine.taskTemplateIds]);

    const tasksNotInRoutine = useMemo(() => 
        taskTemplates.filter(t => !routine.taskTemplateIds.includes(t.id)),
    [taskTemplates, routine.taskTemplateIds]);

    const MainContent = () => {
        if (isEditing) {
            return (
                <div className={styles.taskListContainer}>
                    <TaskSelectionList
                        availableTemplates={tasksInRoutine}
                        selectedIds={routine.taskTemplateIds}
                        onToggle={handleToggleTask}
                        searchTerm={searchTerm}
                        isRemovable={true}
                        routineIsDefault={routine.isDefault}
                    />
                    <button className="btn btn-primary" onClick={() => setIsAddTaskModalOpen(true)} style={{width: '100%', marginTop: 'var(--sp-md)'}}>
                        <Icon path={icons.plus} /> Adicionar Tarefa
                    </button>
                </div>
            );
        } else {
            return (
                 <div className={styles.taskListContainer}>
                    <TaskSelectionList
                        availableTemplates={taskTemplates}
                        selectedIds={routine.taskTemplateIds}
                        onToggle={handleToggleTask}
                        searchTerm={searchTerm}
                    />
                </div>
            );
        }
    };

    return (
        <div className="g-modal-overlay">
            <div className={`g-modal ${styles.routineEditorModal}`} ref={modalRef}>
                <header className="g-modal-header">
                    <h3>{isEditing ? 'Editar Rotina' : 'Criar Nova Rotina'}</h3>
                </header>
                <main className="g-modal-body">
                    <div className={styles.formSection}>
                        {isDefaultRoutine ? (
                            <div className={styles.defaultRoutineInfo}>
                                <div className={styles.defaultRoutineIconContainer}>
                                    <Icon path={icons[routine.icon as keyof typeof icons]} />
                                </div>
                                <div className={styles.defaultRoutineTextContainer}>
                                    <h5>{routine.name}</h5>
                                    <p>{routine.description}</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Nome da Rotina</label>
                                    <input type="text" className="g-input" value={routine.name} onChange={e => handleFieldChange('name', e.target.value)} placeholder="Ex: Preparação para a Semana"/>
                                </div>
                                <div className="form-group">
                                    <label>Descrição</label>
                                    <input type="text" className="g-input" value={routine.description} onChange={e => handleFieldChange('description', e.target.value)} placeholder="Ex: Organizar agenda e metas..."/>
                                </div>
                                <div className="form-group">
                                    <label>Ícone</label>
                                    <div className={styles.iconSelector}>
                                        {routineIcons.map(iconName => (
                                            <button key={iconName} className={routine.icon === iconName ? styles.active : ''} onClick={() => handleFieldChange('icon', iconName)}>
                                                <Icon path={icons[iconName]} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                    <div className={styles.tasksSection}>
                        <h4 className={styles.sectionHeader}>{isEditing ? 'Tarefas na Rotina' : 'Selecione as Tarefas'}</h4>
                        <input type="text" placeholder="Buscar tarefas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`${styles.taskSearchInput} g-input`}/>
                        <MainContent />
                    </div>
                </main>
                <footer className="g-modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={!routine.name.trim()}>{isEditing ? 'Salvar Alterações' : 'Criar Rotina'}</button>
                </footer>
            </div>

            {isEditing && isAddTaskModalOpen && (
                <AddTaskModal 
                    onClose={() => setIsAddTaskModalOpen(false)}
                    tasksNotInRoutine={tasksNotInRoutine}
                    onToggleTask={handleToggleTask}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    routineTaskIds={routine.taskTemplateIds}
                    isDefaultRoutine={isDefaultRoutine}
                />
            )}
        </div>
    );
};