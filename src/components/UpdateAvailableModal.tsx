import React, { useCallback, useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { checkForUpdate, snoozeUpdate, openApkDownload, UpdateManifest } from '../utils/updateCheck';
import styles from './FrogRewardModal.module.css';

export const UPDATE_CHECK_EVENT = 'focusfrog:check-update';

/** Modal "nova versão disponível" do APK. Checa ao abrir e ao voltar pro
 *  app (no máx. a cada 12h) e quando o botão das Configurações dispara o evento. */
export const UpdateAvailableModal: React.FC = () => {
  const [update, setUpdate] = useState<UpdateManifest | null>(null);
  const [current, setCurrent] = useState('');

  const run = useCallback(async (manual: boolean) => {
    const { update: u, installed } = await checkForUpdate(manual);
    if (installed) setCurrent(installed.versionName);
    if (u) setUpdate(u);
    if (manual) window.dispatchEvent(new CustomEvent('focusfrog:update-result', { detail: { found: !!u } }));
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const t = setTimeout(() => run(false), 4000); // depois da splash/tutorial
    const sub = App.addListener('appStateChange', ({ isActive }) => { if (isActive) run(false); });
    const onManual = () => run(true);
    window.addEventListener(UPDATE_CHECK_EVENT, onManual);
    return () => { clearTimeout(t); sub.then(s => s.remove()); window.removeEventListener(UPDATE_CHECK_EVENT, onManual); };
  }, [run]);

  if (!update) return null;
  const later = () => { snoozeUpdate(update.versionCode); setUpdate(null); };

  return (
    <div className={styles.overlay} data-tour-hide onClick={later}>
      <div className={styles.card} onClick={e => e.stopPropagation()}>
        <p className={styles.eyebrow}>🐸 Atualização disponível</p>
        <h3 className={styles.name}>FocusFrog {update.versionName}</h3>
        <p className={styles.description} style={{ marginBottom: 8 }}>
          Você está na {current || 'versão anterior'}. O que tem de novo:
        </p>
        {update.notes && update.notes.length > 0 && (
          <ul style={{ textAlign: 'left', margin: '0 0 16px', paddingLeft: 20, color: 'var(--text-secondary-color)', fontSize: '0.9rem', lineHeight: 1.5 }}>
            {update.notes.slice(0, 5).map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        )}
        <button className={`btn btn-primary ${styles.button}`} onClick={() => { openApkDownload(update.apkUrl); setUpdate(null); }}>
          Baixar atualização
        </button>
        <button className="btn btn-tertiary" style={{ width: '100%', marginTop: 8 }} onClick={later}>Agora não</button>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary-color)', marginTop: 10 }}>
          Seus dados continuam no app: a atualização instala por cima.
        </p>
      </div>
    </div>
  );
};
