
import type { Quadrant, Routine, TaskTemplate } from './types';
import { icons } from './components/Icons';

export const quadrants: { id: Quadrant; title: string; subtitle: string; icon: keyof typeof icons; }[] = [
    { id: "do", title: "Urgente & Importante", subtitle: "Faça Agora", icon: 'alertTriangle' },
    { id: "schedule", title: "Importante & Não Urgente", subtitle: "Agende", icon: 'target' },
    { id: "delegate", title: "Urgente & Não Importante", subtitle: "Delegue", icon: 'clock' },
    { id: "eliminate", title: "Não Urgente & Não Importante", subtitle: "Elimine", icon: 'circle' },
];

export const defaultCategories = [
    'Trabalho',
    'Pessoal',
    'Casa',
    'Estudos',
    'Saúde'
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

export const initialTaskTemplates: TaskTemplate[] = [
    // --- Rotina Matinal: Ativação Sensorial ---
    { id: 1, title: "Beber 500ml de água", description: "Hidratação imediata ajuda a 'ligar' o córtex pré-frontal.", category: "Saúde", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 2, title: "Ingerir Proteína", description: "Proteína no café da manhã ajuda na produção sustentada de dopamina.", category: "Saúde", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 3, title: "Tomar medicação/suplementos", description: "Antes que você esqueça ou se distraia.", category: "Saúde", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 4, title: "Exposição à Luz (Janela/Sol)", description: "5 min de luz natural para regular o ciclo circadiano.", category: "Saúde", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0 },
    { id: 5, title: "Arrumar a cama (Vitória Visual)", description: "Organização externa cria sensação de organização interna.", category: "Casa", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0 },

    // --- Rotina Noturna: Presente para o 'Eu do Futuro' ---
    { id: 10, title: "Brain Dump (Esvaziar a mente)", description: "Tire tudo da cabeça e ponha no app. Reduz ansiedade.", category: "Pessoal", pomodoroEstimate: 1, energyNeeded: 'low', quadrant: 'schedule' },
    { id: 11, title: "Separar a roupa de amanhã", description: "Elimine a fadiga de decisão da sua manhã seguinte.", category: "Pessoal", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0 },
    { id: 12, title: "Preparar a mochila/bolsa", description: "Chaves, carteira, carregador. Deixe na porta.", category: "Pessoal", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0 },
    { id: 13, title: "Celular longe da cama", description: "Use um despertador analógico se possível. Evite scroll.", category: "Saúde", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0 },

    // --- Rotina de Limpeza: Gamificação e Redução de Danos ---
    { id: 20, title: "Calçar Sapatos", description: "Truque psicológico: sapatos mandam o sinal de 'hora de trabalhar'.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 21, title: "Playlist Animada / Podcast", description: "Estímulo auditivo ajuda a tolerar tarefas tediantes.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 22, title: "Timer da Corrida (15 min)", description: "Limpe o máximo que der em 15 min. Parou, acabou.", category: "Casa", pomodoroEstimate: 1, customDuration: 15, energyNeeded: 'medium', quadrant: 'do' },
    { id: 23, title: "Missão: Apenas o Lixo", description: "Ande pela casa com uma sacola grande. Recolha apenas lixo.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 24, title: "Louça: Só o que cabe no escorredor", description: "Não tente lavar tudo. Lave até encher o escorredor.", category: "Casa", energyNeeded: 'medium', quadrant: 'schedule', pomodoroEstimate: 0 },

    // --- Rotina de Estudos: Ritual de Hiperfoco ---
    { id: 30, title: "Reset do Ambiente (Mesa Limpa)", description: "Tire tudo da mesa que não é da matéria atual. Reduz ruído visual.", category: "Estudos", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 31, title: "Modo Avião / Bloqueador de Apps", description: "A força de vontade falha, o bloqueador não.", category: "Estudos", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 32, title: "Definir a 'Micro-Meta'", description: "Ex: 'Ler 3 páginas' em vez de 'Estudar História'.", category: "Estudos", energyNeeded: 'medium', quadrant: 'do', pomodoroEstimate: 0 },
    { id: 33, title: "Pomodoro 25min: Foco Total", description: "Começe. Apenas 25 minutos.", category: "Estudos", pomodoroEstimate: 1, energyNeeded: 'high', quadrant: 'do' },
    { id: 34, title: "Explicar em voz alta (Feynman)", description: "Ao final, explique o conteúdo para uma parede ou pato de borracha.", category: "Estudos", pomodoroEstimate: 0, energyNeeded: 'medium', quadrant: 'schedule' },
];

export const initialRoutines: Routine[] = [
    {
        id: 'routine-morning',
        name: 'Manhã de Dopamina',
        description: 'ESTRATÉGIA: Ativação sensorial (luz, água, proteína) e vitórias rápidas para gerar impulso sem gastar força de vontade.',
        icon: 'sun',
        taskTemplateIds: [1, 2, 3, 4, 5],
    },
    {
        id: 'routine-cleaning',
        name: 'Faxina Gamificada',
        description: 'ESTRATÉGIA: Transforme o caos em jogo. Foco em velocidade, estímulo auditivo e "redução de danos visuais", não em perfeição.',
        icon: 'sparkles',
        taskTemplateIds: [20, 21, 22, 23, 24],
    },
    {
        id: 'routine-study',
        name: 'Ritual de Hiperfoco',
        description: 'ESTRATÉGIA: Elimine distrações antes de começar e quebre a tarefa até ela parecer ridícula de tão fácil.',
        icon: 'bookOpen',
        taskTemplateIds: [30, 31, 32, 33, 34],
    },
    {
        id: 'routine-shutdown',
        name: 'Desligamento Noturno',
        description: 'ESTRATÉGIA: Facilite a vida do seu "Eu do Futuro". Reduza a ansiedade de decisão da manhã seguinte.',
        icon: 'moon',
        taskTemplateIds: [10, 11, 12, 13],
    },
];
