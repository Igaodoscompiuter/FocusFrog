import type { Routine } from "../types";

/**
 * Rotinas padrão. asOneTask: vira um checklist só; pickSome: o usuário escolhe
 * quais partes entram; days: dias da semana (0 = domingo) em que aparece.
 */
export const initialRoutines: Routine[] = [
  {
    id: "routine-morning",
    name: "Manhã de Dopamina",
    description:
      "Luz, água e movimento antes do celular, e um plano claro pro dia.",
    icon: "sun",
    taskTemplateIds: [44, 40, 41, 42, 43],
    isDefault: true,
    asOneTask: true,
  },
  {
    id: "routine-work-start",
    name: "Início do Expediente",
    description:
      "Antes de abrir o chat: três prioridades, caixa de entrada em ordem e o dia no papel.",
    icon: "briefcase",
    taskTemplateIds: [60, 61],
    isDefault: true,
    asOneTask: true,
    days: [1, 2, 3, 4, 5],
  },
  {
    id: "routine-daily-reset",
    name: "Reset Diário",
    description:
      "Um reset de uns 25 min pro caos não se acumular. Começa pelo que dá pra ver.",
    icon: "sparkles",
    taskTemplateIds: [20, 23, 22, 24, 25],
    isDefault: true,
    asOneTask: true,
  },
  {
    id: "routine-cleaning-day",
    name: "Dia de Faxina",
    description:
      "Missões grandes em etapas com tempo estimado. Escolha 1 ou 2, não todas.",
    icon: "trash",
    taskTemplateIds: [21, 28, 29, 27, 26],
    isDefault: true,
    pickSome: true,
    days: [6],
  },
  {
    id: "routine-study",
    name: "Ritual de Hiperfoco",
    description:
      "Prepare o terreno, escolha uma micro-meta e comece com 5 minutos. Vale pra estudo e trabalho.",
    icon: "bookOpen",
    taskTemplateIds: [30, 31, 33, 34],
    isDefault: true,
  },
  {
    id: "routine-shutdown",
    name: "Desligamento Noturno",
    description:
      'Facilite a vida do seu "Eu do Futuro": cabeça vazia, amanhã preparado e sono protegido.',
    icon: "moon",
    taskTemplateIds: [10, 11, 15, 13],
    isDefault: true,
    asOneTask: true,
  },
  {
    id: "routine-weekly",
    name: "Planejamento da Semana",
    description:
      "Uns 30 minutos por semana pra ver o que vem pela frente e escolher o que importa.",
    icon: "target",
    taskTemplateIds: [70, 71, 72, 73, 62],
    isDefault: true,
    asOneTask: true,
    days: [0],
  },
  {
    id: "routine-unstuck",
    name: "Destravar uma Tarefa",
    description: "Pra quando você sabe o que fazer mas não consegue começar.",
    icon: "rocket",
    taskTemplateIds: [74, 32, 75],
    isDefault: true,
  },
];
