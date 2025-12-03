
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/modals/TaskModal';
import { TriageModal } from '../components/modals/TriageModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task, Quadrant, TaskFilters } from '../types';
import { quadrants } from '../constants';
import { FilterPanel } from '../components/tasks/FilterPanel';
import { TaskLibraryModal } from '../components/modals/TaskLibraryModal';
import styles from './TasksScreen.module.css';

const QuadrantColumn: React.FC<any> = ({ quadrant, tasks, onEdit, onTriage, tags }) => {
  
  return (
    <div
      className={`card ${styles.quadrantColumn} ${styles['quadrant-' + quadrant]}`}>
      <div className={styles.quadrantHeader}>
        {quadrants.find(q => q.id === quadrant)?.title}
      </div>
      <div className={styles.taskList}>
        {tasks.map((task: Task) => (
          <TaskCard
              key={task.id}
              task={task}
              tags={tags}
              onEdit={onEdit}
              onTriage={onTriage} // Passando a nova prop
              quadrant={quadrant} // Passando o quadrante
          />
        ))}
      </div>
    </div>
  );
};


export const TasksScreen: React.FC = () => {
    const { 
        tasks, 
        tags, 
        handleUpdateTaskQuadrant, 
        routines, 
        handleAddRoutine, 
        handleAddTemplates 
    } = useTasks();
    
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [triagingTask, setTriagingTask] = useState<Task | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [filters, setFilters] = useState<TaskFilters>({ tags: [], status: [], energy: [] });

     const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            if (task.status === 'done') return false;

            const tagMatch = filters.tags.length === 0 || (task.tagId && filters.tags.includes(task.tagId));
            const energyMatch = filters.energy.length === 0 || (task.energyNeeded && filters.energy.includes(task.energyNeeded));

            return tagMatch && energyMatch;
        });
    }, [tasks, filters]);


    const tasksByQuadrant = useMemo(() => {
        const result: Record<Quadrant, Task[]> = { inbox: [], do: [], schedule: [], delegate: [] };
        filteredTasks.forEach(task => {
            if (result[task.quadrant]) {
                result[task.quadrant].push(task);
            } else {
                result.inbox.push(task);
            }
        });
        return result;
    }, [filteredTasks]);

    const handleOpenTaskModal = (task?: Partial<Task>) => {
        setEditingTask(task || { quadrant: 'inbox' });
    };
    
    // Nova função para o TriageModal
    const handleTriage = (task: Task) => {
        setTriagingTask(task);
    };

    const handleCloseTaskModal = () => setEditingTask(null);
    const handleCloseTriageModal = () => setTriagingTask(null);

    return (
        <main>
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={handleCloseTaskModal} tags={tags} />}
            {triagingTask && <TriageModal task={triagingTask} onClose={handleCloseTriageModal} />}

            {isLibraryOpen && <TaskLibraryModal routines={routines} onAddRoutine={handleAddRoutine} onAddTemplates={handleAddTemplates} onClose={() => setIsLibraryOpen(false)} />}
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} filters={filters} onFilterChange={setFilters} />

            <div className="screen-content">
                <div className={styles.tasksHeader}>
                    <div className={styles.tasksTitle}>
                        <h2>Matriz de Eisenhower</h2>
                    </div>
                    <div className={styles.tasksActions}>
                        <button className="btn btn-secondary btn-icon" onClick={() => setIsLibraryOpen(true)} title="Biblioteca">
                            <Icon path={icons.bookOpen} />
                        </button>
                        <button className="btn btn-secondary btn-icon" onClick={() => setIsFilterPanelOpen(true)} title="Filtros">
                            <Icon path={icons.filter} />
                        </button>
                        <button className="btn btn-primary" onClick={() => handleOpenTaskModal()}>
                            <Icon path={icons.plus} /> Nova Tarefa
                        </button>
                    </div>
                </div>

                <div className={styles.tasksBoard}>
                     <QuadrantColumn
                        quadrant="inbox"
                        tasks={tasksByQuadrant.inbox}
                        tags={tags}
                        onEdit={handleOpenTaskModal}
                        onTriage={handleTriage} // Conectando a função
                    />
                    {['do', 'schedule', 'delegate'].map(q => (
                        <QuadrantColumn
                            key={q}
                            quadrant={q as Quadrant}
                            tasks={tasksByQuadrant[q as Quadrant] || []}
                            tags={tags}
                            onEdit={handleOpenTaskModal}
                            onTriage={handleTriage} // Conectando a função
                        />
                    ))}
                </div>
            </div>
        </main>
    );
};
