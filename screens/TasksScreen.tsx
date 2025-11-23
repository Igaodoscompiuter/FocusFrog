
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TasksContext';
import { useUI } from '../context/UIContext';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/modals/TaskModal';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import type { Task, Quadrant, TaskFilters } from '../types';
import { quadrants } from '../constants';
import { FilterPanel } from '../components/tasks/FilterPanel';
import { TaskLibraryModal } from '../components/modals/TaskLibraryModal';

const QuadrantColumn: React.FC<{
  quadrant: Quadrant;
  tasks: Task[];
  onEdit: (task: Partial<Task>) => void;
  onSubtaskClick: (taskId: string, subtaskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  draggingTask: Task | null;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, quadrant: Quadrant, displayOrder: number) => void;
  isMaximized: boolean;
  onToggleMaximize: () => void;
}> = ({ quadrant, tasks, onEdit, onSubtaskClick, onToggleSubtask, draggingTask, onDragStart, onDragEnd, onDrop, isMaximized, onToggleMaximize }) => {
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);
  const [dropIndicatorIndex, setDropIndicatorIndex] = useState<number | null>(null);

  const quadrantInfo = quadrants.find(q => q.id === quadrant) || { title: 'Caixa de Entrada', subtitle: 'Para Organizar', icon: 'listChecks' as keyof typeof icons };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDropIndicatorIndex(index);
    setIsColumnDragOver(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    onDrop(e, quadrant, index);
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  };
  
  const handleColumnDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(e, quadrant, tasks.length);
    setDropIndicatorIndex(null);
    setIsColumnDragOver(false);
  }

  return (
    <div
      className={`quadrant-column quadrant-${quadrant} ${isMaximized ? 'maximized' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsColumnDragOver(true); }}
      onDragLeave={handleDragLeave}
      onDrop={handleColumnDrop}
    >
      <div className="quadrant-header">
        <div style={{display: 'flex', alignItems: 'center', gap: '0.75rem'}}>
            <Icon path={icons[quadrantInfo.icon]} />
            <div>
            <h4>{quadrantInfo.title}</h4>
            <p>{quadrantInfo.subtitle}</p>
            </div>
        </div>
        <button onClick={onToggleMaximize} className="icon-button" title={isMaximized ? "Restaurar" : "Focar Quadrante"}>
            <Icon path={isMaximized ? "M4 14h6v6h-6v-6zM14 4h6v6h-6v-6z" : "M3 3h18v18H3V3z"} style={{ width: 18, height: 18 }} />
        </button>
      </div>
      <div className={`task-list ${isColumnDragOver && tasks.length === 0 ? 'drag-over' : ''}`}>
        {tasks.map((task, index) => (
          <div
            key={task.id}
            className="drop-zone"
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <div className={`drop-indicator ${dropIndicatorIndex === index ? 'visible' : ''}`}></div>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onSubtaskClick={onSubtaskClick}
              onToggleSubtask={onToggleSubtask}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDragging={draggingTask?.id === task.id}
            />
          </div>
        ))}
        <div 
          className="drop-zone"
          style={{ height: tasks.length > 0 ? '1rem' : '100%' }}
          onDragOver={(e) => handleDragOver(e, tasks.length)}
          onDrop={(e) => handleDrop(e, tasks.length)}
        >
          <div className={`drop-indicator ${dropIndicatorIndex === tasks.length ? 'visible' : ''}`} style={{top: '4px'}}></div>
        </div>
        
        {tasks.length === 0 && (
           <div className="empty-quadrant-dropzone" onDrop={handleColumnDrop}>
            <p>Vazio! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};


export const TasksScreen: React.FC = () => {
    const { tasks, handleUpdateTaskQuadrant, handleToggleSubtask, routines, handleAddRoutine, handleAddTemplates } = useTasks();
    const [editingTask, setEditingTask] = useState<Partial<Task> | null>(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [filters, setFilters] = useState<TaskFilters>({ tags: [], status: [], energy: [] });
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [maximizedQuadrant, setMaximizedQuadrant] = useState<Quadrant | null>(null);

    const filteredTasks = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return tasks.filter(task => {
            if (task.status === 'done') return false;

            const tagMatch = filters.tags.length === 0 || (task.tagId && filters.tags.includes(task.tagId));
            const energyMatch = filters.energy.length === 0 || (task.energyNeeded && filters.energy.includes(task.energyNeeded));
            
            const statusMatch = filters.status.length === 0 || filters.status.some(s => {
                if (s === 'overdue') {
                    return task.dueDate && new Date(task.dueDate + 'T00:00:00') < today;
                }
                return false;
            });

            return tagMatch && energyMatch && statusMatch;
        });
    }, [tasks, filters]);


    const tasksByQuadrant = useMemo(() => {
        const result: Record<Quadrant, Task[]> = { inbox: [], do: [], schedule: [], delegate: [], eliminate: [] };
        filteredTasks.forEach(task => {
            if (result[task.quadrant]) {
                result[task.quadrant].push(task);
            } else {
                result.inbox.push(task);
            }
        });
        for (const key in result) {
            result[key as Quadrant].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
        }
        return result;
    }, [filteredTasks]);

    const handleOpenTaskModal = (task?: Partial<Task>) => setEditingTask(task || {});
    const handleCloseTaskModal = () => setEditingTask(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
        setDraggingTask(task);
    };

    const handleDragEnd = () => {
        setDraggingTask(null);
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newQuadrant: Quadrant, newIndex: number) => {
        const taskId = e.dataTransfer.getData('taskId');
        if (taskId) {
            handleUpdateTaskQuadrant(taskId, newQuadrant, newIndex);
        }
    };
    
    return (
        <main className="tasks-screen">
            {editingTask && <TaskModal taskToEdit={editingTask} onClose={handleCloseTaskModal} />}
            {isLibraryOpen && (
                <TaskLibraryModal 
                    routines={routines}
                    onAddRoutine={handleAddRoutine}
                    onAddTemplates={handleAddTemplates}
                    onClose={() => setIsLibraryOpen(false)}
                />
            )}
            <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} filters={filters} onFilterChange={setFilters} />

            <div className="tasks-header">
                <div className="tasks-title">
                    <h2>Matriz de Prioridades</h2>
                </div>
                <div className="tasks-actions">
                     {maximizedQuadrant && (
                        <button className="control-button tertiary" onClick={() => setMaximizedQuadrant(null)}>
                            Restaurar Visão
                        </button>
                    )}
                    <button className="control-button secondary icon-only" onClick={() => setIsLibraryOpen(true)} title="Biblioteca">
                        <Icon path={icons.bookOpen} />
                    </button>
                    <button className="control-button secondary icon-only" onClick={() => setIsFilterPanelOpen(true)} title="Filtros">
                        <Icon path={icons.filter} />
                    </button>
                    <button className="control-button" onClick={() => handleOpenTaskModal({isDetailed: true})}>
                        <Icon path={icons.plus} /> Nova
                    </button>
                </div>
            </div>

            <div className={`tasks-board ${maximizedQuadrant ? 'has-maximized' : ''}`}>
                {/* Inbox - Always visible unless a matrix quadrant is maximized */}
                {(!maximizedQuadrant || maximizedQuadrant === 'inbox') && (
                    <QuadrantColumn
                        quadrant="inbox"
                        tasks={tasksByQuadrant.inbox}
                        onEdit={handleOpenTaskModal}
                        onSubtaskClick={() => {}}
                        onToggleSubtask={handleToggleSubtask}
                        draggingTask={draggingTask}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDrop={handleDrop}
                        isMaximized={maximizedQuadrant === 'inbox'}
                        onToggleMaximize={() => setMaximizedQuadrant(maximizedQuadrant === 'inbox' ? null : 'inbox')}
                    />
                )}
                
                <div className="eisenhower-matrix" style={{ display: maximizedQuadrant === 'inbox' ? 'none' : 'grid' }}>
                    {quadrants.filter(q => q.id !== 'inbox').map(q => {
                        const isHidden = maximizedQuadrant && maximizedQuadrant !== q.id;
                        if (isHidden) return null;

                        return (
                            <QuadrantColumn
                                key={q.id}
                                quadrant={q.id as Quadrant}
                                tasks={tasksByQuadrant[q.id as Quadrant]}
                                onEdit={handleOpenTaskModal}
                                onSubtaskClick={() => {}}
                                onToggleSubtask={handleToggleSubtask}
                                draggingTask={draggingTask}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                onDrop={handleDrop}
                                isMaximized={maximizedQuadrant === q.id}
                                onToggleMaximize={() => setMaximizedQuadrant(maximizedQuadrant === q.id ? null : q.id as Quadrant)}
                            />
                        );
                    })}
                </div>
            </div>
        </main>
    );
};
