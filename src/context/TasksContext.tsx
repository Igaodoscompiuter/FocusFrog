
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect, useMemo, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import type { Task, Tag, Quadrant, TaskTemplate, Routine, ChecklistItem } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { todayISO, toISODate } from '../utils/dates';
import { useUI } from './UIContext';
import { useTheme } from './ThemeContext';
import { usePomodoro } from './PomodoroContext';
import { initialRoutines, initialTaskTemplates, defaultTags, focusFrogMarketingTask, FOCUS_FROG_MARKETING_TASK_ID } from '../constants';
import { syncRoutineNotifications, scheduleFrogReminder, cancelFrogReminder } from '../notifications';
import { syncChecklistToWidget, readChecklistFromWidget } from '../widgetBridge';

type CompletionMethod = 'timer' | 'button' | 'subtask';

interface TasksContextType {
    tasks: Task[];
    tags: Tag[];
    frogTaskId: string | null;
    routines: Routine[];
    taskTemplates: TaskTemplate[];
    handleAddTask: (task: Omit<Task, 'id' | 'status' | 'displayOrder'>) => void;
    handleAddTasks: (tasks: Omit<Task, 'id' | 'status' | 'displayOrder'>[]) => void;
    handleUpdateTask: (updatedTask: Task) => void;
    handleUpdateTaskQuadrant: (taskId: string, newQuadrant: Quadrant, newIndex: number) => void;
    handleDeleteTask: (taskId: string) => void;
    handleCompleteTask: (taskId: string, method: CompletionMethod, subtaskId?: string) => void;
    handleToggleSubtask: (taskId: string, subtaskId: string) => void;
    handleSetFrog: (id: string | null) => void;
    /** restaura o Card Especial FocusFrog (se excluído/concluído) e define como Sapo do Dia */
    ensureMarketingFrog: () => void;
    handleUnsetFrog: () => void;
    handleSaveTag: (tag: Partial<Tag>) => void;
    handleDeleteTag: (tagId: number) => void;
    handleDuplicateTask: (taskId: string) => void;
    handlePostponeTask: (taskId: string, days: number) => void;
    needsMorningPlan: boolean;
    handleCreateTemplateFromTask: (task: Partial<Omit<Task, 'id' | 'status' | 'displayOrder'>>, category?: string) => void;
    handleCreateTemplate: (task: Partial<Omit<Task, 'id'>>, category?: string) => TaskTemplate;
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
    const { activeTaskId, activeTaskTitle, sessionStatus, stopCycle, lastCompletedFocus, clearLastCompletedFocus } = usePomodoro();

    // Gerador de ID numérico único. Date.now() sozinho colide quando a mesma função
    // é chamada várias vezes no mesmo milissegundo (ex.: salvar uma rotina com várias
    // tarefas novas, criadas em loop) — o contador garante unicidade mesmo nesse caso.
    const idCounterRef = useRef(0);
    const generateNumericId = useCallback(() => {
        idCounterRef.current += 1;
        return Date.now() * 1000 + (idCounterRef.current % 1000);
    }, []);

    // [NOVO] Instalação nova já nasce com o card especial FocusFrog como tarefa
    // de verdade (antes só existia como template na Biblioteca, nunca aparecia
    // sozinho) — estratégia de marketing combinada com frogTaskId abaixo.
    const [tasks, setTasks] = useLocalStorage<Task[]>('focusfrog_tasks', [focusFrogMarketingTask]);
    const [tags, setTags] = useLocalStorage<Tag[]>('focusfrog_tags', defaultTags);
    // Sapo do Dia padrão = o card especial acima, só na 1ª instalação.
    const [frogTaskId, setFrogTaskId] = useLocalStorage<string | null>('focusfrog_frogTaskId', FOCUS_FROG_MARKETING_TASK_ID);
    const [onboardingCompleted, setOnboardingCompleted] = useLocalStorage<boolean>('focusfrog_onboarding_completed', false);

    const [routines, setRoutines] = useLocalStorage<Routine[]>('focusfrog_routines', initialRoutines);

    // Sempre que as rotinas mudarem (criar/editar/excluir/definir horário),
    // ressincroniza as notificações diárias agendadas — nativo apenas.
    useEffect(() => {
        syncRoutineNotifications(routines);
    }, [routines]);

