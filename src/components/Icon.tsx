// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as jsxRuntime from "react/jsx-runtime";

export const Icon = ({
  path: e,
  size: t = 24,
  className: n = "",
  style: s,
  title: r,
}) => (
  <svg
    className={n}
    style={s}
    width={t}
    height={t}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {r && <title>{r}</title>}
    <path d={e} fillRule="evenodd" clipRule="evenodd" />
  </svg>
);
