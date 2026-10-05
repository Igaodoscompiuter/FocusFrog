package com.focusfrog.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Plugin próprio (não vem de um pacote npm), precisa ser registrado na mão.
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(savedInstanceState);
    }

    // o monitor de distração precisa saber se o FocusFrog está na frente
    @Override
    public void onResume() {
        super.onResume();
        FocusDistractionMonitor.appInForeground = true;
        FocusDistractionMonitor.clearNudge(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        FocusDistractionMonitor.appInForeground = false;
    }
}
