// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import { yn } from "../components/ui/Sheet";

export const useClickOutside = (e, t = true) => {
  const n = React.useRef(null);
  return (
    yn(e, t),
    React.useEffect(() => {
      if (!t) return;
      const s = (r) => {
        n.current && !n.current.contains(r.target) && e();
      };
      return (
        document.addEventListener("mousedown", s),
        () => {
          document.removeEventListener("mousedown", s);
        }
      );
    }, [e, t]),
    n
  );
};
