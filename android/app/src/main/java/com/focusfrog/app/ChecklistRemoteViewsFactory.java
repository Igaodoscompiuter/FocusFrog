package com.focusfrog.app;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;
import android.widget.RemoteViewsService;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;

public class ChecklistRemoteViewsFactory implements RemoteViewsService.RemoteViewsFactory {

    private static final String PREFS_NAME = "CapacitorStorage";
    private static final String PREFS_KEY = "leavingHomeItems";
    // Teto generoso (pedido explícito: 10) — evita um checklist com dezenas de
    // itens deixando o widget absurdamente alto; não é mais uma limitação
    // técnica do RemoteViews como antes (GridView é uma lista de verdade).
    private static final int MAX_ITEMS = 10;

    private final Context context;
    private final List<JSONObject> items = new ArrayList<>();

    ChecklistRemoteViewsFactory(Context context) {
        this.context = context;
    }

    @Override
    public void onCreate() { loadData(); }

    @Override
    public void onDataSetChanged() { loadData(); }

    private void loadData() {
        items.clear();
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String raw = prefs.getString(PREFS_KEY, "[]");
        try {
            JSONArray arr = new JSONArray(raw);
            for (int i = 0; i < Math.min(arr.length(), MAX_ITEMS); i++) {
                JSONObject obj = arr.optJSONObject(i);
                if (obj != null) items.add(obj);
            }
        } catch (Exception e) {
            // JSON malformado ou ausente — lista fica vazia, widget mostra o estado vazio.
        }
    }

    @Override
    public void onDestroy() { items.clear(); }

    @Override
    public int getCount() { return items.size(); }

    @Override
    public RemoteViews getViewAt(int position) {
        RemoteViews view = new RemoteViews(context.getPackageName(), R.layout.widget_checklist_item);
        if (position >= items.size()) return view;

        JSONObject item = items.get(position);
        String id = item.optString("id");
        String text = item.optString("text", "");
        boolean completed = item.optBoolean("completed", false);

        view.setTextViewText(R.id.item_text, text);
        view.setInt(
            R.id.item_icon, "setImageResource",
            completed ? R.drawable.widget_checkbox_checked : R.drawable.widget_checkbox_unchecked
        );
        view.setInt(
            R.id.item_text, "setPaintFlags",
            completed ? (android.graphics.Paint.STRIKE_THRU_TEXT_FLAG | android.graphics.Paint.ANTI_ALIAS_FLAG) : android.graphics.Paint.ANTI_ALIAS_FLAG
        );
        view.setInt(R.id.item_text, "setTextColor", completed ? 0xFF6B7280 : 0xFFF3F4F6);

        // Cada célula do GridView não pode ter seu próprio PendingIntent direto —
        // usa o padrão "template + fill-in": o provider define um template com
        // a action, e aqui só preenchemos o extra que diferencia esta célula.
        Intent fillInIntent = new Intent();
        fillInIntent.putExtra(ChecklistWidgetProvider.EXTRA_ITEM_ID, id);
        view.setOnClickFillInIntent(R.id.item_row, fillInIntent);

        return view;
    }

    @Override public RemoteViews getLoadingView() { return null; }
    @Override public int getViewTypeCount() { return 1; }
    @Override public long getItemId(int position) { return position; }
    @Override public boolean hasStableIds() { return true; }
}