    // Lembrete do Sapo do Dia: se passar um tempo e a tarefa escolhida ainda não
    // tiver sido concluída, um empurrãozinho. Reagenda sempre que o Sapo do Dia
    // muda; cancela se a tarefa for concluída, trocada ou removida.
    const FROG_REMINDER_DELAY_MS = 3 * 60 * 60 * 1000; // 3 horas
    useEffect(() => {
        const frogTask = frogTaskId ? tasks.find(t => t.id === frogTaskId) : null;
        if (frogTask && frogTask.status !== 'done') {
            scheduleFrogReminder(frogTask.title, FROG_REMINDER_DELAY_MS);
        } else {
            cancelFrogReminder();
        }
        // Só precisa reagir à troca do Sapo do Dia ou à conclusão da tarefa em si —
        // não a toda mudança em `tasks` (evitaria reagendar o lembrete a cada edição
        // de qualquer outra tarefa da lista).
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frogTaskId, frogTaskId ? tasks.find(t => t.id === frogTaskId)?.status : null]);
    const [taskTemplates, setTaskTemplates] = useLocalStorage<TaskTemplate[]>('focusfrog_taskTemplates', initialTaskTemplates);

    const [leavingHomeItems, setLeavingHomeItems] = useLocalStorage<ChecklistItem[]>('focusfrog_leavingHomeItems', defaultLeavingHomeItems);

    // Espelha o checklist pro widget de tela inicial sempre que mudar dentro do app.
    useEffect(() => {
        syncChecklistToWidget(leavingHomeItems);
    }, [leavingHomeItems]);

