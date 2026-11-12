package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.RemoteViews;
import com.focusfrog.app.WidgetKit;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.json.JSONArray;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class AgendaWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_ITEM = "com.focusfrog.app.AGENDA_WIDGET_ITEM";
    public static final String EXTRA_ID = "agenda_item_id";
    public static final String EXTRA_KIND = "agenda_item_kind";
    static final String KEY_DONE = "agendaWidgetDone";
    static final String KEY_STATE = "agendaWidget";
    static final int MAX_ROWS = 24;
    static final String PREFS_NAME = "CapacitorStorage";

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
        if (ACTION_ITEM.equals(intent.getAction())) {
            String stringExtra = intent.getStringExtra(EXTRA_ID);
            String stringExtra2 = intent.getStringExtra(EXTRA_KIND);
            if (stringExtra == null) {
                return;
            }
            if ("check".equals(stringExtra2)) {
                toggleDone(context, stringExtra);
                refreshAll(context);
                return;
            }
            try {
                Intent intent2 = new Intent("android.intent.action.VIEW", Uri.parse("focusfrog://open?go=" + ("routine".equals(stringExtra2) ? "routine" : "task") + "&id=" + Uri.encode(stringExtra)));
                intent2.setPackage(context.getPackageName());
                intent2.addFlags(805306368);
                context.startActivity(intent2);
            } catch (Exception unused) {
            }
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        for (int i : appWidgetManager.getAppWidgetIds(new ComponentName(context, (Class<?>) AgendaWidgetProvider.class))) {
            update(context, appWidgetManager, i);
        }
    }

    static RemoteViews buildRow(Context context, JSONObject jSONObject, JSONArray jSONArray, int i, int i2, boolean z) {
        PendingIntent openApp;
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_cell);
        String optString = jSONObject.optString("id");
        String optString2 = jSONObject.optString("kind", "open");
        boolean z2 = "check".equals(optString2) && isDone(jSONArray, optString);
        remoteViews.setTextViewText(R.id.w_text, jSONObject.optString(PomodoroForegroundService.EXTRA_TITLE, ""));
        String optString3 = jSONObject.optString("label", "");
        remoteViews.setTextViewText(R.id.w_sub, optString3);
        remoteViews.setViewVisibility(R.id.w_sub, (z || optString3.isEmpty()) ? 8 : 0);
        String optString4 = jSONObject.optString("time", "");
        remoteViews.setTextViewText(R.id.w_time, optString4);
        remoteViews.setViewVisibility(R.id.w_time, optString4.isEmpty() ? 8 : 0);
        if ("check".equals(optString2)) {
            remoteViews.setViewVisibility(R.id.w_check, 0);
            remoteViews.setViewVisibility(R.id.w_go, 8);
            remoteViews.setImageViewResource(R.id.w_check, z2 ? R.drawable.ic_wcheck_on : R.drawable.ic_wcheck_off);
        } else {
            remoteViews.setViewVisibility(R.id.w_check, 8);
            remoteViews.setViewVisibility(R.id.w_go, 0);
            remoteViews.setTextViewText(R.id.w_go, "routine".equals(optString2) ? "+" : "›");
        }
        remoteViews.setInt(R.id.w_text, "setPaintFlags", z2 ? 17 : 1);
        remoteViews.setTextColor(R.id.w_text, z2 ? -9735552 : -789258);
        int i3 = ((i % 1000) * 24) + 7000 + i2;
        if ("check".equals(optString2)) {
            openApp = PendingIntent.getBroadcast(context, i3, new Intent(context, (Class<?>) AgendaWidgetProvider.class).setAction(ACTION_ITEM).putExtra(EXTRA_ID, optString).putExtra(EXTRA_KIND, optString2), 201326592);
        } else {
            openApp = WidgetKit.openApp(context, ("routine".equals(optString2) ? "routine" : "task") + "&id=" + Uri.encode(optString), i3);
        }
        remoteViews.setOnClickPendingIntent(R.id.w_cell, openApp);
        return remoteViews;
    }

    static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    static JSONArray readDone(Context context) {
        try {
            return new JSONArray(context.getSharedPreferences(PREFS_NAME, 0).getString(KEY_DONE, "[]"));
        } catch (Exception unused) {
            return new JSONArray();
        }
    }

    static boolean isDone(JSONArray jSONArray, String str) {
        for (int i = 0; i < jSONArray.length(); i++) {
            if (str.equals(jSONArray.optString(i))) {
                return true;
            }
        }
        return false;
    }

    private static void toggleDone(Context context, String str) {
        JSONArray readDone = readDone(context);
        JSONArray jSONArray = new JSONArray();
        boolean z = false;
        for (int i = 0; i < readDone.length(); i++) {
            String optString = readDone.optString(i);
            if (str.equals(optString)) {
                z = true;
            } else {
                jSONArray.put(optString);
            }
        }
        if (!z) {
            jSONArray.put(str);
        }
        context.getSharedPreferences(PREFS_NAME, 0).edit().putString(KEY_DONE, jSONArray.toString()).apply();
    }

    private static void update(final Context context, AppWidgetManager appWidgetManager, final int i) {
        WidgetKit.push(context, appWidgetManager, i, new WidgetKit.Builder() { // from class: com.focusfrog.app.AgendaWidgetProvider$$ExternalSyntheticLambda0
            @Override // com.focusfrog.app.WidgetKit.Builder
            public final RemoteViews build(float f, float f2) {
                RemoteViews build;
                build = AgendaWidgetProvider.build(context, i, f, f2);
                return build;
            }
        }, "AgendaWidget");
    }


    public static RemoteViews build(Context context, int i, float f, float f2) {
        JSONObject jSONObject;
        String str;
        RemoteViews remoteViews;
        int i2;
        int i3;
        float f3;
        String str2;
        JSONArray jSONArray;
        int i4;
        String str3;
        int i5;
        int i6;
        String str4;
        int i7;
        String str5;
        String sb;
        Context context2 = context;
        RemoteViews remoteViews2 = new RemoteViews(context.getPackageName(), R.layout.widget_list);
        try {
            jSONObject = new JSONObject(context2.getSharedPreferences(PREFS_NAME, 0).getString(KEY_STATE, "{}"));
        } catch (Exception unused) {
            jSONObject = new JSONObject();
        }
        JSONArray optJSONArray = jSONObject.optJSONArray("items");
        int length = optJSONArray == null ? 0 : optJSONArray.length();
        JSONArray readDone = readDone(context);
        int i8 = 0;
        for (int i9 = 0; i9 < length; i9++) {
            JSONObject optJSONObject = optJSONArray.optJSONObject(i9);
            if (optJSONObject != null && isDone(readDone, optJSONObject.optString("id"))) {
                i8++;
            }
        }
        boolean equals = today().equals(jSONObject.optString("date", ""));
        remoteViews2.setTextViewText(R.id.w_title, "AGENDA DE HOJE");
        remoteViews2.setViewVisibility(R.id.w_title, f < 150.0f ? 8 : 0);
        remoteViews2.setTextViewText(R.id.w_count, length > 0 ? i8 + "/" + length : "");
        remoteViews2.setImageViewResource(R.id.w_action, R.drawable.ic_widget_plus);
        remoteViews2.setContentDescription(R.id.w_action, "Anotar no Despejo mental");
        int i10 = i * 10;
        remoteViews2.setOnClickPendingIntent(R.id.w_action, WidgetKit.openApp(context2, "dump", i10 + 5202));
        String str6 = "home";
        remoteViews2.setOnClickPendingIntent(R.id.w_head, WidgetKit.openApp(context2, "home", i10 + 5201));
        remoteViews2.removeAllViews(R.id.w_list);
        if (length == 0 || !equals) {
            remoteViews2.setViewVisibility(R.id.w_list, 8);
            remoteViews2.setViewVisibility(R.id.w_empty, 0);
            remoteViews2.setTextViewText(R.id.w_empty, !equals ? "Abra o app pra atualizar o dia" : "Nada pra hoje. Toque no + pra anotar algo.");
            remoteViews2.setOnClickPendingIntent(R.id.w_empty, WidgetKit.openApp(context2, "home", i10 + 5203));
            return remoteViews2;
        }
        remoteViews2.setViewVisibility(R.id.w_list, 0);
        remoteViews2.setViewVisibility(R.id.w_empty, 8);
        boolean z = f2 < 150.0f;
        int i11 = f >= 300.0f ? 2 : 1;
        float f4 = f / i11;
        float f5 = f4 / 15.0f;
        float clamp = WidgetKit.clamp(12.0f, f5, 15.0f);
        float[] fArr = new float[length];
        int i12 = 0;
        while (true) {
            str = PomodoroForegroundService.EXTRA_TITLE;
            remoteViews = remoteViews2;
            if (i12 >= length) {
                break;
            }
            float f6 = f5;
            JSONObject optJSONObject2 = optJSONArray.optJSONObject(i12);
            if (optJSONObject2 == null) {
                sb = "";
                i7 = i10;
                str4 = str6;
            } else {
                str4 = str6;
                StringBuilder sb2 = new StringBuilder();
                if (f4 >= 170.0f || optJSONObject2.optString("time", "").isEmpty()) {
                    i7 = i10;
                    str5 = "";
                } else {
                    i7 = i10;
                    str5 = optJSONObject2.optString("time") + " · ";
                }
                sb2.append(str5);
                sb2.append(optJSONObject2.optString(PomodoroForegroundService.EXTRA_TITLE, ""));
                sb = sb2.toString();
            }
            fArr[i12] = WidgetKit.cellDp(sb, (z || optJSONObject2 == null || optJSONObject2.optString("label", "").isEmpty()) ? false : true, f4, clamp, f4 < 170.0f);
            i12++;
            remoteViews2 = remoteViews;
            f5 = f6;
            str6 = str4;
            i10 = i7;
        }
        float f7 = f5;
        int i13 = i10;
        String str7 = str6;
        int min = Math.min(24, WidgetKit.fitCells(fArr, i11, WidgetKit.listSpace(f2)));
        boolean z2 = length > min;
        int min2 = (!z2 || min <= 1) ? Math.min(length, min) : min - 1;
        int i14 = (!z2 || min <= 1) ? min2 : min;
        float stretch = WidgetKit.stretch(fArr, i11, i14, WidgetKit.listSpace(f2));
        int i15 = 0;
        while (true) {
            int i16 = i15 * i11;
            if (i16 >= i14) {
                return remoteViews;
            }
            int i17 = length;
            RemoteViews row = WidgetKit.row(context2, stretch);
            int i18 = 0;
            while (i18 < i11) {
                int i19 = i11;
                int i20 = i16 + i18;
                if (i20 < min2) {
                    int i21 = i18;
                    JSONObject optJSONObject3 = optJSONArray.optJSONObject(i20);
                    i2 = i16;
                    if (optJSONObject3 != null) {
                        jSONArray = optJSONArray;
                        i3 = i14;
                        i6 = min2;
                        f3 = f4;
                        String str8 = str;
                        RemoteViews buildRow = buildRow(context, optJSONObject3, readDone, i, i20, z);
                        WidgetKit.fluidText(buildRow, R.id.w_text, 12.0f, Math.min(1.15f, stretch) * f7, Math.min(1.15f, stretch) * 15.0f);
                        WidgetKit.fluidText(buildRow, R.id.w_sub, 10.5f, f3 / 22.0f, 12.0f);
                        WidgetKit.fillCell(buildRow, R.id.w_cell, stretch);
                        buildRow.setInt(R.id.w_text, "setMaxLines", f3 < 170.0f ? 2 : 1);
                        String optString = optJSONObject3.optString("time", "");
                        if (f3 >= 170.0f || optString.isEmpty()) {
                            str2 = str8;
                        } else {
                            buildRow.setViewVisibility(R.id.w_time, 8);
                            int i22 = R.id.w_text;
                            StringBuilder sb3 = new StringBuilder();
                            sb3.append(optString);
                            sb3.append(" · ");
                            str2 = str8;
                            sb3.append(optJSONObject3.optString(str2, ""));
                            buildRow.setTextViewText(i22, sb3.toString());
                        }
                        row.addView(R.id.w_row, buildRow);
                    } else {
                        i3 = i14;
                        i6 = min2;
                        f3 = f4;
                        str2 = str;
                        jSONArray = optJSONArray;
                    }
                    i4 = i21;
                    str3 = str7;
                    i5 = i13;
                } else {
                    i2 = i16;
                    i3 = i14;
                    int i23 = min2;
                    f3 = f4;
                    str2 = str;
                    int i24 = i18;
                    jSONArray = optJSONArray;
                    if (i20 == i23 && z2 && min > 1) {
                        RemoteViews remoteViews3 = new RemoteViews(context.getPackageName(), R.layout.widget_more_cell);
                        remoteViews3.setTextViewText(R.id.w_more, "+" + (i17 - i23) + " no app");
                        i5 = i13;
                        i4 = i24;
                        str3 = str7;
                        remoteViews3.setOnClickPendingIntent(R.id.w_more, WidgetKit.openApp(context, str3, i5 + 5204));
                        row.addView(R.id.w_row, remoteViews3);
                        i6 = i23;
                    } else {
                        i4 = i24;
                        str3 = str7;
                        i5 = i13;
                        i6 = i23;
                        row.addView(R.id.w_row, new RemoteViews(context.getPackageName(), R.layout.widget_cell_blank));
                    }
                }
                i18 = i4 + 1;
                i13 = i5;
                str7 = str3;
                i11 = i19;
                i16 = i2;
                optJSONArray = jSONArray;
                min2 = i6;
                f4 = f3;
                str = str2;
                i14 = i3;
            }
            remoteViews.addView(R.id.w_list, row);
            i15++;
            context2 = context;
            length = i17;
            optJSONArray = optJSONArray;
            min2 = min2;
            f4 = f4;
            str = str;
            i14 = i14;
        }
    }
}
