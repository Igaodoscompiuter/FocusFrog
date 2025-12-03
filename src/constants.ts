
import type { Quadrant, Routine, TaskTemplate } from './types';
import { icons } from './components/Icons';

export const quadrants: { id: Quadrant; title: string; subtitle: string; icon: keyof typeof icons; }[] = [
    { id: "do", title: "Foco Imediato", subtitle: "Fazer Agora", icon: 'zap' },
    { id: "schedule", title: "Tarefas do Dia", subtitle: "Durante o Dia", icon: 'listChecks' },
    { id: "delegate", title: "Ideias e Projetos", subtitle: "Planejamentos", icon: 'bookOpen' },
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
    // --- Rotina Noturna: Presente para o 'Eu do Futuro' ---
    { id: 10, title: "Esvaziar a mente", description: "Use a técnica de \'Brain Dump\'. Tire tudo da cabeça e ponha no app para reduzir a ansiedade.", category: "Pessoal", pomodoroEstimate: 1, energyNeeded: 'low', quadrant: 'schedule', timeOfDay: 'night', timerCompletionMode: 'completeTask' },
    { id: 11, title: "Separar a roupa de amanhã", description: "Elimine a fadiga de decisão da sua manhã seguinte.", category: "Pessoal", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0, timeOfDay: 'night' },
    { id: 12, title: "Preparar a mochila ou bolsa", description: "Verifique chaves, carteira, carregador. Deixe tudo pronto na porta.", category: "Pessoal", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0, timeOfDay: 'night' },
    { id: 13, title: "Manter o celular longe da cama", description: "Use um despertador analógico se possível. Evite o scroll antes de dormir.", category: "Saúde", energyNeeded: 'low', quadrant: 'schedule', pomodoroEstimate: 0, timeOfDay: 'night' },

    // --- Limpeza: Tarefas de Manutenção Diária ---
    { id: 20, title: "Calçar sapatos para ativar", description: "Truque psicológico poderoso: calçar sapatos sinaliza para o cérebro que é \'hora de agir\'.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 21, title: "Ligar uma playlist animada ou podcast", description: "O estímulo auditivo (Temptation Bundling) ajuda a tolerar tarefas tediantes e a manter o ritmo.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 22, title: "Corrida de Limpeza de 15 minutos", description: "Ative o modo turbo. O objetivo é progresso, não perfeição. Pare quando o tempo acabar. Vitória!", category: "Casa", pomodoroEstimate: 1, customDuration: 15, energyNeeded: 'medium', quadrant: 'do', timeOfDay: 'any', timerCompletionMode: 'completeTask' },
    { id: 23, title: "Caçar e recolher o lixo da casa", description: "Missão de caça ao tesouro: andar pela casa com uma sacola e capturar apenas o lixo visível.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 24, title: "Lavar louça até encher o escorredor", description: "Sua tarefa de manutenção diária. O objetivo não é zerar a pia, é apenas impedir que ela transborde. Isso já é uma vitória.", category: "Casa", energyNeeded: 'medium', quadrant: 'schedule', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 25, title: "Resetar uma superfície plana", description: "Missão de impacto visual: deixe UMA superfície (mesa, balcão) visivelmente limpa. A recompensa é imediata.", category: "Casa", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, customDuration: 10, timeOfDay: 'any' },
    { id: 26, title: "Varrer ou aspirar um cômodo", description: "Escolha UM cômodo e limpe apenas o caminho principal. O objetivo não é a perfeição, é um ambiente visivelmente melhor.", category: "Casa", energyNeeded: 'medium', quadrant: 'schedule', pomodoroEstimate: 0, customDuration: 10, timeOfDay: 'any' },
    
    // --- Limpeza: Missões de Faxina Pesada ---
    { 
        id: 28, 
        title: "Executar o ciclo completo da louça", 
        description: "ESTRATÉGIA: Transforme a montanha de louça em um processo organizado. Organizar antes de lavar reduz a sobrecarga mental e torna a tarefa muito mais fácil de encarar.", 
        category: "Casa", 
        energyNeeded: 'high', 
        quadrant: 'schedule', 
        pomodoroEstimate: 1,
        timeOfDay: 'any',
        timerCompletionMode: 'completeTask',
        subtasks: [
            { text: "Ação Rápida: Organizar a louça por tipo", isTimerTrigger: false },
            { text: "Ação Rápida: Lavar pratos e copos", isTimerTrigger: false },
            { text: "Ação Rápida: Lavar talheres, potes e panelas", isTimerTrigger: false },
            { text: "Iniciar Pomodoro: Secar e guardar toda a louça", isTimerTrigger: true }
        ]
    },
    { 
        id: 29, 
        title: "Executar o Ciclo Completo da Lavanderia", 
        description: "ESTRATÉGIA: Esta missão te guia até a roupa guardada. As primeiras etapas são rápidas. Use seu Pomodoro na etapa final (dobrar e guardar) para vencer a procrastinação e finalizar o ciclo.", 
        category: "Casa", 
        energyNeeded: 'high', 
        quadrant: 'schedule', 
        pomodoroEstimate: 1,
        timeOfDay: 'any',
        timerCompletionMode: 'completeTask',
        subtasks: [
            { text: "Ação Rápida: Juntar e separar a roupa suja.", isTimerTrigger: false },
            { text: "Ação Rápida: Iniciar o ciclo de lavagem na máquina.", isTimerTrigger: false },
            { text: "Ação Rápida: Transferir para secadora ou varal.", isTimerTrigger: false },
            { text: "Iniciar Pomodoro: Dobrar e guardar a roupa limpa.", isTimerTrigger: true }
        ]
    },

    // --- Rotina de Estudos: Ritual de Hiperfoco ---
    { id: 30, title: "Limpar e preparar a mesa de estudos", description: "Tire tudo da mesa que não pertence à matéria atual. Reduz o ruído visual e facilita a concentração.", category: "Estudos", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 31, title: "Ativar modo avião ou bloqueador de apps", description: "A força de vontade é um recurso limitado. Não confie nela, use a tecnologia a seu favor.", category: "Estudos", energyNeeded: 'low', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 32, title: "Definir uma micro-meta de estudo", description: "Quebre a tarefa até ficar ridícula de tão fácil. Ex: \'Ler 3 páginas\' ou \'Resolver 1 exercício\'.", category: "Estudos", energyNeeded: 'medium', quadrant: 'do', pomodoroEstimate: 0, timeOfDay: 'any' },
    { id: 33, title: "Iniciar sessão Pomodoro de 25 minutos", description: "Mergulhe na tarefa com foco total. Apenas por 25 minutos. Você consegue.", category: "Estudos", pomodoroEstimate: 1, energyNeeded: 'high', quadrant: 'do', timeOfDay: 'any', timerCompletionMode: 'completeTask' },
    { id: 34, title: "Explicar o estudo em voz alta", description: "Use a Técnica Feynman: ao final da sessão, explique o que aprendeu para a parede. Isso revela lacunas no seu conhecimento.", category: "Estudos", pomodoroEstimate: 0, energyNeeded: 'medium', quadrant: 'schedule', timeOfDay: 'any' },
    
    // --- Rotina Matinal: Manhã de Dopamina (Otimizada) ---
    { 
        id: 40, 
        title: "Ritual de Ativação Física", 
        description: "Os primeiros 10 minutos do seu dia para \'ligar\' o cérebro sem usar o celular.", 
        category: "Saúde", 
        energyNeeded: 'low', 
        quadrant: 'do', 
        pomodoroEstimate: 0, 
        timeOfDay: 'morning',
        subtasks: [
            { text: "Beber um copo grande de água" },
            { text: "Olhar a luz do dia na janela por 5 min" },
            { text: "Fazer 5 min de alongamento ou polichinelos" },
        ]
    },
    { 
        id: 41, 
        title: "Arrumar a cama", 
        description: "Vitória Visual Imediata: uma tarefa de 60 segundos que organiza seu quarto e te dá a primeira sensação de dever cumprido.", 
        category: "Casa", 
        energyNeeded: 'low', 
        quadrant: 'do', 
        pomodoroEstimate: 0, 
        timeOfDay: 'morning'
    },
    { 
        id: 42, 
        title: "Café da Manhã de Foco", 
        description: "Abasteça seu cérebro com os ingredientes certos para um foco mais estável.", 
        category: "Saúde", 
        energyNeeded: 'medium', 
        quadrant: 'do', 
        pomodoroEstimate: 0, 
        timeOfDay: 'morning',
        subtasks: [
            { text: "Ingerir fonte de proteína (ovo, iogurte, etc)" },
            { text: "Tomar medicação/suplementos" }
        ]
    },
    { 
        id: 43, 
        title: "Definir a Missão do Dia", 
        description: "Tire o caos da sua cabeça e defina UMA prioridade clara (O Sapo). Este é o segredo para um dia produtivo.", 
        category: "Pessoal", 
        energyNeeded: 'medium', 
        quadrant: 'do', 
        pomodoroEstimate: 1, 
        timeOfDay: 'morning',
        timerCompletionMode: 'completeTask',
        subtasks: [
            { text: "Ação Rápida: Esvaziar a mente e listar pensamentos", isTimerTrigger: false },
            { text: "Ação Rápida: Revisar a agenda de hoje", isTimerTrigger: false },
            { text: "Iniciar Pomodoro: Escolher e marcar UMA tarefa como o \"Sapo do Dia\" 🐸", isTimerTrigger: true }
        ]
    }
];

export const initialRoutines: Routine[] = [
    {
        id: 'routine-morning',
        name: 'Manhã de Dopamina',
        description: 'ESTRATÉGIA: Ative o cérebro com sinais físicos (luz, água, movimento) e crie um plano claro para o dia. Isso gera impulso e direciona seu foco para o que realmente importa.',
        icon: 'sun',
        taskTemplateIds: [40, 41, 42, 43],
    },
    {
        id: 'routine-daily-reset',
        name: 'Reset Diário',
        description: 'ESTRATÉGIA: Evite que o caos se acumule com um reset rápido. Use estas tarefas de manutenção diária para manter o controle com o mínimo de esforço.',
        icon: 'sparkles',
        taskTemplateIds: [20, 21, 22, 23, 24, 25, 26],
    },
    {
        id: 'routine-cleaning-day',
        name: 'Dia de Faxina',
        description: 'ESTRATÉGIA: Um cardápio de missões para a limpeza pesada. Escolha 1 ou 2 tarefas desta lista para formar sua missão do dia. O objetivo não é fazer tudo, é fazer o suficiente.',
        icon: 'trash',
        taskTemplateIds: [28, 29],
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
        description: 'ESTRATÉGIA: Facilite a vida do seu \'Eu do Futuro\'. Reduza a ansiedade de decisão da manhã seguinte.',
        icon: 'moon',
        taskTemplateIds: [10, 11, 12, 13],
    },
];
