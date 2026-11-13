// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import ua from './NotificationContainer.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { Co, useUI } from '../context/UIContext';
import { AnimatePresence, motion } from 'framer-motion';
import { UQ } from './Toast';

export const YQ = () => {
  const {
      notifications: e,
      removeNotification: t,
      promoteNotification: n,
      showClearAllButton: s,
      clearAllNotifications: r,
      queueCount: o
    } = useUI(),
    a = React.useCallback(d => {
      t(d), setTimeout(n, 250);
    }, [t, n]),
    l = React.useMemo(() => document.getElementById("notification-root"), []);
  if (!l) return null;
  const c = e.length + o,
    u = o >= Co.fastThreshold;
  return ReactDOM.createPortal(<div className={ua.notificationContainer}><div className={ua.stack}><AnimatePresence initial={false}>{e.map(d => <motion.div key={d.id} layout className={ua.item} initial={{
          opacity: 0,
          y: -28,
          scale: 0.94
        }} animate={{
          opacity: 1,
          y: 0,
          scale: 1
        }} exit={{
          opacity: 0,
          y: -16,
          scale: 0.96,
          transition: {
            duration: 0.18
          }
        }} transition={{
          type: "spring",
          stiffness: 420,
          damping: 30
        }}><UQ notification={d} onDismiss={a} fast={u} /></motion.div>)}</AnimatePresence><AnimatePresence>{s && <motion.div className={ua.footer} layout initial={{
          opacity: 0,
          y: -8
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -8,
          transition: {
            duration: 0.15
          }
        }}>{o > 0 && <span className={ua.more}>+{o}{" na fila"}</span>}<button className={ua.clearButton} onClick={r}>{"Limpar tudo · "}{c}</button></motion.div>}</AnimatePresence></div></div>, l);
};
