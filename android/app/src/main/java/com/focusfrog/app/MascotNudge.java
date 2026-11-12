package com.focusfrog.app;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.util.Log;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import com.focusfrog.app.MascotArt;
import java.util.Calendar;
import kotlinx.coroutines.DebugKt;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class MascotNudge extends BroadcastReceiver {
    static final String ACTION = "com.focusfrog.app.MASCOT_NUDGE";
    static final String ACTION_ICON = "com.focusfrog.app.MASCOT_ICON";
    private static final String APP = "CapacitorStorage";
    private static final String CHANNEL = "mascot_nudges";
    static final int DAILY_MAX = 2;
    static final String KEY_ENABLED = "mascotNudges";
    private static final int NOTIF_ID = 9100;
    private static final String PREFS = "MascotNudge";
    static final long RECENT_MS = 5400000;
    static final int[][] SLOTS = {new int[]{10, 30}, new int[]{15, 0}, new int[]{19, 45}};
    private static final String TAG = "MascotNudge";

    @Override // android.content.BroadcastReceiver
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        try {
            if (ACTION.equals(action)) {
                long currentTimeMillis = System.currentTimeMillis();
                Nudge pick = pick(context, currentTimeMillis);
                if (pick != null) {
                    post(context, pick, currentTimeMillis);
                }
                MascotIcon.update(context, currentTimeMillis);
            } else if (ACTION_ICON.equals(action)) {
                MascotIcon.update(context, System.currentTimeMillis());
                return;
            }
        } catch (Exception e) {
            Log.w("MascotNudge", "recado falhou", e);
        }
        schedule(context);
    }

    static long nextSlot(long j) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(j);
        for (int i = 0; i < 2; i++) {
            for (int[] iArr : SLOTS) {
                Calendar calendar2 = (Calendar) calendar.clone();
                calendar2.add(6, i);
                calendar2.set(11, iArr[0]);
                calendar2.set(12, iArr[1]);
                calendar2.set(13, 0);
                calendar2.set(14, 0);
                if (calendar2.getTimeInMillis() > 60000 + j) {
                    return calendar2.getTimeInMillis();
                }
            }
        }
        return j + 21600000;
    }

    static void schedule(Context context) {
        try {
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(NotificationCompat.CATEGORY_ALARM);
            if (alarmManager == null) {
                return;
            }
            alarmManager.setAndAllowWhileIdle(0, nextSlot(System.currentTimeMillis()), PendingIntent.getBroadcast(context, NOTIF_ID, new Intent(context, (Class<?>) MascotNudge.class).setAction(ACTION), 201326592));
        } catch (Exception e) {
            Log.w("MascotNudge", "agendar falhou", e);
        }
    }

    static void scheduleIconCheck(Context context) {
        AlarmManager alarmManager;
        try {
            if ((DebugKt.DEBUG_PROPERTY_VALUE_ON.equals(context.getSharedPreferences(APP, 0).getString("mascotIcon", "")) || !"LauncherDefault".equals(context.getSharedPreferences("MascotIcon", 0).getString("alias", "LauncherDefault"))) && (alarmManager = (AlarmManager) context.getSystemService(NotificationCompat.CATEGORY_ALARM)) != null) {
                alarmManager.set(1, System.currentTimeMillis() + 1800000, PendingIntent.getBroadcast(context, 9103, new Intent(context, (Class<?>) MascotNudge.class).setAction(ACTION_ICON), 201326592));
            }
        } catch (Exception e) {
            Log.w("MascotNudge", "agendar ícone falhou", e);
        }
    }

    static final class Nudge {
        final String body;
        final MascotArt.Face face;
        final String go;
        final String kind;
        final String title;

        Nudge(String str, String str2, String str3, MascotArt.Face face, String str4) {
            this.kind = str;
            this.title = str2;
            this.body = str3;
            this.face = face;
            this.go = str4;
        }
    }

    static void markActive(Context context) {
        context.getSharedPreferences("MascotNudge", 0).edit().putLong("appActiveAt", System.currentTimeMillis()).apply();
    }

    static Nudge pick(Context context, long j) {
        SharedPreferences sharedPreferences = context.getSharedPreferences(APP, 0);
        SharedPreferences sharedPreferences2 = context.getSharedPreferences("MascotNudge", 0);
        if (DebugKt.DEBUG_PROPERTY_VALUE_OFF.equals(sharedPreferences.getString(KEY_ENABLED, ""))) {
            return null;
        }
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(j);
        int i = calendar.get(11);
        if (MascotCore.isSleepHour(i)) {
            return null;
        }
        String dayOf = MascotCore.dayOf(j);
        if ((dayOf.equals(sharedPreferences2.getString("day", "")) ? sharedPreferences2.getInt("count", 0) : 0) >= 2) {
            return null;
        }
        long j2 = sharedPreferences2.getLong("appActiveAt", 0L);
        if (j - j2 < RECENT_MS) {
            return null;
        }
        return choose(MascotCore.load(context, j), frogState(sharedPreferences, dayOf), mascotName(sharedPreferences), i, j, j2, dayOf.equals(sharedPreferences2.getString("day", "")) ? sharedPreferences2.getString("kinds", "") : "");
    }

    static Nudge choose(JSONObject jSONObject, String str, String str2, int i, long j, long j2, String str3) {
        String str4;
        String dayOf = MascotCore.dayOf(j);
        int optInt = jSONObject.optInt("streak");
        long daysBetween = MascotCore.daysBetween(jSONObject.optString("lastCareDay"), dayOf);
        boolean z = optInt > 0 && (daysBetween <= 1 || daysBetween - 1 <= ((long) jSONObject.optInt("freezes")));
        boolean z2 = daysBetween == 0;
        double optDouble = jSONObject.optDouble("food", 70.0d);
        JSONObject optJSONObject = jSONObject.optJSONObject("mission");
        boolean z3 = (optJSONObject == null || !dayOf.equals(optJSONObject.optString("day")) || optJSONObject.optBoolean("done")) ? false : true;
        long j3 = j2 > 0 ? j - j2 : 0L;
        if (!z || z2) {
            str4 = " dia";
        } else {
            str4 = " dia";
            if (i >= 19 && !str3.contains("streak")) {
                StringBuilder sb = new StringBuilder("🔥 Sua sequência de ");
                sb.append(optInt);
                sb.append(optInt == 1 ? str4 : " dias");
                sb.append(" acaba à meia-noite");
                return new Nudge("streak", sb.toString(), "Um foco de 5 minutos ou uma tarefa rápida já salva. " + str2 + " tá torcendo.", MascotArt.Face.HUNGRY, "focus");
            }
        }
        if (j3 > 172800000 && !str3.contains("missed")) {
            return new Nudge("missed", str2 + " sentiu sua falta", "Nada de recomeçar do zero: escolhe uma coisa pequena e faz só ela.", MascotArt.Face.HUNGRY, "home");
        }
        if (str != null && !str.isEmpty() && !str3.contains("frog")) {
            return new Nudge("frog", "🐸 O Sapo do Dia ainda tá aí", "\"" + str + "\". Começa só pelo primeiro passo, o resto vem.", MascotArt.Face.OPEN, "home");
        }
        if (optDouble < 25.0d && !str3.contains("hungry")) {
            return new Nudge("hungry", str2 + " tá com fome", "Cada foco completo vira uma mosca pra ele. Bora um de 25 min?", MascotArt.Face.HUNGRY, "focus");
        }
        if (z3 && i >= 15 && !str3.contains("mission")) {
            return new Nudge("mission", "Missão de hoje: " + MascotCore.missionLabel(optJSONObject.optString("id")), "Vale +2 moscas e 25 XP pro " + str2 + ".", MascotArt.Face.PROUD, "home");
        }
        if (!z || z2 || i < 15 || str3.contains("streak")) {
            return null;
        }
        StringBuilder sb2 = new StringBuilder();
        sb2.append(optInt);
        sb2.append(optInt == 1 ? str4 : " dias");
        sb2.append(" seguidos até aqui. Uma tarefa feita já mantém.");
        return new Nudge("streak", "Hoje ainda não contou pra sequência", sb2.toString(), MascotArt.Face.OPEN, "home");
    }

    private static String mascotName(SharedPreferences sharedPreferences) {
        try {
            String trim = new JSONObject(sharedPreferences.getString("mascotWidget", "{}")).optString("name", "").trim();
            return !trim.isEmpty() ? trim : "Seu sapinho";
        } catch (Exception unused) {
            return "Seu sapinho";
        }
    }

    private static String frogState(SharedPreferences sharedPreferences, String str) {
        try {
            JSONObject jSONObject = new JSONObject(sharedPreferences.getString("frogWidget", "{}"));
            if (!"active".equals(jSONObject.optString("state"))) {
                return null;
            }
            String optString = jSONObject.optString("date", "");
            if (optString.isEmpty() || str.equals(optString)) {
                return jSONObject.optString(PomodoroForegroundService.EXTRA_TITLE, null);
            }
            return null;
        } catch (Exception unused) {
            return null;
        }
    }

    static void post(Context context, Nudge nudge, long j) {
        NotificationManager notificationManager;
        Bitmap bitmap;
        NotificationChannel notificationChannel;
        if (NotificationManagerCompat.from(context).areNotificationsEnabled() && (notificationManager = (NotificationManager) context.getSystemService("notification")) != null) {
            if (Build.VERSION.SDK_INT >= 26) {
                notificationChannel = notificationManager.getNotificationChannel(CHANNEL);
                if (notificationChannel == null) {
                    NotificationChannel m = new NotificationChannel(CHANNEL, "Recados do sapo", 3);
                    m.setDescription("Lembretes do mascote: sequência, Sapo do Dia, missão e fome. No máximo 2 por dia.");
                    notificationManager.createNotificationChannel(m);
                }
            }
            try {
                bitmap = MascotArt.draw(MascotArt.Look.from(new JSONObject(context.getSharedPreferences(APP, 0).getString("mascotWidget", "{}"))), new MascotArt.Frame().face(nudge.face), 192);
            } catch (Exception unused) {
                bitmap = null;
            }
            NotificationCompat.Builder contentIntent = new NotificationCompat.Builder(context, CHANNEL).setSmallIcon(R.drawable.ic_stat_frog).setContentTitle(nudge.title).setContentText(nudge.body).setStyle(new NotificationCompat.BigTextStyle().bigText(nudge.body)).setAutoCancel(true).setColor(-278748).setCategory(NotificationCompat.CATEGORY_REMINDER).setContentIntent(open(context, nudge.go, 9101));
            if (bitmap != null) {
                contentIntent.setLargeIcon(bitmap);
            }
            if ("focus".equals(nudge.go) || "frog".equals(nudge.kind)) {
                contentIntent.addAction(0, "Focar agora", open(context, "focus", 9102));
            }
            try {
                NotificationManagerCompat.from(context).notify(NOTIF_ID, contentIntent.build());
                SharedPreferences sharedPreferences = context.getSharedPreferences("MascotNudge", 0);
                String dayOf = MascotCore.dayOf(j);
                boolean equals = dayOf.equals(sharedPreferences.getString("day", ""));
                SharedPreferences.Editor putInt = sharedPreferences.edit().putString("day", dayOf).putInt("count", (equals ? sharedPreferences.getInt("count", 0) : 0) + 1);
                StringBuilder sb = new StringBuilder();
                sb.append(equals ? sharedPreferences.getString("kinds", "") : "");
                sb.append(nudge.kind);
                sb.append(",");
                putInt.putString("kinds", sb.toString()).apply();
            } catch (SecurityException unused2) {
            }
        }
    }

    private static PendingIntent open(Context context, String str, int i) {
        Intent intent = new Intent("android.intent.action.VIEW", Uri.parse("focusfrog://open?go=" + str));
        intent.setPackage(context.getPackageName());
        intent.addFlags(805306368);
        return PendingIntent.getActivity(context, i, intent, 201326592);
    }
}
