import React, { useState } from 'react';
import { useTasks } from '../../context/TasksContext';
import { Icon } from '../Icon';
import { icons } from '../Icons';
import type { Tag } from '../../types';

const colorPalette = [
    '#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'
];

export const TagEditorModal = ({ onClose }: { onClose: () => void }) => {
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
        if (window.confirm('Tem certeza que deseja excluir esta tag? Ela será removida de todas as tarefas.')) {
            handleDeleteTag(tagId);
        }
    }

    return (
        <div className="modal-overlay">
            <div className="modal tag-editor-modal">
                <div className="modal-header">
                    <h3>Gerenciar Tags</h3>
                     <button onClick={onClose} className="icon-button close-button" aria-label="Fechar modal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    <form onSubmit={handleSubmit} className="tag-editor-form">
                        <div className="form-group">
                            <label>{editingTag.id ? 'Editando Tag' : 'Nova Tag'}</label>
                            <input
                                type="text"
                                placeholder="Nome da tag"
                                value={editingTag.name}
                                onChange={(e) => setEditingTag(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="form-group">
                            <label>Cor</label>
                            <div className="tag-color-palette">
                                {colorPalette.map(color => (
                                    <div
                                        key={color}
                                        className={`tag-color-swatch ${editingTag.color === color ? 'selected' : ''}`}
                                        style={{ backgroundColor: color }}
                                        onClick={() => setEditingTag(prev => ({ ...prev, color }))}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer" style={{padding: 0, marginTop: '1rem'}}>
                            {editingTag.id && <button type="button" className="control-button secondary" onClick={handleClearForm}>Cancelar Edição</button>}
                            <button type="submit" className="control-button">{editingTag.id ? 'Salvar Alterações' : 'Criar Tag'}</button>
                        </div>
                    </form>

                    <div className="tag-list-section">
                        <h4>Tags Existentes</h4>
                        <ul className="tag-list-editor">
                            {tags.map(tag => (
                                <li key={tag.id} className="tag-list-item">
                                    <div className="tag-list-item-info">
                                        <div className="tag-color-dot" style={{ backgroundColor: tag.color }}></div>
                                        <span>{tag.name}</span>
                                    </div>
                                    <div className="tag-list-item-actions">
                                        <button onClick={() => handleSelectTagForEdit(tag)}><Icon path={icons.pencil} /></button>
                                        <button onClick={() => handleDelete(tag.id)}><Icon path={icons.trash} /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};