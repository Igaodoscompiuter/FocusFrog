import type { TaskTemplate } from "../types";

/** Modelos de tarefa padrão. Cada um pode ter passos com tempo estimado (minutes). */
export const initialTaskTemplates: TaskTemplate[] = [
  {
    id: 50,
    title: "🐸 Card Especial FocusFrog N.1",
    quadrant: "do",
    description:
      "O FocusFrog é a sua arquitetura mental, transformando o caos TDAH em rotinas visuais e gerenciáveis. Ele ativa a Dopamina de micro-recompensa para te dar foco e paz",
    category: "FocusFrog🐸",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Siga nossa página ➕🐸",
      },
      {
        text: "Acesse o link da bio pelo navegador 🔗🐸",
      },
      {
        text: "Baixe o FocusFrog no seu celular 🐸💖",
      },
      {
        text: "Crie rotinas e marque @focus.frog 💬🐸",
      },
      {
        text: "Inspire outras pessoas com suas rotinas e estratégias próprias 🐸📅 ",
      },
    ],
    isDefault: true,
  },
  {
    id: 60,
    title: "Planejar o dia de trabalho",
    estMinutes: 10,
    quadrant: "do",
    description:
      "Defina as 3 prioridades do dia e estime o tempo necessário para cada uma.",
    category: "Trabalho",
    pomodoroEstimate: 1,
    isDefault: true,
  },
  {
    id: 61,
    title: "Limpar a caixa de entrada de e-mails",
    estMinutes: 15,
    quadrant: "schedule",
    description:
      "Processe seus e-mails: responda, arquive ou transforme em tarefas.",
    category: "Trabalho",
    pomodoroEstimate: 1,
    isDefault: true,
  },
  {
    id: 62,
    title: "Revisar as tarefas da semana",
    estMinutes: 10,
    quadrant: "schedule",
    description:
      "Olhe para a sua lista de tarefas e ajuste as prioridades para o resto da semana.",
    category: "Trabalho",
    pomodoroEstimate: 1,
    isDefault: true,
  },
  {
    id: 44,
    title: "Celular longe até terminar a rotina",
    estMinutes: 1,
    quadrant: "do",
    description:
      "O primeiro scroll do dia puxa a atenção que você vai precisar. Deixe o celular carregando longe até riscar a rotina da manhã.",
    category: "Saúde",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 40,
    title: "Ligar o corpo",
    estMinutes: 7,
    quadrant: "do",
    description:
      "Água, luz e movimento acordam o cérebro mais rápido que café. Luz natural de manhã também ajuda a regular o sono à noite.",
    category: "Saúde",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Beber um copo grande de água",
      },
      {
        text: "Pegar 5 min de luz do dia (janela, varanda ou rua)",
      },
      {
        text: "Mexer o corpo: alongar ou 20 polichinelos",
      },
    ],
    isDefault: true,
  },
  {
    id: 41,
    title: "Arrumar a cama",
    estMinutes: 2,
    quadrant: "do",
    description:
      "Vitória visual imediata: um minuto e o quarto já parece outro. É a primeira tarefa riscada do dia.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 42,
    title: "Café da manhã com proteína",
    estMinutes: 15,
    quadrant: "do",
    description:
      "Proteína segura a energia e o foco por mais tempo do que só carboidrato.",
    category: "Saúde",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Comer algo com proteína (ovo, iogurte, queijo, pasta de amendoim)",
      },
      {
        text: "Remédios ou suplementos, se você toma",
      },
    ],
    isDefault: true,
  },
  {
    id: 43,
    title: "Definir a missão do dia",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Tire o caos da cabeça e escolha UMA prioridade clara: o Sapo do Dia.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Despejar no app tudo que tá na cabeça",
      },
      {
        text: "Olhar a agenda de hoje",
      },
      {
        text: "Escolher o Sapo do Dia 🐸",
      },
    ],
    isDefault: true,
  },
  {
    id: 30,
    title: "Preparar o terreno",
    estMinutes: 3,
    quadrant: "do",
    description:
      "Menos coisa à vista, menos distração. Vale pra estudo e trabalho.",
    category: "Estudos",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Deixar na mesa só o material de agora",
      },
      {
        text: "Água por perto",
      },
      {
        text: "Celular em outro cômodo ou no Não Perturbe",
      },
    ],
    isDefault: true,
  },
  {
    id: 31,
    title: "Escolher uma micro-meta",
    estMinutes: 2,
    quadrant: "do",
    description:
      'Uma meta tão pequena que dá preguiça de não fazer: "ler 3 páginas", "resolver 1 exercício", "escrever o título".',
    category: "Estudos",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 33,
    title: "Sessão de foco guiada",
    quadrant: "do",
    description:
      "Começar é a parte mais difícil. Os 5 primeiros minutos são só pra pegar tração; depois o bloco de 25 vem quase sozinho.",
    category: "Estudos",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Arrancada: só começar",
        minutes: 5,
      },
      {
        text: "Bloco principal",
        minutes: 25,
      },
      {
        text: "Anotar onde parou e qual é o próximo passo",
      },
    ],
    isDefault: true,
  },
  {
    id: 34,
    title: "Fechar a sessão",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Explicar em voz alta (técnica Feynman) mostra o que ficou e o que falta. A mesa pronta facilita voltar amanhã.",
    category: "Estudos",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Explicar em voz alta o que você fez ou aprendeu",
      },
      {
        text: "Guardar o material e deixar a mesa pronta pra próxima",
      },
    ],
    isDefault: true,
  },
  {
    id: 20,
    title: "Calçar o sapato e pôr uma música",
    estMinutes: 1,
    quadrant: "do",
    description:
      "Calçar o sapato avisa o cérebro que é hora de agir, e uma playlist animada deixa a tarefa chata mais leve.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 23,
    title: "Caçar o lixo à vista",
    estMinutes: 3,
    quadrant: "do",
    description:
      "Uma sacola na mão e só o lixo que dá pra ver. Comece pela sala ou cozinha, onde mais aparece.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 22,
    title: "Corrida de arrumação",
    quadrant: "do",
    description:
      "Timer de 15 min: arrume o máximo que der e pare quando tocar. Aqui o tempo é a meta, não deixar tudo perfeito.",
    category: "Casa",
    pomodoroEstimate: 1,
    customDuration: 15,
    isDefault: true,
  },
  {
    id: 24,
    title: "Louça até encher o escorredor",
    estMinutes: 5,
    quadrant: "do",
    description:
      "A meta não é zerar a pia, é impedir que ela transborde. Escorredor cheio = missão cumprida.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 25,
    title: "Resetar uma superfície plana",
    estMinutes: 3,
    quadrant: "do",
    description:
      "Escolha UMA superfície (mesa, balcão, criado-mudo) e deixe ela livre. A recompensa é imediata.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 26,
    title: "Varrer o caminho principal de um cômodo",
    estMinutes: 5,
    quadrant: "schedule",
    description:
      "Um cômodo, só o caminho principal. Ambiente visivelmente melhor, sem buscar perfeição.",
    category: "Casa",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 21,
    title: "Arrastão 20/10",
    quadrant: "schedule",
    description:
      "20 min arrumando, pausa, mais 20. Blocos curtos com pausa cansam menos que uma maratona e você não passa a odiar faxina.",
    category: "Casa",
    pomodoroEstimate: 2,
    customDuration: 20,
    isDefault: true,
  },
  {
    id: 28,
    title: "Ciclo completo da louça",
    quadrant: "schedule",
    description:
      "Da montanha na pia até tudo guardado, em etapas com tempo estimado.",
    category: "Casa",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Separar a louça por tipo",
      },
      {
        text: "Lavar pratos e copos",
        minutes: 10,
      },
      {
        text: "Lavar talheres, potes e panelas",
        minutes: 10,
      },
      {
        text: "Secar e guardar tudo",
        minutes: 5,
      },
    ],
    isDefault: true,
  },
  {
    id: 29,
    title: "Ciclo completo da roupa",
    quadrant: "schedule",
    description:
      "Da roupa suja até ela guardada no armário. A máquina trabalha sozinha; você só cuida das etapas.",
    category: "Casa",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Juntar e separar a roupa suja",
      },
      {
        text: "Colocar pra lavar",
      },
      {
        text: "Estender ou pôr na secadora",
        minutes: 10,
      },
      {
        text: "Dobrar e guardar",
        minutes: 15,
      },
    ],
    isDefault: true,
  },
  {
    id: 27,
    title: "Banheiro em 3 etapas",
    quadrant: "schedule",
    description:
      "Borrife primeiro e deixe o produto agir enquanto faz o resto: menos esforço, mesmo resultado.",
    category: "Casa",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Borrifar produto na pia, vaso e box",
      },
      {
        text: "Esfregar pia e vaso",
        minutes: 10,
      },
      {
        text: "Box e chão",
        minutes: 10,
      },
    ],
    isDefault: true,
  },
  {
    id: 10,
    title: "Esvaziar a mente",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Jogue no Despejo mental tudo que ficou rodando na cabeça. Fica guardado, e você não precisa lembrar na hora de dormir.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 11,
    title: "Preparar o amanhã",
    estMinutes: 10,
    quadrant: "do",
    description: "Decidir hoje poupa a manhã: menos escolha, menos atraso.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Separar a roupa de amanhã",
      },
      {
        text: "Mochila ou bolsa pronta perto da porta (chaves, carteira, carregador)",
      },
      {
        text: "Ver o primeiro compromisso de amanhã",
      },
    ],
    isDefault: true,
  },
  {
    id: 12,
    title: "Preparar a mochila ou bolsa",
    estMinutes: 3,
    quadrant: "do",
    description:
      "Verifique chaves, carteira, carregador. Deixe tudo pronto na porta.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 15,
    title: "Luz mais fraca 1h antes de deitar",
    estMinutes: 1,
    quadrant: "do",
    description:
      "Diminua o brilho das telas e a luz forte da casa. Luz à noite atrasa o sono, e quem tem TDAH já costuma pegar no sono mais tarde.",
    category: "Saúde",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 13,
    title: "Celular carregando longe da cama",
    estMinutes: 1,
    quadrant: "do",
    description:
      "Use um despertador comum se der. Longe da mão, sem scroll antes de dormir.",
    category: "Saúde",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 70,
    title: "Esvaziar e organizar o Despejo",
    estMinutes: 10,
    quadrant: "do",
    description:
      "Tirar da cabeça e dar um lugar pra cada coisa reduz a sensação de estar esquecendo algo.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Jogar no Despejo tudo que tá pendente na cabeça",
      },
      {
        text: "Organizar o Despejo: Fazer agora, Planejar ou Ideias",
      },
    ],
    isDefault: true,
  },
  {
    id: 71,
    title: "Olhar a semana na agenda",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Ver a semana inteira de uma vez ajuda com a cegueira de tempo: os prazos deixam de pegar de surpresa.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    subtasks: [
      {
        text: "Compromissos e prazos da semana",
      },
      {
        text: "Marcar o que precisa de preparo antes",
      },
    ],
    isDefault: true,
  },
  {
    id: 72,
    title: "Escolher os sapos da semana",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Uma tarefa importante pros dias mais pesados. O resto é bônus.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 73,
    title: "O que funcionou na semana passada?",
    estMinutes: 3,
    quadrant: "do",
    description:
      "Um minuto de revisão: o que ajudou, o que atrapalhou e o que vale mudar.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 74,
    title: "Quebrar em passos ridículos",
    estMinutes: 5,
    quadrant: "do",
    description:
      "Abra a tarefa travada e adicione passos até o primeiro levar menos de 2 minutos. Passo pequeno não assusta.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
  {
    id: 32,
    title: "Arrancada de 5 minutos",
    quadrant: "do",
    description:
      "Combine com você: só 5 minutos. Se quiser parar depois, pode. Quase sempre dá vontade de continuar. Se der, faça perto de alguém trabalhando também.",
    category: "Pessoal",
    pomodoroEstimate: 1,
    customDuration: 5,
    isDefault: true,
  },
  {
    id: 75,
    title: "Escolher a recompensa",
    estMinutes: 1,
    quadrant: "do",
    description:
      "Um prêmio pequeno pra depois: um café, um episódio, 10 min de jogo. Combinar antes ajuda a começar.",
    category: "Pessoal",
    pomodoroEstimate: 0,
    isDefault: true,
  },
];
