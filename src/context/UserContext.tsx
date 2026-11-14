// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { FROG_SPECIES } from "../data/frogs";
import { K2 } from "../hooks/useUserData";
import { q3 } from "../analytics";

const J2 = React.createContext(undefined);

export const useUser = () => {
  const e = React.useContext(J2);
  if (!e) throw new Error("useUser deve ser usado dentro de um UserProvider");
  return e;
};

export const UserProvider = ({ children: e }) => {
  const [t, n] = useLocalStorage("focusfrog_userName", null),
    [s, r] = useLocalStorage("focusfrog_onboardingCompleted", false),
    { getCollectedFrogs: o, addFrogToCollection: a } = K2(),
    [l, c] = React.useState([]),
    [u, d] = React.useState(null),
    [f, h] = React.useState(null);
  React.useEffect(() => {
    c(o());
  }, [o]);
  const m = React.useCallback(
      (g, b) => {
        var j;
        if (!g) {
          console.error("Tentativa de adicionar um sapo com ID inválido:", g);
          return;
        }
        a(g),
          q3(
            g,
            ((j = FROG_SPECIES[g]) == null ? undefined : j.rarity) ?? "unknown",
            !!(b != null && b.guaranteed)
          ),
          c(o()),
          d({
            speciesId: g,
            ...b,
          });
      },
      [a, o]
    ),
    v = React.useCallback(() => {
      d(null);
    }, []),
    x = React.useCallback(() => {
      f && (m(f), h(null));
    }, [f, m]),
    p = {
      userName: t,
      onboardingCompleted: s,
      collectedFrogs: l,
      newlyAcquiredFrog: u,
      setUserName: (g) => {
        n(g);
      },
      completeOnboarding: () => {
        r(true);
      },
      addFrogToCollection: m,
      clearNewlyAcquiredFrog: v,
      setCurrentFrogForSession: h,
      collectCurrentFrog: x,
    };
  return <J2.Provider value={p}>{e}</J2.Provider>;
};
