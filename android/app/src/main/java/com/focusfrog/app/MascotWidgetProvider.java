package com.focusfrog.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.ColorStateList;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.DisplayMetrics;
import android.util.Log;
import android.util.SizeF;
import android.widget.RemoteViews;
import androidx.core.app.NotificationCompat;
import com.focusfrog.app.MascotArt;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;
import org.json.JSONArray;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class MascotWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_FEED = "com.focusfrog.app.MASCOT_FEED";
    public static final String ACTION_PET = "com.focusfrog.app.MASCOT_PET";
    static final String ACTION_REFRESH = "com.focusfrog.app.MASCOT_REFRESH";
    static final Layers BREATH;
    private static final int FRAME_PX = 240;
    private static final int[] FX;
    static final Layers HOP;
    static final long HOP_SHOW_MS = 1300;
    private static final String KEY_STATE = "mascotWidget";
    static final int N = 24;
    private static final String PREFS_APP = "CapacitorStorage";
    private static final String PREFS_LOCAL = "MascotWidget";
    static final long REACT_MS = 5000;
    private static final String TAG = "MascotWidget";
    static final long TAP_DEBOUNCE_MS = 600;
    static final long TIP_MS = 9000;
    static boolean hopping;
    static boolean restartLayers;
    static boolean vectorMode;
    private static final Handler HANDLER = new Handler(Looper.getMainLooper());
    static final int[] FRAME_IDS = {R.id.mascot_f0, R.id.mascot_f1, R.id.mascot_f2, R.id.mascot_f3, R.id.mascot_f4, R.id.mascot_f5, R.id.mascot_f6, R.id.mascot_f7, R.id.mascot_f8, R.id.mascot_f9, R.id.mascot_f10, R.id.mascot_f11, R.id.mascot_f12, R.id.mascot_f13, R.id.mascot_f14, R.id.mascot_f15, R.id.mascot_f16, R.id.mascot_f17, R.id.mascot_f18, R.id.mascot_f19, R.id.mascot_f20, R.id.mascot_f21, R.id.mascot_f22, R.id.mascot_f23};
    private static final float[][] FLY_IN = {new float[]{88.0f, 18.0f}, new float[]{84.0f, 23.0f}, new float[]{79.0f, 27.0f}, new float[]{76.0f, 30.0f}, new float[]{74.0f, 31.0f}, new float[]{73.0f, 32.0f}};

    enum Kind {
        SMALL,
        TALL,
        WIDE,
        LARGE
    }

    enum Mood {
        NORMAL,
        HAPPY,
        EAT,
        SLEEPY,
        HUNGRY,
        PROUD
    }

    @Override // android.appwidget.AppWidgetProvider
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] iArr) {
        for (int i : iArr) {
            update(context, appWidgetManager, i);
        }
    }

    @Override // android.appwidget.AppWidgetProvider
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int i, Bundle bundle) {
        update(context, appWidgetManager, i);
    }

    @Override // android.appwidget.AppWidgetProvider, android.content.BroadcastReceiver
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        String action = intent.getAction();
        if (ACTION_REFRESH.equals(action)) {
            refreshAll(context);
            return;
        }
        if (!ACTION_PET.equals(action) && !ACTION_FEED.equals(action)) {
            return;
        }
        long now = System.currentTimeMillis();
        SharedPreferences prefs = context.getSharedPreferences("MascotWidget", 0);
        if (now - prefs.getLong("lastTapAt", 0L) < TAP_DEBOUNCE_MS) {
            return;
        }
        JSONObject load = MascotCore.load(context, now);
        SharedPreferences.Editor edit = prefs.edit().putLong("lastTapAt", now);
        long tipUntil = 0;
        if (ACTION_PET.equals(action)) {
            MascotCore.pet(load, now);
            edit.putLong("hopUntil", HOP_SHOW_MS + now);
            Stats read = Stats.read(context);
            JSONObject react = load.optJSONObject("react");
            if (read.tips.length > 0 && react != null && "pet".equals(react.optString("kind"))) {
                tipUntil = TIP_MS + now;
                edit.putString("tipMsg", read.tips[(int) ((now / 1000) % read.tips.length)]).putLong("tipUntil", tipUntil);
            }
        } else {
            MascotCore.feed(load, now);
            edit.remove("tipUntil").remove("hopUntil");
        }
        edit.apply();
        MascotCore.save(context, load);
        refreshAll(context);
        JSONObject react2 = load.optJSONObject("react");
        long reactUntil = react2 != null ? react2.optLong("until", 0L) : 0L;
        long max = Math.max(reactUntil, tipUntil);
        long hopEnd = !ACTION_PET.equals(action) ? 0L : 1330 + now;
        long nextEnd = max > now ? max + 150 : 0L;
        scheduleRefresh(context, hopEnd, nextEnd);
    }

    static {
        vectorMode = Build.VERSION.SDK_INT >= 31;
        BREATH = new Layers(R.id.mascot_vlayers, R.id.mv_glow, R.id.mv_base, R.id.mv_belly, R.id.mv_front, new int[]{R.id.mv_pat_spots, R.id.mv_pat_dots, R.id.mv_pat_stripes, R.id.mv_pat_speckles}, new int[]{R.id.mv_acc_leaf, R.id.mv_acc_bowtie, R.id.mv_acc_glasses, R.id.mv_acc_headphones, R.id.mv_acc_crown}, new int[]{R.id.mv_face_open, R.id.mv_face_happy, R.id.mv_face_joy, R.id.mv_face_hungry, R.id.mv_face_sleep, R.id.mv_face_eat});
        HOP = new Layers(R.id.mascot_vlayers_hop, R.id.mv_glow_hop, R.id.mv_base_hop, R.id.mv_belly_hop, R.id.mv_front_hop, new int[]{R.id.mv_pat_spots_hop, R.id.mv_pat_dots_hop, R.id.mv_pat_stripes_hop, R.id.mv_pat_speckles_hop}, new int[]{R.id.mv_acc_leaf_hop, R.id.mv_acc_bowtie_hop, R.id.mv_acc_glasses_hop, R.id.mv_acc_headphones_hop, R.id.mv_acc_crown_hop}, new int[]{R.id.mv_face_joy_hop});
        FX = new int[]{R.id.mv_fx_zzz, R.id.mv_fx_heart, R.id.mv_fx_sparkle};
        hopping = false;
        restartLayers = true;
    }

    static void scheduleRefresh(Context context, long j, long j2) {
        final Context applicationContext = context.getApplicationContext();
        Handler handler = HANDLER;
        handler.removeCallbacksAndMessages(null);
        long currentTimeMillis = System.currentTimeMillis();
        Runnable runnable = new Runnable() { // from class: com.focusfrog.app.MascotWidgetProvider$$ExternalSyntheticLambda3
            @Override // java.lang.Runnable
            public final void run() {
                MascotWidgetProvider.lambda$scheduleRefresh$0(applicationContext);
            }
        };
        if (j > currentTimeMillis) {
            handler.postDelayed(runnable, j - currentTimeMillis);
        }
        if (j2 > currentTimeMillis) {
            handler.postDelayed(runnable, j2 - currentTimeMillis);
            try {
                AlarmManager alarmManager = (AlarmManager) applicationContext.getSystemService(NotificationCompat.CATEGORY_ALARM);
                if (alarmManager != null) {
                    alarmManager.set(1, j2 + 1500, broadcast(applicationContext, ACTION_REFRESH, 65));
                }
            } catch (Exception e) {
                Log.w("MascotWidget", "alarme", e);
            }
        }
    }

    static /* synthetic */ void lambda$scheduleRefresh$0(Context context) {
        try {
            refreshAll(context);
        } catch (Exception e) {
            Log.w("MascotWidget", "refresh", e);
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        for (int i : appWidgetManager.getAppWidgetIds(new ComponentName(context, (Class<?>) MascotWidgetProvider.class))) {
            update(context, appWidgetManager, i);
        }
    }

    static final class Stats {
        int fliesBought;
        int focusMin;
        boolean frogDone;
        int sessions;
        int tasks;
        String name = "Sapinho";
        JSONObject look = null;
        int goalMin = 50;
        String scene = "scene_pond";
        String[] tips = new String[0];

        Stats() {
        }

        static Stats read(Context context) {
            Stats stats = new Stats();
            try {
                JSONObject jSONObject = new JSONObject(context.getSharedPreferences(MascotWidgetProvider.PREFS_APP, 0).getString(MascotWidgetProvider.KEY_STATE, "{}"));
                stats.look = jSONObject;
                String trim = jSONObject.optString("name", "").trim();
                if (!trim.isEmpty()) {
                    stats.name = trim;
                }
                stats.goalMin = Math.max(10, jSONObject.optInt("goalMin", 50));
                stats.fliesBought = Math.max(0, jSONObject.optInt("fliesBought", 0));
                stats.scene = jSONObject.optString("scene", "scene_pond");
                JSONArray optJSONArray = jSONObject.optJSONArray("tips");
                if (optJSONArray != null) {
                    stats.tips = new String[optJSONArray.length()];
                    for (int i = 0; i < optJSONArray.length(); i++) {
                        stats.tips[i] = optJSONArray.optString(i, "");
                    }
                }
                if (MascotWidgetProvider.today().equals(jSONObject.optString("date", ""))) {
                    stats.focusMin = jSONObject.optInt("focusMinToday", 0);
                    stats.sessions = jSONObject.optInt("sessionsToday", 0);
                    stats.tasks = jSONObject.optInt("tasksDoneToday", 0);
                    stats.frogDone = jSONObject.optBoolean("frogDone", false);
                }
            } catch (Exception unused) {
            }
            return stats;
        }
    }

    static Mood moodFor(String str) {
        str.hashCode();
        switch (str) {
            case "tickled":
            case "pet":
            case "task":
            case "focus":
                return Mood.HAPPY;
            case "hungry":
            case "missed":
            case "sad":
            case "nofly":
            case "tired":
                return Mood.HUNGRY;
            case "sleepy":
            case "break":
                return Mood.SLEEPY;
            case "streak":
            case "frog":
            case "levelup":
            case "happy":
            case "mission":
                return Mood.PROUD;
            case "eat":
                return Mood.EAT;
            case "combo":
                return Mood.HAPPY;
            default:
                return Mood.NORMAL;
        }
    }

    static MascotArt.Frame[] frames(Mood mood) {
        MascotArt.Frame f;
        MascotArt.Face face;
        MascotArt.Frame[] frameArr = new MascotArt.Frame[24];
        int i = 0;
        while (i < 24) {
            float f2 = i / 24.0f;
            int ordinal = mood.ordinal();
            if (ordinal != 1) {
                if (ordinal == 2) {
                    f = eatFrame(i);
                } else if (ordinal == 3) {
                    f = f(MascotArt.Face.SLEEP).zzz(Math.min(2, (int) (f2 * 3.0f)));
                } else if (ordinal == 4) {
                    if (i == 15) {
                        face = MascotArt.Face.BLINK;
                    } else {
                        face = (i < 16 || i >= 21) ? MascotArt.Face.HUNGRY : MascotArt.Face.LOOKUP;
                    }
                    f = f(face);
                } else if (ordinal == 5) {
                    MascotArt.Frame f3 = f(i == 21 ? MascotArt.Face.BLINK : MascotArt.Face.PROUD);
                    int i2 = (i / 4) % 3;
                    if (i2 == 2) {
                        i2 = -1;
                    }
                    f = f3.sparkle(i2);
                } else {
                    f = f(i == 18 ? MascotArt.Face.BLINK : MascotArt.Face.OPEN);
                }
            } else if (i < 12) {
                f = f(MascotArt.Face.JOY).hearts(i % 8 >= 4 ? 2 : 1);
            } else {
                f = f(i == 21 ? MascotArt.Face.BLINK : MascotArt.Face.HAPPY);
            }
            frameArr[i] = f;
            i++;
        }
        return frameArr;
    }

    private static MascotArt.Frame f(MascotArt.Face face) {
        return new MascotArt.Frame().face(face);
    }

    static MascotArt.Frame eatFrame(int i) {
        if (i < 6) {
            MascotArt.Frame f = f(MascotArt.Face.EAT);
            float[] fArr = FLY_IN[i];
            return f.flyAt(fArr[0], fArr[1]);
        }
        if (i < 8) {
            return f(MascotArt.Face.EAT).flyAt(73.0f, 32.0f).tongue(i == 6 ? 0.55f : 1.0f);
        }
        if (i < 11) {
            float f2 = i == 8 ? 0.66f : i == 9 ? 0.33f : 0.08f;
            return f(MascotArt.Face.EAT).tongue(f2).flyAt((23.0f * f2) + 50.0f, ((-38.0f) * f2) + 70.0f);
        }
        if (i < 22) {
            return f(MascotArt.Face.JOY).sparkle(i < 18 ? (i / 2) % 2 : -1);
        }
        return f(MascotArt.Face.OPEN);
    }

    static int flipMs(Mood mood) {
        int ordinal = mood.ordinal();
        if (ordinal == 1) {
            return 160;
        }
        if (ordinal != 2) {
            return ordinal != 3 ? 120 : 220;
        }
        return 100;
    }

    static int hopMs(Mood mood) {
        return mood == Mood.HAPPY ? 1400 : 3600000;
    }

    static int breathMs(Mood mood) {
        if (mood == Mood.SLEEPY) {
            return 2900;
        }
        Mood mood2 = Mood.HAPPY;
        return 2000;
    }

    static String moodLabel(Mood mood) {
        int ordinal = mood.ordinal();
        if (ordinal == 1) {
            return "Satisfeito";
        }
        if (ordinal == 2) {
            return "Comendo";
        }
        if (ordinal == 3) {
            return "Descansando";
        }
        if (ordinal == 4) {
            return "Com fome";
        }
        if (ordinal == 5) {
            return "Orgulhoso";
        }
        return "Tranquilo";
    }

    static String bubble(Mood mood, Stats stats, int i, int i2) {
        String[] strArr;
        int ordinal = mood.ordinal();
        if (ordinal == 3) {
            strArr = new String[]{"Fim de expediente. Amanhã a gente continua.", "Descansar também faz parte do plano.", "Desliga um pouco. A lagoa espera."};
        } else if (ordinal != 4) {
            if (ordinal == 5) {
                strArr = new String[]{"Sapo do dia feito. O resto é lucro.", "O mais difícil de hoje já foi.", "Bom trabalho. Hoje rendeu."};
            } else if (stats.focusMin >= stats.goalMin) {
                strArr = new String[]{"Meta de foco do dia batida.", stats.focusMin + " min de foco. Dia sólido."};
            } else if (stats.sessions > 0) {
                String str = stats.focusMin + " min de foco hoje. Mais um bloco?";
                StringBuilder sb = new StringBuilder();
                sb.append(stats.sessions);
                sb.append(stats.sessions == 1 ? " foco feito hoje." : " focos feitos hoje.");
                sb.append(" Mantém o ritmo.");
                strArr = new String[]{str, sb.toString()};
            } else {
                strArr = new String[]{"Qual é a primeira coisa de hoje?", "Começa pequeno. Cinco minutos já contam.", "Uma tarefa de cada vez."};
            }
        } else if (i > 0) {
            strArr = new String[]{"Tem mosca guardada. Aceito uma.", "Um lanche cairia bem agora."};
        } else {
            strArr = new String[]{"Sem moscas hoje. Um foco resolve isso.", "25 minutos e eu janto."};
        }
        return strArr[Math.abs(i2) % strArr.length];
    }

    private static PendingIntent broadcast(Context context, String str, int i) {
        return PendingIntent.getBroadcast(context, i, new Intent(context, (Class<?>) MascotWidgetProvider.class).setAction(str).addFlags(268435456), 201326592);
    }

    private static PendingIntent openApp(Context context, String str, int i) {
        Intent intent = new Intent("android.intent.action.VIEW", Uri.parse("focusfrog://open?go=" + str));
        intent.setPackage(context.getPackageName());
        intent.addFlags(805306368);
        return PendingIntent.getActivity(context, i, intent, 201326592);
    }

    static Kind kindFor(float f, float f2) {
        if (f >= 230.0f) {
            return f2 >= 200.0f ? Kind.LARGE : Kind.WIDE;
        }
        if (f2 >= 230.0f && f >= 150.0f) {
            return Kind.TALL;
        }
        return Kind.SMALL;
    }

    static int layoutFor(Kind kind) {
        return kind == Kind.LARGE ? R.layout.widget_mascot_large : kind == Kind.WIDE ? R.layout.widget_mascot : kind == Kind.TALL ? R.layout.widget_mascot_tall : R.layout.widget_mascot_small;
    }

    static int frameBg(String str) {
        return "scene_night".equals(str) ? R.drawable.widget_mascot_frame_night : "scene_sunset".equals(str) ? R.drawable.widget_mascot_frame_sunset : R.drawable.widget_mascot_frame_pond;
    }

    static RemoteViews build(Context context, boolean z) {
        return build(context, z ? Kind.SMALL : Kind.WIDE, null);
    }

    static RemoteViews build(Context context, Kind kind, Bitmap[] bitmapArr) {
        return build(context, kind, bitmapArr, kind == Kind.SMALL ? 120.0f : kind == Kind.TALL ? 170.0f : 300.0f, kind == Kind.WIDE ? 140.0f : 260.0f);
    }

    static final class Snap {
        final int flies;
        final JSONObject life;
        final Mood mood;
        final long now;
        final Stats st;
        final String status;
        final String tip;

        Snap(Context context) {
            long currentTimeMillis = System.currentTimeMillis();
            this.now = currentTimeMillis;
            this.st = Stats.read(context);
            JSONObject load = MascotCore.load(context, currentTimeMillis);
            this.life = load;
            String status = MascotCore.status(load, currentTimeMillis);
            this.status = status;
            this.mood = MascotWidgetProvider.moodFor(status);
            this.flies = Math.max(0, load.optInt("flies"));
            SharedPreferences sharedPreferences = context.getSharedPreferences("MascotWidget", 0);
            this.tip = sharedPreferences.getLong("tipUntil", 0L) > currentTimeMillis ? sharedPreferences.getString("tipMsg", "") : null;
        }
    }

    static RemoteViews build(Context context, Kind kind, Bitmap[] bitmapArr, float f, float f2) {
        return build(context, kind, bitmapArr, f, f2, new Snap(context));
    }

    static RemoteViews build(Context context, Kind kind, Bitmap[] bitmapArr, float f, float f2, Snap snap) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), layoutFor(kind));
        Stats stats = snap.st;
        long j = snap.now;
        JSONObject jSONObject = snap.life;
        String str = snap.status;
        int i = snap.flies;
        Calendar calendar = Calendar.getInstance();
        Mood mood = snap.mood;
        if (vectorMode) {
            applyVector(remoteViews, stats, mood, hopping, restartLayers);
        } else {
            Bitmap[] drawFrames = bitmapArr != null ? bitmapArr : drawFrames(stats, mood);
            int[] iArr = FRAME_IDS;
            for (int i2 = 0; i2 < iArr.length; i2++) {
                remoteViews.setImageViewBitmap(iArr[i2], drawFrames[i2]);
            }
            remoteViews.setInt(R.id.mascot_flipper, "setFlipInterval", flipMs(mood));
            remoteViews.setInt(R.id.mascot_breath, "setFlipInterval", breathMs(mood));
            remoteViews.setInt(R.id.mascot_hop, "setFlipInterval", hopMs(mood));
            if (mood == Mood.HAPPY) {
                remoteViews.showNext(R.id.mascot_hop);
            }
            remoteViews.setDisplayedChild(R.id.mascot_flipper, 0);
        }
        remoteViews.setInt(R.id.mascot_tap, "setBackgroundResource", frameBg(stats.scene));
        remoteViews.setTextViewText(R.id.mascot_feed_text, String.valueOf(i));
        remoteViews.setInt(R.id.mascot_feed, "setBackgroundResource", i > 0 ? R.drawable.widget_btn_fly : R.drawable.widget_btn_fly_empty);
        remoteViews.setTextColor(R.id.mascot_feed_text, i > 0 ? -1245707 : -1712521739);
        remoteViews.setOnClickPendingIntent(R.id.mascot_tap, broadcast(context, ACTION_PET, 61));
        remoteViews.setOnClickPendingIntent(R.id.mascot_feed, broadcast(context, ACTION_FEED, 62));
        remoteViews.setOnClickPendingIntent(R.id.mascot_focus, openApp(context, "focus", 63));
        if (kind != Kind.SMALL) {
            int i3 = (calendar.get(11) * 7) + (calendar.get(12) / 20);
            String speech = snap.tip != null ? snap.tip : MascotCore.speech(jSONObject, str);
            if (speech == null || speech.isEmpty()) {
                speech = (stats.tips.length <= 0 || i3 % 3 == 0) ? bubble(mood, stats, i, i3) : stats.tips[i3 % stats.tips.length];
            }
            remoteViews.setTextViewText(R.id.mascot_bubble, speech);
            float f3 = ((kind == Kind.TALL || kind == Kind.LARGE) ? f : 0.55f * f) / 20.0f;
            float clamp = WidgetKit.clamp(11.0f, f3, 14.0f);
            WidgetKit.fluidText(remoteViews, R.id.mascot_bubble, 11.0f, f3, 14.0f);
            remoteViews.setInt(R.id.mascot_bubble, "setMaxLines", WidgetKit.linesFor((kind == Kind.TALL ? 0.22f : kind == Kind.LARGE ? 0.24f : 0.42f) * f2, clamp, 2, 7));
            WidgetKit.fluidText(remoteViews, R.id.mascot_name, 13.0f, f / 20.0f, 17.0f);
            remoteViews.setTextViewText(R.id.mascot_name, stats.name);
            remoteViews.setTextViewText(R.id.mascot_mood, MascotCore.label(str) + " · Nv " + MascotCore.levelFor(jSONObject.optInt("xp")));
            remoteViews.setOnClickPendingIntent(R.id.mascot_name, openApp(context, "home", 64));
        }
        if (kind == Kind.WIDE || kind == Kind.LARGE) {
            remoteViews.setProgressBar(R.id.mascot_food, 100, (int) Math.round(jSONObject.optDouble("food")), false);
            remoteViews.setProgressBar(R.id.mascot_energy, 100, (int) Math.round(jSONObject.optDouble("energy")), false);
            remoteViews.setProgressBar(R.id.mascot_humor, 100, (int) Math.round(jSONObject.optDouble("mood")), false);
        }
        return remoteViews;
    }

    static final class Layers {
        final int[] accs;
        final int base;
        final int belly;
        final int[] faces;
        final int front;
        final int glow;
        final int[] patterns;
        final int root;

        Layers(int i, int i2, int i3, int i4, int i5, int[] iArr, int[] iArr2, int[] iArr3) {
            this.root = i;
            this.glow = i2;
            this.base = i3;
            this.belly = i4;
            this.front = i5;
            this.patterns = iArr;
            this.accs = iArr2;
            this.faces = iArr3;
        }
    }

    static int faceIndex(Mood mood) {
        int ordinal = mood.ordinal();
        if (ordinal == 1) {
            return 2;
        }
        if (ordinal == 2) {
            return 5;
        }
        if (ordinal == 3) {
            return 4;
        }
        if (ordinal != 4) {
            return ordinal != 5 ? 0 : 1;
        }
        return 3;
    }

    static int fxFor(Mood mood) {
        int ordinal = mood.ordinal();
        if (ordinal == 1) {
            return R.id.mv_fx_heart;
        }
        if (ordinal == 3) {
            return R.id.mv_fx_zzz;
        }
        if (ordinal != 5) {
            return 0;
        }
        return R.id.mv_fx_sparkle;
    }


    static int patternIndex(String str) {
        int z;
        if (str == null) {
            str = "";
        }
        str.hashCode();
        switch (str.hashCode()) {
            case -2132809718:
                if (str.equals("speckles")) {
                    z = 0;
                    break;
                }
                z = -1;
                break;
            case -1881757242:
                if (str.equals("stripes")) {
                    z = 1;
                    break;
                }
                z = -1;
                break;
            case 3089482:
                if (str.equals("dots")) {
                    z = 2;
                    break;
                }
                z = -1;
                break;
            case 109651889:
                if (str.equals("spots")) {
                    z = 3;
                    break;
                }
                z = -1;
                break;
            default:
                z = -1;
                break;
        }
        switch (z) {
            case 0:
                return 3;
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 0;
            default:
                return -1;
        }
    }


    static int accessoryIndex(String str) {
        int z;
        if (str == null) {
            str = "";
        }
        str.hashCode();
        switch (str.hashCode()) {
            case -1805022941:
                if (str.equals("acc_headphones")) {
                    z = 0;
                    break;
                }
                z = -1;
                break;
            case -863030420:
                if (str.equals("acc_glasses")) {
                    z = 1;
                    break;
                }
                z = -1;
                break;
            case 1633556484:
                if (str.equals("acc_bowtie")) {
                    z = 2;
                    break;
                }
                z = -1;
                break;
            case 1993363321:
                if (str.equals("acc_crown")) {
                    z = 3;
                    break;
                }
                z = -1;
                break;
            case 2142767196:
                if (str.equals("acc_leaf")) {
                    z = 4;
                    break;
                }
                z = -1;
                break;
            default:
                z = -1;
                break;
        }
        switch (z) {
            case 0:
                return 3;
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 4;
            case 4:
                return 0;
            default:
                return -1;
        }
    }

    private static void show(RemoteViews remoteViews, int[] iArr, int i) {
        int i2 = 0;
        while (i2 < iArr.length) {
            remoteViews.setViewVisibility(iArr[i2], i2 == i ? 0 : 8);
            i2++;
        }
    }

    private static void tint(RemoteViews remoteViews, int i, int i2) {
        if (Build.VERSION.SDK_INT >= 31) {
            remoteViews.setColorStateList(i, "setIndeterminateTintList", ColorStateList.valueOf(i2));
        }
    }

    static String visualKey(Stats stats, Mood mood, boolean z) {
        MascotArt.Look from = MascotArt.Look.from(stats.look);
        return mood + "|" + z + "|" + from.primary + "|" + from.secondary + "|" + from.accent + "|" + from.patternKind + "|" + from.accessory + "|" + from.special;
    }

    static void applyVector(RemoteViews remoteViews, Stats stats, Mood mood, boolean z, boolean z2) {
        MascotArt.Look from = MascotArt.Look.from(stats.look);
        if (z2) {
            remoteViews.setViewVisibility(R.id.mascot_vstage, 8);
        }
        remoteViews.setViewVisibility(R.id.mascot_vstage, 0);
        boolean z3 = true;
        boolean z4 = mood == Mood.HAPPY && z;
        Layers layers = z4 ? HOP : BREATH;
        Layers layers2 = z4 ? BREATH : HOP;
        remoteViews.setViewVisibility(layers.root, 0);
        remoteViews.setViewVisibility(layers2.root, 8);
        tint(remoteViews, layers.base, from.primary);
        tint(remoteViews, layers.front, from.primary);
        tint(remoteViews, layers.belly, from.secondary);
        int patternIndex = patternIndex(from.patternKind);
        show(remoteViews, layers.patterns, patternIndex);
        if (patternIndex >= 0 && patternIndex < 3) {
            tint(remoteViews, layers.patterns[patternIndex], from.accent);
        }
        if (!"glow".equals(from.special) && !"stars".equals(from.special) && !"rainbow".equals(from.special) && !"crystal".equals(from.special)) {
            z3 = false;
        }
        remoteViews.setViewVisibility(layers.glow, z3 ? 0 : 8);
        if (z3) {
            tint(remoteViews, layers.glow, from.accent);
        }
        show(remoteViews, layers.faces, z4 ? 0 : faceIndex(mood));
        show(remoteViews, layers.accs, accessoryIndex(from.accessory));
        int fxFor = fxFor(mood);
        int[] iArr = FX;
        int length = iArr.length;
        for (int i = 0; i < length; i++) {
            int i2 = iArr[i];
            remoteViews.setViewVisibility(i2, i2 == fxFor ? 0 : 8);
        }
    }

    static Bitmap[] drawFrames(Stats stats, Mood mood) {
        return drawFrames(stats, mood, FRAME_PX);
    }

    static Bitmap[] drawFrames(Stats stats, Mood mood, int i) {
        MascotArt.Look from = MascotArt.Look.from(stats.look);
        MascotArt.Frame[] frames = frames(mood);
        Bitmap[] bitmapArr = new Bitmap[frames.length];
        HashMap hashMap = new HashMap();
        for (int i2 = 0; i2 < frames.length; i2++) {
            String key = frames[i2].key();
            Bitmap bitmap = (Bitmap) hashMap.get(key);
            if (bitmap == null) {
                bitmap = MascotArt.draw(from, frames[i2], i);
                hashMap.put(key, bitmap);
            }
            bitmapArr[i2] = bitmap;
        }
        return bitmapArr;
    }

    static int framePx(Context context) {
        DisplayMetrics displayMetrics = context.getResources().getDisplayMetrics();
        return Math.max(200, Math.min(480, (int) Math.sqrt(((((displayMetrics.widthPixels * displayMetrics.heightPixels) * 4.0d) * 1.5d) * 0.45d) / 24.0d)));
    }

    static Bitmap[] currentFrames(Context context) {
        Stats read = Stats.read(context);
        long currentTimeMillis = System.currentTimeMillis();
        return drawFrames(read, moodFor(MascotCore.status(MascotCore.load(context, currentTimeMillis), currentTimeMillis)), framePx(context));
    }

    private static void update(Context context, AppWidgetManager appWidgetManager, int i) {
        RemoteViews build;
        try {
            Snap snap = new Snap(context);
            Bitmap[] drawFrames = vectorMode ? null : drawFrames(snap.st, snap.mood, framePx(context));
            int i2 = 0;
            if (vectorMode) {
                SharedPreferences sharedPreferences = context.getSharedPreferences("MascotWidget", 0);
                hopping = sharedPreferences.getLong("hopUntil", 0L) > snap.now;
                String visualKey = visualKey(snap.st, snap.mood, hopping && snap.mood == Mood.HAPPY);
                boolean equals = visualKey.equals(sharedPreferences.getString("vkey_" + i, ""));
                restartLayers = true ^ equals;
                if (!equals) {
                    sharedPreferences.edit().putString("vkey_" + i, visualKey).apply();
                }
            }
            if (Build.VERSION.SDK_INT >= 31) {
                HashMap hashMap = new HashMap();
                float[] fArr = WidgetKit.WIDTHS;
                int length = fArr.length;
                int i3 = 0;
                while (i3 < length) {
                    float f = fArr[i3];
                    float[] fArr2 = WidgetKit.HEIGHTS;
                    int length2 = fArr2.length;
                    int i4 = i2;
                    while (i4 < length2) {
                        float f2 = fArr2[i4];
                        hashMap.put(new SizeF(f, f2), build(context, kindFor(f, f2), drawFrames, f, f2, snap));
                        i4++;
                        f = f;
                        length2 = length2;
                        fArr2 = fArr2;
                    }
                    i3++;
                    i2 = 0;
                }
                                build = new RemoteViews((Map) hashMap);
            } else {
                Bundle appWidgetOptions = appWidgetManager.getAppWidgetOptions(i);
                float f3 = appWidgetOptions.getInt("appWidgetMinWidth", 250);
                float f4 = appWidgetOptions.getInt("appWidgetMaxHeight", 120);
                build = build(context, kindFor(f3, f4), drawFrames, f3, f4, snap);
            }
            appWidgetManager.updateAppWidget(i, build);
        } catch (Exception e) {
            Log.e("MascotWidget", "update falhou", e);
        }
    }

    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }
}
