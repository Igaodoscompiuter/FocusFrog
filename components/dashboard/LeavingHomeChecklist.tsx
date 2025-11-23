import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import { ChecklistModal } from '../modals/ChecklistModal';
import type { ChecklistItem } from '../../types';

export const LeavingHomeChecklist: React.FC = () => {
    const { 
        leavingHomeItems, 
        handleToggleLeavingHomeItem,
        handleAddLeavingHomeItem,
        handleRemoveLeavingHomeItem,
        handleResetLeavingHomeItems 
    } = useTasks();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {isModalOpen && (
                <ChecklistModal 
                    items={leavingHomeItems}
                    onAddItem={handleAddLeavingHomeItem}
                    onRemoveItem={handleRemoveLeavingHomeItem}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
            <div className="card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
                    <h3><Icon path={icons.briefcase} /> Checklist de Saída</h3>
                    <div>
                        <button className="control-button tertiary" onClick={handleResetLeavingHomeItems} style={{padding: '0.4rem 0.8rem', marginRight: '0.5rem'}}>
                           Desmarcar
                        </button>
                        <button className="control-button secondary" onClick={() => setIsModalOpen(true)} style={{padding: '0.4rem 0.8rem'}}>
                            <Icon path={icons.pencil} /> Editar
                        </button>
                    </div>
                </div>

                <ul style={{listStyle: 'none'}}>
                    {leavingHomeItems.map(item => (
                        <li 
                            key={item.id} 
                            className={`filter-checkbox ${item.completed ? 'completed' : ''}`}
                            onClick={() => handleToggleLeavingHomeItem(item.id)}
                            style={{padding: '0.5rem 0'}}
                        >
                            <input type="checkbox" checked={item.completed} readOnly />
                            <span className="checkbox-visual"><Icon path={icons.check} /></span>
                            <span style={{textDecoration: item.completed ? 'line-through' : 'none', opacity: item.completed ? 0.7 : 1}}>{item.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};