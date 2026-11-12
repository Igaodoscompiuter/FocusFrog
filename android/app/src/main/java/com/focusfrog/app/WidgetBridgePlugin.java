package com.focusfrog.app;

import android.app.AlarmManager;
import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
/* loaded from: classes.dex */
public class WidgetBridgePlugin extends Plugin {
    @PluginMethod
    public void refreshChecklistWidget(PluginCall pluginCall) {
        ChecklistWidgetProvider.refreshAll(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void refreshAgendaWidget(PluginCall pluginCall) {
        AgendaWidgetProvider.refreshAll(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void refreshFrogWidget(PluginCall pluginCall) {
        FrogWidgetProvider.refreshAll(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void refreshMascotWidget(PluginCall pluginCall) {
        MascotWidgetProvider.refreshAll(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    /*
    */
    public void checkExactAlarmPermission(PluginCall pluginCall) {
        JSObject jSObject = new JSObject();
        boolean granted = true;
        if (Build.VERSION.SDK_INT >= 31) {
            AlarmManager alarmManager = (AlarmManager) getContext().getSystemService(NotificationCompat.CATEGORY_ALARM);
            granted = alarmManager != null && alarmManager.canScheduleExactAlarms();
        }
        jSObject.put("granted", granted);
        pluginCall.resolve(jSObject);
    }

    @PluginMethod
    public void openExactAlarmSettings(PluginCall pluginCall) {
        if (Build.VERSION.SDK_INT >= 31) {
            Intent intent = new Intent("android.settings.REQUEST_SCHEDULE_EXACT_ALARM");
            intent.setData(Uri.parse("package:" + getContext().getPackageName()));
            intent.setFlags(268435456);
            getContext().startActivity(intent);
        }
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void startFocusService(PluginCall pluginCall) {
        PomodoroForegroundService.start(getContext(), pluginCall.getString(PomodoroForegroundService.EXTRA_TITLE, "FocusFrog"), pluginCall.getString(PomodoroForegroundService.EXTRA_BODY, ""), pluginCall.getLong("endsAt", 0L).longValue(), pluginCall.getString(PomodoroForegroundService.EXTRA_PHASE, "focus"));
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void getFocusDistraction(PluginCall pluginCall) {
        JSObject jSObject = new JSObject();
        jSObject.put("distractedMs", FocusDistractionMonitor.getDistractedMs(getContext()));
        pluginCall.resolve(jSObject);
    }

    @PluginMethod
    public void setDistractionGuard(PluginCall pluginCall) {
        FocusDistractionMonitor.setGuardEnabled(getContext(), Boolean.TRUE.equals(pluginCall.getBoolean("enabled", true)));
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void resetFocusDistraction(PluginCall pluginCall) {
        FocusDistractionMonitor.reset(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void stopFocusService(PluginCall pluginCall) {
        PomodoroForegroundService.stop(getContext());
        pluginCall.resolve(new JSObject());
    }

    @PluginMethod
    public void requestPinWidget(PluginCall pluginCall) {
        boolean isRequestPinAppWidgetSupported;
        Class cls;
        boolean requestPinAppWidget;
        Context context = getContext();
        JSObject jSObject = new JSObject();
        if (Build.VERSION.SDK_INT < 26) {
            jSObject.put("supported", false);
            jSObject.put("reason", "android_version");
            pluginCall.resolve(jSObject);
            return;
        }
        AppWidgetManager appWidgetManager = AppWidgetManager.getInstance(context);
        isRequestPinAppWidgetSupported = appWidgetManager.isRequestPinAppWidgetSupported();
        if (!isRequestPinAppWidgetSupported) {
            jSObject.put("supported", false);
            jSObject.put("reason", "launcher_unsupported");
            pluginCall.resolve(jSObject);
            return;
        }
        String string = pluginCall.getString("kind");
        if ("frog".equals(string)) {
            cls = FrogWidgetProvider.class;
        } else if ("agenda".equals(string)) {
            cls = AgendaWidgetProvider.class;
        } else {
            cls = "mascot".equals(string) ? MascotWidgetProvider.class : ChecklistWidgetProvider.class;
        }
        requestPinAppWidget = appWidgetManager.requestPinAppWidget(new ComponentName(context, (Class<?>) cls), null, null);
        jSObject.put("supported", true);
        jSObject.put("requested", requestPinAppWidget);
        pluginCall.resolve(jSObject);
    }
}
