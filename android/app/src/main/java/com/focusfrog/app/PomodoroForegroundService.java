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

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * Serviço em primeiro plano de verdade pra sessão de foco/pausa — escrito do
 * zero (não usa mais plugin de terceiros) porque precisava de duas coisas que
 * o plugin anterior não dava: um cronômetro AO VIVO de verdade na notificação
 * (setUsesChronometer) e garantia de que ela NÃO possa ser descartada deslizando
 * (setOngoing). Ter o código aqui dá controle total sobre os dois.
 *
 * O cronômetro é nativo do Android — a contagem regressiva na notificação roda
 * sozinha no sistema, sem precisar de nenhum tick de JS pra isso.
 */
public class PomodoroForegroundService extends Service {

    private static final String CHANNEL_ID = "pomodoro_focus_channel";
    private static final int NOTIF_ID = 9002; // mesmo ID de antes, pra não duplicar notificações antigas

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_ENDS_AT = "ends_at"; // epoch millis
    public static final String ACTION_STOP = "com.focusfrog.app.POMODORO_SERVICE_STOP";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_STOP.equals(intent.getAction())) {
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        String title = intent != null ? intent.getStringExtra(EXTRA_TITLE) : "FocusFrog";
        String body = intent != null ? intent.getStringExtra(EXTRA_BODY) : "";
        long endsAt = intent != null ? intent.getLongExtra(EXTRA_ENDS_AT, 0) : 0;

        ensureChannel();
        Notification notification = buildNotification(title, body, endsAt);
        startForeground(NOTIF_ID, notification);

        // START_STICKY: se o Android precisar matar o processo por pressão de
        // memória, tenta recriar o serviço (sem o Intent original) assim que
        // houver recurso de novo — é a parte de "mesmo se for embora, volta".
        return START_STICKY;
    }

    private Notification buildNotification(String title, String body, long endsAt) {
        Intent openApp = getPackageManager().getLaunchIntentForPackage(getPackageName());
        PendingIntent contentIntent = openApp != null
            ? PendingIntent.getActivity(this, 0, openApp, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE)
            : null;

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(R.drawable.ic_stat_frog)
            .setOngoing(true) // não pode ser descartada deslizando — é o ponto principal
            .setOnlyAlertOnce(true) // atualizar (ex.: trocar pra pausa) não vibra/soa de novo
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_PROGRESS);

        if (contentIntent != null) builder.setContentIntent(contentIntent);

        if (endsAt > 0) {
            // Cronômetro nativo do Android: setWhen + setChronometerCountDown faz o
            // próprio sistema contar regressivamente até esse instante, sem precisar
            // de nenhuma atualização por segundo vinda do app.
            builder.setWhen(endsAt);
            builder.setUsesChronometer(true);
            builder.setChronometerCountDown(true);
        }

        return builder.build();
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null && manager.getNotificationChannel(CHANNEL_ID) == null) {
                NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID, "Sessão de foco em andamento", NotificationManager.IMPORTANCE_LOW
                );
                channel.setDescription("Notificação fixa enquanto um foco ou pausa está rodando.");
                channel.setShowBadge(false);
                manager.createNotificationChannel(channel);
            }
        }
    }

    public static void start(Context context, String title, String body, long endsAt) {
        Intent intent = new Intent(context, PomodoroForegroundService.class);
        intent.putExtra(EXTRA_TITLE, title);
        intent.putExtra(EXTRA_BODY, body);
        intent.putExtra(EXTRA_ENDS_AT, endsAt);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
    }

    public static void stop(Context context) {
        Intent intent = new Intent(context, PomodoroForegroundService.class);
        intent.setAction(ACTION_STOP);
        context.startService(intent);
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null; // serviço "started", não "bound" — ninguém precisa de bind aqui
    }
}
