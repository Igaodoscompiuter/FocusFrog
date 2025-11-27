
import React from 'react';
import styles from './ContextMenu.module.css';
import { Icon } from './Icon';
import { icons } from './Icons';

export type MenuItem = {
    label: string;
    icon: keyof typeof icons;
    onClick: () => void;
    isSubmenu?: boolean;
    isDanger?: boolean;
} | { isSeparator: true };

interface ContextMenuProps {
    items: MenuItem[];
    onClose: () => void;
    position: { top: number; left?: number; right?: number };
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ items, onClose, position }) => {
    const menuRef = React.useRef<HTMLDivElement>(null);

    // Efeito para fechar o menu ao clicar fora
    React.useEffect(() => {
        const handleMouseDown = (event: MouseEvent) => {
            // Se o clique foi fora do componente do menu, fecha o menu
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, [onClose]);

    const menuStyle: React.CSSProperties = {
        top: `${position.top}px`,
        left: position.left ? `${position.left}px` : 'auto',
        right: position.right ? `${position.right}px` : 'auto',
    };

    return (
        <div ref={menuRef} className={styles.menu} style={menuStyle}>
            {items.map((item, index) => {
                if ('isSeparator' in item) {
                    return <div key={index} className={styles.separator}></div>;
                }

                const itemClasses = [
                    styles.item,
                    item.isDanger ? styles.danger : ''
                ].join(' ');

                return (
                    <button key={index} className={itemClasses} onClick={item.onClick}>
                        <Icon path={icons[item.icon]} />
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};
