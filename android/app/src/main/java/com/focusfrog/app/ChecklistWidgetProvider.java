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


    public static RemoteViews build(Context context, int i, float f, float f2) {
        float f3;
        JSONArray jSONArray;
        float f4;
        int i2;
        RemoteViews remoteViews = new RemoteViews(context.getPackageName(), R.layout.widget_list);
        JSONArray readItems = readItems(context);
        int length = readItems.length();
        int i3 = 0;
        for (int i4 = 0; i4 < length; i4++) {
            JSONObject optJSONObject = readItems.optJSONObject(i4);
            if (optJSONObject != null && optJSONObject.optBoolean("completed")) {
                i3++;
            }
        }
        remoteViews.setTextViewText(R.id.w_title, "JÁ PEGOU?");
        remoteViews.setTextViewText(R.id.w_count, length > 0 ? i3 + "/" + length : "");
        remoteViews.setViewVisibility(R.id.w_title, f < 150.0f ? 8 : 0);
        remoteViews.setImageViewResource(R.id.w_action, R.drawable.ic_widget_reset);
        remoteViews.setContentDescription(R.id.w_action, "Desmarcar tudo");
        remoteViews.setOnClickPendingIntent(R.id.w_action, WidgetKit.broadcast(context, ChecklistWidgetProvider.class, ACTION_RESET_ALL, (i * 10) + 9, null, null));
        remoteViews.setOnClickPendingIntent(R.id.w_head, WidgetKit.openApp(context, "home", i + 5300));
        remoteViews.removeAllViews(R.id.w_list);
        if (length == 0) {
            remoteViews.setViewVisibility(R.id.w_list, 8);
            remoteViews.setViewVisibility(R.id.w_empty, 0);
            remoteViews.setTextViewText(R.id.w_empty, "Nenhum item ainda. Abra o app pra adicionar.");
            remoteViews.setOnClickPendingIntent(R.id.w_empty, WidgetKit.openApp(context, "home", i + 5310));
            return remoteViews;
        }
        remoteViews.setViewVisibility(R.id.w_list, 0);
        remoteViews.setViewVisibility(R.id.w_empty, 8);
        int colsFor = WidgetKit.colsFor(f, 110.0f);
        float f5 = f / colsFor;
        float f6 = f5 / 15.0f;
        float clamp = WidgetKit.clamp(12.0f, f6, 15.0f);
        float[] fArr = new float[length];
        for (int i5 = 0; i5 < length; i5++) {
            JSONObject optJSONObject2 = readItems.optJSONObject(i5);
            fArr[i5] = WidgetKit.cellDp(optJSONObject2 == null ? "" : optJSONObject2.optString("text", ""), false, f5, clamp, f5 < 170.0f);
        }
        int fitCells = WidgetKit.fitCells(fArr, colsFor, WidgetKit.listSpace(f2));
        boolean z = length > fitCells;
        int min = (!z || fitCells <= 1) ? Math.min(length, fitCells) : fitCells - 1;
        int i6 = (!z || fitCells <= 1) ? min : fitCells;
        float stretch = WidgetKit.stretch(fArr, colsFor, i6, WidgetKit.listSpace(f2));
        float min2 = Math.min(1.15f, stretch) * 15.0f;
        int i7 = 0;
        while (true) {
            int i8 = i7 * colsFor;
            if (i8 >= i6) {
                return remoteViews;
            }
            int i9 = i6;
            RemoteViews row = WidgetKit.row(context, stretch);
            RemoteViews remoteViews2 = remoteViews;
            int i10 = 0;
            while (i10 < colsFor) {
                int i11 = colsFor;
                int i12 = i8 + i10;
                if (i12 < min) {
                    i2 = i8;
                    RemoteViews cell = cell(context, i, readItems.optJSONObject(i12), i12);
                    jSONArray = readItems;
                    f3 = f6;
                    WidgetKit.fluidText(cell, R.id.w_text, 12.0f, f6 * Math.min(1.15f, stretch), min2);
                    WidgetKit.fillCell(cell, R.id.w_cell, stretch);
                    f4 = min2;
                    WidgetKit.fluidText(cell, R.id.w_sub, 10.5f, f5 / 22.0f, 12.0f);
                    cell.setInt(R.id.w_text, "setMaxLines", f5 < 170.0f ? 2 : 1);
                    row.addView(R.id.w_row, cell);
                } else {
                    f3 = f6;
                    jSONArray = readItems;
                    f4 = min2;
                    i2 = i8;
                    if (i12 == min && z && fitCells > 1) {
                        RemoteViews remoteViews3 = new RemoteViews(context.getPackageName(), R.layout.widget_more_cell);
                        remoteViews3.setTextViewText(R.id.w_more, "+" + (length - min));
                        remoteViews3.setOnClickPendingIntent(R.id.w_more, WidgetKit.openApp(context, "home", i + 5320));
                        row.addView(R.id.w_row, remoteViews3);
                    } else {
                        row.addView(R.id.w_row, new RemoteViews(context.getPackageName(), R.layout.widget_cell_blank));
                    }
                }
                i10++;
                min2 = f4;
                colsFor = i11;
                i8 = i2;
                readItems = jSONArray;
                f6 = f3;
            }
            remoteViews = remoteViews2;
            remoteViews.addView(R.id.w_list, row);
            i7++;
            i6 = i9;
            colsFor = colsFor;
            f6 = f6;
        }
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