    // Ao voltar ao primeiro plano, lê de volta o que o widget possa ter mudado
    // enquanto o app estava fechado/minimizado (toques em "Já pegou?" na tela inicial).
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;
        const sub = CapacitorApp.addListener('appStateChange', async ({ isActive }) => {
            if (!isActive) return;
            const fromWidget = await readChecklistFromWidget();
            if (fromWidget && JSON.stringify(fromWidget) !== JSON.stringify(leavingHomeItems)) {
                setLeavingHomeItems(fromWidget);
            }
        });
        return () => { sub.then(s => s.remove()); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leavingHomeItems]);
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
                subtasks: welcomeTaskTemplate.subtasks?.map((st, subIndex) => ({ id: `sub-${Date.now()}-${subIndex}`, text: st.text, completed: false })),
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

    const handleAddTask = useCallback((taskData: Omit<Task, 'id' | 'status' | 'displayOrder'>) => {
        const newTasks: Task[] = [{ ...taskData, id: `task-${Date.now()}`, status: 'todo', displayOrder: 0 }];
        setTasks(prev => [...prev, ...newTasks].map((t, i) => ({ ...t, displayOrder: i })));
        if (taskData.quadrant === 'inbox') {
            addNotification('Nova tarefa capturada na Caixa de Entrada', '📥', 'info');
        } else {
            addNotification('Nova tarefa adicionada à sua lista', '✨', 'success');
        }
    }, [setTasks, addNotification]);

    const handleAddTasks = useCallback((tasksData: Omit<Task, 'id' | 'status' | 'displayOrder'>[]) => {
        const newTasks: Task[] = tasksData.map((taskData, index) => ({
            ...taskData,
            id: `task-${Date.now()}-${index}`,
            status: 'todo',
            displayOrder: 0,
        }));
        setTasks(prev => [...prev, ...newTasks].map((t, i) => ({ ...t, displayOrder: i })));
    }, [setTasks]);

    const handleUpdateTask = useCallback((updatedTask: Task) => {
        setTasks(prevTasks => prevTasks.map(task => task.id === updatedTask.id ? updatedTask : task));
        addNotification('Tarefa atualizada com sucesso', '✏️', 'success');
    }, [setTasks, addNotification]);

    const handleCompleteTask = useCallback((taskId: string, method: CompletionMethod, subtaskId?: string) => {
        const taskToComplete = tasks.find(t => t.id === taskId);
        if (!taskToComplete || taskToComplete.status === 'done') return;

        if (taskId === activeTaskId) {
            stopCycle();
        }

        const shouldReward = method === 'timer';

        setTasks(prev => prev.map(task => {
            if (task.id !== taskId) return task;

            let taskCompleted = false;
            let updatedSubtasks = task.subtasks;

            if (subtaskId) {
                updatedSubtasks = task.subtasks?.map(st => st.id === subtaskId ? { ...st, completed: true } : st) || [];
                const allSubtasksDone = updatedSubtasks.every(st => st.completed);
                if (allSubtasksDone) {
                    taskCompleted = true;
                }
            } else {
                taskCompleted = true;
            }

            if (taskCompleted) {
                if (shouldReward) {
                    setPontosFoco(p => p + 10); // Recompensa base
                    if (taskId === frogTaskId) {
                        addNotification('Sapo do dia engolido!', '🐸', 'victory');
                        setPontosFoco(p => p + 40); // Bônus pelo sapo
                    } else {
                        addNotification('Tarefa concluída com foco!', '🎉', 'success');
                    }
                } else {
                    addNotification('Tarefa concluída!', '✅', 'info');
                }
                return { ...task, subtasks: updatedSubtasks, status: 'done', completedAt: new Date().toISOString() };
            } else {
                return { ...task, subtasks: updatedSubtasks };
            }
        }));
    }, [tasks, setTasks, addNotification, setPontosFoco, activeTaskId, stopCycle, frogTaskId]);

    useEffect(() => {
        if (lastCompletedFocus?.taskId) {
            setTimeout(() => {
                handleCompleteTask(lastCompletedFocus.taskId, lastCompletedFocus.completionMethod);
                clearLastCompletedFocus();
            }, 0);
        }
    }, [lastCompletedFocus, handleCompleteTask, clearLastCompletedFocus]);

    const handleUpdateTaskQuadrant = useCallback((taskId: string, newQuadrant: Quadrant, newIndex: number) => {
        setTasks(prevTasks => {
            const taskToMove = prevTasks.find(t => t.id === taskId);
            if (!taskToMove) return prevTasks;
            const sourceQuadrant = prevTasks.filter(t => t.quadrant === taskToMove.quadrant && t.id !== taskId);
            const destinationQuadrant = prevTasks.filter(t => t.quadrant === newQuadrant);
            const otherQuadrants = prevTasks.filter(t => t.quadrant !== taskToMove.quadrant && t.quadrant !== newQuadrant);
            destinationQuadrant.splice(newIndex, 0, { ...taskToMove, quadrant: newQuadrant });
            const result = [...otherQuadrants, ...sourceQuadrant, ...destinationQuadrant].map((t, i) => ({ ...t, displayOrder: i }));
            return result;
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
        if (taskId === activeTaskId) stopCycle();
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;
        const taskToDelete = tasks[taskIndex];
        setLastDeletedTask({ task: taskToDelete, index: taskIndex });
        setTasks(prev => prev.filter(t => t.id !== taskId));
        addNotification('Tarefa excluída', '🗑️', 'info', { label: 'Desfazer', onAction: handleUndoDelete });
        setTimeout(() => setLastDeletedTask(null), 5000);
    }, [tasks, setTasks, addNotification, handleUndoDelete, activeTaskId, stopCycle]);

    const handleToggleSubtask = useCallback((taskId: string, subtaskId: string) => {
        handleCompleteTask(taskId, 'subtask', subtaskId);
    }, [handleCompleteTask]);

    // [CORREÇÃO] Mesmo risco do botão "Comer o Sapo": trocar o Sapo do Dia
    // enquanto ELE MESMO está em foco interrompia o ciclo em silêncio, sem
    // perguntar nada. Agora confirma antes, igual o botão de comer já faz.
    const handleSetFrog = useCallback((id: string | null) => {
        const isFocusingCurrentFrog = frogTaskId === activeTaskId && sessionStatus !== 'idle' && frogTaskId !== id;
        if (isFocusingCurrentFrog) {
            const troca = window.confirm(
                `Você está em foco${activeTaskTitle ? ` em "${activeTaskTitle}"` : ''} agora. Trocar o Sapo do Dia vai interromper esse foco. Continuar?`
            );
            if (!troca) return;
            stopCycle();
        }
        setFrogTaskId(id);
    }, [frogTaskId, activeTaskId, activeTaskTitle, sessionStatus, stopCycle, setFrogTaskId]);

    const handleUnsetFrog = useCallback(() => {
        const isFocusingCurrentFrog = frogTaskId === activeTaskId && sessionStatus !== 'idle';
        if (isFocusingCurrentFrog) {
            const continuar = window.confirm(
                `Você está em foco${activeTaskTitle ? ` em "${activeTaskTitle}"` : ''} agora. Remover o Sapo do Dia vai interromper esse foco. Continuar?`
            );
            if (!continuar) return;
            stopCycle();
        }
        setFrogTaskId(null);
    }, [frogTaskId, activeTaskId, activeTaskTitle, sessionStatus, stopCycle, setFrogTaskId]);

    const handleSaveTag = useCallback((tag: Partial<Tag>) => {
        setTags(prev => {
            if (tag.id) {
                if (prev.find(t => t.id === tag.id)?.isDefault) {
                    addNotification("Etiquetas padrão não podem ser editadas.", '🛡️', 'error');
                    return prev;
                }
                addNotification('Etiqueta atualizada', '✏️', 'success');
                return prev.map(t => t.id === tag.id ? { ...t, ...tag } as Tag : t);
            }
            addNotification('Nova etiqueta criada', '✨', 'success');
            return [...prev, { id: generateNumericId(), name: tag.name!, color: tag.color!, isDefault: false }];
        });
    }, [setTags, addNotification, generateNumericId]);

    const handleDeleteTag = useCallback((tagId: number) => {
        if (tags.find(t => t.id === tagId)?.isDefault) {
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
            handleAddTask({ ...taskToDuplicate, title: `${taskToDuplicate.title} (Cópia)` });
        }
    }, [tasks, handleAddTask]);

    const handlePostponeTask = useCallback((taskId: string, days: number) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                const currentDate = task.dueDate ? new Date(task.dueDate + 'T00:00:00') : new Date();
                currentDate.setDate(currentDate.getDate() + days);
                return { ...task, dueDate: toISODate(currentDate) };
            }
            return task;
        }));
        addNotification(`Tarefa adiada por ${days} dia(s)`, '🗓️', 'info');
    }, [setTasks, addNotification]);

    // [CORREÇÃO] categoria era fixa em 'Personalizado' — agora vem de quem chama
    const handleCreateTemplate = useCallback((taskData: Partial<Omit<Task, 'id'>>, category: string = 'Personalizado') => {
        const newTemplate: TaskTemplate = {
            id: generateNumericId(),
            title: taskData.title || 'Nova Tarefa',
            description: taskData.description,
            quadrant: taskData.quadrant,
            pomodoroEstimate: taskData.pomodoroEstimate,
            customDuration: taskData.customDuration,
            energyNeeded: taskData.energyNeeded,
            category,
            subtasks: taskData.subtasks?.map(st => ({ text: st.text })),
            isDefault: false,
        };
        setTaskTemplates(prev => [...prev, newTemplate]);
        return newTemplate;
    }, [setTaskTemplates, generateNumericId]);

    const handleCreateTemplateFromTask = useCallback((task: Partial<Omit<Task, 'id' | 'status' | 'displayOrder'>>, category?: string) => {
        const newTemplate = handleCreateTemplate(task, category);
        addNotification(`Modelo "${newTemplate.title}" salvo em ${newTemplate.category}.`, '📚', 'success');
    }, [handleCreateTemplate, addNotification]);

    const handleDeleteTemplate = useCallback((templateId: number) => {
        if (taskTemplates.find(t => t.id === templateId)?.isDefault) {
            addNotification("Modelos padrão não podem ser excluídos.", '🛡️', 'error');
            return;
        }
        setTaskTemplates(prev => prev.filter(t => t.id !== templateId));
        addNotification("Modelo excluído com sucesso.", '🗑️', 'info');
    }, [taskTemplates, setTaskTemplates, addNotification]);

    const handleAddTemplates = useCallback((templates: TaskTemplate[]) => {
        // [CORREÇÃO] Antes toda tarefa de rotina ganhava dueDate=hoje automático,
        // mesmo quando a rotina não tem relação nenhuma com um dia específico —
        // isso inflava a Agenda de Hoje com tarefas que o usuário não agendou de
        // propósito. A tarefa continua caindo certinho no quadrante dela (Foco
        // Imediato, Agendar etc.) — só não reivindica "hoje" sozinha. Quem quiser
        // mesmo agendar pra hoje ainda pode, editando a tarefa normalmente.
        const newTasks: Omit<Task, 'id' | 'status' | 'displayOrder'>[] = templates.map(template => ({
            ...template,
            quadrant: template.quadrant || 'inbox',
            pomodoroEstimate: template.pomodoroEstimate ?? 1,
            subtasks: template.subtasks?.map((st, i) => ({ id: `sub-${Date.now()}-${i}`, text: st.text, completed: false })),
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

    const handleSaveRoutine = useCallback((routineToSave: Routine) => {
        setRoutines(prev => {
            const existingIndex = prev.findIndex(r => r.id === routineToSave.id);
            if (existingIndex > -1) {
                const newRoutines = [...prev];
                newRoutines[existingIndex] = routineToSave;
                addNotification(`Rotina '${routineToSave.name}' atualizada!`, '✏️', 'success');
                return newRoutines;
            } else {
                const newRoutine = { ...routineToSave, id: `routine-${Date.now()}`, isDefault: false, taskTemplateIds: routineToSave.taskTemplateIds || [] };
                addNotification(`Nova rotina '${newRoutine.name}' criada!`, '✨', 'success');
                return [...prev, newRoutine];
            }
        });
    }, [setRoutines, addNotification]);

    const handleDeleteRoutine = useCallback((routineId: string) => {
        if (routines.find(r => r.id === routineId)?.isDefault) {
            addNotification('Rotinas padrão não podem ser excluídas.', '🛡️', 'error');
            return;
        }
        setRoutines(prev => prev.filter(r => r.id !== routineId));
        addNotification('Rotina excluída com sucesso.', '🗑️', 'info');
    }, [routines, setRoutines, addNotification]);

    const handleToggleLeavingHomeItem = (itemId: string) => setLeavingHomeItems(prev => prev.map(item => item.id === itemId ? { ...item, completed: !item.completed } : item));
    const handleAddLeavingHomeItem = (text: string) => setLeavingHomeItems(prev => [...prev, { id: `item-${Date.now()}`, text, completed: false }]);
    const handleRemoveLeavingHomeItem = (itemId: string) => setLeavingHomeItems(prev => prev.filter(item => item.id !== itemId));
    const handleResetLeavingHomeItems = () => setLeavingHomeItems(prev => prev.map(item => ({ ...item, completed: false })));

    const startTriage = useCallback(() => {
        const inboxTasks = tasks.filter(t => t.quadrant === 'inbox');
        setTriageQueue(inboxTasks);
        if (inboxTasks.length === 0) {
            addNotification("Sua caixa de entrada está limpa!", '🎉', 'success');
        }
    }, [tasks, addNotification]);

    const endTriage = useCallback(() => setTriageQueue([]), []);

    const processTriage = useCallback((quadrant: Quadrant) => {
        if (triageQueue.length === 0) return;
        const taskToTriage = triageQueue[0];
        handleUpdateTaskQuadrant(taskToTriage.id, quadrant, tasks.filter(t => t.quadrant === quadrant).length);
        setTriageQueue(prev => prev.slice(1));
        if (triageQueue.length === 1) {
            addNotification("Triagem concluída!", '✅', 'success');
            endTriage();
        }
    }, [triageQueue, tasks, handleUpdateTaskQuadrant, endTriage, addNotification]);

    const ensureMarketingFrog = useCallback(() => {
        setTasks(prev => {
            const current = prev.find(t => t.id === FOCUS_FROG_MARKETING_TASK_ID);
            if (current && current.status !== 'done') return prev;
            const fresh = { ...focusFrogMarketingTask, subtasks: focusFrogMarketingTask.subtasks?.map(st => ({ ...st, completed: false })) };
            return [fresh, ...prev.filter(t => t.id !== FOCUS_FROG_MARKETING_TASK_ID)];
        });
        setFrogTaskId(FOCUS_FROG_MARKETING_TASK_ID);
    }, [setTasks, setFrogTaskId]);

    const needsMorningPlan = useMemo(() => {
        const today = todayISO();
        return !tasks.find(t => t.id === frogTaskId && t.dueDate === today);
    }, [tasks, frogTaskId]);

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
        ensureMarketingFrog,
        handleUnsetFrog,
        handleSaveTag,
        handleDeleteTag,
        handleDuplicateTask,
        handlePostponeTask,
        needsMorningPlan,
        handleCreateTemplateFromTask,
        handleCreateTemplate,
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
