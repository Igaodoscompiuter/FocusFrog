
import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Tag } from '../../types';
import styles from './TagEditorView.module.css';

const colorPalette = [
    '#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

interface TagEditorViewProps {
    onBack: () => void;
}

export const TagEditorView: React.FC<TagEditorViewProps> = ({ onBack }) => {
    const { tags, handleSaveTag, handleDeleteTag } = useTasks();
    const [editingTag, setEditingTag] = useState<Partial<Tag>>({ name: '', color: colorPalette[0] });
    const [isListOpen, setIsListOpen] = useState(true);

    const handleSelectTagForEdit = (tag: Tag) => {
        setEditingTag(tag);
        // Não é mais necessário fechar a lista, o scroll vai cuidar da visibilidade
    };

    const handleClearForm = () => {
        setEditingTag({ name: '', color: colorPalette[0] });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTag.name?.trim()) {
            handleSaveTag(editingTag);
            handleClearForm();
        }
    };
    
    const handleDelete = (tagId: number) => {
        handleDeleteTag(tagId);
        handleClearForm();
    }

    return (
        <>
            {/* Utiliza o cabeçalho global do modal */}
            <header className="g-modal-header">
                <h3>Gerenciar Etiquetas</h3>
                <button onClick={onBack} className="btn btn-secondary btn-icon">
                    <Icon path={icons.close} />
                </button>
            </header>

            {/* Envolve o conteúdo no corpo rolável do modal */}
            <main className="g-modal-body">
                {/* Formulário de Criação/Edição */}
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <h5 className={styles.formTitle}>{editingTag.id ? 'Editando Etiqueta' : 'Criar Nova Etiqueta'}</h5>
                        <div className="form-group">
                            <label htmlFor="tagName">Nome</label>
                            <input
                                id="tagName"
                                type="text"
                                className="g-input"
                                placeholder="Nome da etiqueta"
                                value={editingTag.name || ''}
                                onChange={(e) => setEditingTag(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cor</label>
                            <div className={styles.colorPalette}>
                                {colorPalette.map(color => (
                                    <div
                                        key={color}
                                        className={`${styles.colorSwatch} ${editingTag.color === color ? styles.selected : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEditingTag(prev => ({ ...prev, color }))}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            {editingTag.id && <button type="button" className="btn btn-secondary" onClick={handleClearForm}>Cancelar</button>}
                            <button type="submit" className="btn btn-primary">{editingTag.id ? 'Salvar Alterações' : 'Criar Etiqueta'}</button>
                        </div>
                    </form>
                </div>

                {/* Acordeão de Etiquetas Existentes */}
                <div className={styles.listContainer}>
                    <div className={styles.accordion}>
                        <button className={styles.accordionHeader} onClick={() => setIsListOpen(!isListOpen)}>
                            <span>Etiquetas Existentes</span>
                            <Icon path={isListOpen ? icons.chevronUp : icons.chevronDown} />
                        </button>
                        <div className={`${styles.accordionContent} ${isListOpen ? styles.open : ''}`}>
                            <ul className={styles.list}>
                                {tags.map(tag => (
                                    <li key={tag.id} className={styles.listItem}>
                                        <div className={styles.listItemInfo}>
                                            <div className={styles.tagColorDot} style={{ backgroundColor: tag.color }}></div>
                                            <span>{tag.name}</span>
                                        </div>
                                        <div className={styles.listItemActions}>
                                            {tag.isDefault ? (
                                                <Icon path={icons.lock} className={styles.lockIcon} />
                                            ) : (
                                                <>
                                                    <button onClick={() => handleSelectTagForEdit(tag)} className="btn btn-tertiary btn-icon btn-sm"><Icon path={icons.pencil} /></button>
                                                    <button onClick={() => handleDelete(tag.id)} className="btn btn-tertiary btn-icon btn-sm btn-danger"><Icon path={icons.trash} /></button>
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
};
