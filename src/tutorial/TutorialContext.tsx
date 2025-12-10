
import React, { createContext, useContext, ReactNode, useMemo, useCallback, useEffect } from 'react';
import Shepherd from 'shepherd.js';
import { steps } from './steps';
import { TutorialEvents } from './TutorialEvents'; // Importando o orquestrador
import 'shepherd.js/dist/css/shepherd.css';
import './custom-shepherd.css';

interface TutorialContextType {
    startTutorial: () => void;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
    const context = useContext(TutorialContext);
    if (!context) {
        throw new Error('useTutorial deve ser usado dentro de um TutorialProvider');
    }
    return context;
};

export const TutorialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const tour = useMemo(() => {
        const tourInstance = new Shepherd.Tour({
            useModalOverlay: true,
            defaultStepOptions: {
                cancelIcon: { enabled: true },
                classes: 'focus-frog-shepherd-step',
                scrollTo: { behavior: 'smooth', block: 'center' }
            }
        });

        const tourSteps = steps(tourInstance);
        tourInstance.addSteps(tourSteps);
        
        tourInstance.on('cancel', () => {
            localStorage.setItem('tutorial_status', 'skipped');
        });

        tourInstance.on('complete', () => {
            localStorage.setItem('tutorial_status', 'completed');
        });

        tourInstance.on('show', (event) => {
            localStorage.setItem('tutorial_current_step', event.step.id);
            localStorage.setItem('tutorial_status', 'active');
        });

        return tourInstance;
    }, []);

    // Efetiva a integração entre o Tour e o gerenciador de eventos
    useEffect(() => {
        // Instancia o orquestrador de eventos, passando o tour
        const eventManager = new TutorialEvents(tour);

        // Retorna uma função de limpeza para ser executada quando o componente desmontar
        return () => {
            eventManager.destroy();
        };
    }, [tour]); // O efeito depende apenas da instância do tour

    const startTutorial = useCallback(() => {
        const status = localStorage.getItem('tutorial_status');
        const lastStep = localStorage.getItem('tutorial_current_step');

        if (status === 'completed' || status === 'skipped') {
            return;
        }

        if (status === 'active' && lastStep) {
            // Adiciona um pequeno delay para garantir que a UI esteja pronta
            setTimeout(() => tour.start(lastStep), 200);
        } else {
            setTimeout(() => tour.start(), 200);
        }
    }, [tour]);

    const value = {
        startTutorial
    };

    return (
        <TutorialContext.Provider value={value}>
            {children}
        </TutorialContext.Provider>
    );
};
