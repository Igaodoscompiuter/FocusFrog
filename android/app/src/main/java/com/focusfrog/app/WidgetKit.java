package com.focusfrog.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.util.SizeF;
import android.widget.RemoteViews;
import java.util.HashMap;
import java.util.Map;

/* loaded from: classes.dex */
final class WidgetKit {
    static final float[] WIDTHS = {110.0f, 250.0f, 330.0f};
    static final float[] HEIGHTS = {100.0f, 150.0f, 200.0f, 250.0f, 300.0f};

    interface Builder {
        RemoteViews build(float f, float f2);
    }

    static float listSpace(float f) {
        return f - 58.0f;
    }

    private WidgetKit() {
    }

    static void push(Context context, AppWidgetManager appWidgetManager, int i, Builder builder, String str) {
        RemoteViews build;
        try {
            if (Build.VERSION.SDK_INT >= 31) {
                HashMap hashMap = new HashMap();
                for (float f : WIDTHS) {
                    for (float f2 : HEIGHTS) {
                        hashMap.put(new SizeF(f, f2), builder.build(f, f2));
                    }
                }
                                build = new RemoteViews((Map) hashMap);
            } else {
                Bundle appWidgetOptions = appWidgetManager.getAppWidgetOptions(i);
                build = builder.build(appWidgetOptions.getInt("appWidgetMinWidth", 250), appWidgetOptions.getInt("appWidgetMaxHeight", 180));
            }
            appWidgetManager.updateAppWidget(i, build);
        } catch (Exception e) {
            Log.e(str, "update falhou", e);
        }
    }

    static int rowsFit(float f, float f2, float f3) {
        return Math.max(1, (int) Math.floor((f - f2) / f3));
    }

    static int listRows(float f) {
        return rowsFit(f, 56.0f, 42.0f);
    }

    static int colsFor(float f, float f2) {
        return Math.max(1, Math.min(3, (int) Math.floor((f - 24.0f) / f2)));
    }

    static float cellDp(String str, boolean z, float f, float f2, boolean z2) {
        return Math.max(38.0f, (Math.max(1, z2 ? Math.min(2, (int) Math.ceil(((str.length() * f2) * 0.52f) / Math.max(40.0f, ((f - 4.0f) - 18.0f) - 29.0f))) : 1) * f2 * 1.33f) + (z ? 15 : 0) + 10.0f) + 4.0f;
    }

    static int fitCells(float[] fArr, int i, float f) {
        float f2 = 0.0f;
        int i2 = 0;
        int i3 = 0;
        while (i2 < fArr.length) {
            float f3 = 0.0f;
            for (int i4 = 0; i4 < i; i4++) {
                int i5 = i2 + i4;
                if (i5 >= fArr.length) {
                    break;
                }
                f3 = Math.max(f3, fArr[i5]);
            }
            float f4 = f3 + f2;
            if (f4 > f) {
                break;
            }
            i2 += i;
            i3 = Math.min(fArr.length, i2);
            f2 = f4;
        }
        int ceil = ((int) Math.ceil(i3 / i)) * i;
        if (i3 < fArr.length && f2 + 42.0f <= f) {
            ceil += i;
        }
        return Math.max(1, ceil);
    }

    static float usedDp(float[] fArr, int i, int i2) {
        float f = 0.0f;
        int i3 = 0;
        while (i3 < i2) {
            float f2 = 42.0f;
            for (int i4 = 0; i4 < i; i4++) {
                int i5 = i3 + i4;
                if (i5 < Math.min(i2, fArr.length)) {
                    f2 = Math.max(f2, fArr[i5]);
                }
            }
            f += f2;
            i3 += i;
        }
        return f;
    }

    static float stretch(float[] fArr, int i, int i2, float f) {
        float usedDp = usedDp(fArr, i, i2);
        if (usedDp <= 0.0f) {
            return 1.0f;
        }
        float f2 = f / usedDp;
        if (f2 < 1.04f || f2 > 1.9f) {
            return 1.0f;
        }
        return f2;
    }

    static RemoteViews row(Context context, float f) {
        return new RemoteViews(context.getPackageName(), f > 1.0f ? R.layout.widget_row_fill : R.layout.widget_row);
    }

    static void fillCell(RemoteViews remoteViews, int i, float f) {
        if (f <= 1.0f || Build.VERSION.SDK_INT < 31) {
            return;
        }
        remoteViews.setViewLayoutHeight(i, -1.0f, 0);
    }

    static float clamp(float f, float f2, float f3) {
        return Math.max(f, Math.min(f3, f2));
    }

    static void fluidText(RemoteViews remoteViews, int i, float f, float f2, float f3) {
        remoteViews.setTextViewTextSize(i, 2, clamp(f, f2, f3));
    }

    static int linesFor(float f, float f2, int i, int i2) {
        return Math.max(i, Math.min(i2, (int) Math.floor(f / (f2 * 1.3f))));
    }

    static PendingIntent openApp(Context context, String str, int i) {
        Intent intent = new Intent("android.intent.action.VIEW", Uri.parse("focusfrog://open?go=" + str));
        intent.setPackage(context.getPackageName());
        intent.addFlags(805306368);
        return PendingIntent.getActivity(context, i, intent, 201326592);
    }

    static PendingIntent broadcast(Context context, Class<?> cls, String str, int i, String str2, String str3) {
        Intent action = new Intent(context, cls).setAction(str);
        if (str2 != null) {
            action.putExtra(str2, str3);
        }
        return PendingIntent.getBroadcast(context, i, action, 201326592);
    }
}
