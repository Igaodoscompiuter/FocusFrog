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
 * [REESCRITO] Os itens agora vêm de um GridView de verdade (alimentado por
 * ChecklistWidgetService/ChecklistRemoteViewsFactory), não mais de um grid
 * fixo de linhas escondendo/mostrando na mão. numColumns="auto_fit" no XML
 * decide sozinho quantas colunas cabem pela largura real, e o GridView rola
 * verticalmente por padrão quando os itens não cabem na altura — nenhum
 * item nunca mais fica simplesmente escondido.
 */
public class ChecklistWidgetProvider extends AppWidgetProvider {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String PREFS_KEY = "leavingHomeItems";
    public static final String ACTION_TOGGLE = "com.focusfrog.app.WIDGET_TOGGLE_ITEM";
    public static final String ACTION_RESET_ALL = "com.focusfrog.app.WIDGET_RESET_ALL";
    public static final String EXTRA_ITEM_ID = "item_id";

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, android.os.Bundle newOptions) {
        // Redimensionar não muda os DADOS, só o espaço disponível — o próprio
        // GridView se reorganiza sozinho (numColumns="auto_fit"), não precisa
        // reconstruir nada aqui. Mantido só por clareza/futuro.
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    @Override
    public void onReceive(Context context, Intent intent) {
        super.onReceive(context, intent);
        boolean isToggle = ACTION_TOGGLE.equals(intent.getAction());
        boolean isReset = ACTION_RESET_ALL.equals(intent.getAction());
        if (isToggle || isReset) {
            if (isToggle) {
                String itemId = intent.getStringExtra(EXTRA_ITEM_ID);
                if (itemId != null) toggleItem(context, itemId);
            } else {
                resetAllItems(context);
            }
            AppWidgetManager mgr = AppWidgetManager.getInstance(context);
            int[] ids = mgr.getAppWidgetIds(new ComponentName(context, ChecklistWidgetProvider.class));
            // notifyAppWidgetViewDataChanged recarrega os ITENS do GridView
            // (chama onDataSetChanged na factory); updateWidget atualiza o
            // cabeçalho (progresso). Os dois são necessários.
            mgr.notifyAppWidgetViewDataChanged(ids, R.id.widget_grid_view);
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
        mgr.notifyAppWidgetViewDataChanged(ids, R.id.widget_grid_view);
        for (int id : ids) {
            updateWidget(context, mgr, id);
        }
    }

    private static void resetAllItems(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");
        try {
            JSONArray items = new JSONArray(raw);
            for (int i = 0; i < items.length(); i++) {
                items.getJSONObject(i).put("completed", false);
            }
            prefs.edit().putString(PREFS_KEY, items.toString()).apply();
        } catch (Exception e) {
            // JSON malformado ou ausente: ignora o toque.
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
        try {
            updateWidgetInner(context, appWidgetManager, appWidgetId);
        } catch (Exception e) {
            // Rede de segurança: qualquer erro inesperado aqui antes derrubava
            // a adição do widget inteira ("Não foi possível adicionar widget").
            try {
                RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_checklist);
                appWidgetManager.updateAppWidget(appWidgetId, fallback);
            } catch (Exception ignored) { /* nada mais a fazer */ }
        }
    }

    private static void updateWidgetInner(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_checklist);

        // --- Cabeçalho: progresso "X/Y" + estado vazio ---
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");
        JSONArray items;
        try {
            items = new JSONArray(raw);
        } catch (Exception e) {
            items = new JSONArray();
        }
        int total = items.length();
        int done = 0;
        for (int i = 0; i < total; i++) {
            JSONObject it = items.optJSONObject(i);
            if (it != null && it.optBoolean("completed", false)) done++;
        }
        views.setTextViewText(R.id.widget_progress, total > 0 ? ("(" + done + "/" + total + ")") : "");

        // --- GridView: adapter de verdade (ChecklistWidgetService) ---
        Intent svcIntent = new Intent(context, ChecklistWidgetService.class);
        svcIntent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, appWidgetId);
        svcIntent.setData(android.net.Uri.parse(svcIntent.toUri(Intent.URI_INTENT_SCHEME)));
        views.setRemoteAdapter(R.id.widget_grid_view, svcIntent);
        views.setEmptyView(R.id.widget_grid_view, R.id.widget_empty_state);

        // Template de clique: cada célula do GridView só pode preencher um
        // "fill-in" (feito na Factory) em cima deste modelo — GridView/ListView
        // não aceita PendingIntent individual por célula, só esse padrão.
        Intent toggleIntent = new Intent(context, ChecklistWidgetProvider.class);
        toggleIntent.setAction(ACTION_TOGGLE);
        PendingIntent togglePi = PendingIntent.getBroadcast(
            context, appWidgetId, toggleIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE
        );
        views.setPendingIntentTemplate(R.id.widget_grid_view, togglePi);

        // --- Botão de resetar tudo ---
        Intent resetIntent = new Intent(context, ChecklistWidgetProvider.class);
        resetIntent.setAction(ACTION_RESET_ALL);
        PendingIntent resetPi = PendingIntent.getBroadcast(
            context, appWidgetId * 10 + 9, resetIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_reset_button, resetPi);

        // --- Toque no cabeçalho abre o app ---
        Intent openAppIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        if (openAppIntent != null) {
            PendingIntent openPi = PendingIntent.getActivity(
                context, 0, openAppIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_header, openPi);
        }

        appWidgetManager.updateAppWidget(appWidgetId, views);
        appWidgetManager.notifyAppWidgetViewDataChanged(appWidgetId, R.id.widget_grid_view);
    }
}
