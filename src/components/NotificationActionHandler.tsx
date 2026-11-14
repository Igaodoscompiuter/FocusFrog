// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import * as React from "react";
import { Capacitor } from "@capacitor/core";
import { useUI } from "../context/UIContext";
import { App as CapApp } from "@capacitor/app";
import { LocalNotifications } from "@capacitor/local-notifications";
import { SS, yO } from "../notifications";
import { useTasks } from "../context/TasksContext";
import { xd } from "../hooks/useHomeFlow";

export const NotificationActionHandler = () => {
  const { routines: e, handleAddRoutine: t } = useTasks(),
    { handleNavigate: n, addNotification: s } = useUI(),
    r = React.useRef({
      routines: e,
      handleAddRoutine: t,
      handleNavigate: n,
      addNotification: s,
    });
  return (
    (r.current = {
      routines: e,
      handleAddRoutine: t,
      handleNavigate: n,
      addNotification: s,
    }),
    React.useEffect(() => {
      if (!Capacitor.isNativePlatform()) return;
      const o = LocalNotifications.addListener(
        "localNotificationActionPerformed",
        ({ actionId: a, notification: l }) => {
          const {
              routines: c,
              handleAddRoutine: u,
              handleNavigate: d,
              addNotification: f,
            } = r.current,
            h = l.extra || {};
          if (h.routineId) {
            const m = c.find((v) => v.id === h.routineId);
            if (!m) {
              d("tasks");
              return;
            }
            if (a === SS) {
              yO(m.id, m.name, 10),
                f(
                  `Combinado: lembro de "${m.name}" em 10 minutos.`,
                  "⏰",
                  "info"
                ),
                setTimeout(() => CapApp.minimizeApp().catch(() => {}), 1200);
              return;
            }
            u(m), d("tasks");
            return;
          }
          h.go === "focus"
            ? d("focus")
            : h.go === "home" &&
              (d("dashboard"),
              setTimeout(() => window.dispatchEvent(new Event(xd)), 350));
        }
      );
      return () => {
        o.then((a) => a.remove()).catch(() => {});
      };
    }, []),
    null
  );
};
