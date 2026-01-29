
import React from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { IdleFocusScreen } from './focus/IdleFocusScreen';
import { ZenLakeScreen } from './focus/ZenLakeScreen'; // Importa a nova tela

export const FocusScreen: React.FC = () => {
    const { sessionStatus, startPomodoro } = usePomodoro();

    const handleStart = (settings: any) => {
        // O taskId é null aqui porque essas sessões não estão vinculadas a tarefas específicas da lista
        startPomodoro({ taskId: null, ...settings });
    };

    // Renderiza o componente apropriado com base no estado da sessão
    if (sessionStatus === 'idle') {
        return <IdleFocusScreen onStart={handleStart} />;
    } else {
        return <ZenLakeScreen />; // Usa a nova tela de foco
    }
};
