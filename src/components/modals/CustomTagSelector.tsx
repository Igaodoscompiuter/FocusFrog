
import React, { useState, useRef } from 'react';
import type { Tag } from '../../types';
import { useClickOutside } from '../../hooks/useClickOutside';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import styles from './CustomTagSelector.module.css';

interface CustomTagSelectorProps {
    tags: Tag[];
    selectedTagId: string | null;
    onChange: (tagId: string | null) => void;
    onManageTags: () => void;
    label: string;
}

export const CustomTagSelector: React.FC<CustomTagSelectorProps> = ({ tags, selectedTagId, onChange, onManageTags, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useClickOutside(popoverRef, () => setIsOpen(false));

    const selectedTag = tags.find(tag => tag.id === selectedTagId);

    const handleSelect = (tagId: string | null) => {
        onChange(tagId);
        setIsOpen(false);
    };

    return (
        <div className={styles.selectorContainer} ref={popoverRef}>
            <label className="form-label"><Icon path={icons.tag} /> {label}</label>
            <button 
                className={`${styles.selectorButton} ${isOpen ? styles.open : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className={styles.selectorValue}>
                    {selectedTag ? (
                        <>
                            <span className={styles.tagColorDot} style={{ backgroundColor: selectedTag.color }}></span>
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
                    <div
                        className={`${styles.popoverItem} ${!selectedTagId ? styles.selected : ''}`}
                        onClick={() => handleSelect(null)}
                    >
                         <span className={styles.tagColorDot} style={{ backgroundColor: 'var(--border-color)' }}></span>
                         Nenhuma etiqueta
                    </div>
                    {tags.map(tag => (
                        <div 
                            key={tag.id}
                            className={`${styles.popoverItem} ${selectedTagId === tag.id ? styles.selected : ''}`}
                            onClick={() => handleSelect(tag.id)}
                        >
                            <span className={styles.tagColorDot} style={{ backgroundColor: tag.color }}></span>
                            {tag.name}
                        </div>
                    ))}
                    <div className={styles.manageButton} onClick={onManageTags}>
                        <Icon path={icons.settings} />
                        Gerenciar Etiquetas
                    </div>
                </div>
            )}
        </div>
    );
};
