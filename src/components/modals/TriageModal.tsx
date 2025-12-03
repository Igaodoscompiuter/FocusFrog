
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Task, Quadrant } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TriageModal.module.css';

interface TriageModalProps {
  task: Task;
  onClose: () => void;
  onTriage: (quadrant: Quadrant) => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({ task, onClose, onTriage }) => {
  const modalRef = useClickOutside(onClose);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  if (!modalRoot) return null;

  const triageOptions: { id: Quadrant; title: string; subtitle: string; icon: keyof typeof icons; }[] = [
    { id: "do", title: "Foco Imediato", subtitle: "Urgente & Importante", icon: 'zap' },
    { id: "schedule", title: "Tarefas do Dia", subtitle: "Importante, não urgente", icon: 'calendar' },
    { id: "someday", title: "Ideias & Projetos", subtitle: "Não urgente & não importante", icon: 'bookOpen' },
  ];

  return createPortal(
    <div className="g-modal-overlay">
      <div className="g-modal" ref={modalRef} style={{ maxWidth: '550px' }}>
        <header className={`g-modal-header ${styles.centeredHeader}`}>
            <h3>{`Para onde vai a tarefa "${task.title}"?`}</h3>
            <p className={styles.subtitle}>Escolha o quadrante de destino para organizar sua tarefa.</p>
        </header>
        
        <main className="g-modal-body">
            <div className={styles.optionsGrid}>
              {triageOptions.map(option => (
                  <button 
                      key={option.id}
                      className={`${styles.optionButton} ${styles[option.id]}`}
                      onClick={() => onTriage(option.id)}
                  >
                      <Icon path={icons[option.icon]} />
                      <span className={styles.optionTitle}>{option.title}</span>
                      <span className={styles.optionSubtitle}>{option.subtitle}</span>
                  </button>
              ))}
            </div>
        </main>

        <footer className="g-modal-footer">
          <button className={`${styles.footerButton}`} onClick={onClose}>
            Decidir Depois
          </button>
        </footer>
      </div>
    </div>,
    modalRoot
  );
};
