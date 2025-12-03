
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

    const handleSelectTagForEdit = (tag: Tag) => {
        setEditingTag(tag);
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
        if (window.confirm('Tem certeza que deseja excluir esta etiqueta? Ela será removida de todas as tarefas.')) {
            handleDeleteTag(tagId);
            handleClearForm();
        }
    }

    return (
        <div className={styles.editorContainer}>
            <div className={styles.header}>
                <button onClick={onBack} className="btn btn-secondary btn-icon">
                    <Icon path={icons.arrowLeft} />
                </button>
                <h4>Gerenciar Etiquetas</h4>
            </div>

            <div className={styles.editorBody}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className="form-group">
                        <label>{editingTag.id ? 'Editando Etiqueta' : 'Nova Etiqueta'}</label>
                        <input
                            type="text"
                            className="g-input" // Aplica a classe global
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
                        {editingTag.id && <button type="button" className="btn btn-secondary" onClick={handleClearForm}>Cancelar Edição</button>}
                        <button type="submit" className="btn btn-primary">{editingTag.id ? 'Salvar Alterações' : 'Criar Etiqueta'}</button>
                    </div>
                </form>

                <div className={styles.listSection}>
                    <h5>Etiquetas Existentes</h5>
                    <ul className={styles.list}>
                        {tags.map(tag => (
                            <li key={tag.id} className={styles.listItem}>
                                <div className={styles.listItemInfo}>
                                    <div className={styles.tagColorDot} style={{ backgroundColor: tag.color }}></div>
                                    <span>{tag.name}</span>
                                </div>
                                <div className={styles.listItemActions}>
                                    <button onClick={() => handleSelectTagForEdit(tag)} className="btn btn-tertiary btn-icon btn-sm"><Icon path={icons.pencil} /></button>
                                    <button onClick={() => handleDelete(tag.id)} className="btn btn-tertiary btn-icon btn-sm btn-danger"><Icon path={icons.trash} /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};
