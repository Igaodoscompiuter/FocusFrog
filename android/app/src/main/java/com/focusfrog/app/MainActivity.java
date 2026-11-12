package com.focusfrog.app;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;
import androidx.core.content.ContextCompat;
import androidx.core.view.OnApplyWindowInsetsListener;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import com.getcapacitor.BridgeActivity;

/* loaded from: classes.dex */
public class MainActivity extends BridgeActivity {
    @Override // com.getcapacitor.BridgeActivity, androidx.fragment.app.FragmentActivity, androidx.activity.ComponentActivity, androidx.core.app.ComponentActivity, android.app.Activity
    public void onCreate(Bundle bundle) {
        registerPlugin(WidgetBridgePlugin.class);
        super.onCreate(bundle);
        paintStatusBar();
        requestHighRefreshRate();
    }

    private void requestHighRefreshRate() {
        try {
            Display display = Build.VERSION.SDK_INT >= 30 ? getDisplay() : getWindowManager().getDefaultDisplay();
            if (display == null) {
                return;
            }
            Display.Mode mode = display.getMode();
            Display.Mode mode2 = mode;
            for (Display.Mode mode3 : display.getSupportedModes()) {
                if (mode3.getPhysicalWidth() == mode.getPhysicalWidth() && mode3.getPhysicalHeight() == mode.getPhysicalHeight() && mode3.getRefreshRate() > mode2.getRefreshRate()) {
                    mode2 = mode3;
                }
            }
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.preferredDisplayModeId = mode2.getModeId();
            attributes.preferredRefreshRate = mode2.getRefreshRate();
            getWindow().setAttributes(attributes);
        } catch (Exception unused) {
        }
    }

    private void paintStatusBar() {
        try {
            Window window = getWindow();
            int color = ContextCompat.getColor(this, R.color.statusBarColor);
            if (Build.VERSION.SDK_INT < 35) {
                window.setStatusBarColor(color);
            }
            View decorView = window.getDecorView();
            if (decorView instanceof ViewGroup) {
                View view = new View(this);
                view.setBackgroundColor(color);
                view.setImportantForAccessibility(2);
                ((ViewGroup) decorView).addView(view, new FrameLayout.LayoutParams(-1, 0, 48));
                ViewCompat.setOnApplyWindowInsetsListener(view, new OnApplyWindowInsetsListener() { // from class: com.focusfrog.app.MainActivity$$ExternalSyntheticLambda1
                    @Override // androidx.core.view.OnApplyWindowInsetsListener
                    public final WindowInsetsCompat onApplyWindowInsets(View view2, WindowInsetsCompat windowInsetsCompat) {
                        return MainActivity.lambda$paintStatusBar$0(view2, windowInsetsCompat);
                    }
                });
                ViewCompat.requestApplyInsets(view);
            }
            WindowCompat.getInsetsController(window, decorView).setAppearanceLightStatusBars(true);
        } catch (Exception unused) {
        }
    }

    static /* synthetic */ WindowInsetsCompat lambda$paintStatusBar$0(View view, WindowInsetsCompat windowInsetsCompat) {
        int i = windowInsetsCompat.getInsets(WindowInsetsCompat.Type.statusBars()).top;
        ViewGroup.LayoutParams layoutParams = view.getLayoutParams();
        if (layoutParams.height != i) {
            layoutParams.height = i;
            view.setLayoutParams(layoutParams);
        }
        return windowInsetsCompat;
    }

    @Override // com.getcapacitor.BridgeActivity, androidx.fragment.app.FragmentActivity, android.app.Activity
    public void onResume() {
        super.onResume();
        requestHighRefreshRate();
        FocusDistractionMonitor.appInForeground = true;
        FocusDistractionMonitor.clearNudge(this);
        MascotNudge.markActive(this);
    }

    @Override // com.getcapacitor.BridgeActivity, androidx.fragment.app.FragmentActivity, android.app.Activity
    public void onPause() {
        super.onPause();
        FocusDistractionMonitor.appInForeground = false;
        MascotNudge.markActive(this);
    }

    @Override // com.getcapacitor.BridgeActivity, androidx.appcompat.app.AppCompatActivity, androidx.fragment.app.FragmentActivity, android.app.Activity
    public void onStop() {
        super.onStop();
        try {
            MascotNudge.schedule(this);
            MascotNudge.scheduleIconCheck(this);
        } catch (Exception unused) {
        }
    }
}
