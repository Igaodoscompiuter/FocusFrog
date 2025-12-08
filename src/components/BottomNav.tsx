
import React from 'react';
import { useUI } from '../context/UIContext';
import { FiGrid, FiCheckSquare, FiTarget, FiBarChart2, FiAward } from 'react-icons/fi';
import type { Screen } from '../types';
import styles from './BottomNav.module.css';

const iconMap: Record<Screen, React.ElementType> = {
  dashboard: FiGrid,
  tasks: FiCheckSquare,
  focus: FiTarget,
  stats: FiBarChart2,
  rewards: FiAward,
  moodboard: FiGrid, // Este ícone não será mais usado na barra principal
};

// A ordem de 5 ícones, com Home no centro, agora é garantida.
const baseScreenOrder: Screen[] = ['focus', 'tasks', 'dashboard', 'stats', 'rewards'];

export const BottomNav: React.FC = () => {
  // REMOVIDO: a variável devModeEnabled não é mais necessária aqui.
  const { activeScreen, handleNavigate } = useUI();

  // A ordem agora é fixa, garantindo sempre 5 botões.
  const screenOrder = baseScreenOrder;

  const screenLabels: Record<Screen, string> = {
    dashboard: 'Home',
    tasks: 'Tarefas',
    focus: 'Foco',
    stats: 'Estatísticas',
    rewards: 'Personalizar',
    moodboard: 'Dev',
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
