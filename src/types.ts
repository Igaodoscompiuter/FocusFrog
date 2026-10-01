
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export type Quadrant = 'inbox' | 'do' | 'schedule' | 'delegate' | 'someday';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type TimeOfDay = 'morning' | 'afternoon' | 'night';

/** As telas navegáveis pela BottomNav (mapeadas em AppLayout/BottomNav). */
export type Screen = 'dashboard' | 'tasks' | 'focus' | 'stats' | 'rewards' | 'moodboard';

/** Notificação toast exibida pelo UIContext (NotificationContainer). */
export interface Notification {
  id: number;
  message: string;
  icon: string;
  action?: { label: string; onAction: () => void };
}

/** Filtros aplicáveis na TasksScreen (FilterPanel). */
export interface TaskFilters {
  tags: number[];
  status: ('frog')[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'done' | 'doing';
  quadrant: Quadrant;
  displayOrder: number;
  pomodoroEstimate?: number;
  pomodorosDone?: number;
  dueDate?: string;
  completedAt?: string;
  tagId?: number;
  subtasks?: Subtask[];
  energyNeeded?: EnergyLevel;
  timeOfDay?: TimeOfDay;
  customDuration?: number;
  templateId?: number;
}

export interface Subtask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Tag {
  id: number;
  name: string;
  color: string;
  isDefault?: boolean;
}

export interface TaskTemplate {
  id: number;
  title: string;
  category: string;
  description?: string;
  quadrant?: Quadrant;
  pomodoroEstimate?: number;
  energyNeeded?: EnergyLevel;
  timeOfDay?: TimeOfDay;
  customDuration?: number;
  subtasks?: { text: string }[];
  isDefault?: boolean;
}

export interface Routine {
  id: string; 
  name: string;
  icon: string | IconDefinition;
  description: string;
  taskTemplateIds: number[];
  isDefault?: boolean; 
  /** Horário (HH:MM, 24h) em que uma notificação diária convida a iniciar esta rotina. */
  scheduledTime?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isDefault?: boolean;
}
