package com.focusfrog.app;

import android.app.KeyguardManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;

import androidx.core.app.NotificationCompat;

/**
 * Mede distração durante o FOCO sem permissões invasivas (não sabe QUAL app
 * foi aberto, só que o FocusFrog não está na frente):
 *   tela ligada + desbloqueada + FocusFrog em segundo plano → distração.
 * Tela desligada/bloqueada não conta — celular largado é o comportamento
 * desejado. Pausas não contam. Após 30s seguidos, uma cutucada gentil
 * (no máximo uma a cada 2 min). O total fica em SharedPreferences pra
 * sobreviver a um reinício do processo, e o app consulta no fim da sessão.
 */
public final class FocusDistractionMonitor {
    private static final String PREFS = "focusfrog_focus";
    private static final String KEY_MS = "distracted_ms";
    private static final long TICK_MS = 5_000, NUDGE_AFTER_MS = 30_000, NUDGE_GAP_MS = 120_000;
    private static final int NUDGE_ID = 9005;
    private static final String NUDGE_CHANNEL = "focus_nudge";

    /** atualizado por MainActivity.onResume/onPause */
    public static volatile boolean appInForeground = true;

    private static volatile String phase = "focus";
    private static long continuousMs = 0, lastNudgeAt = 0;
    private static Handler handler;
    private static Runnable loop;

    private FocusDistractionMonitor() {}

    static void setPhase(String p) { phase = p == null ? "focus" : p; continuousMs = 0; }

    static synchronized void start(Context ctx) {
        if (handler != null) return;
        final Context app = ctx.getApplicationContext();
        handler = new Handler(Looper.getMainLooper());
        loop = new Runnable() {
            @Override public void run() {
                tick(app);
                if (handler != null) handler.postDelayed(this, TICK_MS);
            }
        };
        handler.postDelayed(loop, TICK_MS);
    }

    static synchronized void stop() {
        if (handler != null) { handler.removeCallbacks(loop); handler = null; }
        continuousMs = 0;
    }

    private static void tick(Context c) {
        if (!"focus".equals(phase)) { continuousMs = 0; return; }
        PowerManager pm = (PowerManager) c.getSystemService(Context.POWER_SERVICE);
        KeyguardManager km = (KeyguardManager) c.getSystemService(Context.KEYGUARD_SERVICE);
        boolean usingPhone = pm != null && pm.isInteractive() && (km == null || !km.isKeyguardLocked());
        if (usingPhone && !appInForeground) {
            SharedPreferences p = prefs(c);
            p.edit().putLong(KEY_MS, p.getLong(KEY_MS, 0) + TICK_MS).apply();
            continuousMs += TICK_MS;
            long now = System.currentTimeMillis();
            if (continuousMs >= NUDGE_AFTER_MS && now - lastNudgeAt >= NUDGE_GAP_MS) {
                lastNudgeAt = now;
                nudge(c);
            }
        } else {
            continuousMs = 0;
        }
    }

    public static long getDistractedMs(Context c) { return prefs(c).getLong(KEY_MS, 0); }

    public static void reset(Context c) {
        prefs(c).edit().putLong(KEY_MS, 0).apply();
        continuousMs = 0;
        lastNudgeAt = 0;
    }

    /** voltou pro app: a cutucada já cumpriu o papel */
    public static void clearNudge(Context c) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.cancel(NUDGE_ID);
    }

    private static void nudge(Context c) {
        NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && nm.getNotificationChannel(NUDGE_CHANNEL) == null) {
            NotificationChannel ch = new NotificationChannel(NUDGE_CHANNEL, "Lembretes de foco", NotificationManager.IMPORTANCE_DEFAULT);
            ch.setDescription("Cutucada gentil quando você sai do foco pra outro app.");
            nm.createNotificationChannel(ch);
        }
        Intent open = c.getPackageManager().getLaunchIntentForPackage(c.getPackageName());
        PendingIntent pi = open == null ? null
            : PendingIntent.getActivity(c, NUDGE_ID, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        NotificationCompat.Builder b = new NotificationCompat.Builder(c, NUDGE_CHANNEL)
            .setSmallIcon(R.drawable.ic_stat_frog)
            .setContentTitle("🐸 Ei, seu sapo tá te esperando")
            .setContentText("Volta pro foco? Ele está crescendo com você.")
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT);
        if (pi != null) b.setContentIntent(pi);
        nm.notify(NUDGE_ID, b.build());
    }

    private static SharedPreferences prefs(Context c) { return c.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }
}
