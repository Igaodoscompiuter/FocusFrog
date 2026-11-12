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

/* loaded from: classes.dex */
public final class FocusDistractionMonitor {
    private static final String KEY_GUARD = "guard_enabled";
    private static final String KEY_MS = "distracted_ms";
    private static final long NUDGE_AFTER_MS = 30000;
    private static final String NUDGE_CHANNEL = "focus_nudge";
    private static final long NUDGE_GAP_MS = 120000;
    private static final int NUDGE_ID = 9005;
    private static final String PREFS = "focusfrog_focus";
    private static final long TICK_MS = 5000;
    public static volatile boolean appInForeground = true;
    private static long continuousMs = 0;
    private static Handler handler = null;
    private static long lastNudgeAt = 0;
    private static Runnable loop = null;
    private static volatile String phase = "focus";

    private FocusDistractionMonitor() {
    }

    static void setPhase(String str) {
        if (str == null) {
            str = "focus";
        }
        phase = str;
        continuousMs = 0L;
    }

    static synchronized void start(Context context) {
        synchronized (FocusDistractionMonitor.class) {
            if (handler != null) {
                return;
            }
            final Context applicationContext = context.getApplicationContext();
            handler = new Handler(Looper.getMainLooper());
            Runnable runnable = new Runnable() { // from class: com.focusfrog.app.FocusDistractionMonitor.1
                @Override // java.lang.Runnable
                public void run() {
                    FocusDistractionMonitor.tick(applicationContext);
                    if (FocusDistractionMonitor.handler != null) {
                        FocusDistractionMonitor.handler.postDelayed(this, FocusDistractionMonitor.TICK_MS);
                    }
                }
            };
            loop = runnable;
            handler.postDelayed(runnable, TICK_MS);
        }
    }

    static synchronized void stop() {
        synchronized (FocusDistractionMonitor.class) {
            Handler handler2 = handler;
            if (handler2 != null) {
                handler2.removeCallbacks(loop);
                handler = null;
            }
            continuousMs = 0L;
        }
    }


    public static void tick(Context context) {
        if (!"focus".equals(phase) || !prefs(context).getBoolean(KEY_GUARD, true)) {
            continuousMs = 0L;
            return;
        }
        PowerManager powerManager = (PowerManager) context.getSystemService("power");
        KeyguardManager keyguardManager = (KeyguardManager) context.getSystemService("keyguard");
        if (powerManager != null && powerManager.isInteractive() && ((keyguardManager == null || !keyguardManager.isKeyguardLocked()) && !appInForeground)) {
            SharedPreferences prefs = prefs(context);
            prefs.edit().putLong(KEY_MS, prefs.getLong(KEY_MS, 0L) + TICK_MS).apply();
            continuousMs += TICK_MS;
            long currentTimeMillis = System.currentTimeMillis();
            if (continuousMs < NUDGE_AFTER_MS || currentTimeMillis - lastNudgeAt < NUDGE_GAP_MS) {
                return;
            }
            lastNudgeAt = currentTimeMillis;
            nudge(context);
            return;
        }
        continuousMs = 0L;
    }

    public static void setGuardEnabled(Context context, boolean z) {
        prefs(context).edit().putBoolean(KEY_GUARD, z).apply();
        if (z) {
            return;
        }
        clearNudge(context);
    }

    public static long getDistractedMs(Context context) {
        return prefs(context).getLong(KEY_MS, 0L);
    }

    public static void reset(Context context) {
        prefs(context).edit().putLong(KEY_MS, 0L).apply();
        continuousMs = 0L;
        lastNudgeAt = 0L;
    }

    public static void clearNudge(Context context) {
        NotificationManager notificationManager = (NotificationManager) context.getSystemService("notification");
        if (notificationManager != null) {
            notificationManager.cancel(NUDGE_ID);
        }
    }

    private static void nudge(Context context) {
        NotificationChannel notificationChannel;
        NotificationManager notificationManager = (NotificationManager) context.getSystemService("notification");
        if (notificationManager == null) {
            return;
        }
        if (Build.VERSION.SDK_INT >= 26) {
            notificationChannel = notificationManager.getNotificationChannel(NUDGE_CHANNEL);
            if (notificationChannel == null) {
                NotificationChannel m = new NotificationChannel(NUDGE_CHANNEL, "Lembretes de foco", 3);
                m.setDescription("Cutucada gentil quando você sai do foco pra outro app.");
                notificationManager.createNotificationChannel(m);
            }
        }
        Intent launchIntentForPackage = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        PendingIntent activity = launchIntentForPackage == null ? null : PendingIntent.getActivity(context, NUDGE_ID, launchIntentForPackage, 201326592);
        NotificationCompat.Builder priority = new NotificationCompat.Builder(context, NUDGE_CHANNEL).setSmallIcon(R.drawable.ic_stat_frog).setContentTitle("🐸 Ei, seu sapo tá te esperando").setContentText("Volta pro foco? Ele está crescendo com você.").setAutoCancel(true).setPriority(0);
        if (activity != null) {
            priority.setContentIntent(activity);
        }
        notificationManager.notify(NUDGE_ID, priority.build());
    }

    private static SharedPreferences prefs(Context context) {
        return context.getSharedPreferences(PREFS, 0);
    }
}
