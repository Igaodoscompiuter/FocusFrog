// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import sa from "./BottomNav.module.css";
import * as jsxRuntime from "react/jsx-runtime";
import { useUI } from "../context/UIContext";
import { FiCheckSquare, FiHome, FiSettings, FiTarget } from "react-icons/fi";
import { Icon } from "./Icon";
import { icons } from "./Icons";

const AI = ({ className: e }) => (
  <span className={e}>
    <Icon path={icons.frog} />
  </span>
);

const PI = [
  {
    screen: "focus",
    label: "Foco",
    icon: FiTarget,
  },
  {
    screen: "tasks",
    label: "Tarefas",
    icon: FiCheckSquare,
  },
  {
    screen: "dashboard",
    label: "Início",
    icon: FiHome,
  },
  {
    screen: "stats",
    label: "Jardim",
    icon: AI,
  },
  {
    screen: "rewards",
    label: "Ajustes",
    icon: FiSettings,
  },
];

export const BottomNav = () => {
  const { activeScreen: e, handleNavigate: t } = useUI();
  return (
    <nav className={sa.bottomNav} aria-label="Navegação principal">
      {PI.map(({ screen: n, label: s, icon: Xr1 }) => {
        const o = e === n;
        return (
          <button
            key={n}
            className={`${sa.navItem} ${o ? sa.active : ""}`}
            onClick={() => t(n)}
            aria-current={o ? "page" : undefined}
          >
            <span className={sa.pill}>
              <Xr1 className={sa.navIcon} />
            </span>
            <span className={sa.label}>{s}</span>
          </button>
        );
      })}
    </nav>
  );
};
