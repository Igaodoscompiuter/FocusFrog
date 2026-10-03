package com.focusfrog.app;

import android.content.Intent;
import android.widget.RemoteViewsService;

/**
 * Fornece os itens do checklist pro GridView do widget. É o jeito "de
 * verdade" do Android de alimentar uma lista/grade dentro de um widget —
 * sem isso, GridView/ListView num RemoteViews fica sempre vazio.
 */
public class ChecklistWidgetService extends RemoteViewsService {
    @Override
    public RemoteViewsFactory onGetViewFactory(Intent intent) {
        return new ChecklistRemoteViewsFactory(getApplicationContext());
    }
}
