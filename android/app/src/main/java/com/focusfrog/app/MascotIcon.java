package com.focusfrog.app;

import android.content.ComponentName;
import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.util.Log;
import kotlinx.coroutines.DebugKt;

/* loaded from: classes.dex */
final class MascotIcon {
    static final String[] ALIASES = {"LauncherDefault", "LauncherNormal", "LauncherHappy", "LauncherSleepy", "LauncherSad"};
    static final long IDLE_MS = 1500000;
    static final String KEY_ENABLED = "mascotIcon";
    private static final String TAG = "MascotIcon";

    private MascotIcon() {
    }

    static String aliasFor(String str) {
        str.hashCode();
        switch (str) {
            case "tickled":
            case "streak":
            case "eat":
            case "pet":
            case "frog":
            case "task":
            case "levelup":
            case "combo":
            case "focus":
            case "happy":
            case "mission":
                return "LauncherHappy";
            case "hungry":
            case "missed":
            case "sad":
            case "nofly":
            case "tired":
                return "LauncherSad";
            case "sleepy":
            case "break":
                return "LauncherSleepy";
            default:
                return "LauncherNormal";
        }
    }

    static void update(Context context, long j) {
        if (FocusDistractionMonitor.appInForeground || PomodoroForegroundService.running) {
            return;
        }
        if (j - context.getSharedPreferences("MascotNudge", 0).getLong("appActiveAt", 0L) < IDLE_MS) {
            return;
        }
        try {
            String aliasFor = !DebugKt.DEBUG_PROPERTY_VALUE_ON.equals(context.getSharedPreferences("CapacitorStorage", 0).getString(KEY_ENABLED, "")) ? "LauncherDefault" : aliasFor(MascotCore.status(MascotCore.load(context, j), j));
            SharedPreferences sharedPreferences = context.getSharedPreferences(TAG, 0);
            if (aliasFor.equals(sharedPreferences.getString("alias", "LauncherDefault"))) {
                return;
            }
            PackageManager packageManager = context.getPackageManager();
            packageManager.setComponentEnabledSetting(component(context, aliasFor), 1, 1);
            for (String str : ALIASES) {
                if (!str.equals(aliasFor)) {
                    packageManager.setComponentEnabledSetting(component(context, str), 2, 1);
                }
            }
            sharedPreferences.edit().putString("alias", aliasFor).apply();
        } catch (Exception e) {
            Log.w(TAG, "troca de ícone falhou", e);
        }
    }

    private static ComponentName component(Context context, String str) {
        return new ComponentName(context.getPackageName(), "com.focusfrog.app." + str);
    }
}
