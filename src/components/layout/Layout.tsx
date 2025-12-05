
import React from 'react';
import styles from './Layout.module.css';
import { NotificationContainer } from '../NotificationContainer';
import { PWAInstallPopup } from '../PWAInstallPopup'; // Importa o novo componente

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <main className={styles.container}>
            {children}
            
            {/* Containers globais que podem aparecer sobre qualquer tela */}
            <NotificationContainer />
            <PWAInstallPopup />
        </main>
    );
};
