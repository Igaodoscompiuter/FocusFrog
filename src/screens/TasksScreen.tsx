
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/modals/TaskModal';
import { TriageModal } from '../components/modals/TriageModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task, Quadrant, TaskFilters } from '../types';
import { quadrants as quadrantInfoConst } from '../constants';
import { FilterPanel } from '../components/tasks/FilterPanel';
import { TaskLibraryModal } from '../components/modals/TaskLibraryModal';
import styles from './TasksScreen.module.css';

// [REFINAMENTO] O componente agora usa classes dinâmicas para um layout horizontal perfeito.
const CollapsibleQuadrant: React.FC<any> = ({ title, quadrant, tasks, tags, onEdit, onStartTriage }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const visibleTasks = isExpanded ? tasks : tasks.slice(0, 2);
    const isHorizontal = quadrant === 'inbox' || quadrant === 'someday';
    const isInbox = quadrant === 'inbox';

    // Determina a classe CSS correta com base no estado expandido/recolhido
    const getTaskListClass = () => {
        if (!isHorizontal) return styles.taskList;
        return isExpanded ? styles.expandedHorizontalList : styles.collapsedHorizontalList;
    };

    return (
        <div className={`${styles.quadrantColumn} ${styles['quadrant-' + quadrant]}`}>
            <header className={styles.quadrantHeader}>
                <span>{title} ({tasks.length})</span>
                {isInbox && tasks.length > 0 && (
                    <button className="btn btn-secondary btn-sm" onClick={onStartTriage}>
                        <Icon path={icons.clipboardList} /> Organizar Caixa de Entrada
                    </button>
                )}
            </header>
            <div className={getTaskListClass()}>
                {visibleTasks.map((task: Task) => (
                    <TaskCard key={task.id} task={task} tags={tags} onEdit={onEdit} quadrant={quadrant} />
                ))}
            </div>
            {isHorizontal && tasks.length > 2 && (
                <button className={`btn btn-tertiary ${styles.inboxShowMore}`} onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Mostrar menos' : `Mostrar mais ${tasks.length - 2} tarefa(s)`}
                </button>
            )}
        </div>
    );
};

const QuadrantColumn: React.FC<any> = ({ title, quadrant, tasks, onEdit, tags }) => (
    <div className={`${styles.quadrantColumn} ${styles['quadrant-' + quadrant]}`}>
        <header className={styles.quadrantHeader}><span>{title} ({tasks.length})</span></header>
        <div className={styles.taskList}>
            {tasks.map((task: Task) => (
                <TaskCard key={task.id} task={task} tags={tags} onEdit={onEdit} quadrant={quadrant} />
            ))}
        </div>
    </div>
);

export const TasksScreen: React.FC = () => {
    const {
        tasks,
        tags,
        routines,
        handleAddRoutine,
        handleAddTemplates,
        isTriageActive,
        triageQueue,
        startTriage,
        endTriage,
        processTriage
    } = useTasks();
    
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [filters, setFilters] = useState<TaskFilters>({ tags: [], status: [], energy: [] });

    const filteredTasks = useMemo(() => tasks.filter(task => {
        if (task.status === 'done') return false;
        const tagMatch = filters.tags.length === 0 || (task.tagId && filters.tags.includes(task.tagId));
        const energyMatch = filters.energy.length === 0 || (task.energyNeeded && filters.energy.includes(task.energyNeeded));
        return tagMatch && energyMatch;
    }), [tasks, filters]);

    const tasksByQuadrant = useMemo(() => {
        const result: Record<string, Task[]> = { inbox: [], do: [], schedule: [], someday: [] };
        filteredTasks.forEach(task => {
            const quadrantId = task.quadrant as Quadrant;
            if (result[quadrantId]) {
                 result[quadrantId].push(task);
            } else {
                 result.inbox.push(task); // Fallback para inbox
            }
        });
        return result;
    }, [filteredTasks]);

    const handleOpenTaskModal = (task?: Partial<Task>) => setEditingTask(task || { quadrant: 'inbox' });
    const handleCloseTaskModal = () => setEditingTask(null);

    const quadrantsToRender = [
        { id: 'inbox', component: CollapsibleQuadrant, props: { onStartTriage: startTriage } },
        { id: 'do', component: QuadrantColumn, props: {} },
        { id: 'schedule', component: QuadrantColumn, props: {} },
        { id: 'someday', component: CollapsibleQuadrant, props: {} }
    ];

    return (
        <main>
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={handleCloseTaskModal} tags={tags} />}
            {isTriageActive && triageQueue.length > 0 && (
                <TriageModal 
                    task={triageQueue[0]} 
                    onClose={endTriage} 
                    onTriage={processTriage} 
                />
            )}
            {isLibraryOpen && <TaskLibraryModal routines={routines} onAddRoutine={handleAddRoutine} onAddTemplates={handleAddTemplates} onClose={() => setIsLibraryOpen(false)} />}
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} filters={filters} onFilterChange={setFilters} />

            <div className="screen-content">
                <div className={styles.tasksHeader}>
                    <div className={styles.tasksTitle}><h2>Matriz de Eisenhower</h2></div>
                    <div className={styles.tasksActions}>
                         <button className="btn btn-secondary btn-icon" onClick={() => setIsLibraryOpen(true)} title="Biblioteca"><Icon path={icons.bookOpen} /></button>
                        <button className="btn btn-secondary btn-icon" onClick={() => setIsFilterPanelOpen(true)} title="Filtros"><Icon path={icons.filter} /></button>
                        <button className="btn btn-primary" onClick={() => handleOpenTaskModal()}><Icon path={icons.plus} /> Nova Tarefa</button>
                    </div>
                </div>

                <div className={styles.tasksBoard}>
                    {quadrantsToRender.map(q => {
                        const CurrentQuadrantComponent = q.component;
                        const quadrantInfo = quadrantInfoConst.find(info => info.id === q.id);
                        if (!quadrantInfo) return null;

                        return (
                            <CurrentQuadrantComponent
                                key={q.id}
                                quadrant={q.id}
                                title={quadrantInfo.title}
                                tasks={tasksByQuadrant[q.id] || []}
                                tags={tags}
                                onEdit={handleOpenTaskModal}
                                {...q.props}
                            />
                        );
                    })}
                </div>
            </div>
        </main>
    );
};
