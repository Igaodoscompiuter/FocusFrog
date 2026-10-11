package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Widget "Sapo do Dia". O app escreve o estado em CapacitorStorage
 * (chave "frogWidget", ver src/widgetBridge.ts):
 *   { state: "active"|"none"|"done", title, done, total, focusEndsAt, date }
 * e chama refreshAll(). O widget só mostra; os botões abrem o app por
 * focusfrog://open?go=... — exceto "Por hoje chega", que é resolvido aqui
 * (grava "frogWidgetRest" = data de hoje e mostra o estado de descanso).
 */
public class FrogWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String KEY_STATE = "frogWidget";
    private static final String KEY_REST = "frogWidgetRest";
    public static final String ACTION_REST = "com.focusfrog.app.FROG_WIDGET_REST";

    @Override
    public void onUpdate(Context context, AppWidgetManager mgr, int[] ids) {
        for (int id : ids) update(context, mgr, id);
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager mgr, int id, android.os.Bundle opts) {
        update(context, mgr, id);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_REST.equals(intent.getAction())) {
            context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
                .edit().putString(KEY_REST, today()).apply();
            refreshAll(context);
        }
    }

    public static void refreshAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, FrogWidgetProvider.class));
        for (int id : ids) update(context, mgr, id);
    }

    private static String today() {
        return new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
    }

    private static PendingIntent openApp(Context context, String go, int requestCode) {
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("focusfrog://open?go=" + go));
        i.setPackage(context.getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, requestCode, i,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private static void update(Context context, AppWidgetManager mgr, int id) {
        RemoteViews v = new RemoteViews(context.getPackageName(), R.layout.widget_frog);
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            JSONObject s;
            try { s = new JSONObject(prefs.getString(KEY_STATE, "{}")); } catch (Exception e) { s = new JSONObject(); }
            String state = s.optString("state", "none");
            // o estado vale pro dia em que foi gravado; dia novo = escolher de novo
            String date = s.optString("date", "");
            if (!"active".equals(state) && !today().equals(date)) state = "none";
            if ("done".equals(state) && today().equals(prefs.getString(KEY_REST, ""))) state = "rest";

            v.setViewVisibility(R.id.frog_state_active, "active".equals(state) ? View.VISIBLE : View.GONE);
            v.setViewVisibility(R.id.frog_state_empty, "none".equals(state) ? View.VISIBLE : View.GONE);
            v.setViewVisibility(R.id.frog_state_done, "done".equals(state) ? View.VISIBLE : View.GONE);
            v.setViewVisibility(R.id.frog_state_rest, "rest".equals(state) ? View.VISIBLE : View.GONE);

            if ("active".equals(state)) {
                v.setTextViewText(R.id.frog_title, s.optString("title", "Sapo do Dia"));
                int total = s.optInt("total", 0), done = s.optInt("done", 0);
                if (total > 0) {
                    v.setViewVisibility(R.id.frog_steps_row, View.VISIBLE);
                    v.setProgressBar(R.id.frog_progress, 100, Math.round(done * 100f / total), false);
                    v.setTextViewText(R.id.frog_steps, done + " de " + total + " passos");
                } else {
                    v.setViewVisibility(R.id.frog_steps_row, View.GONE);
                }
                long endsAt = s.optLong("focusEndsAt", 0);
                if (endsAt > System.currentTimeMillis()) {
                    String hm = new SimpleDateFormat("HH:mm", Locale.getDefault()).format(new Date(endsAt));
                    v.setTextViewText(R.id.frog_label, "Em foco · até " + hm);
                    v.setTextViewText(R.id.frog_btn_open, "Ver foco");
                } else {
                    v.setTextViewText(R.id.frog_label, "Sapo do Dia");
                    v.setTextViewText(R.id.frog_btn_open, total > 0 ? "Continuar" : "Começar foco");
                }
                v.setOnClickPendingIntent(R.id.frog_btn_open, openApp(context, "home", 41));
                v.setOnClickPendingIntent(R.id.frog_root, openApp(context, "home", 42));
            } else if ("done".equals(state)) {
                v.setTextViewText(R.id.frog_done_title, s.optString("title", ""));
                v.setOnClickPendingIntent(R.id.frog_btn_another, openApp(context, "frog", 43));
                Intent rest = new Intent(context, FrogWidgetProvider.class).setAction(ACTION_REST);
                v.setOnClickPendingIntent(R.id.frog_btn_rest, PendingIntent.getBroadcast(context, 44, rest,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE));
            } else if ("none".equals(state)) {
                v.setOnClickPendingIntent(R.id.frog_btn_choose, openApp(context, "frog", 45));
                v.setOnClickPendingIntent(R.id.frog_root, openApp(context, "frog", 46));
            } else {
                v.setOnClickPendingIntent(R.id.frog_root, openApp(context, "home", 47));
            }
        } catch (Exception ignored) {
            // nunca derrubar o widget: no pior caso fica o layout padrão
        }
        mgr.updateAppWidget(id, v);
    }
}
