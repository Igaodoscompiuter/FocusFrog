import React from 'react';
import styles from './Tooltip.module.css';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
  enabled?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, enabled = true }) => {
  // Se o tooltip não estiver habilitado, apenas renderiza o elemento filho.
  if (!enabled) {
    return children;
  }

  // O container agora é o único gatilho.
  return (
    <div className={styles.tooltipContainer}>
      {children}
      <div className={styles.tooltipText}>{text}</div>
    </div>
  );
};
