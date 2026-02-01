
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';

// Define a forma de um sapo, posição e ondulação
interface Frog {
  id: string;
  speciesId: string;
}

interface Position {
  top: string;
  left: string;
}

interface Ripple extends Position {
  id: number;
}

interface ZenPondProps {
  collectedFrogs: Frog[];
  children?: React.ReactNode;
}

// Função para gerar uma posição aleatória no laguinho
const getRandomPosition = (): Position => {
  const top = `${Math.random() * 70 + 15}%`;
  const left = `${Math.random() * 70 + 15}%`;
  return { top, left };
};

export const ZenPond: React.FC<ZenPondProps> = ({ collectedFrogs, children }) => {
  const [frogPositions, setFrogPositions] = useState<Map<string, Position>>(new Map());
  const [ripples, setRipples] = useState<Ripple[]>([]);

  // Inicializa e atualiza as posições quando a lista de sapos muda
  useEffect(() => {
    setFrogPositions(prevPositions => {
      const newPositions = new Map(prevPositions);
      let hasChanged = false;
      
      // Adiciona novos sapos que não estão no mapa de posições
      collectedFrogs.forEach(frog => {
        if (!newPositions.has(frog.id)) {
          newPositions.set(frog.id, getRandomPosition());
          hasChanged = true;
        }
      });
      
      // Remove sapos que não estão mais na coleção
      prevPositions.forEach((_, id) => {
          if (!collectedFrogs.some(f => f.id === id)) {
              newPositions.delete(id);
              hasChanged = true;
          }
      });
      
      return hasChanged ? newPositions : prevPositions;
    });
  }, [collectedFrogs]);

  // Efeito principal para gerenciar o movimento e as ondulações
  useEffect(() => {
    const timers = new Map<string, NodeJS.Timeout>();

    const moveFrog = (frog: Frog) => {
      // 1. Cria uma ondulação na posição ATUAL do sapo
      const currentPosition = frogPositions.get(frog.id);
      if (currentPosition) {
        const newRipple: Ripple = {
          id: Date.now() + Math.random(),
          ...currentPosition,
        };
        setRipples(prev => [...prev, newRipple]);
        // Limpa a ondulação após a animação (1 segundo)
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 1000);
      }

      // 2. Calcula e define a NOVA posição do sapo
      const newPosition = getRandomPosition();
      setFrogPositions(prev => new Map(prev).set(frog.id, newPosition));

      // 3. Agenda o PRÓXIMO movimento para este sapo
      const nextMoveTimeout = Math.random() * 8000 + 4000; // Próximo movimento em 4-12s
      timers.set(frog.id, setTimeout(() => moveFrog(frog), nextMoveTimeout));
    };

    // Inicia os timers para cada sapo
    collectedFrogs.forEach(frog => {
      if (frogPositions.has(frog.id)) {
        const initialTimeout = Math.random() * 5000 + 2000; // Movimento inicial em 2-7s
        timers.set(frog.id, setTimeout(() => moveFrog(frog), initialTimeout));
      }
    });

    // Função de limpeza: para todos os timers se o componente for desmontado
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [collectedFrogs, frogPositions]); // Depende da lista de sapos e de suas posições

  const validFrogs = collectedFrogs.filter(f => f && f.speciesId && frogPositions.has(f.id));

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water}>
        {/* Renderiza as ondulações */}
        {ripples.map(ripple => (
          <div
            key={ripple.id}
            className={styles.ripple}
            style={{ top: ripple.top, left: ripple.left }}
          />
        ))}

        {/* Renderiza os sapos com animação */}
        {validFrogs.length > 0 ? (
          validFrogs.map(frog => {
            const pos = frogPositions.get(frog.id)!;
            return (
              <motion.div
                key={frog.id}
                animate={{ top: pos.top, left: pos.left }}
                transition={{ duration: 1.5, type: 'spring' }}
                style={{ position: 'absolute' }}
              >
                <ZenFrog speciesId={frog.speciesId} stage="adult" />
              </motion.div>
            );
          })
        ) : (
          children
        )}
      </div>
    </div>
  );
};
