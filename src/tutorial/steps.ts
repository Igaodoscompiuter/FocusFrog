
// src/tutorial/steps.ts
import Shepherd from 'shepherd.js';

/**
 * Define o roteiro do tutorial usando a sintaxe do Shepherd.js.
 * Cada passo é configurado para avanço programático, sem botões de navegação padrão.
 */
export const steps = (
    tour: Shepherd.Tour // O tour precisa ser passado para que os botões possam controlá-lo
) => [
    {
        id: 'step-1',
        title: 'Passo 1 de 6',
        text: 'Bem-vindo ao seu Oásis de Clareza! Comece esvaziando a mente. Digite uma tarefa aqui e tecle Enter.',
        attachTo: {
            element: '#tutorial-step1-form',
            on: 'bottom'
        },
        buttons: [
            {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
        // O avanço será acionado pelo evento de submit do formulário
    },
    {
        id: 'step-2',
        title: 'Passo 2 de 6',
        text: "Ótimo! Agora vamos organizar. Toque em 'Tarefas' para ver sua Matriz de Prioridades.",
        attachTo: {
            element: '#nav-item-tasks',
            on: 'bottom'
        },
        buttons: [
             {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
        // O avanço será acionado pelo clique neste item de navegação
    },
    {
        id: 'step-3',
        title: 'Passo 3 de 6',
        text: 'Aqui as tarefas esperam. Toque na que você criou para decidir o que fazer com ela.',
        attachTo: {
            element: '#tutorial-task-in-inbox',
            on: 'bottom'
        },
        buttons: [
             {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
        // O avanço será acionado pelo clique na tarefa
    },
    {
        id: 'step-4',
        title: 'Passo 4 de 6',
        text: "Tarefa organizada! Volte para a 'Home' para definir sua grande vitória do dia.",
        attachTo: {
            element: '#nav-item-dashboard',
            on: 'bottom'
        },
        buttons: [
             {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
         // O avanço será acionado pelo clique neste item de navegação
    },
    {
        id: 'step-5',
        title: 'Passo 5 de 6',
        text: 'Para vencer a paralisia, escolha UMA tarefa para ser o seu Sapo do Dia. Toque aqui para escolher.',
        attachTo: {
            element: '#frog-card-empty-state',
            on: 'bottom'
        },
        buttons: [
             {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
        // O avanço será acionado pelo clique no card
    },
    {
        id: 'step-6',
        title: 'Passo 6 de 6',
        text: "Sapo definido! Quando estiver pronto para focar, toque em 'Comer o Sapo'.",
        attachTo: {
            element: '#eat-the-frog-button',
            on: 'bottom'
        },
        buttons: [
             {
                text: 'Sair',
                action: tour.cancel,
                secondary: true
            }
        ],
        // O avanço será acionado pelo clique no botão
    },
    {
        id: 'step-7',
        title: 'Tutorial Concluído!',
        text: 'Parabéns! Você aprendeu o ritual. Crie tarefas, organize e coma um sapo por dia para ter clareza e foco.',
        buttons: [
            {
                text: 'Concluir',
                action: tour.complete
            }
        ]
    }
];
