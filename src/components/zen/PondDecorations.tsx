import React, { useMemo } from 'react';
import styles from './PondDecorations.module.css';

import rockSvg from '../../assets/rocks.svg';
import plantSvg from '../../assets/water-plants.svg';
import algaeSvg from '../../assets/algae.svg';

// --- Configuração das Zonas e Decorações ---

// Zonas são definidas como [minX, maxX, minY, maxY] em porcentagens
const ZONES = {
  BOTTOM_FLOOR: [0, 100, 85, 100], // Faixa no fundo
  LEFT_EDGE: [0, 25, 60, 90],
  RIGHT_EDGE: [75, 100, 60, 90],
  SUBMERGED_CENTER: [20, 80, 40, 80],
};

const DECORATIONS_CONFIG = [
  {
    type: 'rock',
    src: rockSvg,
    count: 3,
    allowedZones: [ZONES.BOTTOM_FLOOR, ZONES.LEFT_EDGE],
    minSize: 40, 
    maxSize: 80,
    fixedZIndex: 1, // Pedras sempre mais ao fundo
  },
  {
    type: 'pebble', // Novas pedrinhas menores
    src: rockSvg,
    count: 6, // Mais numerosas
    allowedZones: [ZONES.BOTTOM_FLOOR], // Apenas no chão
    minSize: 20, 
    maxSize: 35, // Menores e mais redondinhas
    fixedZIndex: 1,
  },
  {
    type: 'plant',
    src: plantSvg,
    count: 4, // Mais plantas para preencher
    allowedZones: [ZONES.RIGHT_EDGE, ZONES.LEFT_EDGE],
    minSize: 70,
    maxSize: 120,
    fixedZIndex: 2, // Plantas na frente das pedras
  },
  {
    type: 'algae',
    src: algaeSvg,
    count: 2,
    allowedZones: [ZONES.SUBMERGED_CENTER, ZONES.BOTTOM_FLOOR],
    minSize: 80,
    maxSize: 110,
    variableZIndex: true, // Pode ficar na frente ou atrás de outras algas
  },
];

const random = (min, max) => Math.random() * (max - min) + min;

// --- Componente React ---

export const PondDecorations: React.FC = () => {
  const generatedDecorations = useMemo(() => {
    return DECORATIONS_CONFIG.flatMap(config => {
      return Array.from({ length: config.count }, (_, i) => {
        const zone = config.allowedZones[Math.floor(Math.random() * config.allowedZones.length)];
        const size = random(config.minSize, config.maxSize);
        const x = random(zone[0], zone[1]);
        const y = random(zone[2], zone[3]);
        const rotation = random(-20, 20);

        let zIndex = 1;
        if (config.fixedZIndex) {
          zIndex = config.fixedZIndex;
        } else if (config.variableZIndex) {
          zIndex = Math.random() > 0.5 ? 1 : 2;
        }

        return {
          id: `${config.type}-${i}`,
          src: config.src,
          style: {
            width: `${size}px`,
            position: 'absolute',
            top: `calc(${y}% - ${size / 2}px)`,
            left: `calc(${x}% - ${size / 2}px)`,
            transform: `rotate(${rotation}deg)`,
            opacity: random(0.6, 0.9),
            zIndex: zIndex,
          } as React.CSSProperties,
        };
      });
    });
  }, []);

  return (
    <div className={styles.decorationContainer}>
      {generatedDecorations.map(deco => (
        <img key={deco.id} src={deco.src} style={deco.style} alt="" />
      ))}
    </div>
  );
};
