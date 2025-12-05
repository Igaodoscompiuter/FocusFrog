
import type { Quadrant, Routine, TaskTemplate } from './types';
import { icons } from './components/Icons';

export const quadrants: { id: Quadrant; title: string; subtitle: string; icon: keyof typeof icons; }[] = [
    { id: "inbox", title: "Caixa de Entrada", subtitle: "Para organizar", icon: 'inbox' },
    { id: "do", title: "Foco Imediato", subtitle: "Urgente & Importante", icon: 'zap' },
    { id: "schedule", title: "Tarefas do Dia", subtitle: "Importante, não urgente", icon: 'calendar' },
    { id: "someday", title: "Ideias & Projetos", subtitle: "Não urgente & não importante", icon: 'bookOpen' },
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

// Quadrants e tipo de tarefa (pomodoroEstimate: 0) revisados para a rotina de Desligamento Noturno
export const initialTaskTemplates: TaskTemplate[] = [
    { id: 10, title: "Esvaziar a mente", quadrant: 'do', description: "Use a técnica de \'Brain Dump\'. Tire tudo da cabeça e ponha no app para reduzir a ansiedade.", category: "Pessoal", pomodoroEstimate: 0, isDefault: true },
    { id: 11, title: "Separar a roupa de amanhã", quadrant: 'do', description: "Elimine a fadiga de decisão da sua manhã seguinte.", category: "Pessoal", pomodoroEstimate: 0, isDefault: true },
    { id: 12, title: "Preparar a mochila ou bolsa", quadrant: 'do', description: "Verifique chaves, carteira, carregador. Deixe tudo pronto na porta.", category: "Pessoal", pomodoroEstimate: 0, isDefault: true },
    { id: 13, title: "Manter o celular longe da cama", quadrant: 'do', description: "Use um despertador analógico se possível. Evite o scroll antes de dormir.", category: "Saúde", pomodoroEstimate: 0, isDefault: true },
    { id: 20, title: "Calçar sapatos para ativar", quadrant: 'do', description: "Truque psicológico poderoso: calçar sapatos sinaliza para o cérebro que é 'hora de agir'.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 21, title: "Ligar uma playlist animada ou podcast", quadrant: 'do', description: "O estímulo auditivo (Temptation Bundling) ajuda a tolerar tarefas tediantes e a manter o ritmo.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 22, title: "Corrida de Limpeza de 15 minutos", quadrant: 'schedule', description: "Ative o modo turbo. O objetivo é progresso, não perfeição. Pare quando o tempo acabar. Vitória!", category: "Casa", pomodoroEstimate: 1, customDuration: 15, isDefault: true },
    { id: 23, title: "Caçar e recolher o lixo da casa", quadrant: 'do', description: "Missão de caça ao tesouro: andar pela casa com uma sacola e capturar apenas o lixo visível.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 24, title: "Lavar louça até encher o escorredor", quadrant: 'schedule', description: "Sua tarefa de manutenção diária. O objetivo não é zerar a pia, é apenas impedir que ela transborde. Isso já é uma vitória.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 25, title: "Resetar uma superfície plana", quadrant: 'do', description: "Missão de impacto visual: deixe UMA superfície (mesa, balcão) visivelmente limpa. A recompensa é imediata.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 26, title: "Varrer ou aspirar um cômodo", quadrant: 'schedule', description: "Escolha UM cômodo e limpe apenas o caminho principal. O objetivo não é a perfeição, é um ambiente visivelmente melhor.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 28, title: "Executar o ciclo completo da louça", quadrant: 'schedule', description: "Transforme a montanha de louça em um processo organizado.", category: "Casa", pomodoroEstimate: 1, subtasks: [{ text: "Ação Rápida: Organizar a louça por tipo" }, { text: "Ação Rápida: Lavar pratos e copos" }, { text: "Ação Rápida: Lavar talheres, potes e panelas" }, { text: "Iniciar Pomodoro: Secar e guardar toda a louça" }], isDefault: true },
    { id: 29, title: "Executar o Ciclo Completo da Lavanderia", quadrant: 'schedule', description: "Esta missão te guia até a roupa guardada. Use seu Pomodoro na etapa final (dobrar e guardar).", category: "Casa", pomodoroEstimate: 1, subtasks: [{ text: "Ação Rápida: Juntar e separar a roupa suja." }, { text: "Ação Rápida: Iniciar o ciclo de lavagem." }, { text: "Ação Rápida: Transferir para secadora ou varal." }, { text: "Iniciar Pomodoro: Dobrar e guardar a roupa limpa." }], isDefault: true },
    { id: 30, title: "Limpar e preparar a mesa de estudos", quadrant: 'schedule', description: "Tire tudo da mesa que não pertence à matéria atual.", category: "Estudos", isDefault: true },
    { id: 31, title: "Celular no silencioso / Ativar o 'Não Perturbe'", quadrant: 'schedule', description: "A força de vontade é um recurso limitado. Use a tecnologia a seu favor.", category: "Estudos", isDefault: true },
    { id: 32, title: "Definir uma micro-meta de estudo", quadrant: 'schedule', description: "Quebre a tarefa até ficar ridícula de tão fácil. Ex: 'Ler 3 páginas' ou 'Resolver 1 exercício'.", category: "Estudos", isDefault: true },
    { id: 33, title: "Iniciar sessão Pomodoro de 25 minutos", quadrant: 'do', description: "Mergulhe na tarefa com foco total. Apenas por 25 minutos.", category: "Estudos", pomodoroEstimate: 1, isDefault: true },
    { id: 34, title: "Explicar o estudo em voz alta", quadrant: 'schedule', description: "Use a Técnica Feynman: ao final da sessão, explique o que aprendeu.", category: "Estudos", isDefault: true },
    { id: 40, title: "Ritual de Ativação Física", quadrant: 'do', description: "Os primeiros 10 minutos do seu dia para 'ligar' o cérebro sem usar o celular.", category: "Saúde", subtasks: [{ text: "Beber um copo grande de água" }, { text: "Olhar a luz do dia na janela por 5 min" }, { text: "Fazer 5 min de alongamento ou polichinelos" }], isDefault: true },
    { id: 41, title: "Arrumar a cama", quadrant: 'do', description: "Vitória Visual Imediata: uma tarefa de 60 segundos que organiza seu quarto e te dá a primeira sensação de dever cumprido.", category: "Casa", pomodoroEstimate: 0, isDefault: true },
    { id: 42, title: "Café da Manhã de Foco", quadrant: 'do', description: "Abasteça seu cérebro com os ingredientes certos para um foco mais estável.", category: "Saúde", pomodoroEstimate: 0, subtasks: [{ text: "Ingerir fonte de proteína (ovo, iogurte, etc)" }, { text: "Tomar medicação/suplementos" }], isDefault: true },
    { id: 43, title: "Definir a Missão do Dia", quadrant: 'do', description: "Tire o caos da sua cabeça e defina UMA prioridade clara (O Sapo).", category: "Pessoal", pomodoroEstimate: 1, subtasks: [{ text: "Ação Rápida: Esvaziar a mente e listar pensamentos" }, { text: "Ação Rápida: Revisar a agenda de hoje" }, { text: "Iniciar Pomodoro: Escolher e marcar UMA tarefa como o \"Sapo do Dia\" 🐸" }], isDefault: true }
];

// Todas as rotinas padrão agora têm isDefault: true e IDs de string
export const initialRoutines: Routine[] = [
    { id: 'routine-morning', name: 'Manhã de Dopamina', description: 'Ative o cérebro com sinais físicos (luz, água, movimento) e crie um plano claro para o dia.', icon: 'sun', taskTemplateIds: [40, 41, 42, 43], isDefault: true },
    { id: 'routine-daily-reset', name: 'Reset Diário', description: 'Evite que o caos se acumule com um reset rápido de manutenção.', icon: 'sparkles', taskTemplateIds: [20, 21, 22, 23, 24, 25, 26], isDefault: true },
    { id: 'routine-cleaning-day', name: 'Dia de Faxina', description: 'Um cardápio de missões para a limpeza pesada. Escolha 1 ou 2.', icon: 'trash', taskTemplateIds: [28, 29], isDefault: true },
    { id: 'routine-study', name: 'Ritual de Hiperfoco', description: 'Elimine distrações antes de começar e quebre a tarefa até ela parecer ridícula de tão fácil.', icon: 'bookOpen', taskTemplateIds: [30, 31, 32, 33, 34], isDefault: true },
    { id: 'routine-shutdown', name: 'Desligamento Noturno', description: "Facilite a vida do seu \'Eu do Futuro\'. Reduza a ansiedade da manhã seguinte.", icon: 'moon', taskTemplateIds: [10, 11, 12, 13], isDefault: true },
];
