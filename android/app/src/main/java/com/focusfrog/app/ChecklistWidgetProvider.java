package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/**
 * Widget de tela inicial do checklist "Já pegou?". Lê e escreve no MESMO
 * arquivo de SharedPreferences que o plugin @capacitor/preferences usa no
 * lado JS ("CapacitorStorage", chave "leavingHomeItems") — é assim que o
 * widget nativo e o app em React conseguem compartilhar o mesmo dado sem
 * precisar de um servidor ou de um plugin mais complexo.
 *
 * Layout é de linhas FIXAS (até MAX_ITEMS) em vez de uma ListView dinâmica
 * (RemoteViewsFactory/RemoteViewsService) — bem mais simples de manter
 * corretamente pra uma lista curta como essa, ao custo de um teto de itens
 * visíveis no widget (itens além do teto continuam normais dentro do app).
 */
public class ChecklistWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String PREFS_KEY = "leavingHomeItems";
    public static final String ACTION_TOGGLE = "com.focusfrog.app.WIDGET_TOGGLE_ITEM";
    public static final String EXTRA_ITEM_ID = "item_id";
    private static final int MAX_ITEMS = 5;

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        if (ACTION_TOGGLE.equals(intent.getAction())) {
            String itemId = intent.getStringExtra(EXTRA_ITEM_ID);
            if (itemId != null) {
                toggleItem(context, itemId);
            }
            // Atualiza todas as instâncias do widget imediatamente, sem esperar
            // o próximo ciclo automático do Android (esse pode levar até 30min).
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, ChecklistWidgetProvider.class));
            for (int id : ids) {
                updateWidget(context, mgr, id);
            }
        }
    }

    /** Chamado pelo WidgetBridgePlugin sempre que o app muda o checklist, pra o
     *  widget refletir na hora em vez de esperar o próximo ciclo automático. */
    public static void refreshAll(Context context) {
        AppWidgetManager mgr = AppWidgetManager.getInstance(context);
        int[] ids = mgr.getAppWidgetIds(new ComponentName(context, ChecklistWidgetProvider.class));
        for (int id : ids) {
            updateWidget(context, mgr, id);
        }
    }

    private static void toggleItem(Context context, String itemId) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");
        try {
            JSONArray items = new JSONArray(raw);
            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);
                if (itemId.equals(item.optString("id"))) {
                    item.put("completed", !item.optBoolean("completed", false));
                    break;
                }
            }
            prefs.edit().putString(PREFS_KEY, items.toString()).apply();
        } catch (Exception e) {
            // JSON malformado ou ausente: não derruba o widget, só ignora o toque.
        }
    }

    private static void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_checklist);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");

        int[] rowLayoutIds = {
            R.id.widget_row_1, R.id.widget_row_2, R.id.widget_row_3, R.id.widget_row_4, R.id.widget_row_5
        };
        int[] rowTextIds = {
            R.id.widget_text_1, R.id.widget_text_2, R.id.widget_text_3, R.id.widget_text_4, R.id.widget_text_5
        };
        int[] rowIconIds = {
            R.id.widget_icon_1, R.id.widget_icon_2, R.id.widget_icon_3, R.id.widget_icon_4, R.id.widget_icon_5
        };

        JSONArray items;
        try {
            items = new JSONArray(raw);
        } catch (Exception e) {
            items = new JSONArray();
        }

        int count = Math.min(items.length(), MAX_ITEMS);
        for (int i = 0; i < MAX_ITEMS; i++) {
            if (i < count) {
                try {
                    JSONObject item = items.getJSONObject(i);
                    String id = item.optString("id");
                    String text = item.optString("text", "");
                    boolean completed = item.optBoolean("completed", false);

                    views.setViewVisibility(rowLayoutIds[i], android.view.View.VISIBLE);
                    views.setTextViewText(rowTextIds[i], text);
                    views.setInt(
                        rowIconIds[i],
                        "setImageResource",
                        completed ? R.drawable.widget_checkbox_checked : R.drawable.widget_checkbox_unchecked
                    );
                    views.setInt(
                        rowTextIds[i],
                        "setPaintFlags",
                        completed ? (android.graphics.Paint.STRIKE_THRU_TEXT_FLAG | android.graphics.Paint.ANTI_ALIAS_FLAG) : android.graphics.Paint.ANTI_ALIAS_FLAG
                    );

                    Intent toggleIntent = new Intent(context, ChecklistWidgetProvider.class);
                    toggleIntent.setAction(ACTION_TOGGLE);
                    toggleIntent.putExtra(EXTRA_ITEM_ID, id);
                    // IDs únicos por linha (requestCode) pra cada PendingIntent ser distinto —
                    // sem isso o Android reaproveita o mesmo intent pra todas as linhas.
                    PendingIntent pi = PendingIntent.getBroadcast(
                        context,
                        appWidgetId * 10 + i,
                        toggleIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );
                    views.setOnClickPendingIntent(rowLayoutIds[i], pi);
                } catch (Exception e) {
                    views.setViewVisibility(rowLayoutIds[i], android.view.View.GONE);
                }
            } else {
                views.setViewVisibility(rowLayoutIds[i], android.view.View.GONE);
            }
        }

        // Toque no cabeçalho abre o app de verdade (pra editar a lista, ver o resto etc.)
        Intent openAppIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (openAppIntent != null) {
            PendingIntent openPi = PendingIntent.getActivity(
                context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_header, openPi);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
