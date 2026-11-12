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


    public static RemoteViews build(final Context context, final int i, float f, float f2) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_list);
        JSONObject state;
        try {
            state = new JSONObject(context.getSharedPreferences(PREFS_NAME, 0).getString(KEY_STATE, "{}"));
        } catch (Exception unused) {
            state = new JSONObject();
        }
        final JSONArray items = state.optJSONArray("items") == null ? new JSONArray() : state.optJSONArray("items");
        int length = items.length();
        final JSONArray readDone = readDone(context);
        int done = 0;
        for (int k = 0; k < length; k++) {
            JSONObject o = items.optJSONObject(k);
            if (o != null && isDone(readDone, o.optString("id"))) {
                done++;
            }
        }
        boolean fresh = today().equals(state.optString("date", ""));
        remoteViews.setTextViewText(R.id.w_title, "AGENDA DE HOJE");
        remoteViews.setViewVisibility(R.id.w_title, f < 200.0f ? 8 : 0);
        remoteViews.setImageViewResource(R.id.w_action, R.drawable.ic_widget_plus);
        remoteViews.setContentDescription(R.id.w_action, "Anotar no Despejo mental");
        int base = i * 10;
        remoteViews.setOnClickPendingIntent(R.id.w_action, WidgetKit.openApp(context, "dump", base + 5202));
        remoteViews.setOnClickPendingIntent(R.id.w_head, WidgetKit.openApp(context, "home", base + 5201));
        remoteViews.removeAllViews(R.id.w_list);
        if (length == 0 || !fresh) {
            remoteViews.setTextViewText(R.id.w_count, "");
            remoteViews.setViewVisibility(R.id.w_list, 8);
            remoteViews.setViewVisibility(R.id.w_empty, 0);
            remoteViews.setTextViewText(R.id.w_empty, !fresh ? "Abra o app pra atualizar o dia" : "Nada pra hoje. Toque no + pra anotar algo.");
            remoteViews.setOnClickPendingIntent(R.id.w_empty, WidgetKit.openApp(context, "home", base + 5203));
            return remoteViews;
        }
        remoteViews.setViewVisibility(R.id.w_list, 0);
        remoteViews.setViewVisibility(R.id.w_empty, 8);
        final int cols = WidgetKit.colsFor(f, 110.0f);
        final float cellW = f / cols;
        final float baseFont = WidgetKit.clamp(12.0f, cellW / 15.0f, 15.0f);
        final boolean narrow = cellW < 170.0f;
        final boolean hideSub = f2 < 150.0f || narrow;
        float[] heights = new float[Math.min(length, MAX_ROWS)];
        for (int k = 0; k < heights.length; k++) {
            JSONObject o = items.optJSONObject(k);
            String text = "";
            boolean sub = false;
            if (o != null) {
                String time = o.optString("time", "");
                text = (narrow && !time.isEmpty() ? time + " · " : "") + o.optString(PomodoroForegroundService.EXTRA_TITLE, "");
                sub = !hideSub && !o.optString("label", "").isEmpty();
            }
            heights[k] = WidgetKit.cellDp(text, sub, cellW, baseFont, narrow);
        }
        WidgetKit.Plan plan = WidgetKit.plan(heights, cols, WidgetKit.listSpace(f2));
        remoteViews.setTextViewText(R.id.w_count, WidgetKit.counter(done, length, length - plan.shown, f));
        final float fontScale = cellW / 15.0f;
        WidgetKit.fillGrid(context, remoteViews, R.id.w_list, plan, new WidgetKit.CellBinder() {
            @Override
            public RemoteViews cell(int index, float stretch) {
                JSONObject o = items.optJSONObject(index);
                if (o == null) {
                    return new RemoteViews(context.getPackageName(), R.layout.widget_cell_blank);
                }
                RemoteViews cell = buildRow(context, o, readDone, i, index, hideSub);
                float grow = Math.min(1.15f, stretch);
                WidgetKit.fluidText(cell, R.id.w_text, 12.0f, fontScale * grow, 15.0f * grow);
                WidgetKit.fluidText(cell, R.id.w_sub, 10.5f, cellW / 22.0f, 12.0f);
                WidgetKit.fillCell(cell, R.id.w_cell, stretch);
                cell.setInt(R.id.w_text, "setMaxLines", narrow ? 2 : 1);
                if (cellW < 130.0f) {
                    cell.setViewVisibility(R.id.w_check, 8);
                }
                String time = o.optString("time", "");
                if (narrow && !time.isEmpty()) {
                    cell.setViewVisibility(R.id.w_time, 8);
                    cell.setTextViewText(R.id.w_text, time + " · " + o.optString(PomodoroForegroundService.EXTRA_TITLE, ""));
                }
                return cell;
            }
        });
        return remoteViews;
    }
}
