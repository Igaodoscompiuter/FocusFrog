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
    public static final String ACTION_RESET_ALL = "com.focusfrog.app.WIDGET_RESET_ALL";
    public static final String EXTRA_ITEM_ID = "item_id";
    private static final int MAX_ROWS = 3;
    private static final int MAX_COLS = 2;
    private static final int MAX_ITEMS = MAX_ROWS * MAX_COLS; // 6 vagas na grade

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    @Override
    public void onAppWidgetOptionsChanged(Context context, AppWidgetManager appWidgetManager, int appWidgetId, android.os.Bundle newOptions) {
        // Disparado quando o usuário redimensiona o widget na tela inicial —
        // recalcula quantas linhas cabem de verdade no novo tamanho.
        updateWidget(context, appWidgetManager, appWidgetId);
    }

    /** 1 coluna em widgets estreitos, 2 colunas quando há largura de sobra —
     *  é o que faz os itens se reorganizarem de verdade, não só encolherem. */
    private static int computeColumns(AppWidgetManager appWidgetManager, int appWidgetId) {
        android.os.Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int widthDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_WIDTH, 0) : 0;
        if (widthDp <= 0) return 1; // sem informação ainda — assume o mais conservador
        return widthDp >= 250 ? 2 : 1;
    }

    /** Quantas LINHAS da grade cabem de verdade na altura atual do widget —
     *  evita tanto cortar item quanto sobrar vão vazio embaixo. */
    private static int computeRows(AppWidgetManager appWidgetManager, int appWidgetId) {
        android.os.Bundle options = appWidgetManager.getAppWidgetOptions(appWidgetId);
        int heightDp = options != null ? options.getInt(AppWidgetManager.OPTION_APPWIDGET_MAX_HEIGHT, 0) : 0;
        if (heightDp <= 0) return MAX_ROWS;
        // ~14dp de padding em cada ponta + ~34dp de cabeçalho/divisor + ~36dp por linha.
        int available = (heightDp - 14 - 14 - 34) / 36;
        return Math.max(1, Math.min(MAX_ROWS, available));
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

    /** Botão de "desmarcar tudo" — zera o completed de todo mundo de uma vez. */
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
            // [CORREÇÃO] Rede de segurança: qualquer erro inesperado aqui antes
            // derrubava a adição do widget inteira ("Não foi possível adicionar
            // widget"). Melhor mostrar um estado mínimo do que travar tudo.
            try {
                RemoteViews fallback = new RemoteViews(context.getPackageName(), R.layout.widget_checklist);
                appWidgetManager.updateAppWidget(appWidgetId, fallback);
            } catch (Exception ignored) { /* nada mais a fazer */ }
        }
    }

    private static void updateWidgetInner(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_checklist);

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");

        int[] rowLayoutIds = {
            R.id.widget_row_1, R.id.widget_row_2, R.id.widget_row_3,
            R.id.widget_row_4, R.id.widget_row_5, R.id.widget_row_6
        };
        int[] rowTextIds = {
            R.id.widget_text_1, R.id.widget_text_2, R.id.widget_text_3,
            R.id.widget_text_4, R.id.widget_text_5, R.id.widget_text_6
        };
        int[] rowIconIds = {
            R.id.widget_icon_1, R.id.widget_icon_2, R.id.widget_icon_3,
            R.id.widget_icon_4, R.id.widget_icon_5, R.id.widget_icon_6
        };
        // Cada linha visual da grade tem 2 células (índices pares/ímpares).
        int[] gridRowIds = { R.id.widget_grid_row_1, R.id.widget_grid_row_2, R.id.widget_grid_row_3 };

        JSONArray items;
        try {
            items = new JSONArray(raw);
        } catch (Exception e) {
            items = new JSONArray();
        }

        // Progresso "X/Y" no cabeçalho + estado vazio quando não há item nenhum.
        int total = items.length();
        int done = 0;
        for (int i = 0; i < total; i++) {
            JSONObject it = items.optJSONObject(i);
            if (it != null && it.optBoolean("completed", false)) done++;
        }
        views.setTextViewText(R.id.widget_progress, total > 0 ? ("(" + done + "/" + total + ")") : "");
        views.setViewVisibility(R.id.widget_empty_state, total == 0 ? android.view.View.VISIBLE : android.view.View.GONE);

        // Botão de resetar tudo.
        Intent resetIntent = new Intent(context, ChecklistWidgetProvider.class);
        resetIntent.setAction(ACTION_RESET_ALL);
        PendingIntent resetPi = PendingIntent.getBroadcast(
            context, appWidgetId * 10 + 9, resetIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        views.setOnClickPendingIntent(R.id.widget_reset_button, resetPi);

        // [NOVO] Grade de verdade: colunas vêm da LARGURA, linhas vêm da ALTURA —
        // os itens se reorganizam (1 ou 2 colunas) em vez de só aparecer/sumir.
        int columns = computeColumns(appWidgetManager, appWidgetId);
        int visibleGridRows = computeRows(appWidgetManager, appWidgetId);
        int visibleSlots = columns * visibleGridRows;
        int count = Math.min(items.length(), Math.min(visibleSlots, MAX_ITEMS));

        // Esconde linhas INTEIRAS da grade além do que a altura permite.
        for (int r = 0; r < MAX_ROWS; r++) {
            views.setViewVisibility(gridRowIds[r], r < visibleGridRows ? android.view.View.VISIBLE : android.view.View.GONE);
        }

        for (int i = 0; i < MAX_ITEMS; i++) {
            boolean isSecondColumn = (i % MAX_COLS) == 1;
            boolean columnAllowed = !isSecondColumn || columns >= 2;
            boolean rowAllowed = (i / MAX_COLS) < visibleGridRows;
            if (!columnAllowed || !rowAllowed) {
                views.setViewVisibility(rowLayoutIds[i], android.view.View.GONE);
                continue;
            }
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
                    // Além do strikethrough, esmaece o texto do que já foi feito —
                    // reforça a hierarquia visual (pendente chama mais atenção).
                    views.setInt(rowTextIds[i], "setTextColor", completed ? 0xFF6B7280 : 0xFFF3F4F6);

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
