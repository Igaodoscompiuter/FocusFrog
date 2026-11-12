package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.os.SystemClock;
import android.util.Log;
import android.widget.RemoteViews;
import androidx.core.view.accessibility.AccessibilityNodeInfoCompat;
import com.focusfrog.app.MascotArt;
import com.focusfrog.app.WidgetKit;
import com.getcapacitor.PluginMethod;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashSet;
import java.util.Locale;
import java.util.Set;
import org.json.JSONArray;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class FrogWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_DONE = "com.focusfrog.app.FROG_WIDGET_DONE";
    public static final String ACTION_REST = "com.focusfrog.app.FROG_WIDGET_REST";
    public static final String ACTION_STEP = "com.focusfrog.app.FROG_WIDGET_STEP";
    private static final String EXTRA_STEP = "step_id";
    static final String KEY_PENDING = "frogWidgetPending";
    private static final String KEY_REST = "frogWidgetRest";
    private static final String KEY_STATE = "frogWidget";
    private static final String PREFS_NAME = "CapacitorStorage";

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
        SharedPreferences sharedPreferences = context.getSharedPreferences(PREFS_NAME, 0);
        if (ACTION_REST.equals(action)) {
            sharedPreferences.edit().putString(KEY_REST, today()).apply();
            refreshAll(context);
            return;
        }
        if (ACTION_STEP.equals(action) || ACTION_DONE.equals(action)) {
            String optString = readState(sharedPreferences).optString("id", "");
            if (optString.isEmpty()) {
                return;
            }
            JSONObject readPending = readPending(sharedPreferences, optString);
            try {
                if (ACTION_STEP.equals(action)) {
                    String stringExtra = intent.getStringExtra(EXTRA_STEP);
                    if (stringExtra == null) {
                        return;
                    }
                    JSONArray optJSONArray = readPending.optJSONArray("toggled");
                    JSONArray jSONArray = new JSONArray();
                    boolean z = false;
                    for (int i = 0; optJSONArray != null && i < optJSONArray.length(); i++) {
                        if (stringExtra.equals(optJSONArray.optString(i))) {
                            z = true;
                        } else {
                            jSONArray.put(optJSONArray.optString(i));
                        }
                    }
                    if (!z) {
                        jSONArray.put(stringExtra);
                    }
                    readPending.put("toggled", jSONArray);
                } else {
                    readPending.put("complete", true);
                }
                readPending.put("taskId", optString);
                sharedPreferences.edit().putString(KEY_PENDING, readPending.toString()).apply();
            } catch (Exception unused) {
            }
            refreshAll(context);
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        for (int i : appWidgetManager.getAppWidgetIds(new ComponentName(context, (Class<?>) FrogWidgetProvider.class))) {
            update(context, appWidgetManager, i);
        }
    }

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static JSONObject readState(SharedPreferences sharedPreferences) {
        try {
            return new JSONObject(sharedPreferences.getString(KEY_STATE, "{}"));
        } catch (Exception unused) {
            return new JSONObject();
        }
    }

    private static JSONObject readPending(SharedPreferences sharedPreferences, String str) {
        try {
            JSONObject jSONObject = new JSONObject(sharedPreferences.getString(KEY_PENDING, "{}"));
            return str.equals(jSONObject.optString("taskId")) ? jSONObject : new JSONObject();
        } catch (Exception unused) {
            return new JSONObject();
        }
    }

    private static MascotArt.Look mascotLook(SharedPreferences sharedPreferences) {
        try {
            return MascotArt.Look.from(new JSONObject(sharedPreferences.getString("mascotWidget", "{}")));
        } catch (Exception unused) {
            return MascotArt.Look.from(null);
        }
    }

    private static void update(final Context context, AppWidgetManager appWidgetManager, final int i) {
        WidgetKit.push(context, appWidgetManager, i, new WidgetKit.Builder() { // from class: com.focusfrog.app.FrogWidgetProvider$$ExternalSyntheticLambda1
            @Override // com.focusfrog.app.WidgetKit.Builder
            public final RemoteViews build(float f, float f2) {
                RemoteViews build;
                build = FrogWidgetProvider.build(context, i, f, f2);
                return build;
            }
        }, "FrogWidget");
    }

    public static RemoteViews build(Context context, int i, float f, float f2) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_frog);
        SharedPreferences sharedPreferences = context.getSharedPreferences(PREFS_NAME, 0);
        JSONObject readState = new JSONObject();
        JSONObject readPending = new JSONObject();
        String optString = PluginMethod.RETURN_NONE;
        try {
            readState = readState(sharedPreferences);
            optString = readState.optString("state", PluginMethod.RETURN_NONE);
            readPending = readPending(sharedPreferences, readState.optString("id", ""));
            if (!"active".equals(optString) && !today().equals(readState.optString("date", ""))) {
                optString = PluginMethod.RETURN_NONE;
            }
            if ("active".equals(optString) && readPending.optBoolean("complete", false)) {
                optString = "done";
            }
            if ("done".equals(optString) && today().equals(sharedPreferences.getString(KEY_REST, ""))) {
                optString = "rest";
            }
        } catch (Exception e) {
            Log.e("FrogWidget", "build falhou", e);
        }
        boolean compact = !(f >= 180.0f && f2 >= 130.0f);
        float density = context.getResources().getDisplayMetrics().density;
        int pad = Math.round((f2 < 160.0f ? 8.0f : 14.0f) * density);
        remoteViews.setViewPadding(R.id.frog_root, pad, pad, pad, pad);
        if (f2 < 118.0f && Build.VERSION.SDK_INT >= 31) {
            remoteViews.setViewLayoutHeight(R.id.frog_btn_row, 32.0f, 1);
        }
        boolean active = "active".equals(optString);
        remoteViews.setViewVisibility(R.id.frog_state_active, active ? 0 : 8);
        remoteViews.setViewVisibility(R.id.frog_state_empty, PluginMethod.RETURN_NONE.equals(optString) ? 0 : 8);
        remoteViews.setViewVisibility(R.id.frog_state_done, "done".equals(optString) ? 0 : 8);
        remoteViews.setViewVisibility(R.id.frog_state_rest, "rest".equals(optString) ? 0 : 8);
        remoteViews.setInt(R.id.frog_root, "setBackgroundResource", active ? R.drawable.widget_frog_bg : R.drawable.widget_frog_bg_idle);
        if (active) {
            buildActive(context, remoteViews, readState, readPending, i, f, f2, compact);
            return remoteViews;
        }
        MascotArt.Look mascotLook = mascotLook(sharedPreferences);
        int artVis = f < 200.0f ? 8 : 0;
        remoteViews.setViewVisibility(R.id.frog_art_done, artVis);
        remoteViews.setViewVisibility(R.id.frog_art_empty, artVis);
        remoteViews.setViewVisibility(R.id.frog_art_rest, artVis);
        if ("done".equals(optString)) {
            if (artVis == 0) {
                remoteViews.setImageViewBitmap(R.id.frog_art_done, MascotArt.draw(mascotLook, new MascotArt.Frame().face(MascotArt.Face.PROUD).sparkle(1), 200));
            }
            remoteViews.setTextViewText(R.id.frog_done_title, readState.optString(PomodoroForegroundService.EXTRA_TITLE, ""));
            remoteViews.setOnClickPendingIntent(R.id.frog_btn_another, WidgetKit.openApp(context, "frog", 43));
            remoteViews.setOnClickPendingIntent(R.id.frog_btn_rest, PendingIntent.getBroadcast(context, 44, new Intent(context, (Class<?>) FrogWidgetProvider.class).setAction(ACTION_REST), 201326592));
            remoteViews.setViewVisibility(R.id.frog_btn_rest, f2 < 160.0f ? 8 : 0);
        } else if (PluginMethod.RETURN_NONE.equals(optString)) {
            if (artVis == 0) {
                remoteViews.setImageViewBitmap(R.id.frog_art_empty, MascotArt.draw(mascotLook, new MascotArt.Frame().face(MascotArt.Face.LOOKUP), 200));
            }
            remoteViews.setOnClickPendingIntent(R.id.frog_btn_choose, WidgetKit.openApp(context, "frog", 45));
            remoteViews.setViewVisibility(R.id.frog_empty_q, (f2 < 150.0f && f < 200.0f) ? 8 : 0);
            remoteViews.setOnClickPendingIntent(R.id.frog_root, WidgetKit.openApp(context, "frog", 46));
        } else {
            if (artVis == 0) {
                remoteViews.setImageViewBitmap(R.id.frog_art_rest, MascotArt.draw(mascotLook, new MascotArt.Frame().face(MascotArt.Face.SLEEP).zzz(1), 200));
            }
            remoteViews.setOnClickPendingIntent(R.id.frog_root, WidgetKit.openApp(context, "home", 47));
        }
        return remoteViews;
    }

    private static void buildActive(Context context, RemoteViews remoteViews, JSONObject jSONObject, JSONObject jSONObject2, int i, float f, float f2, boolean z) {
        long j;
        int i2;
        JSONObject jSONObject3;
        String str;
        int i3;
        boolean z2;
        PendingIntent openApp;
        JSONArray jSONArray;
        String str2;
        String str3 = "id";
        String optString = jSONObject.optString("id", "");
        remoteViews.setTextViewText(R.id.frog_title, jSONObject.optString(PomodoroForegroundService.EXTRA_TITLE, "Sapo do Dia"));
        String optString2 = jSONObject.optString("badge", "");
        remoteViews.setViewVisibility(R.id.frog_badge, (optString2.isEmpty() || f < 200.0f) ? 8 : 0);
        remoteViews.setTextViewText(R.id.frog_badge, optString2);
        JSONArray optJSONArray = jSONObject.optJSONArray("steps");
        HashSet hashSet = new HashSet();
        JSONArray optJSONArray2 = jSONObject2.optJSONArray("toggled");
        for (int i4 = 0; optJSONArray2 != null && i4 < optJSONArray2.length(); i4++) {
            hashSet.add(optJSONArray2.optString(i4));
        }
        int optInt = optJSONArray == null ? jSONObject.optInt("total", 0) : optJSONArray.length();
        int i5 = 0;
        for (int i6 = 0; optJSONArray != null && i6 < optJSONArray.length(); i6++) {
            JSONObject optJSONObject = optJSONArray.optJSONObject(i6);
            if (optJSONObject != null) {
                if (hashSet.contains(optJSONObject.optString("id")) ^ optJSONObject.optBoolean("completed")) {
                    i5++;
                }
            }
        }
        if (optJSONArray == null) {
            i5 = jSONObject.optInt("done", 0);
        }
        boolean z3 = optInt > 0 && i5 == optInt;
        long currentTimeMillis = System.currentTimeMillis();
        boolean z4 = z3;
        long optLong = jSONObject.optLong("focusEndsAt", 0L);
        boolean z5 = optLong > currentTimeMillis;
        j = optLong;
        i2 = WidgetKit.linesFor(f2 - 112.0f, WidgetKit.clamp(14.0f, f / 17.0f, 19.0f), 1, 3);
        remoteViews.setInt(R.id.frog_title, "setMaxLines", i2);
        int i7 = i5;
        WidgetKit.fluidText(remoteViews, R.id.frog_title, 14.0f, f / 17.0f, 19.0f);
        WidgetKit.fluidText(remoteViews, R.id.frog_btn_open, 12.5f, f / 21.0f, 15.0f);
        WidgetKit.fluidText(remoteViews, R.id.frog_next, 11.5f, f / 26.0f, 13.0f);
        int floor = (z || z5 || optJSONArray == null) ? 0 : (int) Math.floor((f2 - ((((((WidgetKit.clamp(14.0f, f / 17.0f, 19.0f) * 1.3f) * i2) + 28.0f) + 46.0f) + 18.0f) + 6.0f)) / 33.0f);
        remoteViews.removeAllViews(R.id.frog_steps_list);
        if (floor > 0 && optInt > 0) {
            JSONArray jSONArray2 = new JSONArray();
            int i8 = 0;
            while (i8 < 2) {
                int i9 = 0;
                while (i9 < optJSONArray.length()) {
                    JSONObject optJSONObject2 = optJSONArray.optJSONObject(i9);
                    if (optJSONObject2 == null) {
                        str2 = str3;
                        jSONArray = optJSONArray;
                    } else {
                        jSONArray = optJSONArray;
                        str2 = str3;
                        if ((i8 == 0) != (optJSONObject2.optBoolean("completed") ^ hashSet.contains(optJSONObject2.optString(str3)))) {
                            jSONArray2.put(optJSONObject2);
                        }
                    }
                    i9++;
                    str3 = str2;
                    optJSONArray = jSONArray;
                }
                i8++;
            }
            int min = Math.min(jSONArray2.length(), floor);
            if (jSONArray2.length() > floor && floor >= 2) {
                min = floor - 1;
            }
            int i10 = 0;
            while (i10 < min) {
                RemoteViews stepRow = stepRow(context, jSONArray2.optJSONObject(i10), hashSet, i, i10);
                WidgetKit.fluidText(stepRow, R.id.fs_text, 12.0f, f / 24.0f, 14.0f);
                remoteViews.addView(R.id.frog_steps_list, stepRow);
                i10++;
                hashSet = hashSet;
            }
            if (jSONArray2.length() > min && floor >= 2) {
                RemoteViews remoteViews2 = new RemoteViews(context.getPackageName(), R.layout.widget_more);
                remoteViews2.setTextViewText(R.id.w_more, "+" + (jSONArray2.length() - min) + " passos");
                remoteViews2.setOnClickPendingIntent(R.id.w_more, WidgetKit.openApp(context, "task&id=" + Uri.encode(optString), i + 4900));
                remoteViews.addView(R.id.frog_steps_list, remoteViews2);
            }
            remoteViews.setViewVisibility(R.id.frog_steps_list, 0);
            remoteViews.setViewVisibility(R.id.frog_next, 8);
            jSONObject3 = jSONObject;
            str = "";
        } else {
            remoteViews.setViewVisibility(R.id.frog_steps_list, 8);
            jSONObject3 = jSONObject;
            str = "";
            String optString3 = jSONObject3.optString("next", str);
            remoteViews.setViewVisibility(R.id.frog_next, (optString3.isEmpty() || z || f2 < 150.0f) ? 8 : 0);
            remoteViews.setTextViewText(R.id.frog_next, optString3);
        }
        if (optInt > 0 && !z && !z5) {
            remoteViews.setViewVisibility(R.id.frog_steps_row, 0);
            remoteViews.setProgressBar(R.id.frog_progress, 100, Math.round((i7 * 100.0f) / optInt), false);
            remoteViews.setTextViewText(R.id.frog_steps, i7 + "/" + optInt);
        } else {
            remoteViews.setViewVisibility(R.id.frog_steps_row, 8);
            if (optInt > 0 && !z5 && f >= 150.0f) {
                remoteViews.setTextViewText(R.id.frog_badge, i7 + "/" + optInt);
                remoteViews.setViewVisibility(R.id.frog_badge, 0);
            }
        }
        boolean z6 = optInt == 0 || z4;
        PendingIntent broadcast = WidgetKit.broadcast(context, FrogWidgetProvider.class, ACTION_DONE, i + 4800, null, null);
        boolean optBoolean = jSONObject3.optBoolean("focusable", false);
        if (z5) {
            remoteViews.setViewVisibility(R.id.frog_timer_row, 0);
            remoteViews.setChronometer(R.id.frog_timer, SystemClock.elapsedRealtime() + (j - currentTimeMillis), null, true);
            remoteViews.setChronometerCountDown(R.id.frog_timer, true);
            remoteViews.setTextViewText(R.id.frog_btn_open, "Ver foco");
            openApp = WidgetKit.openApp(context, "focus", 41);
            z2 = true;
            i3 = 8;
        } else {
            remoteViews.setViewVisibility(R.id.frog_timer_row, 8);
            i3 = 8;
            z2 = true;
            remoteViews.setChronometer(R.id.frog_timer, SystemClock.elapsedRealtime(), null, false);
            String optString4 = jSONObject3.optString("cta", str);
            if (optBoolean && !z4) {
                int i11 = R.id.frog_btn_open;
                StringBuilder sb = new StringBuilder("▶ ");
                if (optString4.isEmpty() || f < 180.0f) {
                    optString4 = "Focar";
                }
                sb.append(optString4);
                remoteViews.setTextViewText(i11, sb.toString());
                openApp = WidgetKit.openApp(context, "focustask&id=" + Uri.encode(optString), 41);
            } else if (z6) {
                remoteViews.setTextViewText(R.id.frog_btn_open, "✓ Concluir");
                openApp = broadcast;
            } else {
                remoteViews.setTextViewText(R.id.frog_btn_open, "Ver passos");
                openApp = WidgetKit.openApp(context, "task&id=" + Uri.encode(optString), 41);
            }
        }
        remoteViews.setOnClickPendingIntent(R.id.frog_btn_open, openApp);
        remoteViews.setViewVisibility(R.id.frog_btn_done, (!((z5 || !z6 || !optBoolean) ? false : z2) || openApp == broadcast) ? i3 : 0);
        remoteViews.setOnClickPendingIntent(R.id.frog_btn_done, broadcast);
        remoteViews.setOnClickPendingIntent(R.id.frog_title, WidgetKit.openApp(context, "home", 42));
    }

    private static RemoteViews stepRow(Context context, JSONObject jSONObject, Set<String> set, int i, int i2) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_frog_step);
        boolean contains = set.contains(jSONObject.optString("id")) ^ jSONObject.optBoolean("completed");
        remoteViews.setTextViewText(R.id.fs_text, jSONObject.optString("text", ""));
        remoteViews.setImageViewResource(R.id.fs_check, contains ? R.drawable.ic_wcheck_on : R.drawable.ic_wcheck_off);
        remoteViews.setInt(R.id.fs_text, "setPaintFlags", contains ? 17 : 1);
        remoteViews.setTextColor(R.id.fs_text, contains ? -9735552 : -789258);
        int optInt = jSONObject.optInt("minutes", 0);
        remoteViews.setViewVisibility(R.id.fs_min, optInt <= 0 ? 8 : 0);
        remoteViews.setTextViewText(R.id.fs_min, optInt + " min");
        remoteViews.setOnClickPendingIntent(R.id.fs_row, WidgetKit.broadcast(context, FrogWidgetProvider.class, ACTION_STEP, ((i % 500) * 32) + AccessibilityNodeInfoCompat.EXTRA_DATA_TEXT_CHARACTER_LOCATION_ARG_MAX_LENGTH + i2, EXTRA_STEP, jSONObject.optString("id")));
        return remoteViews;
    }
}
