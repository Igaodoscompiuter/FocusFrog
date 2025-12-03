
import React from 'react';
import styles from './Layout.module.css';
import { NotificationContainer } from '../NotificationContainer'; // Importa o NotificationContainer

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <main className={styles.container}>
            {children}
            {/* Adiciona o NotificationContainer aqui para que ele seja renderizado em todas as telas */}
            <NotificationContainer />
        </main>
    );
};
