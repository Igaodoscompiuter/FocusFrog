
import React from 'react';
import { useUser } from '../context/UserContext';
import './OnboardingWelcomeScreen.css'; // Estilos atualizados

export const OnboardingWelcomeScreen: React.FC = () => {
  const { userName, completeOnboarding } = useUser();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Olá, {userName}!</h1>
        <p className="welcome-subtitle">
          O FocusFrog foi desenhado para transformar suas tarefas em uma jornada focada e recompensadora. 
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <h3>🐸 Técnica Pomodoro</h3>
            <p>Alterne entre ciclos de foco e pausas para maximizar sua concentração.</p>
          </div>
          <div className="feature-item">
            <h3>📝 Listas de Tarefas</h3>
            <p>Organize suas tarefas e defina prioridades para nunca perder o rumo.</p>
          </div>
          <div className="feature-item">
            <h3>🔔 Notificações</h3>
            <p>Receba alertas no final de cada ciclo, mesmo com o app fechado.</p>
          </div>
        </div>

        <button onClick={completeOnboarding} className="g-button g-button--primary">
          Começar a Usar!
        </button>
      </div>
    </div>
  );
};
