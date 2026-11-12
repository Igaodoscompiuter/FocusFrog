package com.focusfrog.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;

/* loaded from: classes.dex */
public class PomodoroForegroundService extends Service {
    public static final String ACTION_STOP = "com.focusfrog.app.POMODORO_SERVICE_STOP";
    private static final String CHANNEL_ID = "pomodoro_focus_channel";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_ENDS_AT = "ends_at";
    public static final String EXTRA_PHASE = "phase";
    public static final String EXTRA_TITLE = "title";
    private static final int NOTIF_ID = 9002;
    static volatile boolean running = false;

    @Override // android.app.Service
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override // android.app.Service
    public int onStartCommand(Intent intent, int i, int i2) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            FocusDistractionMonitor.stop();
            running = false;
            stopForeground(true);
            stopSelf();
            return 2;
        }
        String stringExtra = intent != null ? intent.getStringExtra(EXTRA_TITLE) : "FocusFrog";
        String stringExtra2 = intent != null ? intent.getStringExtra(EXTRA_BODY) : "";
        long longExtra = intent != null ? intent.getLongExtra(EXTRA_ENDS_AT, 0L) : 0L;
        FocusDistractionMonitor.setPhase((intent == null || intent.getStringExtra(EXTRA_PHASE) == null) ? "focus" : intent.getStringExtra(EXTRA_PHASE));
        FocusDistractionMonitor.start(this);
        ensureChannel();
        startForeground(NOTIF_ID, buildNotification(stringExtra, stringExtra2, longExtra));
        running = true;
        return 1;
    }

    private Notification buildNotification(String str, String str2, long j) {
        Intent launchIntentForPackage = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent activity = launchIntentForPackage != null ? PendingIntent.getActivity(this, 0, launchIntentForPackage, 201326592) : null;
        NotificationCompat.Builder category = new NotificationCompat.Builder(this, CHANNEL_ID).setContentTitle(str).setContentText(str2).setSmallIcon(R.drawable.ic_stat_frog).setOngoing(true).setOnlyAlertOnce(true).setPriority(-1).setCategory(NotificationCompat.CATEGORY_PROGRESS);
        if (activity != null) {
            category.setContentIntent(activity);
        }
        if (j > 0) {
            category.setWhen(j);
            category.setUsesChronometer(true);
            category.setChronometerCountDown(true);
        }
        return category.build();
    }

    private void ensureChannel() {
        NotificationManager notificationManager;
        NotificationChannel notificationChannel;
        if (Build.VERSION.SDK_INT < 26 || (notificationManager = (NotificationManager) getSystemService(NotificationManager.class)) == null) {
            return;
        }
        notificationChannel = notificationManager.getNotificationChannel(CHANNEL_ID);
        if (notificationChannel == null) {
            NotificationChannel m = new NotificationChannel(CHANNEL_ID, "Sessão de foco em andamento", 2);
            m.setDescription("Notificação fixa enquanto um foco ou pausa está rodando.");
            m.setShowBadge(false);
            notificationManager.createNotificationChannel(m);
        }
    }

    public static void start(Context context, String str, String str2, long j, String str3) {
        Intent intent = new Intent(context, (Class<?>) PomodoroForegroundService.class);
        intent.putExtra(EXTRA_PHASE, str3);
        intent.putExtra(EXTRA_TITLE, str);
        intent.putExtra(EXTRA_BODY, str2);
        intent.putExtra(EXTRA_ENDS_AT, j);
        if (Build.VERSION.SDK_INT >= 26) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stop(Context context) {
        Intent intent = new Intent(context, (Class<?>) PomodoroForegroundService.class);
        intent.setAction(ACTION_STOP);
        context.startService(intent);
    }
}
