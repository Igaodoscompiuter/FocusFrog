
import React from 'react';
import { useUser } from '../context/UserContext';
import './Onboarding.css'; // Importa os estilos de botão
import './OnboardingNameScreen.css'; // Importa os estilos de layout unificados

export const OnboardingWelcomeScreen: React.FC = () => {
  const { userName, completeOnboarding } = useUser();

  return (
    // Usa as classes padronizadas para o layout e estilo corretos
    <div className="onboarding-container">
      {/* Adiciona a classe 'welcome-screen-typography' para escopo de estilo */}
      <div className="onboarding-card welcome-screen-typography">
        <h1 className="onboarding-title">Bem-vindo, {userName}!</h1>
        <p className="onboarding-subtitle">
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

        {/* Este botão agora será estilizado corretamente */}
        <button onClick={completeOnboarding} className="g-button g-button--primary">
          Estou pronto para focar!
        </button>
      </div>
    </div>
  );
};
