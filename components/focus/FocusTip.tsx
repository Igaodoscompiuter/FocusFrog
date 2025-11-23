import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';

type Cycle = 'focus' | 'shortBreak' | 'longBreak';

export const FocusTip: React.FC<{ isActive: boolean; currentCycle: Cycle }> = ({ isActive, currentCycle }) => {
    if (!isActive) {
        return (
            <div className="focus-tip focus-tip-prepare">
                <h4><Icon path={icons.zap} /> Prepare-se para o Foco!</h4>
                <ul>
                    <li>Silencie o celular e feche abas desnecessárias.</li>
                    <li>Pegue um copo d'água.</li>
                    <li>Respire fundo antes de começar.</li>
                </ul>
            </div>
        );
    }

    if (currentCycle === 'focus') {
        return (
            <div className="focus-tip focus-tip-focusing">
                <h4><Icon path={icons.target} /> Mantenha a Concentração</h4>
                <p style={{ lineHeight: 1.5 }}>Você está no caminho certo. Lembre-se do seu objetivo e evite distrações. Cada minuto focado é uma vitória!</p>
            </div>
        );
    }

    return (
        <div className="focus-tip focus-tip-break">
            <h4><Icon path={icons.coffee} /> Hora da Pausa!</h4>
            <ul>
                <li>Levante-se e alongue o corpo.</li>
                <li>Olhe para um objeto distante por 20 segundos.</li>
                <li>Evite redes sociais para um descanso real.</li>
            </ul>
        </div>
    );
};
