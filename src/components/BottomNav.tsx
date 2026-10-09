import React from 'react';
import { useUI } from '../context/UIContext';
import { FiHome, FiCheckSquare, FiTarget, FiSettings } from 'react-icons/fi';
import { Icon as AppIcon } from './Icon';
import { icons } from './Icons';
import type { Screen } from '../types';
import styles from './BottomNav.module.css';

const FrogIcon: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className}><AppIcon path={icons.frog} /></span>
);

/** Abas: nomes curtos (cabem em telas estreitas sem quebrar) e o Início no meio. */
const tabs: { screen: Screen; label: string; icon: React.ElementType }[] = [
  { screen: 'focus', label: 'Foco', icon: FiTarget },
  { screen: 'tasks', label: 'Tarefas', icon: FiCheckSquare },
  { screen: 'dashboard', label: 'Início', icon: FiHome },
  { screen: 'stats', label: 'Jardim', icon: FrogIcon },
  { screen: 'rewards', label: 'Ajustes', icon: FiSettings },
];

export const BottomNav: React.FC = () => {
  const { activeScreen, handleNavigate } = useUI();

  return (
    <nav className={styles.bottomNav} aria-label="Navegação principal">
      {tabs.map(({ screen, label, icon: Icon }) => {
        const isActive = activeScreen === screen;
        return (
          <button
            key={screen}
            className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            onClick={() => handleNavigate(screen)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className={styles.pill}><Icon className={styles.navIcon} /></span>
            <span className={styles.label}>{label}</span>
          </button>
        );
      })}
    </nav>
  );
};
