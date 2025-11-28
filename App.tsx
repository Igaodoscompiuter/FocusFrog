import React from 'react';
import { UIProvider } from './context/UIContext';
import { ThemeProvider } from './context/ThemeContext';
import { TasksProvider } from './context/TasksContext';
import { PomodoroProvider } from './context/PomodoroContext';
import { AppLayout } from './components/AppLayout';
import { MoodboardScreen } from './screens/MoodboardScreen';
import { WireframeViewer } from './screens/wireframes/WireframeViewer';

import './global-components.css'; // <-- Importando os estilos globais para modais

// Altere esta flag para 'app', 'moodboard', ou 'wireframe' para ver diferentes estágios do projeto.
// Fase 3: Mudando para 'app' para aplicar o design de alta fidelidade.
// FIX: Use a type assertion to prevent the compiler from narrowing the type of VIEW_MODE
// to its literal value, which would cause type errors in the switch statement.
const VIEW_MODE = 'app' as 'app' | 'moodboard' | 'wireframe';

const App: React.FC = () => {
  switch (VIEW_MODE) {
    case 'moodboard':
      return <MoodboardScreen />;
    case 'wireframe':
      return <WireframeViewer />;
    case 'app':
    default:
      return (
        <UIProvider>
          <ThemeProvider>
            <PomodoroProvider>
              <TasksProvider>
                <AppLayout />
              </TasksProvider>
            </PomodoroProvider>
          </ThemeProvider>
        </UIProvider>
      );
  }
};

export default App;
