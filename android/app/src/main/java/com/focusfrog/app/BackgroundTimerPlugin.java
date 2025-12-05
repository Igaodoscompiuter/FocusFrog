
package com.focusfrog.app;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "BackgroundTimer")
public class BackgroundTimerPlugin extends Plugin {

    private Intent serviceIntent;
    private BroadcastReceiver timerReceiver;

    @Override
    public void load() {
        super.load();
        setupTimerReceiver();
    }

    private void setupTimerReceiver() {
        timerReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                if (BackgroundTimerService.ACTION_TICK.equals(intent.getAction())) {
                    long remainingTime = intent.getLongExtra("remainingTime", 0);
                    JSObject ret = new JSObject();
                    ret.put("remainingTime", remainingTime);
                    notifyListeners("onTick", ret);
                } else if (BackgroundTimerService.ACTION_FINISH.equals(intent.getAction())) {
                    JSObject ret = new JSObject();
                    ret.put("status", "finished");
                    notifyListeners("onFinish", ret);
                }
            }
        };
        IntentFilter filter = new IntentFilter();
        filter.addAction(BackgroundTimerService.ACTION_TICK);
        filter.addAction(BackgroundTimerService.ACTION_FINISH);
        LocalBroadcastManager.getInstance(getContext()).registerReceiver(timerReceiver, filter);
    }

    @PluginMethod()
    public void start(PluginCall call) {
        Integer duration = call.getInt("duration");
        if (duration == null) {
            call.reject("A duration must be provided.");
            return;
        }

        Context context = getContext();
        serviceIntent = new Intent(context, BackgroundTimerService.class);
        serviceIntent.putExtra("duration", duration);
        context.startService(serviceIntent);

        call.resolve(new JSObject().put("status", "Timer started"));
    }

    @PluginMethod()
    public void stop(PluginCall call) {
        if (serviceIntent != null) {
            getContext().stopService(serviceIntent);
            serviceIntent = null;
        }
        call.resolve(new JSObject().put("status", "Timer stopped"));
    }

    @Override
    protected void handleOnDestroy() {
        if (timerReceiver != null) {
            LocalBroadcastManager.getInstance(getContext()).unregisterReceiver(timerReceiver);
            timerReceiver = null;
        }
        super.handleOnDestroy();
    }
}
