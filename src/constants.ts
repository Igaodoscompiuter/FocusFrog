
import type { Quadrant, Tag, Task } from './types';
import { icons } from './components/Icons';

export const quadrants: { id: Quadrant; title: string; subtitle: string; icon: keyof typeof icons; }[] = [
    { id: "inbox", title: "Caixa de Entrada", subtitle: "Para organizar", icon: 'inbox' },
    { id: "do", title: "Foco Imediato", subtitle: "Urgente & Importante", icon: 'zap' },
    { id: "schedule", title: "Planejar", subtitle: "Importante, não urgente", icon: 'calendar' },
    { id: "someday", title: "Ideias & Projetos", subtitle: "Não urgente & não importante", icon: 'bookOpen' },
];

export const defaultTags: Tag[] = [
    { id: 1, name: 'FocusFrog🐸', color: '#5c8b57' },
    { id: 2, name: 'Pessoal', color: '#3B82F6' },
    { id: 3, name: 'Trabalho', color: '#4B5563' },
    { id: 4, name: 'Estudos', color: '#F97316' },
    { id: 5, name: 'Casa', color: '#14B8A6' },
    { id: 6, name: 'Saúde', color: '#EC4899' },
    { id: 8, name: 'Teste', color: '#e53e3e' } // Categoria de Teste
];

export const defaultCategories = [
    'Trabalho',
    'Pessoal',
    'Casa',
    'Estudos',
    'Saúde',
    'Teste'
];

export const routineIcons: (keyof typeof icons)[] = [
    'sun',
    'moon',
    'zap',
    'briefcase',
    'home',
    'bookOpen',
    'coffee',
    'award',
    'target',
    'listChecks',
    'pawPrint',
    'rocket',
    'trash',
    'sparkles'
];

export { initialTaskTemplates } from './data/taskTemplates';
export { initialRoutines } from './data/routines';

// ---------------------------------------------------------------
// Card especial FocusFrog — estratégia de marketing: na primeira instalação,
// já nasce como uma tarefa de verdade (não só disponível na Biblioteca) e
// definido como o Sapo do Dia por padrão, pra todo usuário novo já ver essa
// tela logo de cara.
// ---------------------------------------------------------------
export const FOCUS_FROG_MARKETING_TASK_ID = 'focusfrog-marketing-card-v1';
/** Modelo da Biblioteca que gera o mesmo card (versões antigas criavam por ele). */
export const FOCUS_FROG_MARKETING_TEMPLATE_ID = 50;
/** É o Card Especial? (o criado pelo tutorial ou um antigo, criado pelo modelo) */
export const isSpecialFrogTask = (t?: { id: string; templateId?: number } | null) =>
    !!t && (t.id === FOCUS_FROG_MARKETING_TASK_ID || t.templateId === FOCUS_FROG_MARKETING_TEMPLATE_ID);

export const focusFrogMarketingTask: Task = {
    id: FOCUS_FROG_MARKETING_TASK_ID,
    title: "🐸 Card Especial FocusFrog N.1",
    quadrant: 'do',
    status: 'todo',
    displayOrder: 0,
    description: "O FocusFrog é a sua arquitetura mental, transformando o caos TDAH em rotinas visuais e gerenciáveis. Ele ativa a Dopamina de micro-recompensa para te dar foco e paz",
    pomodoroEstimate: 0,
    subtasks: [
        { id: 'ffm-1', text: "Siga nossa página ➕🐸", completed: false },
        { id: 'ffm-2', text: "Acesse o link da bio pelo navegador 🔗🐸", completed: false },
        { id: 'ffm-3', text: "Baixe o FocusFrog no seu celular 🐸💖", completed: false },
        { id: 'ffm-4', text: "Crie rotinas e marque @focus.frog 💬🐸", completed: false },
        { id: 'ffm-5', text: "Inspire outras pessoas com suas rotinas e estratégias próprias 🐸📅 ", completed: false },
    ],
};
