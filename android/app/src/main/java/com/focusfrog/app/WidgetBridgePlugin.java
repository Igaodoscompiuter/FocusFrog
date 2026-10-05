package com.focusfrog.app;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

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
     * No Android 12+ (API 31+), SCHEDULE_EXACT_ALARM precisa ser LIGADA PELO
     * USUÁRIO numa tela própria do sistema — declarar a permissão no manifesto
     * (como já fazemos) não é suficiente e não mostra nenhum diálogo sozinho.
     * Sem isso ligado, alarmes de horário exato (rotinas, fim de foco/pausa)
     * podem simplesmente não disparar, sem erro nenhum visível. Esse método
     * deixa o JS checar o estado e, se precisar, abrir essa tela direto.
     */
    @PluginMethod
    public void checkExactAlarmPermission(PluginCall call) {
        JSObject result = new JSObject();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            AlarmManager am = (AlarmManager) getContext().getSystemService(Context.ALARM_SERVICE);
            result.put("granted", am != null && am.canScheduleExactAlarms());
        } else {
            result.put("granted", true); // versões antigas não exigem essa permissão separada
        }
        call.resolve(result);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall call) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            Intent intent = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            getContext().startActivity(intent);
        }
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void startFocusService(PluginCall call) {
        String title = call.getString("title", "FocusFrog");
        String body = call.getString("body", "");
        long endsAt = call.getLong("endsAt", 0L);
        String phase = call.getString("phase", "focus");
        PomodoroForegroundService.start(getContext(), title, body, endsAt, phase);
        call.resolve(new JSObject());
    }

    /** total de distração (ms) acumulado na sessão de foco atual */
    @PluginMethod
    public void getFocusDistraction(PluginCall call) {
        JSObject r = new JSObject();
        r.put("distractedMs", FocusDistractionMonitor.getDistractedMs(getContext()));
        call.resolve(r);
    }

    @PluginMethod
    public void resetFocusDistraction(PluginCall call) {
        FocusDistractionMonitor.reset(getContext());
        call.resolve(new JSObject());
    }

    @PluginMethod
    public void stopFocusService(PluginCall call) {
        PomodoroForegroundService.stop(getContext());
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
