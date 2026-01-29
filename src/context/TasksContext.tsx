
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo } from 'react';
import type { Task, Tag, Quadrant, TaskTemplate, Routine, ChecklistItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { usePomodoro } from './PomodoroContext';
import { initialRoutines, initialTaskTemplates, defaultTags } from '../constants';

interface TasksContextType {
    tasks: Task[];
    tags: Tag[];
    frogTaskId: string | null;
    routines: Routine[];
    taskTemplates: TaskTemplate[];
    handleAddTask: (task: Omit<Task, 'id' | 'status'>) => void;
    handleAddTasks: (tasks: Omit<Task, 'id' | 'status'>[]) => void;
    handleUpdateTask: (updatedTask: Task) => void;
    handleUpdateTaskQuadrant: (taskId: string, newQuadrant: Quadrant, newIndex: number) => void;
    handleDeleteTask: (taskId: string) => void;
    handleCompleteTask: (taskId: string, subtaskId?: string) => void;
    handleToggleSubtask: (taskId: string, subtaskId: string) => void;
    handleSetFrog: (id: string | null) => void;
    handleUnsetFrog: () => void;
    handleSaveTag: (tag: Partial<Tag>) => void;
    handleDeleteTag: (tagId: number) => void;
    handleDuplicateTask: (taskId: string) => void;
    handlePostponeTask: (taskId: string, days: number) => void;
    needsMorningPlan: boolean;
    handleCreateTemplateFromTask: (task: Task) => void;
    handleCreateTemplate: (task: Partial<Omit<Task, 'id'>>) => TaskTemplate;
    handleDeleteTemplate: (templateId: number) => void;
    handleAddRoutine: (routine: Routine) => void;
    handleSaveRoutine: (routine: Routine) => void;
    handleDeleteRoutine: (routineId: string) => void;
    handleAddTemplates: (templates: TaskTemplate[]) => void;
    leavingHomeItems: ChecklistItem[];
    handleToggleLeavingHomeItem: (itemId: string) => void;
    handleAddLeavingHomeItem: (text: string) => void;
    handleRemoveLeavingHomeItem: (itemId: string) => void;
    handleResetLeavingHomeItems: () => void;
    triageQueue: Task[];
    isTriageActive: boolean;
    startTriage: () => void;
    processTriage: (quadrant: Quadrant) => void;
    endTriage: () => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasks = () => {
    const context = useContext(TasksContext);
    if (!context) {
        throw new Error('useTasks must be used within a TasksProvider');
    }
    return context;
};

const defaultLeavingHomeItems: ChecklistItem[] = [
    { id: 'item-1', text: 'Chaves', completed: false, isDefault: true },
    { id: 'item-2', text: 'Carteira', completed: false, isDefault: true },
    { id: 'item-3', text: 'Celular', completed: false, isDefault: true },
];

export const TasksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { addNotification } = useUI();
    const { setPontosFoco } = useTheme();
    const { activeTaskId, stopCycle, lastCompletedFocus, clearLastCompletedFocus } = usePomodoro(); 

    const [tasks, setTasks] = useLocalStorage<Task[]>('focusfrog_tasks', []);
    const [tags, setTags] = useLocalStorage<Tag[]>('focusfrog_tags', defaultTags);
    const [frogTaskId, setFrogTaskId] = useLocalStorage<string | null>('focusfrog_frogTaskId', null);
    const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('focusfrog_onboarding_completed', false);

    const [routines, setRoutines] = useLocalStorage<Routine[]>('focusfrog_routines', initialRoutines);
    const [taskTemplates, setTaskTemplates] = useLocalStorage<TaskTemplate[]>('focusfrog_taskTemplates', initialTaskTemplates);

    const [leavingHomeItems, setLeavingHomeItems] = useLocalStorage<ChecklistItem[]>('focusfrog_leavingHomeItems', defaultLeavingHomeItems);
    const [lastDeletedTask, setLastDeletedTask] = useState<{ task: Task, index: number } | null>(null);

    const [triageQueue, setTriageQueue] = useState<Task[]>([]);
    const isTriageActive = useMemo(() => triageQueue.length > 0, [triageQueue]);

    useEffect(() => {
        const welcomeTaskTemplate = taskTemplates.find(t => t.id === 50);
        if (!onboardingCompleted && welcomeTaskTemplate) {
            const newTaskId = `task-${Date.now()}`;
            const welcomeTaskInstance: Task = {
                id: newTaskId,
                title: welcomeTaskTemplate.title,
                description: welcomeTaskTemplate.description,
                quadrant: welcomeTaskTemplate.quadrant || 'inbox',
                pomodoroEstimate: welcomeTaskTemplate.pomodoroEstimate !== undefined ? welcomeTaskTemplate.pomodoroEstimate : 1,
                customDuration: welcomeTaskTemplate.customDuration,
                energyNeeded: welcomeTaskTemplate.energyNeeded,
                subtasks: welcomeTaskTemplate.subtasks?.map((st, subIndex) => ({
                    id: `sub-${Date.now()}-${subIndex}`,
                    text: st.text,
                    completed: false
                })),
                tagId: welcomeTaskTemplate.category === "FocusFrog🐸" ? 1 : undefined,
                status: 'todo',
                displayOrder: 0,
                templateId: welcomeTaskTemplate.id,
            };

            setTasks([welcomeTaskInstance]);
            setFrogTaskId(newTaskId);
            setOnboardingCompleted(true);
        }
    }, [onboardingCompleted, setOnboardingCompleted, setTasks, setFrogTaskId, taskTemplates]);

    const getLocalTodayString = useCallback(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }, []);

    const todayString = useMemo(() => getLocalTodayString(), [getLocalTodayString]);
    
    const needsMorningPlan = useMemo(() => {
        const frogForToday = tasks.find(t => t.id === frogTaskId && t.dueDate === todayString);
        return !frogForToday;
    }, [tasks, frogTaskId, todayString]);

    const handleAddTasks = useCallback((tasksData: Omit<Task, 'id' | 'status'>[]) => {
        setTasks(prev => {
            const newTasks: Task[] = tasksData.map((taskData, index) => ({
                ...taskData,
                id: `task-${Date.now()}-${index}`,
                status: 'todo',
                displayOrder: prev.filter(t => t.quadrant === taskData.quadrant).length + index,
            }));
            return [...prev, ...newTasks];
        });
    }, [setTasks]);

    const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'status'>) => {
        handleAddTasks([taskData]);
        if (taskData.quadrant === 'inbox') {
            addNotification('Nova tarefa capturada na Caixa de Entrada', '📥', 'info');
        } else {
            addNotification('Nova tarefa adicionada à sua lista', '✨', 'success');
        }
    }, [addNotification, handleAddTasks]);

    const handleUpdateTask = useCallback((updatedTask: Task) => {
        setTasks(prevTasks => {
            const oldTask = prevTasks.find(t => t.id === updatedTask.id);
            if (!oldTask) return prevTasks;
    
            if (oldTask.quadrant === updatedTask.quadrant) {
                return prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task);
            }

            const otherTasks = prevTasks.filter(task => task.id !== updatedTask.id);
            
            const oldQuadrantTasks = otherTasks
                .filter(t => t.quadrant === oldTask.quadrant)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((task, index) => ({ ...task, displayOrder: index }));

            const updatedTaskWithOrder = { ...updatedTask, displayOrder: otherTasks.filter(t => t.quadrant === updatedTask.quadrant).length };

            const newQuadrantTasks = [...otherTasks.filter(t => t.quadrant === updatedTask.quadrant), updatedTaskWithOrder]
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((task, index) => ({ ...task, displayOrder: index }));

            const unaffectedTasks = otherTasks.filter(t => t.quadrant !== oldTask.quadrant && t.quadrant !== updatedTask.quadrant);
            
            return [...unaffectedTasks, ...oldQuadrantTasks, ...newQuadrantTasks];
        });
        addNotification('Tarefa atualizada com sucesso', '✏️', 'success');
    }, [setTasks, addNotification]);
    
    const handleCompleteTask = useCallback((taskId: string, subtaskId?: string) => {
        const taskToComplete = tasks.find(t => t.id === taskId);
        if (!taskToComplete || taskToComplete.status === 'done') return;

        if (taskId === activeTaskId) {
            stopCycle();
        }
    
        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;
    
            if (subtaskId) {
                const updatedSubtasks = task.subtasks?.map(st => 
                    st.id === subtaskId ? { ...st, completed: true } : st
                ) || [];

                const allSubtasksDone = updatedSubtasks.every(st => st.completed);
                
                if (allSubtasksDone) {
                    setPontosFoco(p => p + 10);
                    if (taskId === frogTaskId) {
                        addNotification('Sapo do dia engolido!', '🐸', 'victory');
                        setPontosFoco(p => p + 40); // Bônus
                    } else {
                        addNotification('Tarefa concluída por subtarefas!', '🎉', 'success');
                    }
                    return { ...task, subtasks: updatedSubtasks, status: 'done', completedAt: new Date().toISOString() };
                }
                
                return { ...task, subtasks: updatedSubtasks };
            
            } else {
                setPontosFoco(p => p + 10);
                if (taskId === frogTaskId) {
                    addNotification('Sapo do dia engolido!', '🐸', 'victory');
                    setPontosFoco(p => p + 40); // Bônus
                } else {
                    addNotification('Tarefa concluída!', '🎉', 'success');
                }
                return { ...task, status: 'done', completedAt: new Date().toISOString() };
            }
        }));
    }, [tasks, setTasks, addNotification, setPontosFoco, activeTaskId, stopCycle, frogTaskId]);

    useEffect(() => {
        if (lastCompletedFocus?.taskId) {
            setTimeout(() => {
                handleCompleteTask(lastCompletedFocus.taskId);
                clearLastCompletedFocus();
                stopCycle(); 
            }, 0);
        }
    }, [lastCompletedFocus, handleCompleteTask, clearLastCompletedFocus, stopCycle]);

    const handleUpdateTaskQuadrant = useCallback((taskId: string, newQuadrant: Quadrant, newIndex: number) => {
        setTasks(prevTasks => {
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;
    
            const oldQuadrant = taskToMove.quadrant;
    
            if (oldQuadrant === newQuadrant) {
                const quadrantTasks = prevTasks
                    .filter(t => t.quadrant === oldQuadrant && t.id !== taskId)
                    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
                quadrantTasks.splice(newIndex, 0, taskToMove);
    
                const updatedQuadrantTasks = quadrantTasks.map((t, index) => ({
                    ...t,
                    displayOrder: index
                }));
    
                const otherTasks = prevTasks.filter(t => t.quadrant !== oldQuadrant);
                return [...otherTasks, ...updatedQuadrantTasks];
            }
    
            const tasksWithoutMoved = prevTasks.filter(t => t.id !== taskId);
            
            const oldQuadrantTasks = tasksWithoutMoved
                .filter(t => t.quadrant === oldQuadrant)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                .map((t, index) => ({ ...t, displayOrder: index }));
    
            const newQuadrantTasksRaw = tasksWithoutMoved
                .filter(t => t.quadrant === newQuadrant)
                .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
            const movedTask = { ...taskToMove, quadrant: newQuadrant };
            newQuadrantTasksRaw.splice(newIndex, 0, movedTask);
            
            const newQuadrantTasks = newQuadrantTasksRaw.map((t, index) => ({
                ...t,
                displayOrder: index
            }));
            
            const unaffectedTasks = tasksWithoutMoved.filter(t => t.quadrant !== oldQuadrant && t.quadrant !== newQuadrant);
    
            return [...unaffectedTasks, ...oldQuadrantTasks, ...newQuadrantTasks];
        });
    }, [setTasks]);

    const handleUndoDelete = useCallback(() => {
        if (lastDeletedTask) {
            setTasks(prev => {
                const newTasks = [...prev];
                newTasks.splice(lastDeletedTask.index, 0, lastDeletedTask.task);
                return newTasks;
            });
            setLastDeletedTask(null);
            addNotification('Tarefa restaurada', '↩️', 'info');
        }
    }, [lastDeletedTask, setTasks, addNotification]);

    const handleDeleteTask = useCallback((taskId: string) => {
        if (taskId === activeTaskId) {
            stopCycle();
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const taskToDelete = tasks[taskIndex];
        setLastDeletedTask({ task: taskToDelete, index: taskIndex });
        
        setTasks(prev => prev.filter(t => t.id !== taskId));

        addNotification('Tarefa excluída', '🗑️', 'info', {
            label: 'Desfazer',
            onAction: handleUndoDelete,
        });
        
        setTimeout(() => {
            setLastDeletedTask(null);
        }, 5000); 
    }, [tasks, setTasks, addNotification, handleUndoDelete, activeTaskId, stopCycle]);
    
    const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        handleCompleteTask(taskId, subtaskId);
    }, [handleCompleteTask]);
    
    const handleSetFrog = useCallback((id: string | null) => {
        if (frogTaskId === activeTaskId && frogTaskId !== id) {
            stopCycle();
        }
        setFrogTaskId(id);
    }, [frogTaskId, activeTaskId, stopCycle, setFrogTaskId]);

    const handleUnsetFrog = useCallback(() => {
        if (frogTaskId === activeTaskId) {
            stopCycle();
        }
        setFrogTaskId(null);
    }, [frogTaskId, activeTaskId, stopCycle, setFrogTaskId]);


    const handleSaveTag = useCallback((tag: Partial<Tag>) => {
        setTags(prev => {
            if (tag.id) {
                const originalTag = prev.find(t => t.id === tag.id);
                if (originalTag?.isDefault) {
                    addNotification("Etiquetas padrão não podem ser editadas.", '🛡️', 'error');
                    return prev;
                }
                addNotification('Etiqueta atualizada com sucesso', '✏️', 'success');
                return prev.map(t => t.id === tag.id ? { ...t, ...tag } : t);
            }
            addNotification('Nova etiqueta criada', '✨', 'success');
            const newTag: Tag = { id: Date.now(), name: tag.name!, color: tag.color!, isDefault: false };
            return [...prev, newTag];
        });
    }, [setTags, addNotification]);

    const handleDeleteTag = useCallback((tagId: number) => {
        const tagToDelete = tags.find(t => t.id === tagId);
        if (tagToDelete?.isDefault) {
            addNotification("Etiquetas padrão não podem ser excluídas.", '🛡️', 'error');
            return;
        }
        
        setTags(prev => prev.filter(t => t.id !== tagId));
        setTasks(prev => prev.map(t => t.tagId === tagId ? { ...t, tagId: undefined } : t));
        addNotification('Etiqueta excluída', '🗑️', 'info');
    }, [tags, setTags, setTasks, addNotification]);
    
    const handleDuplicateTask = useCallback((taskId: string) => {
        const taskToDuplicate = tasks.find(t => t.id === taskId);
        if (taskToDuplicate) {
            const duplicatedTask: Omit<Task, 'id' | 'status'> = {
                ...taskToDuplicate,
                title: `${taskToDuplicate.title} (Cópia)`,
            };
            handleAddTask(duplicatedTask);
        }
    }, [tasks, handleAddTask]);
    
    const handlePostponeTask = useCallback((taskId: string, days: number) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const currentDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : new Date();
                currentDate.setDate(currentDate.getDate() + days);
                const newDueDate = currentDate.toISOString().split('T')[0];
                return { ...task, dueDate: newDueDate };
            }
            return task;
        }));
        addNotification(`Tarefa adiada por ${days} dia(s)`, '🗓️', 'info');
    }, [setTasks, addNotification]);

    // [NOVO] Função para criar um modelo a partir de dados de tarefa e retorná-lo.
    const handleCreateTemplate = useCallback((taskData: Partial<Omit<Task, 'id'>>) => {
        const newTemplate: TaskTemplate = {
            id: Date.now(),
            title: taskData.title || 'Nova Tarefa',
            description: taskData.description,
            quadrant: taskData.quadrant,
            pomodoroEstimate: taskData.pomodoroEstimate,
            customDuration: taskData.customDuration,
            energyNeeded: taskData.energyNeeded,
            category: 'Personalizado',
            subtasks: taskData.subtasks?.map(st => ({ text: st.text })),
            isDefault: false,
        };
        setTaskTemplates(prev => [...prev, newTemplate]);
        // addNotification("Novo modelo salvo na sua biblioteca", '📚', 'success'); // Notificação desabilitada para fluxo de rotina
        return newTemplate;
    }, [setTaskTemplates]);

    const handleCreateTemplateFromTask = useCallback((task: Task) => {
        const newTemplate = handleCreateTemplate(task);
        addNotification(`Modelo "${newTemplate.title}" salvo na sua biblioteca.`, '📚', 'success');
    }, [handleCreateTemplate, addNotification]);
    
    const handleDeleteTemplate = useCallback((templateId: number) => {
        const templateToDelete = taskTemplates.find(t => t.id === templateId);
        if (!templateToDelete) return;

        if (templateToDelete.isDefault) {
            addNotification("Modelos padrão não podem ser excluídos.", '🛡️', 'error');
            return;
        }

        setTaskTemplates(prev => prev.filter(t => t.id !== templateId));
        addNotification("Modelo excluído com sucesso.", '🗑️', 'info');
    }, [taskTemplates, setTaskTemplates, addNotification]);

    const handleAddTemplates = useCallback((templates: TaskTemplate[]) => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const todayString = `${yyyy}-${mm}-${dd}`;

        const newTasks: Omit<Task, 'id' | 'status'>[] = templates.map(template => ({
            title: template.title,
            description: template.description,
            quadrant: template.quadrant || 'inbox',
            pomodoroEstimate: template.pomodoroEstimate !== undefined ? template.pomodoroEstimate : 1,
            customDuration: template.customDuration,
            energyNeeded: template.energyNeeded,
            subtasks: template.subtasks?.map((st, subIndex) => ({
                id: `sub-${Date.now()}-${subIndex}`,
                text: st.text,
                completed: false
            })),
            dueDate: todayString,
            templateId: template.id,
        }));
        
        if (newTasks.length > 0) {
            handleAddTasks(newTasks);
            addNotification(`${newTasks.length} tarefa(s) adicionada(s) à sua lista`, '✨', 'success');
        }
    }, [handleAddTasks, addNotification]);
    
    const handleAddRoutine = useCallback((routine: Routine) => {
        const templatesToAdd = (routine.taskTemplateIds && taskTemplates.filter(t => routine.taskTemplateIds.includes(t.id))) || [];
        if (templatesToAdd.length > 0) {
            handleAddTemplates(templatesToAdd);
            addNotification(`Rotina '${routine.name}' adicionada`, '🚀', 'success');
        }
    }, [taskTemplates, handleAddTemplates, addNotification]);

    // [CORREÇÃO] Lógica ajustada para verificar se a rotina existe antes de salvar
    const handleSaveRoutine = useCallback((routineToSave: Routine) => {
        setRoutines(prev => {
            const existingIndex = prev.findIndex(r => r.id === routineToSave.id);
            if (existingIndex > -1) {
                const newRoutines = [...prev];
                newRoutines[existingIndex] = routineToSave;
                addNotification(`Rotina '${routineToSave.name}' atualizada!`, '✏️', 'success');
                return newRoutines;
            } else {
                const newRoutine = {
                    ...routineToSave,
                    id: `routine-${Date.now()}`,
                    isDefault: false,
                    taskTemplateIds: routineToSave.taskTemplateIds || []
                };
                addNotification(`Nova rotina '${newRoutine.name}' criada!`, '✨', 'success');
                return [...prev, newRoutine];
            }
        });
    }, [setRoutines, addNotification]);

    const handleDeleteRoutine = useCallback((routineId: string) => {
        const routineToDelete = routines.find(r => r.id === routineId);
        if (!routineToDelete) return;

        if (routineToDelete.isDefault) {
            addNotification('Rotinas padrão não podem ser excluídas.', '🛡️', 'error');
            return;
        }

        setRoutines(prev => prev.filter(r => r.id !== routineId));
        addNotification('Rotina excluída com sucesso.', '🗑️', 'info');
    }, [routines, setRoutines, addNotification]);
    
    const handleToggleLeavingHomeItem = (itemId: string) => {
        setLeavingHomeItems(prev => prev.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
    };
    const handleAddLeavingHomeItem = (text: string) => {
        setLeavingHomeItems(prev => [...prev, { id: `item-${Date.now()}`, text, completed: false }]);
    };
    const handleRemoveLeavingHomeItem = (itemId: string) => {
        setLeavingHomeItems(prev => prev.filter(item => item.id !== itemId));
    };
    const handleResetLeavingHomeItems = () => {
        setLeavingHomeItems(prev => prev.map(item => ({ ...item, completed: false })));
    };
    
    const startTriage = useCallback(() => {
        const inboxTasks = tasks.filter(t => t.quadrant === 'inbox');
        setTriageQueue(inboxTasks);
        if (inboxTasks.length === 0) {
            addNotification("Sua caixa de entrada está limpa!", '🎉', 'success');
        }
    }, [tasks, addNotification]);

    const endTriage = useCallback(() => {
        setTriageQueue([]);
    }, []);

    const processTriage = useCallback((quadrant: Quadrant) => {
        if (triageQueue.length === 0) return;

        const taskToTriage = triageQueue[0];
        const newIndex = tasks.filter(t => t.quadrant === quadrant).length;
        
        handleUpdateTaskQuadrant(taskToTriage.id, quadrant, newIndex);
        
        setTriageQueue(prev => prev.slice(1));

        if (triageQueue.length === 1) {
            addNotification("Triagem concluída!", '✅', 'success');
            endTriage();
        }

    }, [triageQueue, tasks, handleUpdateTaskQuadrant, endTriage, addNotification]);

    const value: TasksContextType = {
        tasks,
        tags,
        frogTaskId,
        routines,
        taskTemplates,
        handleAddTask,
        handleAddTasks,
        handleUpdateTask,
        handleUpdateTaskQuadrant,
        handleDeleteTask,
        handleCompleteTask,
        handleToggleSubtask,
        handleSetFrog,
        handleUnsetFrog,
        handleSaveTag,
        handleDeleteTag,
        handleDuplicateTask,
        handlePostponeTask,
        needsMorningPlan,
        handleCreateTemplateFromTask,
        handleCreateTemplate, // Exposta no contexto
        handleDeleteTemplate,
        handleAddRoutine,
        handleSaveRoutine,    
        handleDeleteRoutine, 
        handleAddTemplates,
        leavingHomeItems,
        handleToggleLeavingHomeItem,
        handleAddLeavingHomeItem,
        handleRemoveLeavingHomeItem,
        handleResetLeavingHomeItems,
        triageQueue,
        isTriageActive,
        startTriage,
        processTriage,
        endTriage,
    };

    return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
};
