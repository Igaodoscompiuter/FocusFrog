import React, { useState, useMemo } from 'react';
import type { TaskTemplate, Routine } from '../../types';
import { useTasks } from '../../context/TasksContext';
import { defaultCategories } from '../../constants';
import { Icon } from '../Icon';
import { icons } from '../Icons';

interface TaskLibraryModalProps {
    routines: Routine[];
    onAddRoutine: (routine: Routine) => void;
    onAddTemplates: (templates: TaskTemplate[]) => void;
    onClose: () => void;
}

export const TaskLibraryModal: React.FC<TaskLibraryModalProps> = ({ routines, onAddRoutine, onAddTemplates, onClose }) => {
    const { taskTemplates } = useTasks();
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<number[]>([]);
    const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'routines' | 'templates'>('routines');

    const categories = useMemo(() => {
        const allCategories = Array.from(new Set(taskTemplates.map(t => t.category)));
        // Ensure default categories are present, even if empty
        const categorySet = new Set([...allCategories, ...defaultCategories]);
        return Array.from(categorySet);
    }, [taskTemplates]);

    const handleToggleTemplate = (id: number) => {
        setSelectedTemplateIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleAccordion = (category: string) => {
        setActiveAccordion(prev => prev === category ? null : category);
    };

    const handleAddSelectedTemplates = () => {
        const templatesToAdd = taskTemplates.filter(t => selectedTemplateIds.includes(t.id));
        if (templatesToAdd.length > 0) {
            onAddTemplates(templatesToAdd);
        }
        onClose();
    };
    
    const handleAddRoutineAndClose = (routine: Routine) => {
        onAddRoutine(routine);
        onClose();
    };

    return (
        <div className="modal-overlay">
            <div className="modal task-library-modal">
                <div className="modal-header">
                    <h3><Icon path={icons.bookOpen} /> Biblioteca</h3>
                    <p>Adicione rotinas completas ou tarefas individuais para agilizar seu dia.</p>
                </div>
                
                 <div className="library-tabs">
                    <button className={activeTab === 'routines' ? 'active' : ''} onClick={() => setActiveTab('routines')}>
                        <Icon path={icons.rotateCw} /> Rotinas
                    </button>
                    <button className={activeTab === 'templates' ? 'active' : ''} onClick={() => setActiveTab('templates')}>
                        <Icon path={icons.zap} /> Tarefas Rápidas
                    </button>
                </div>

                <div className="modal-body">
                    {activeTab === 'routines' && (
                         <div className="library-section">
                            <div className="routines-list">
                                {routines.map(routine => (
                                    <div key={routine.id} className="routine-card">
                                         <div className="routine-card-header">
                                            <Icon path={icons[routine.icon as keyof typeof icons]} />
                                            <h5>{routine.name}</h5>
                                        </div>
                                        <p>{routine.description}</p>
                                        <button className="control-button secondary" onClick={() => handleAddRoutineAndClose(routine)}>
                                            <Icon path={icons.plus}/> Adicionar ({routine.taskTemplateIds.length}) Tarefas
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="library-section">
                            <div className="task-library-accordion">
                                {categories.map(category => (
                                    <div key={category} className={`accordion-item ${activeAccordion === category ? 'open' : ''}`}>
                                        <div className="accordion-header" onClick={() => handleToggleAccordion(category)}>
                                            <span>{category}</span>
                                            <Icon path={icons.chevronDown} />
                                        </div>
                                        <div className="accordion-content">
                                            {taskTemplates.filter(t => t.category === category).map(template => (
                                                <div key={template.id} className="template-item" onClick={() => handleToggleTemplate(template.id)}>
                                                    <input type="checkbox" checked={selectedTemplateIds.includes(template.id)} readOnly />
                                                    <label>{template.title}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <button className="control-button secondary" onClick={onClose}>Fechar</button>
                    {activeTab === 'templates' && (
                        <button className="control-button" onClick={handleAddSelectedTemplates} disabled={selectedTemplateIds.length === 0}>
                            Adicionar Tarefas ({selectedTemplateIds.length})
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};