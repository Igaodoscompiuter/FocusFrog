
import React from 'react';
import { useUser } from '../context/UserContext';
import './OnboardingWelcomeScreen.css'; // Estilos atualizados

export const OnboardingWelcomeScreen: React.FC = () => {
  const { userName, completeOnboarding } = useUser();

  return (
    <div className="welcome-container">
      <div className="welcome-card">
        <h1 className="welcome-title">Bem-vindo, {userName}!</h1>
        <p className="welcome-subtitle">
          O FocusFrog é uma caixa de ferramentas para acalmar a mente e te ajudar a focar no que realmente importa. Veja como:
        </p>

        <div className="features-grid">
          <div className="feature-item">
            <h3>🐸 Engula um Sapo por Dia</h3>
            <p>Para vencer a paralisia de decisão, escolheremos UMA tarefa principal por dia: o seu "Sapo". Completá-la já torna o dia uma vitória.</p>
          </div>
          <div className="feature-item">
            <h3>📝 Adeus, "Não sei por onde começar"</h3>
            <p>Use a Matriz de Prioridades para organizar suas ideias. Ela te ajuda a separar o que é para FAZER AGORA do que pode ser AGENDADO, dando clareza.</p>
          </div>
          <div className="feature-item">
            <h3>⚡️ Rotinas que Pensam por Você</h3>
            <p>Use rotinas prontas (como "limpar em 5 min" ou "preparar para dormir") que quebram tarefas assustadoras em passos rápidos para você apenas seguir.</p>
          </div>
          <div className="feature-item">
            <h3>✅ Chega de Voltar para Casa</h3>
            <p>Antes de sair, use nosso checklist "Já pegou?" para verificar itens como chaves e carteira. Uma pequena ajuda para sua memória de trabalho.</p>
          </div>
        </div>

        <button onClick={completeOnboarding} className="g-button g-button--primary">
          Estou pronto para focar!
        </button>
      </div>
    </div>
  );
};
