package com.focusfrog.app;

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
}
