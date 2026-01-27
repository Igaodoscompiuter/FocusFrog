
import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Tag } from '../../types';
import styles from './CustomTagSelector.module.css';

interface CustomTagSelectorProps {
    selectedTagId: number | null;
    onChange: (tagId: number | null) => void;
    onManageTags: () => void;
}

export const CustomTagSelector: React.FC<CustomTagSelectorProps> = ({ selectedTagId, onChange, onManageTags }) => {
    const { tags } = useTasks();
    const [isOpen, setIsOpen] = useState(false);
    const selectorRef = useRef<HTMLDivElement>(null);

    const selectedTag = tags.find(tag => tag.id === selectedTagId);

    // Fecha o popover se clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (tagId: number | null) => {
        onChange(tagId);
        setIsOpen(false);
    };

    return (
        <div className={styles.selectorContainer} ref={selectorRef}>
            <button className={`${styles.selectorButton} ${isOpen ? styles.open : ''}`} onClick={() => setIsOpen(!isOpen)}>
                <div className={styles.selectorValue}>
                    {selectedTag ? (
                        <>
                            <div className={styles.tagColorDot} style={{ backgroundColor: selectedTag.color }}></div>
                            <span>{selectedTag.name}</span>
                        </>
                    ) : (
                        <span className={styles.placeholder}>Nenhuma etiqueta</span>
                    )}
                </div>
                <Icon path={icons.chevronDown} className={`${styles.chevron} ${isOpen ? styles.open : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.popover}>
                    {/* Opção "Nenhuma etiqueta" */}
                    <div
                        className={`${styles.popoverItem} ${selectedTagId === null ? styles.selected : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                        <div className={styles.itemLabel}>Nenhuma etiqueta</div>
                        {selectedTagId === null && <Icon path={icons.check} className={styles.checkIcon} />}
                    </div>

                    {/* Lista de Tags */}
                    {tags.map(tag => (
                        <div
                            key={tag.id}
                            className={`${styles.popoverItem} ${selectedTagId === tag.id ? styles.selected : ''}`}
                            onClick={() => handleSelect(tag.id)}
                        >
                            <div className={styles.itemLabel}>
                                <div className={styles.tagColorDot} style={{ backgroundColor: tag.color }}></div>
                                <span>{tag.name}</span>
                            </div>
                            {selectedTagId === tag.id && <Icon path={icons.check} className={styles.checkIcon} />}
                        </div>
                    ))}
                    
                    <div className={styles.manageButton} onClick={onManageTags}>
                        <Icon path={icons.plusCircle} />
                        <span>Gerenciar Etiquetas</span>
                    </div>
                </div>
            )}
        </div>
    );
};
