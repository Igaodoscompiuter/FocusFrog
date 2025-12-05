
import React from 'react';
import { useUI } from '../context/UIContext';
import { InstallButton } from './InstallButton'; // Importa o nosso novo botão
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

const baseScreenOrder: Screen[] = ['dashboard', 'tasks', 'focus', 'stats', 'rewards'];

export const BottomNav: React.FC = () => {
  const { activeScreen, handleNavigate, devModeEnabled } = useUI();

  const screenOrder = [...baseScreenOrder];
  if (devModeEnabled) {
    screenOrder.push('moodboard'); 
  }

  const screenLabels: Record<Screen, string> = {
    dashboard: 'Dashboard',
    tasks: 'Tarefas',
    focus: 'Foco',
    stats: 'Estatísticas',
    rewards: 'Personalizar',
    moodboard: 'Dev', 
  };

  return (
    <nav className={styles.bottomNav}>
      <InstallButton /> {/* Adicionamos o botão de instalação aqui */}
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
