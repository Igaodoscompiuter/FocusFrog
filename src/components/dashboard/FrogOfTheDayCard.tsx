
import React from 'react';
import type { Task } from '../../types';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from '../../screens/HomeScreen.module.css';

interface FrogOfTheDayCardProps {
    frogTask: Task | undefined;
    isFrogInFocus: boolean;
    onFrogTaskClick: (task: Task) => void;
    onOpenMorningReview: () => void;
    onUnsetFrog: () => void;
}

export const FrogOfTheDayCard: React.FC<FrogOfTheDayCardProps> = ({ 
    frogTask, 
    isFrogInFocus, 
    onFrogTaskClick, 
    onOpenMorningReview, 
    onUnsetFrog 
}) => {

    const isSpecialFrog = frogTask?.title === "🐸 Card Especial FocusFrog N.1";

    const handleSpecialFrogClick = () => {
        window.open('https://www.instagram.com/focus.frog/', '_blank');
    };

    return (
        <div className={`${styles.frogCard} ${frogTask ? styles.hasFrog : ''}`}>
            <div className={styles.frogCardHeader}>
                <h3><Icon path={icons.frog} /> Sapo do Dia</h3>
                {frogTask && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button className="btn btn-secondary btn-small" onClick={onOpenMorningReview}>
                            Alterar
                        </button>
                        <button className="btn btn-secondary btn-icon btn-small" onClick={onUnsetFrog} title="Remover Sapo">
                            <Icon path={icons.close} />
                        </button>
                    </div>
                )}
            </div>
            {frogTask ? (
                <div>
                    <p className={styles.frogTaskTitle}>{frogTask.title}</p>
                    {isSpecialFrog ? (
                        <button 
                            className="btn btn-primary" 
                            style={{width: '100%'}}
                            onClick={handleSpecialFrogClick}
                        >
                            Visitar o Instagram 🐸
                        </button>
                    ) : (
                        <button 
                            className="btn btn-primary" 
                            style={{width: '100%'}}
                            onClick={() => onFrogTaskClick(frogTask)}
                            disabled={isFrogInFocus}
                        >
                            {isFrogInFocus ? (
                                <><Icon path={icons.zap} /> Focando no Sapo</>
                            ) : (
                                'Comer o Sapo!'
                            )}
                        </button>
                    )}
                </div>
            ) : (
                <div className={styles.frogCardContentEmpty} onClick={onOpenMorningReview}>
                    <Icon path={icons.target} size={24} />
                    <strong>Escolha seu Sapo!</strong>
                    <p>Selecione a tarefa que vai destravar seu dia.</p>
                </div>
            )}
        </div>
    );
};
