
import React from 'react';
import { useTasks } from '../../context/TasksContext';
import type { TaskFilters } from '../../types';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './FilterPanel.module.css';
import { useClickOutside } from '../../hooks/useClickOutside';

interface FilterPanelProps {
    isOpen: boolean;
    onClose: () => void;
    filters: TaskFilters;
    onFilterChange: (filters: TaskFilters) => void;
}

// Opções de filtro, agora sem ícones para um design mais limpo
const statusOptions: { id: 'frog', label: string }[] = [
    { id: 'frog', label: 'Sapo do Dia' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, onFilterChange }) => {
    const { tags } = useTasks();
    const modalRef = useClickOutside(onClose, isOpen);

    const handleToggleFilter = (key: keyof TaskFilters, value: string | number) => {
        const newFilters = { ...filters };
        let current = newFilters[key] as (string | number)[];
        if (current.includes(value)) {
            current = current.filter(item => item !== value);
        } else {
            current = [...current, value];
        }
        onFilterChange({ ...newFilters, [key]: current });
    };

    const handleClearFilters = () => {
        onFilterChange({ tags: [], status: [] });
    };

    if (!isOpen) return null;

    const getStatusChipClass = (id: 'frog') => {
        const isActive = filters.status.includes(id);
        return `${styles.filterChip} ${isActive ? styles.active : ''}`;
    }

    return (
        <div className="g-modal-overlay">
            <div className={styles.filterPanel} ref={modalRef} onClick={(e) => e.stopPropagation()}>
                <header className={styles.panelHeader}>
                    <h3><Icon path={icons.sliders} /> Filtros</h3>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Fechar filtros">
                        <Icon path={icons.x} />
                    </button>
                </header>

                <main className={styles.panelBody}>
                    <div className={styles.filterSection}>
                        <h4>STATUS</h4>
                        <div className={styles.filterOptions}>
                            {statusOptions.map(option => (
                                <button 
                                    key={option.id} 
                                    className={getStatusChipClass(option.id)}
                                    onClick={() => handleToggleFilter('status', option.id)}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                     <div className={styles.filterSection}>
                        <h4>TAGS</h4>
                        <div className={styles.filterOptions}>
                             {tags.map(tag => (
                                <button 
                                    key={tag.id} 
                                    className={`${styles.filterChip} ${filters.tags.includes(tag.id) ? styles.active : ''}`}
                                    onClick={() => handleToggleFilter('tags', tag.id)}
                                >
                                    <span className={styles.tagColorDot} style={{backgroundColor: tag.color}}></span>
                                    {tag.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </main>

                 <footer className={styles.panelFooter}>
                    <button className="btn btn-secondary" onClick={handleClearFilters}>Limpar Filtros</button>
                    <button className="btn btn-primary" onClick={onClose}>Aplicar</button>
                </footer>
            </div>
        </div>
    );
};