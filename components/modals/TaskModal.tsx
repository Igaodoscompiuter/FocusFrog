
import React, { useState, useEffect } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Task, Subtask, Quadrant, TimeOfDay, EnergyLevel } from '../../types';
import { quadrants } from '../../constants';
import { TagEditorModal } from './TagEditorModal';

interface TaskModalProps {
    taskToEdit: Partial<Task> | null;
    onClose: (createAnother?: boolean) => void;
}

const getInitialTaskState = (taskToEdit: Partial<Task> | null): Partial<Task> => {
    if (taskToEdit && Object.keys(taskToEdit).length > 0) {
        return {
            ...taskToEdit,
            subtasks: taskToEdit.subtasks ? [...taskToEdit.subtasks] : [],
            pomodoroEstimate: taskToEdit.pomodoroEstimate !== undefined ? taskToEdit.pomodoroEstimate : 1
        };
    }
    // Default to today's date (local) for new tasks so they appear on Dashboard immediately
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    
    return {
        title: '',
        description: '',
        quadrant: 'inbox',
        subtasks: [],
        status: 'todo',
        pomodoroEstimate: 1,
        energyNeeded: 'medium',
        dueDate: todayStr,
    };
};

export const TaskModal: React.FC<TaskModalProps> = ({ taskToEdit, onClose }) => {
    const { handleAddTask, handleUpdateTask, handleDeleteTask, tags, handleCreateTemplateFromTask } = useTasks();
    const [task, setTask] = useState<Partial<Task>>({});
    const [newSubtask, setNewSubtask] = useState('');
    const [isTagEditorOpen, setIsTagEditorOpen] = useState(false);
    const [isDetailedView, setIsDetailedView] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    // Matrix State
    const [urgency, setUrgency] = useState<'urgent' | 'not-urgent' | null>(null);
    const [importance, setImportance] = useState<'important' | 'not-important' | null>(null);
    
    // Helper to identify if it's a quick task (0 pomodoros)
    const isQuickTask = task.pomodoroEstimate === 0;

    useEffect(() => {
        const initialState = getInitialTaskState(taskToEdit);
        setTask(initialState);
        if (initialState.id || taskToEdit?.isDetailed) {
            setIsDetailedView(true);
        } else {
            setIsDetailedView(false);
        }
    }, [taskToEdit]);

    // Sync Matrix State with Task Quadrant
    useEffect(() => {
        const q = task.quadrant;
        if (q === 'do') { setUrgency('urgent'); setImportance('important'); }
        else if (q === 'schedule') { setUrgency('not-urgent'); setImportance('important'); }
        else if (q === 'delegate') { setUrgency('urgent'); setImportance('not-important'); }
        else if (q === 'eliminate') { setUrgency('not-urgent'); setImportance('not-important'); }
        else if (q === 'inbox') { setUrgency(null); setImportance(null); }
    }, [task.quadrant]);

    const updateMatrix = (u: typeof urgency, i: typeof importance) => {
        setUrgency(u);
        setImportance(i);
        
        if (u && i) {
             let newQ: Quadrant = 'inbox';
             if (u === 'urgent' && i === 'important') newQ = 'do';
             if (u === 'not-urgent' && i === 'important') newQ = 'schedule';
             if (u === 'urgent' && i === 'not-important') newQ = 'delegate';
             if (u === 'not-urgent' && i === 'not-important') newQ = 'eliminate';
             
             setTask(prev => ({ ...prev, quadrant: newQ }));
        }
    };

    const handleChange = (field: keyof Task, value: any) => {
        setTask(prev => ({ ...prev, [field]: value }));
    };
    
    const handleTaskTypeChange = (type: 'focus' | 'quick') => {
        handleChange('pomodoroEstimate', type === 'quick' ? 0 : 1);
        if (type === 'quick') {
            handleChange('customDuration', undefined);
        }
    };

    const handleSubtaskChange = (id: string, text: string) => {
        const updatedSubtasks = task.subtasks?.map(st => st.id === id ? { ...st, text } : st);
        handleChange('subtasks', updatedSubtasks);
    };

    const handleAddSubtask = () => {
        if (newSubtask.trim()) {
            const subtask: Subtask = { id: `sub-${Date.now()}`, text: newSubtask, completed: false };
            handleChange('subtasks', [...(task.subtasks || []), subtask]);
            setNewSubtask('');
        }
    };

    const handleRemoveSubtask = (id: string) => {
        handleChange('subtasks', task.subtasks?.filter(st => st.id !== id));
    };

    const handleMagicBreakdown = async () => {
        if (!task.title?.trim()) return;
        
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 1200));

        const titleLower = task.title.toLowerCase();
        let suggestions: string[] = [];

        if (titleLower.includes('estudar') || titleLower.includes('aprender') || titleLower.includes('ler')) {
            suggestions = ['Separar material', 'Definir objetivo', 'Fazer anotações', 'Revisar conceitos', 'Resumir'];
        } else if (titleLower.includes('limpar') || titleLower.includes('faxina')) {
            suggestions = ['Recolher lixo', 'Pegar produtos', 'Limpar superfícies', 'Aspirar chão', 'Passar pano'];
        } else if (titleLower.includes('relatório') || titleLower.includes('escrever')) {
            suggestions = ['Reunir dados', 'Criar esboço', 'Escrever rascunho', 'Revisar texto', 'Enviar'];
        } else if (titleLower.includes('treino') || titleLower.includes('exercício')) {
            suggestions = ['Preparar roupa', 'Alongamento', 'Aquecimento', 'Série principal', 'Esfriamento'];
        } else {
            suggestions = [
                `Definir primeiro passo`,
                `Preparar materiais`,
                `Executar parte difícil`,
                `Finalizar detalhes`,
                `Revisar`
            ];
        }

        const newSubtasks = suggestions.map((text, index) => ({
            id: `sub-ai-${Date.now()}-${index}`,
            text,
            completed: false
        }));

        handleChange('subtasks', [...(task.subtasks || []), ...newSubtasks]);
        setIsGenerating(false);
    };

    const handleSubmit = (createAnother = false) => {
        if (!task.title?.trim()) {
            alert('O título da tarefa é obrigatório.');
            return;
        }
        
        const { isDetailed, ...taskToSave } = task;

        // Se não tem ID e não foi detalhado, vai pra Inbox por padrão
        if (!taskToSave.id && !isDetailedView && taskToSave.quadrant === 'inbox') {
            taskToSave.quadrant = 'inbox';
        }
        
        if (taskToSave.id) {
            handleUpdateTask(taskToSave as Task);
        } else {
            handleAddTask(taskToSave as Omit<Task, 'id' | 'status'>);
        }
        
        if (createAnother) {
            setTask(getInitialTaskState({}));
            setIsDetailedView(false);
        } else {
            onClose();
        }
    };
    
    const handleDelete = () => {
        if (task.id && window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
            handleDeleteTask(task.id);
            onClose();
        }
    };
    
    const handleSaveAsTemplate = () => {
        if(task.id){
            handleCreateTemplateFromTask(task as Task);
            onClose();
        }
    };

    if (!taskToEdit) return null;
    
    const currentQuadrantInfo = quadrants.find(q => q.id === task.quadrant) || { title: 'Caixa de Entrada', subtitle: 'Defina a prioridade', icon: 'inbox' as keyof typeof icons, id: 'inbox' };

    const energyLevels: { id: EnergyLevel, label: string }[] = [
        { id: 'low', label: 'Baixa' },
        { id: 'medium', label: 'Média' },
        { id: 'high', label: 'Alta' },
    ];

    return (
        <>
        <div className="modal-overlay" onClick={() => onClose()}>
            <div className={`modal task-modal ${!isDetailedView ? 'simple-modal' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{task.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
                     <button onClick={() => onClose()} className="icon-button close-button" aria-label="Fechar modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        className="task-title-input"
                        placeholder="O que precisa ser feito?"
                        value={task.title || ''}
                        onChange={e => handleChange('title', e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && !isDetailedView) handleSubmit(false)
                        }}
                        autoFocus
                    />
                    
                    {!isDetailedView && (
                        <button className="add-details-button" onClick={() => setIsDetailedView(true)}>
                            <Icon path={icons.plus} /> Adicionar Detalhes & Prioridade
                        </button>
                    )}

                    {isDetailedView && (
                        <div className="detailed-fields">
                            <textarea
                                className="task-description-textarea"
                                placeholder="Descrição, links ou notas..."
                                value={task.description || ''}
                                onChange={e => handleChange('description', e.target.value)}
                            />

                            <div className="form-group">
                                <label><Icon path={icons.layoutGrid} /> Matriz de Prioridade</label>
                                <div className="matrix-selector-container">
                                    <div className="matrix-row">
                                        <span className="matrix-label">É urgente?</span>
                                        <div className="matrix-toggle-group">
                                            <button 
                                                type="button"
                                                className={`matrix-toggle-btn ${urgency === 'not-urgent' ? 'active' : ''}`}
                                                onClick={() => updateMatrix('not-urgent', importance)}
                                            >
                                                Pode esperar
                                            </button>
                                            <button 
                                                type="button"
                                                className={`matrix-toggle-btn ${urgency === 'urgent' ? 'active' : ''}`}
                                                onClick={() => updateMatrix('urgent', importance)}
                                            >
                                                É pra já!
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="matrix-divider"></div>

                                    <div className="matrix-row">
                                        <span className="matrix-label">É importante?</span>
                                        <div className="matrix-toggle-group">
                                            <button 
                                                type="button"
                                                className={`matrix-toggle-btn ${importance === 'not-important' ? 'active' : ''}`}
                                                onClick={() => updateMatrix(urgency, 'not-important')}
                                            >
                                                Baixo impacto
                                            </button>
                                            <button 
                                                type="button"
                                                className={`matrix-toggle-btn ${importance === 'important' ? 'active' : ''}`}
                                                onClick={() => updateMatrix(urgency, 'important')}
                                            >
                                                Alto impacto
                                            </button>
                                        </div>
                                    </div>

                                    <div className={`matrix-result quadrant-${currentQuadrantInfo.id}`}>
                                        <div className="result-icon">
                                            <Icon path={icons[currentQuadrantInfo.icon]} />
                                        </div>
                                        <div className="result-text">
                                            <span className="result-title">{currentQuadrantInfo.title}</span>
                                            <span className="result-subtitle">{currentQuadrantInfo.subtitle}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="task-modal-grid">
                                <div className="form-group">
                                    <label><Icon path={icons.calendar} /> Data</label>
                                    <input type="date" value={task.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value)} />
                                </div>
                                
                                <div className="form-group">
                                     <label><Icon path={icons.sun} /> Período</label>
                                     <select value={task.timeOfDay || ''} onChange={e => handleChange('timeOfDay', e.target.value as TimeOfDay)}>
                                        <option value="">Nenhum</option>
                                        <option value="morning">Manhã</option>
                                        <option value="afternoon">Tarde</option>
                                        <option value="night">Noite</option>
                                    </select>
                                </div>

                                <div className="form-group" style={{gridColumn: 'span 2'}}>
                                    <label><Icon path={icons.target} /> Tipo de Tarefa</label>
                                    <div className="matrix-toggle-group" style={{display: 'flex', width: '100%', marginBottom: '0.5rem'}}>
                                        <button 
                                            type="button"
                                            className={`matrix-toggle-btn ${!isQuickTask ? 'active' : ''}`}
                                            onClick={() => handleTaskTypeChange('focus')}
                                            style={{flex: 1}}
                                        >
                                            Foco (Timer)
                                        </button>
                                        <button 
                                            type="button"
                                            className={`matrix-toggle-btn ${isQuickTask ? 'active' : ''}`}
                                            onClick={() => handleTaskTypeChange('quick')}
                                            style={{flex: 1}}
                                        >
                                            Rápida (Check)
                                        </button>
                                    </div>
                                </div>
                                
                                {!isQuickTask && (
                                    <>
                                        <div className="form-group">
                                            <label><Icon path={icons.timer} /> Pomodoros (25m)</label>
                                            <input 
                                                type="number" 
                                                value={task.pomodoroEstimate || ''} 
                                                onChange={e => handleChange('pomodoroEstimate', parseInt(e.target.value) || 1)}
                                                min="1"
                                                placeholder="1"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label><Icon path={icons.clock} /> Duração (Min)</label>
                                            <input 
                                                type="number" 
                                                value={task.customDuration || ''} 
                                                onChange={e => handleChange('customDuration', e.target.value ? parseInt(e.target.value) : undefined)}
                                                min="1"
                                                placeholder="25 (Padrão)"
                                            />
                                        </div>
                                    </>
                                )}

                                 <div className="form-group">
                                    <label><Icon path={icons.zap} /> Tag</label>
                                    <div className="tag-selector-wrapper">
                                        <select value={task.tagId || ''} onChange={e => handleChange('tagId', e.target.value ? parseInt(e.target.value) : null)}>
                                            <option value="">Nenhuma</option>
                                            {tags.map(tag => (
                                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => setIsTagEditorOpen(true)} className="manage-tags-button"><Icon path={icons.pencil}/></button>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label><Icon path={icons.battery} /> Energia Necessária</label>
                                <div className="energy-selector">
                                    {energyLevels.map(level => (
                                        <button
                                            key={level.id}
                                            type="button"
                                            className={`energy-option-button ${task.energyNeeded === level.id ? 'selected' : ''}`}
                                            onClick={() => handleChange('energyNeeded', level.id)}
                                        >
                                            <Icon path={icons.zap} />
                                            {level.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <span><Icon path={icons.checkSquare} /> Subtarefas</span>
                                    <button 
                                        className={`magic-ai-button ${isGenerating ? 'generating' : ''}`} 
                                        onClick={handleMagicBreakdown}
                                        disabled={isGenerating || !task.title}
                                        type="button"
                                        title="Usar IA para quebrar tarefa em passos menores"
                                    >
                                        {isGenerating ? (
                                            <>✨ Pensando...</>
                                        ) : (
                                            <><Icon path={icons.sparkles} /> Magic Breakdown</>
                                        )}
                                    </button>
                                </label>
                                <ul className="subtask-list">
                                    {task.subtasks?.map(subtask => (
                                        <li key={subtask.id}>
                                            <input type="checkbox" checked={subtask.completed} readOnly />
                                            <input type="text" value={subtask.text} onChange={(e) => handleSubtaskChange(subtask.id, e.target.value)} />
                                            <button onClick={() => handleRemoveSubtask(subtask.id)}><Icon path={icons.trash} /></button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="subtask-input-group">
                                    <input
                                        type="text"
                                        placeholder="Adicionar subtarefa..."
                                        value={newSubtask}
                                        onChange={(e) => setNewSubtask(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                                    />
                                    <button onClick={handleAddSubtask}><Icon path={icons.plus} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="modal-footer">
                    <div>
                        {task.id && (
                             <button className="control-button tertiary" onClick={handleDelete}>
                                <Icon path={icons.trash} /> Excluir
                            </button>
                        )}
                        {task.id && isDetailedView && (
                            <button className="control-button tertiary" onClick={handleSaveAsTemplate}>
                                <Icon path={icons.bookOpen} /> Modelo
                            </button>
                        )}
                    </div>
                    <div>
                        {isDetailedView && <button className="control-button secondary" onClick={() => handleSubmit(true)}>Salvar +</button>}
                        <button className="control-button" onClick={() => handleSubmit(false)}>Salvar</button>
                    </div>
                </div>
            </div>
        </div>
        {isTagEditorOpen && <TagEditorModal onClose={() => setIsTagEditorOpen(false)} />}
        </>
    );
};
