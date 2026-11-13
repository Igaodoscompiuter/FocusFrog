// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor } from '@capacitor/core';
import { useUI } from '../context/UIContext';
import { D3 } from '../analytics';
import { II } from './BottomNav';
import { C_sR } from '../hooks/useHomeFlow';
import { RR } from './ui/Sheet';
import { KD } from './tour/TourContext';
import { Km, Y8 } from '../screens/store/StoreScreen';
import { C_tK } from './UpdateAvailableModal';
import { ET } from '../screens/RewardsScreen';
import { YQ } from './NotificationContainer';
import { C_aX, C_iX } from './FrogRewardModal';
import { SX } from './tour/TourOverlay';
import { AX, PX } from './UpdatePrompt';
import { IX } from './NotificationActionHandler';
import { C_zX } from './Celebration';
import { C_qX, HX, UX, VX, WX } from './app/Overlays';

export const GX = () => {
  const {
      activeScreen: e,
      isImmersiveMode: t,
      handleNavigate: n
    } = useUI(),
    [s, r] = React.useState(false);
  React.useEffect(() => {
    const a = () => r(true);
    return window.addEventListener(Km, a), () => window.removeEventListener(Km, a);
  }, []), RR(() => t ? false : e !== "dashboard" ? (n("dashboard"), true) : false), React.useEffect(() => {
    D3({
      dashboard: "Início",
      tasks: "Tarefas",
      focus: "Foco",
      stats: "Jardim",
      rewards: "Ajustes",
      moodboard: "Moodboard"
    }[e] || e);
  }, [e]);
  const Xo1 = HX[e];
  return <KD><div className={`app-container screen-${e} ${t ? "immersive-mode" : ""}`}><div className="screen-content">{Xo1 ? <Xo1 /> : <div>Ecrã não encontrado</div>}</div>{!t && <II />}<YQ /><C_aX /><C_iX /><C_tK /><C_sR /><PX /><IX /><C_zX /><VX /><UX /><C_qX /><WX />{s && <Y8 onClose={() => r(false)} />}{!Capacitor.isNativePlatform() && <AX />}<SX /></div></KD>;
};

export const YX = ({
  show: e,
  onInstall: t,
  onDismiss: n
}) => e ? <div style={{
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2e3
}}><div style={{
    backgroundColor: "rgba(44, 62, 80, 0.75)",
    color: "white",
    padding: "30px",
    borderRadius: "20px",
    textAlign: "center",
    maxWidth: "340px",
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.18)"
  }}><img src={ET} alt="Mascote FocusFrog com uma chávena de café" style={{
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "20px",
      border: "2px solid rgba(255, 255, 255, 0.2)"
    }} /><h3 style={{
      marginTop: 0,
      fontSize: "1.5rem",
      fontWeight: 600
    }}>Instale o FocusFrog</h3><p style={{
      opacity: 0.9,
      lineHeight: 1.6
    }}>Leve seus focos para qualquer lugar. Instale o app em seu dispositivo para uma experiência mais rápida e integrada.</p><div style={{
      display: "flex",
      justifyContent: "space-around",
      marginTop: "30px"
    }}><button onClick={n} style={{
        padding: "12px 24px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        backgroundColor: "transparent",
        color: "#ecf0f1",
        borderRadius: "10px",
        cursor: "pointer",
        fontSize: "1rem"
      }}>Agora não</button><button onClick={t} style={{
        padding: "12px 24px",
        border: "none",
        backgroundColor: "#f1c40f",
        color: "#2c3e50",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "bold",
        fontSize: "1.1rem"
      }}>Instalar</button></div></div></div> : null;
