
import React from 'react';
import { useUI } from '../context/UIContext';
// Importando o novo ícone
import { FiGrid, FiCheckSquare, FiTarget, FiBarChart2, FiAward } from 'react-icons/fi';
import type { Screen } from '../types';
import styles from './BottomNav.module.css';

const iconMap: Record<Screen, React.ElementType> = {
  dashboard: FiGrid,
  tasks: FiCheckSquare,
  focus: FiTarget,
  stats: FiBarChart2,
  rewards: FiAward,
  moodboard: FiGrid, // SUBSTITUÍDO: Usando FiGrid como teste
};

// Definindo a ordem base da navegação
const baseScreenOrder: Screen[] = ['dashboard', 'tasks', 'focus', 'stats', 'rewards'];

export const BottomNav: React.FC = () => {
  // Pegando o estado devModeEnabled do contexto
  const { activeScreen, handleNavigate, devModeEnabled } = useUI();

  // Construindo a ordem final das telas
  const screenOrder = [...baseScreenOrder];
  if (devModeEnabled) {
    screenOrder.push('moodboard'); // Adiciona o Moodboard se o modo dev estiver ativo
  }

  const screenLabels: Record<Screen, string> = {
    dashboard: 'Dashboard',
    tasks: 'Tarefas',
    focus: 'Foco',
    stats: 'Estatísticas',
    rewards: 'Personalizar',
    moodboard: 'Dev', // Rótulo para o botão do Moodboard
  };

  return (
    <nav className={styles.bottomNav}>
      {screenOrder.map((screen) => {
        const Icon = iconMap[screen];
        const isActive = activeScreen === screen;
        const itemClassName = `${styles.navItem} ${isActive ? styles.active : ''}`;

        return (
          <button 
            key={screen} 
            className={itemClassName}
            onClick={() => handleNavigate(screen)}
          >
            <Icon className={styles.navIcon} />
            <span>{screenLabels[screen]}</span>
          </button>
        );
      })}
    </nav>
  );
};
