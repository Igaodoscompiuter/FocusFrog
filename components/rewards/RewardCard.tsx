import React from 'react';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { themes } from '../../themes';
import type { Reward } from '../../types';

export const RewardCard = ({ reward, isUnlocked, canAfford, onPurchase, isActive, onSelect }: { 
    reward: Reward, 
    isUnlocked: boolean, 
    canAfford: boolean, 
    onPurchase: (reward: Reward) => void, 
    isActive: boolean, 
    onSelect: (reward: Reward) => void 
}) => {
    
    const renderButton = () => {
        if (isUnlocked) {
            if (reward.type === 'icon') {
                 return <button className="reward-button reward-button-unlocked" disabled><Icon path={icons.check} /> Obtido</button>;
            }
            if (isActive) {
                return <button className="reward-button reward-button-active" disabled><Icon path={icons.check} /> {reward.type === 'theme' ? 'Ativo' : 'Em uso'}</button>;
            }
            return <button onClick={() => onSelect(reward)} className="reward-button reward-button-apply">{reward.type === 'theme' ? 'Aplicar' : 'Usar'}</button>;
        }
        
        return (
            <button onClick={() => onPurchase(reward)} disabled={!canAfford} className={`reward-button ${canAfford ? 'reward-button-unlock' : 'reward-button-insufficient'}`}>
                {canAfford ? (
                    <><Icon path={icons.sparkles} /> Desbloquear</>
                ) : (
                    <><Icon path={icons.lock} /> Insuficiente</>
                )}
            </button>
        );
    }

    const renderPreview = () => {
        switch (reward.type) {
            case 'theme':
                return <div className="reward-preview" style={{ background: themes[reward.id]?.preview }}></div>;
            case 'icon':
                const iconMap: { [key: string]: keyof typeof icons } = {
                    'star-icon': 'star',
                    'rocket-icon': 'rocket',
                    'diamond-icon': 'gem',
                    'crown-icon': 'crown',
                };
                const iconKey = iconMap[reward.id] || 'star';
                return (
                    <div className="reward-preview-sound">
                         <Icon path={icons[iconKey]} />
                    </div>
                );
            case 'sound':
                return (
                    <div className="reward-preview-sound">
                        <div className="icon-wrapper"><Icon path={icons.music} /></div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className={`reward-card ${isUnlocked ? 'unlocked' : ''}`}>
            {isUnlocked && (
                <div className="reward-unlocked-badge">
                    <Icon path={icons.check} /> Desbloqueado
                </div>
            )}

            {renderPreview()}

            <h3>{reward.name}</h3>
            <p>{reward.description}</p>

            <div className="reward-card-footer">
                <div className="reward-cost">
                    <Icon path={icons.trophy} />
                    <span>{reward.cost}</span>
                </div>
                {renderButton()}
            </div>
        </div>
    );
};
