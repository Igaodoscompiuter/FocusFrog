// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import hp from './UpdatePrompt.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { useUI } from '../context/UIContext';
import { useTheme } from '../context/ThemeContext';
import { fl } from '../data/ambientSounds';
import { uS } from '../utils/audio';
import { usePomodoro } from '../context/PomodoroContext';
import { Ed, Lj, Mj } from '../utils/focusMute';
import { CX } from '../utils/registerSW';

export function AX() {
  const {
      needRefresh: [e],
      updateServiceWorker: t
    } = CX(),
    n = () => {
      t(true);
    };
  return e ? <div className={hp.updatePrompt}><div className={hp.message}>Uma nova versão do aplicativo está disponível!</div><button className={hp.updateButton} onClick={n}>Atualizar</button></div> : null;
}

export const PX = () => {
  const {
      sessionStatus: e,
      isPaused: t
    } = usePomodoro(),
    {
      activeSoundId: n
    } = useTheme(),
    {
      soundEnabled: s
    } = useUI(),
    [r, o] = React.useState(Ed);
  return React.useEffect(() => Lj(() => o(Ed())), []), React.useEffect(() => {
    e === "idle" && Mj(false);
  }, [e]), React.useEffect(() => {
    if (!s || r || e !== "focus" || t) return;
    const a = fl.find(l => l.id === n);
    if (!(!a || a.id === "none" || !a.ready)) return uS(a, 0.45);
  }, [s, r, e, t, n]), null;
};
