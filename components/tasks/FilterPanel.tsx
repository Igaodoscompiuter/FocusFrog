


import React from 'react';
import { useTasks } from '../../context/TasksContext';
import type { TaskFilters, EnergyLevel, Tag } from '../../types';
import { Icon } from '../Icon';
import { icons } from '../Icons';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: TaskFilters;
    onFilterChange: (filters: TaskFilters) => void;
}

const statusOptions: { id: 'overdue' | 'frog', label: string }[] = [
    { id: 'overdue', label: 'Atrasada' },
    { id: 'frog', label: 'Sapo do Dia' },
];
const energyOptions: { id: EnergyLevel, label: string }[] = [
    { id: 'low', label: 'Baixa Energia' },
    { id: 'medium', label: 'Média Energia' },
    { id: 'high', label: 'Alta Energia' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, onFilterChange }) => {
    const { tags } = useTasks();

    const handleToggleFilter = (key: keyof TaskFilters, value: string | number) => {
        const newFilters = { ...filters };
        
        switch (key) {
            case 'tags': {
                const current = newFilters.tags;
                const val = value as number;
                newFilters.tags = current.includes(val) ? current.filter(t => t !== val) : [...current, val];
                break;
            }
            case 'status': {
                const current = newFilters.status;
                const val = value as 'overdue' | 'frog';
                newFilters.status = current.includes(val) ? current.filter(s => s !== val) : [...current, val];
                break;
            }
            case 'energy': {
                const current = newFilters.energy;
                const val = value as EnergyLevel;
                newFilters.energy = current.includes(val) ? current.filter(e => e !== val) : [...current, val];
                break;
            }
        }
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        onFilterChange({ tags: [], status: [], energy: [] });
    };

    return (
        <>
            <div className={`filter-panel-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
            <aside className={`filter-panel ${isOpen ? 'open' : ''}`}>
                <div className="filter-panel-header">
                    <h3><Icon path={icons.sliders} /> Filtros</h3>
                     <button onClick={onClose} className="icon-button close-button" aria-label="Fechar filtros">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="filter-panel-body">
                    <div className="filter-section">
                        <h4>Status</h4>
                        <div className="filter-options">
                            {statusOptions.map(option => (
                                <label key={option.id} className="filter-checkbox">
                                    <input type="checkbox" checked={filters.status.includes(option.id)} onChange={() => handleToggleFilter('status', option.id)} />
                                    <span className="checkbox-visual"><Icon path={icons.check} /></span>
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                     <div className="filter-section">
                        <h4>Tags</h4>
                        <div className="filter-options">
                             {tags.map(tag => (
                                <label key={tag.id} className="filter-checkbox">
                                    <input type="checkbox" checked={filters.tags.includes(tag.id)} onChange={() => handleToggleFilter('tags', tag.id)} />
                                    <span className="checkbox-visual"><Icon path={icons.check} /></span>
                                    <span className="tag-color-dot" style={{backgroundColor: tag.color}}></span>
                                    <span>{tag.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                     <div className="filter-section">
                        <h4>Energia</h4>
                        <div className="filter-options">
                            {energyOptions.map(option => (
                                <label key={option.id} className="filter-checkbox">
                                    <input type="checkbox" checked={filters.energy.includes(option.id)} onChange={() => handleToggleFilter('energy', option.id)} />
                                    <span className="checkbox-visual"><Icon path={icons.check} /></span>
                                    <span>{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                </div>
                 <div className="filter-panel-footer">
                    <button className="control-button tertiary" onClick={handleClearFilters}>Limpar Filtros</button>
                    <button className="control-button" onClick={onClose}>Aplicar</button>
                </div>
            </aside>
        </>
    );
};