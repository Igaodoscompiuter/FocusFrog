import React from 'react';
import type { Screen } from '../types';
import { Icon } from './Icon';
import { icons } from './Icons';
import { useUI } from '../context/UIContext';

export const BottomNav = () => {
  const { activeScreen, handleNavigate } = useUI();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: icons.layoutGrid },
    { id: 'tasks', label: 'Tarefas', icon: icons.checkSquare },
    { id: 'focus', label: 'Foco', icon: icons.timer },
    { id: 'stats', label: 'Estatísticas', icon: icons.barChart },
    { id: 'rewards', label: 'Ajustes', icon: icons.sliders },
  ] as const;

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <a 
          key={item.id}
          href="#" 
          className={`nav-item ${activeScreen === item.id ? 'active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            handleNavigate(item.id as Screen);
          }}
          aria-current={activeScreen === item.id ? 'page' : undefined}
        >
          <Icon path={item.icon} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
};