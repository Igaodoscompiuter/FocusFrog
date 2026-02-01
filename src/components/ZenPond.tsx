
import React, { useMemo } from 'react';
import styles from './ZenPond.module.css';
import { ZenFrog } from './zen/ZenFrog';

interface ZenPondProps {
  collectedFrogs: { id: string; speciesId: string }[];
  children?: React.ReactNode;
}

const useFrogPositions = (frogs: ZenPondProps['collectedFrogs']) => {
    return useMemo(() => {
        const positions = new Map<string, { top: string; left: string }>();
        // Usando o índice para garantir que mesmo sapos com IDs duplicados (se houver) tenham uma posição
        frogs.forEach((frog, index) => {
            const uniqueId = `${frog.id}-${index}`;
            const top = `${Math.random() * 80 + 10}%`;
            const left = `${Math.random() * 80 + 10}%`;
            positions.set(uniqueId, { top, left });
        });
        return positions;
    }, [frogs]);
};

export const ZenPond: React.FC<ZenPondProps> = ({ collectedFrogs, children }) => {
  const frogPositions = useFrogPositions(collectedFrogs);

  return (
    <div className={styles.zenPondContainer}>
      <div className={styles.water}>
        {/* CORREÇÃO: Usando o índice no map para garantir uma "key" única */}
        {collectedFrogs.map((frog, index) => {
          const uniqueId = `${frog.id}-${index}`;
          const pos = frogPositions.get(uniqueId);
          return (
            <div key={uniqueId} style={{ position: 'absolute', top: pos?.top, left: pos?.left }}>
              <ZenFrog speciesId={frog.speciesId} stage="adult" />
            </div>
          );
        })}
      </div>
      {children}
    </div>
  );
};
