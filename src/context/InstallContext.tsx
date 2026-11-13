// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { M3 } from '../analytics';

const sS = React.createContext({
  canInstall: false,
  triggerInstall: () => console.warn("triggerInstall chamado fora de um PWAInstallProvider")
});

export const oP = () => React.useContext(sS);

export const InstallProvider = ({
  children: e
}) => {
  const t = React.useRef(null),
    [n, s] = React.useState(false);
  React.useEffect(() => {
    const a = c => {
      c.preventDefault(), t.current = c, s(true);
    };
    window.addEventListener("beforeinstallprompt", a);
    const l = () => {
      s(false), t.current = null;
    };
    return window.addEventListener("appinstalled", l), () => {
      window.removeEventListener("beforeinstallprompt", a), window.removeEventListener("appinstalled", l);
    };
  }, []);
  const o = {
    canInstall: n,
    triggerInstall: async () => {
      if (t.current) {
        await t.current.prompt();
        const {
          outcome: a
        } = await t.current.userChoice;
        a === "accepted" && (M3("install_button"), s(false), t.current = null);
      } else console.warn("O evento de instalação não está disponível.");
    }
  };
  return <sS.Provider value={o}>{e}</sS.Provider>;
};
