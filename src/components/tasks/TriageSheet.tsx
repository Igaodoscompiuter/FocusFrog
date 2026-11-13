// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import ia from './TriageSheet.module.css';
import * as jsxRuntime from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import { ne, yn } from '../ui/Sheet';

const b9 = [{
  id: "do",
  name: "Fazer agora",
  sub: "Urgente e importante",
  color: "#F87171"
}, {
  id: "schedule",
  name: "Planejar",
  sub: "Importante, sem pressa",
  color: "#93C5FD"
}, {
  id: "someday",
  name: "Ideias",
  sub: "Algum dia, sem culpa",
  color: "#C4B5FD"
}];

export const C_k9 = ({
  task: e,
  onClose: t,
  onTriage: n,
  onDone: s,
  position: r
}) => {
  yn(t);
  const o = r ? Math.round(r.index / Math.max(1, r.total) * 100) : 0;
  return ReactDOM.createPortal(<div className={`${ne.sheetOverlay} ${ne.centerOverlay}`} onClick={t}><div className={`${ne.sheet} ${ne.dialog}`} role="dialog" aria-label="Organizar o despejo mental" onClick={a => a.stopPropagation()}>{r && <><div className={ia.top}><span className={ia.kicker}>Organizando</span><span>{r.index}{" de "}{r.total}</span></div><div className={ia.bar}><span style={{
            width: `${o}%`
          }} /></div></>}<h2 className={ne.sheetTitle}>Pra onde vai "{e.title}"?</h2>{b9.map(a => <button key={a.id} className={ia.opt} style={{
        "--c": a.color
      }} onClick={() => n(a.id)}><span className={ia.optName}>{a.name}</span><span className={ia.optSub}>{a.sub}</span></button>)}{s && <button className={ne.successBtn} onClick={s}>Já fiz (vitória rápida)</button>}<button className={ne.ghostBtn} onClick={t}>Decidir depois</button></div></div>, document.body);
};
