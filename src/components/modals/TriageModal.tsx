
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTasks } from '../../context/TasksContext';
import type { Task, Quadrant } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './TriageModal.module.css';

interface TriageModalProps {
  task: Task;
  onClose: () => void;
}

export const TriageModal: React.FC<TriageModalProps> = ({ task, onClose }) => {
  const { handleUpdateTaskQuadrant } = useTasks();
  const [isUrgent, setIsUrgent] = useState<boolean | null>(null);
  const [isImportant, setIsImportant] = useState<boolean | null>(null);
  const [targetQuadrant, setTargetQuadrant] = useState<Quadrant | null>(null);
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);

  const modalRef = useClickOutside(onClose);

  useEffect(() => {
    setModalRoot(document.getElementById('modal-root'));
  }, []);

  useEffect(() => {
    if (isUrgent === null || isImportant === null) return;

    let destination: Quadrant;
    if (isImportant && isUrgent) {
      destination = 'do';
    } else if (!isImportant && isUrgent) {
        destination = 'schedule';
    } else if (isImportant && !isUrgent) {
        destination = 'schedule';
    } else { 
      destination = 'delegate';
    }
    setTargetQuadrant(destination);
  }, [isUrgent, isImportant]);

  useEffect(() => {
    if (targetQuadrant) {
      const timer = setTimeout(() => {
        handleUpdateTaskQuadrant(task.id, targetQuadrant, 0);
        onClose();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [targetQuadrant, task.id, handleUpdateTaskQuadrant, onClose]);

  const getButtonClass = (value: boolean | null, expected: boolean) => {
    if (value === null) return 'btn-secondary';
    return value === expected ? 'btn-primary' : 'btn-disabled';
  };

  if (!modalRoot) return null;

  return createPortal(
    <div className="g-modal-overlay">
      <div className="g-modal" ref={modalRef} style={{ maxWidth: '500px' }}>
        <header className="g-modal-header">
          <h3>{`Organizar: "${task.title}"`}</h3>
          <button onClick={onClose} className="btn btn-secondary btn-icon" aria-label="Fechar">
            <Icon path={icons.close} />
          </button>
        </header>
        <main className="g-modal-body">
          <div className={styles.triageContainer}>
            <div className={styles.questionBlock}>
              <h4><Icon path={icons.clock} /> É Urgente?</h4>
              <p>Precisa ser resolvido hoje ou tem um prazo iminente?</p>
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => setIsUrgent(true)}
                  className={`btn ${getButtonClass(isUrgent, true)}`}
                >
                  Sim, é pra já
                </button>
                <button
                  onClick={() => setIsUrgent(false)}
                  className={`btn ${getButtonClass(isUrgent, false)}`}
                >
                  Não, pode esperar
                </button>
              </div>
            </div>

            {isUrgent !== null && (
              <div className={styles.questionBlock}>
                <h4><Icon path={icons.target} /> É Importante?</h4>
                <p>Contribui diretamente para suas metas e projetos de longo prazo?</p>
                <div className={styles.buttonGroup}>
                  <button
                    onClick={() => setIsImportant(true)}
                    className={`btn ${getButtonClass(isImportant, true)}`}
                  >
                    Sim, alto impacto
                  </button>
                  <button
                    onClick={() => setIsImportant(false)}
                    className={`btn ${getButtonClass(isImportant, false)}`}
                  >
                    Não, baixo impacto
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>,
    modalRoot
  );
};
