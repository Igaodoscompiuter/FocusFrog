
package com.focusfrog.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.IBinder;
import androidx.core.app.NotificationCompat;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class BackgroundTimerService extends Service {

    public static final String CHANNEL_ID = "BackgroundTimerServiceChannel";
    public static final String ACTION_TICK = "com.focusfrog.app.TIMER_TICK";
    public static final String ACTION_FINISH = "com.focusfrog.app.TIMER_FINISH";

    private CountDownTimer timer;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        int duration = intent.getIntExtra("duration", 0);
        createNotificationChannel();

        Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Focus Frog Timer")
                .setContentText("Focus session is in progress...")
                // .setSmallIcon(R.drawable.ic_launcher_foreground)
                .build();

        startForeground(1, notification);

        timer = new CountDownTimer(duration * 1000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                Intent intent = new Intent(ACTION_TICK);
                intent.putExtra("remainingTime", millisUntilFinished / 1000);
                LocalBroadcastManager.getInstance(BackgroundTimerService.this).sendBroadcast(intent);
            }

            @Override
            public void onFinish() {
                Intent intent = new Intent(ACTION_FINISH);
                LocalBroadcastManager.getInstance(BackgroundTimerService.this).sendBroadcast(intent);
                stopSelf();
            }
        }.start();

        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        if (timer != null) {
            timer.cancel();
        }
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                    CHANNEL_ID,
                    "Focus Frog Timer Channel",
                    NotificationManager.IMPORTANCE_DEFAULT
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
}
