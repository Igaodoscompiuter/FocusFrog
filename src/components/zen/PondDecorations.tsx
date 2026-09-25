import React, { useMemo } from 'react';
import styles from './PondDecorations.module.css';

import rockSvg from '../../assets/rocks.svg';
import plantSvg from '../../assets/water-plants.svg';
import algaeSvg from '../../assets/algae.svg';
import { Heron } from './Heron';
import { KoiFish } from './KoiFish';
import { LotusFlower } from './LotusFlower';

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

  // Fauna animada (Garça, Carpas, Flor de Lótus): posições calculadas uma vez
  // com o mesmo sistema de zonas usado nas decorações estáticas acima.
  const wildlife = useMemo(() => {
    const heronZone = Math.random() > 0.5 ? ZONES.LEFT_EDGE : ZONES.RIGHT_EDGE;
    const heronX = random(heronZone[0], heronZone[1]);
    const heronY = random(65, 78); // Na margem, "em pé" na água rasa

    const koi = Array.from({ length: 2 }, (_, i) => {
      const x = random(ZONES.SUBMERGED_CENTER[0], ZONES.SUBMERGED_CENTER[1]);
      const y = random(ZONES.SUBMERGED_CENTER[2], ZONES.SUBMERGED_CENTER[3]);
      return {
        isReversed: i % 2 === 0,
        style: { top: `${y}%`, left: `${x}%`, opacity: 0.85 } as React.CSSProperties,
      };
    });

    const lotuses = Array.from({ length: 3 }, () => {
      const zone = Math.random() > 0.5 ? ZONES.LEFT_EDGE : ZONES.RIGHT_EDGE;
      const x = random(zone[0], zone[1]);
      const y = random(35, 55); // Flutuando na superfície, mais ao centro que as plantas
      return {
        style: { top: `${y}%`, left: `${x}%` } as React.CSSProperties,
      };
    });

    return {
      heron: { style: { top: `${heronY}%`, left: `${heronX}%` } as React.CSSProperties },
      koi,
      lotuses,
    };
  }, []);

  return (
    <div className={styles.decorationContainer}>
      {generatedDecorations.map(deco => (
        <img key={deco.id} src={deco.src} style={deco.style} alt="" />
      ))}

      {/* Fauna animada: dá vida ao lago além das decorações estáticas. */}
      {wildlife.heron && (
        <Heron style={{ position: 'absolute', zIndex: 2, ...wildlife.heron.style }} delay={0.3} />
      )}
      {wildlife.koi.map((koi, i) => (
        <KoiFish
          key={`koi-${i}`}
          style={{ position: 'absolute', zIndex: 3, ...koi.style }}
          delay={i * 0.6}
          isReversed={koi.isReversed}
        />
      ))}
      {wildlife.lotuses.map((lotus, i) => (
        <LotusFlower
          key={`lotus-${i}`}
          style={{ position: 'absolute', zIndex: 2, ...lotus.style }}
          delay={0.5 + i * 0.4}
        />
      ))}
    </div>
  );
};
