import React from 'react';
import styles from './Lake.module.css';

export const Lake: React.FC = () => {
    return (
        <div className={styles.rippleContainer}>
            {/* Aumentando o número de ondas para maior complexidade */}
            <div className={`${styles.ripple} ${styles.ripple1}`}></div>
            <div className={`${styles.ripple} ${styles.ripple2}`}></div>
            <div className={`${styles.ripple} ${styles.ripple3}`}></div>
            <div className={`${styles.ripple} ${styles.ripple4}`}></div>
            <div className={`${styles.ripple} ${styles.ripple5}`}></div>
        </div>
    );
};
