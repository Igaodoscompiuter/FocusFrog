import React, { useState } from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Routine } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { routineIcons } from '../../constants';
import { useClickOutside } from '../../hooks/useClickOutside';

export const RoutineEditorModal = ({ routineToEdit, onSave, onClose }: {
    routineToEdit: Routine | null;
    onSave: (routine: Routine) => void;
    onClose: () => void;
}) => {
    const { taskTemplates } = useTasks();
    const [routine, setRoutine] = useState<Routine>(routineToEdit || { id: '', name: '', description: '', icon: 'zap', taskTemplateIds: [] });
    const [searchTerm, setSearchTerm] = useState('');

    const modalRef = useClickOutside(onClose);

    const handleFieldChange = (field: keyof Routine, value: string) => {
        setRoutine(prev => ({ ...prev, [field]: value }));
    };

    const handleToggleTask = (templateId: number) => {
        setRoutine(prev => {
            const taskIds = prev.taskTemplateIds;
            if (taskIds.includes(templateId)) {
                return { ...prev, taskTemplateIds: taskIds.filter(id => id !== templateId) };
            } else {
                return { ...prev, taskTemplateIds: [...taskIds, templateId] };
            }
        });
    };

    const handleSubmit = () => {
        if (!routine.name.trim() || routine.taskTemplateIds.length === 0) return;
        onSave(routine);
    };

    const filteredTemplates = taskTemplates.filter(t => t.title.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="modal-overlay">
            <div className="modal routine-editor-modal" ref={modalRef}>
                <div className="modal-header">
                    <h3>{routineToEdit ? 'Editar Rotina' : 'Criar Nova Rotina'}</h3>
                </div>
                <div className="modal-body">
                    <div className="form-group">
                        <label>Nome da Rotina</label>
                        <input type="text" value={routine.name} onChange={e => handleFieldChange('name', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Descrição</label>
                        <input type="text" value={routine.description} onChange={e => handleFieldChange('description', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label>Ícone</label>
                        <div className="icon-selector">
                            {routineIcons.map(iconName => (
                                <button key={iconName} className={routine.icon === iconName ? 'active' : ''} onClick={() => handleFieldChange('icon', iconName)}>
                                    <Icon path={icons[iconName]} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="routine-task-builder">
                        <h4>Adicionar Tarefas</h4>
                         <input type="text" placeholder="Buscar tarefas..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="task-search-input"/>
                        <ul className="template-selection-list">
                            {filteredTemplates.map(template => (
                                <li key={template.id} onClick={() => handleToggleTask(template.id)} className={routine.taskTemplateIds.includes(template.id) ? 'selected' : ''}>
                                    <input type="checkbox" readOnly checked={routine.taskTemplateIds.includes(template.id)} />
                                    <span>{template.title}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="modal-footer">
                    <button className="control-button secondary" onClick={onClose}>Cancelar</button>
                    <button className="control-button" onClick={handleSubmit}>Salvar Rotina</button>
                </div>
            </div>
        </div>
    );
};