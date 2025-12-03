import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

// [CORREÇÃO] Adicionado 'someday' para o quadrante de Ideias & Projetos
export type Quadrant = 'inbox' | 'do' | 'schedule' | 'delegate' | 'someday';

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
  tagId?: number;
  subtasks?: Subtask[];
  energyNeeded?: number;
  customDuration?: number; 
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
}

export interface TaskTemplate {
  id: number;
  title: string;
  category: string;
  description?: string;
  quadrant?: Quadrant;
  pomodoroEstimate?: number;
  energyNeeded?: number;
  customDuration?: number;
  subtasks?: { text: string }[];
}

export interface Routine {
  id: number;
  name: string;
  icon: string | IconDefinition;
  description: string;
  taskTemplateIds: number[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  isDefault?: boolean;
}
