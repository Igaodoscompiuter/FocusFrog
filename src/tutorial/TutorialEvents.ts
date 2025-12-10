
// src/tutorial/TutorialEvents.ts
import Shepherd from 'shepherd.js';

/**
 * Gerencia a lógica de avanço do tutorial baseada em eventos.
 * Anexa e remove event listeners dinamicamente para cada passo.
 */
export class TutorialEvents {
    private tour: Shepherd.Tour;
    private currentStepId: string | null = null;

    // Mapeia o ID do passo para a função que configura seus eventos
    private eventConfig: Record<string, () => void>;

    constructor(tour: Shepherd.Tour) {
        this.tour = tour;

        // Binding do `this` para os métodos de evento
        this.handleStep1Advance = this.handleStep1Advance.bind(this);
        this.handleGenericClickAdvance = this.handleGenericClickAdvance.bind(this);

        // Centraliza a configuração dos eventos por passo
        this.eventConfig = {
            'step-1': this.setupStep1Listener,
            'step-2': () => this.setupGenericClickListener('#nav-item-tasks'),
            'step-3': () => this.setupGenericClickListener('#tutorial-task-in-inbox'),
            'step-4': () => this.setupGenericClickListener('#nav-item-dashboard'),
            'step-5': () => this.setupGenericClickListener('#frog-card-empty-state'),
            'step-6': () => this.setupGenericClickListener('#eat-the-frog-button'),
        };

        // Inicia o monitoramento das mudanças de passo
        this.tour.on('show', this.onStepChange);
    }

    /**
     * Chamado sempre que um novo passo do tutorial é exibido.
     * Limpa os listeners antigos e configura os novos.
     */
    private onStepChange = (event: { step: Shepherd.Step }) => {
        // Limpa eventos do passo anterior para evitar acúmulo
        this.cleanupCurrentStepEvents();

        this.currentStepId = event.step.id;
        const setupFunction = this.eventConfig[this.currentStepId];

        if (setupFunction) {
            setupFunction.call(this);
        }
    };

    // --- Configuração dos Listeners por Passo ---

    private setupStep1Listener() {
        const form = document.getElementById('tutorial-step1-form');
        if (form) {
            form.addEventListener('submit', this.handleStep1Advance);
        }
    }

    private setupGenericClickListener(selector: string) {
        const element = document.querySelector(selector);
        if (element) {
            element.addEventListener('click', this.handleGenericClickAdvance);
        }
    }

    // --- Handlers dos Eventos ---

    private handleStep1Advance(event: Event) {
        event.preventDefault(); // Impede o recarregamento da página
        this.tour.next();
    }

    private handleGenericClickAdvance() {
        // Adiciona um pequeno delay para que a ação do usuário seja percebida antes do pop-up mudar
        setTimeout(() => this.tour.next(), 100);
    }

    // --- Limpeza dos Eventos ---

    /**
     * Remove os event listeners do passo atual para evitar acúmulos e comportamentos inesperados.
     */
    private cleanupCurrentStepEvents() {
        if (!this.currentStepId) return;

        if (this.currentStepId === 'step-1') {
            const form = document.getElementById('tutorial-step1-form');
            if (form) form.removeEventListener('submit', this.handleStep1Advance);
        }
        
        // Para os outros passos, a lógica de limpeza é similar
        const selectors: Record<string, string> = {
            'step-2': '#nav-item-tasks',
            'step-3': '#tutorial-task-in-inbox',
            'step-4': '#nav-item-dashboard',
            'step-5': '#frog-card-empty-state',
            'step-6': '#eat-the-frog-button',
        };

        const selector = selectors[this.currentStepId];
        if (selector) {
            const element = document.querySelector(selector);
            if (element) element.removeEventListener('click', this.handleGenericClickAdvance);
        }
    }
    
    /**
     * Método público para limpar todos os eventos quando o tour for destruído.
     */
    public destroy() {
        this.cleanupCurrentStepEvents();
        this.tour.off('show', this.onStepChange);
    }
}
