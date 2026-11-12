package com.focusfrog.app;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.widget.RemoteViews;
import com.focusfrog.app.WidgetKit;
import org.json.JSONArray;
import org.json.JSONObject;

/* loaded from: classes.dex */
public class ChecklistWidgetProvider extends AppWidgetProvider {
    public static final String ACTION_RESET_ALL = "com.focusfrog.app.WIDGET_RESET_ALL";
    public static final String ACTION_TOGGLE = "com.focusfrog.app.WIDGET_TOGGLE_ITEM";
    public static final String EXTRA_ITEM_ID = "item_id";
    private static final String PREFS_KEY = "leavingHomeItems";
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
        if (ACTION_TOGGLE.equals(intent.getAction())) {
            String stringExtra = intent.getStringExtra(EXTRA_ITEM_ID);
            if (stringExtra != null) {
                toggleItem(context, stringExtra);
            }
            refreshAll(context);
            return;
        }
        if (ACTION_RESET_ALL.equals(intent.getAction())) {
            resetAllItems(context);
            refreshAll(context);
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        for (int i : appWidgetManager.getAppWidgetIds(new ComponentName(context, (Class<?>) ChecklistWidgetProvider.class))) {
            update(context, appWidgetManager, i);
        }
    }

    static JSONArray readItems(Context context) {
        try {
            return new JSONArray(context.getSharedPreferences(PREFS_NAME, 0).getString(PREFS_KEY, "[]"));
        } catch (Exception unused) {
            return new JSONArray();
        }
    }

    private static void write(Context context, JSONArray jSONArray) {
        context.getSharedPreferences(PREFS_NAME, 0).edit().putString(PREFS_KEY, jSONArray.toString()).apply();
    }

    private static void resetAllItems(Context context) {
        try {
            JSONArray readItems = readItems(context);
            for (int i = 0; i < readItems.length(); i++) {
                readItems.getJSONObject(i).put("completed", false);
            }
            write(context, readItems);
        } catch (Exception unused) {
        }
    }

    private static void toggleItem(Context context, String str) {
        try {
            JSONArray readItems = readItems(context);
            int i = 0;
            while (true) {
                if (i >= readItems.length()) {
                    break;
                }
                JSONObject jSONObject = readItems.getJSONObject(i);
                if (str.equals(jSONObject.optString("id"))) {
                    jSONObject.put("completed", !jSONObject.optBoolean("completed", false));
                    break;
                }
                i++;
            }
            write(context, readItems);
        } catch (Exception unused) {
        }
    }

    private static void update(final Context context, AppWidgetManager appWidgetManager, final int i) {
        WidgetKit.push(context, appWidgetManager, i, new WidgetKit.Builder() { // from class: com.focusfrog.app.ChecklistWidgetProvider$$ExternalSyntheticLambda0
            @Override // com.focusfrog.app.WidgetKit.Builder
            public final RemoteViews build(float f, float f2) {
                RemoteViews build;
                build = ChecklistWidgetProvider.build(context, i, f, f2);
                return build;
            }
        }, "ChecklistWidget");
    }


    public static RemoteViews build(final Context context, final int i, float f, float f2) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_list);
        final JSONArray readItems = readItems(context);
        int length = readItems.length();
        int done = 0;
        for (int k = 0; k < length; k++) {
            JSONObject o = readItems.optJSONObject(k);
            if (o != null && o.optBoolean("completed")) {
                done++;
            }
        }
        remoteViews.setTextViewText(R.id.w_title, "JÁ PEGOU?");
        remoteViews.setViewVisibility(R.id.w_title, f < 150.0f ? 8 : 0);
        remoteViews.setImageViewResource(R.id.w_action, R.drawable.ic_widget_reset);
        remoteViews.setContentDescription(R.id.w_action, "Desmarcar tudo");
        remoteViews.setOnClickPendingIntent(R.id.w_action, WidgetKit.broadcast(context, ChecklistWidgetProvider.class, ACTION_RESET_ALL, (i * 10) + 9, null, null));
        remoteViews.setOnClickPendingIntent(R.id.w_head, WidgetKit.openApp(context, "home", i + 5300));
        remoteViews.removeAllViews(R.id.w_list);
        if (length == 0) {
            remoteViews.setTextViewText(R.id.w_count, "");
            remoteViews.setViewVisibility(R.id.w_list, 8);
            remoteViews.setViewVisibility(R.id.w_empty, 0);
            remoteViews.setTextViewText(R.id.w_empty, "Nenhum item ainda. Abra o app pra adicionar.");
            remoteViews.setOnClickPendingIntent(R.id.w_empty, WidgetKit.openApp(context, "home", i + 5310));
            return remoteViews;
        }
        remoteViews.setViewVisibility(R.id.w_list, 0);
        remoteViews.setViewVisibility(R.id.w_empty, 8);
        final int cols = WidgetKit.colsFor(f, 110.0f);
        final float cellW = f / cols;
        final float baseFont = WidgetKit.clamp(12.0f, cellW / 15.0f, 15.0f);
        final boolean narrow = cellW < 170.0f;
        float[] heights = new float[length];
        for (int k = 0; k < length; k++) {
            JSONObject o = readItems.optJSONObject(k);
            heights[k] = WidgetKit.cellDp(o == null ? "" : o.optString("text", ""), false, cellW, baseFont, narrow);
        }
        WidgetKit.Plan plan = WidgetKit.plan(heights, cols, WidgetKit.listSpace(f2));
        remoteViews.setTextViewText(R.id.w_count, WidgetKit.counter(done, length, plan.hidden, f));
        final float fontScale = cellW / 15.0f;
        WidgetKit.fillGrid(context, remoteViews, R.id.w_list, plan, new WidgetKit.CellBinder() {
            @Override
            public RemoteViews cell(int index, float stretch) {
                RemoteViews cell = ChecklistWidgetProvider.cell(context, i, readItems.optJSONObject(index), index);
                float grow = Math.min(1.15f, stretch);
                WidgetKit.fluidText(cell, R.id.w_text, 12.0f, fontScale * grow, 15.0f * grow);
                WidgetKit.fillCell(cell, R.id.w_cell, stretch);
                cell.setInt(R.id.w_text, "setMaxLines", narrow ? 2 : 1);
                if (cellW < 130.0f) {
                    cell.setViewVisibility(R.id.w_check, 8);
                }
                return cell;
            }
        });
        return remoteViews;
    }

    private static RemoteViews cell(Context context, int i, JSONObject jSONObject, int i2) {
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_cell);
        if (jSONObject == null) {
            return remoteViews;
        }
        boolean optBoolean = jSONObject.optBoolean("completed", false);
        remoteViews.setTextViewText(R.id.w_text, jSONObject.optString("text", ""));
        remoteViews.setImageViewResource(R.id.w_check, optBoolean ? R.drawable.ic_wcheck_on : R.drawable.ic_wcheck_off);
        remoteViews.setInt(R.id.w_text, "setPaintFlags", optBoolean ? 17 : 1);
        remoteViews.setTextColor(R.id.w_text, optBoolean ? -9735552 : -789258);
        remoteViews.setOnClickPendingIntent(R.id.w_cell, WidgetKit.broadcast(context, ChecklistWidgetProvider.class, ACTION_TOGGLE, ((i % 1000) * 64) + 8000 + i2, EXTRA_ITEM_ID, jSONObject.optString("id")));
        return remoteViews;
    }
}
