
import React, { useState } from 'react';
import { Icon } from '../../components/Icon';
import { icons } from '../../components/Icons';
import styles from './IdleFocusScreen.module.css';
import { FocusFrogCharacter } from '../../components/FocusFrogCharacter';

const morningPhrases = ["Vamos fazer acontecer hoje?", "Que a força do sapo esteja com você.", "Um pequeno passo hoje, um grande salto para seus objetivos."];
const afternoonPhrases = ["Mantenha o foco, você está quase lá!", "Continue o bom trabalho, seu futuro agradece."];
const nightPhrases = ["A noite é uma criança, planeje seu próximo dia.", "Bom descanso, guerreiro do foco!"];

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { title: "Bom dia", phrase: morningPhrases[Math.floor(Math.random() * morningPhrases.length)] };
    if (hour < 18) return { title: "Boa tarde", phrase: afternoonPhrases[Math.floor(Math.random() * afternoonPhrases.length)] };
    return { title: "Boa noite", phrase: nightPhrases[Math.floor(Math.random() * nightPhrases.length)] };
};

const MemoizedFocusFrogCharacter = React.memo(FocusFrogCharacter);

export const IdleFocusScreen: React.FC<{ onStart: (settings: any) => void }> = ({ onStart }) => {
    const [cycles, setCycles] = useState(2);
    const [greeting] = useState(getGreeting());

    const handleStartQuick = () => {
        onStart({ mode: 'quick', taskTitle: 'Foco Rápido' });
    };

    const handleStartClassic = () => {
        onStart({ mode: 'classic', taskTitle: `Pomodoro Clássico`, cycles: cycles });
    };
    
    return (
        <main className={styles.idleContainer}>
            
            <header className={styles.greetingBanner}>
                <h1>{greeting.title}</h1>
                <p>{greeting.phrase}</p>
            </header>

            <div className={styles.idleCharacter}>
                 <MemoizedFocusFrogCharacter status="idle" size={120} />
            </div>
            
            <div className={styles.optionsContainer}>
                <button className={styles.selectionCardButton} onClick={handleStartQuick}>
                    <div className={styles.iconWrapper}>
                        <Icon path={icons.zap} className={styles.cardIcon} />
                    </div>
                    <div className={styles.cardText}>
                        <h4>Ciclo Rápido</h4>
                        <p>Sessão única de 25 min.</p>
                    </div>
                    <div className={styles.cardActionWrapper}>
                        <Icon path={icons.chevronRight} className={styles.cardChevron} />
                    </div>
                </button>

                <div id="pomodoro-config-card" className={styles.configCard}>
                    <div className={styles.configCardHeader}>
                        <div className={styles.iconWrapper}>
                            <Icon path={icons.rotateCw} className={styles.cardIcon} />
                        </div>
                        <div className={styles.cardText}>
                            <h4>Pomodoro Clássico</h4>
                            <p>Foco: 25 min, Pausa: 5 min.</p>
                        </div>
                        <div className={styles.cardActionWrapper}></div>
                    </div>

                    <div className={styles.divider} />

                    <div className={styles.configCardControls}>
                        <p className={styles.controlsLabel}>Ciclos</p>
                        <div className={styles.cycleSelector}>
                            <button onClick={() => setCycles(c => Math.max(2, c - 1))} className={styles.cycleButton}>-</button>
                            <div className={styles.cycleCount}>
                                <span>{cycles}</span>
                            </div>
                            <button onClick={() => setCycles(c => Math.min(8, c + 1))} className={styles.cycleButton}>+</button>
                        </div>
                    </div>

                    <div className={styles.divider} />

                    <button className={styles.accentYellow} onClick={handleStartClassic}>
                        Iniciar Pomodoro
                    </button>
                </div>
            </div>
        </main>
    );
}
