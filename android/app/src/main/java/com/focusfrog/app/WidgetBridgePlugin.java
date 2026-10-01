package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Ponte mínima entre o JS e o widget nativo: depois que o app escreve o
 * checklist em @capacitor/preferences, chama refreshChecklistWidget() pra o
 * widget atualizar na hora, em vez de esperar o próximo ciclo automático do
 * Android (que pode levar até 30 minutos).
 */
@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridgePlugin extends Plugin {

    @PluginMethod
    public void refreshChecklistWidget(PluginCall call) {
        ChecklistWidgetProvider.refreshAll(getContext());
        call.resolve(new JSObject());
    }

    /**
     * Pede pro launcher fixar o widget na tela inicial, com o diálogo de
     * confirmação nativo do próprio Android — sem precisar explicar o
     * caminho manual (segurar a tela → Widgets → achar o app).
     *
     * Só existe a partir do Android 8.0 (API 26) e só funciona se o launcher
     * do aparelho der suporte (a grande maioria dá hoje, mas alguns
     * launchers alternativos mais simples não). Nos dois casos em que não dá
     * pra usar esse atalho, devolve supported:false pro JS mostrar o caminho
     * manual como alternativa, em vez de travar sem explicação.
     */
    @PluginMethod
    public void requestPinWidget(PluginCall call) {
        Context context = getContext();
        JSObject result = new JSObject();

        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
            result.put("supported", false);
            result.put("reason", "android_version");
            call.resolve(result);
            return;
        }

        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        if (!appWidgetManager.isRequestPinAppWidgetSupported()) {
            result.put("supported", false);
            result.put("reason", "launcher_unsupported");
            call.resolve(result);
            return;
        }

        ComponentName provider = new ComponentName(context, ChecklistWidgetProvider.class);

        // Callback opcional dispensado aqui (o widget aparece na hora de qualquer
        // forma); se algum dia quisermos detectar "usuário cancelou o diálogo"
        // de verdade, dá pra registrar um BroadcastReceiver nesse PendingIntent.
        boolean requested = appWidgetManager.requestPinAppWidget(provider, null, null);
        result.put("supported", true);
        result.put("requested", requested);
        call.resolve(result);
    }
}
