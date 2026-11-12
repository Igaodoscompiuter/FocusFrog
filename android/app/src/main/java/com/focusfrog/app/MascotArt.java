package com.focusfrog.app;

import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.graphics.RectF;
import android.graphics.Typeface;
import androidx.core.view.ViewCompat;
import org.json.JSONArray;
import org.json.JSONObject;

/* loaded from: classes.dex */
final class MascotArt {
    static final float TONGUE_X = 73.0f;
    static final float TONGUE_Y = 32.0f;

    enum Face {
        OPEN,
        BLINK,
        HAPPY,
        SLEEP,
        HUNGRY,
        EAT,
        LOOKUP,
        PROUD,
        JOY
    }

    static final class Frame {
        Face face = Face.OPEN;
        float squash = 1.0f;
        float hop = 0.0f;
        int hearts = 0;
        int zzz = -1;
        boolean fly = false;
        float flyX = -1.0f;
        float flyY = 0.0f;
        float tongue = 0.0f;
        int sparkle = -1;

        Frame() {
        }

        Frame face(Face face) {
            this.face = face;
            return this;
        }

        Frame squash(float f) {
            this.squash = f;
            return this;
        }

        Frame hop(float f) {
            this.hop = f;
            return this;
        }

        Frame hearts(int i) {
            this.hearts = i;
            return this;
        }

        Frame zzz(int i) {
            this.zzz = i;
            return this;
        }

        Frame fly(boolean z) {
            this.fly = z;
            return this;
        }

        Frame sparkle(int i) {
            this.sparkle = i;
            return this;
        }

        Frame flyAt(float f, float f2) {
            this.flyX = f;
            this.flyY = f2;
            this.fly = true;
            return this;
        }

        Frame tongue(float f) {
            this.tongue = f;
            return this;
        }

        String key() {
            return this.face + "/" + this.squash + "/" + this.hop + "/" + this.hearts + "/" + this.zzz + "/" + this.fly + "/" + this.sparkle + "/" + this.flyX + "," + this.flyY + "/" + this.tongue;
        }
    }

    static final class Look {
        int primary = -13730510;
        int secondary = -5319295;
        int accent = -3722;
        String patternKind = "plain";
        float[][] dots = new float[0][];
        float[][] stripes = new float[0][];
        String special = "";
        String accessory = "acc_none";
        String scene = "scene_pond";
        boolean fireflies = false;

        Look() {
        }

        static Look from(JSONObject jSONObject) {
            Look look = new Look();
            if (jSONObject == null) {
                return look;
            }
            JSONObject optJSONObject = jSONObject.optJSONObject("colors");
            if (optJSONObject != null) {
                look.primary = parse(optJSONObject.optString("primary"), look.primary);
                look.secondary = parse(optJSONObject.optString("secondary"), look.secondary);
                look.accent = parse(optJSONObject.optString("accent"), look.accent);
            }
            look.patternKind = jSONObject.optString("pattern", "plain");
            look.special = jSONObject.optString("special", "");
            look.accessory = jSONObject.optString("accessory", "acc_none");
            look.scene = jSONObject.optString("scene", "scene_pond");
            look.fireflies = jSONObject.optLong("fireflyUntil", 0L) > System.currentTimeMillis();
            JSONObject optJSONObject2 = jSONObject.optJSONObject("patternShapes");
            if (optJSONObject2 != null) {
                look.dots = arr(optJSONObject2.optJSONArray("dots"), 3);
                look.stripes = arr(optJSONObject2.optJSONArray("stripes"), 6);
            }
            return look;
        }

        private static int parse(String str, int i) {
            try {
                return Color.parseColor(str);
            } catch (Exception unused) {
                return i;
            }
        }

        private static float[][] arr(JSONArray jSONArray, int i) {
            if (jSONArray == null) {
                return new float[0][];
            }
            float[][] fArr = new float[jSONArray.length()][];
            for (int i2 = 0; i2 < jSONArray.length(); i2++) {
                JSONArray optJSONArray = jSONArray.optJSONArray(i2);
                fArr[i2] = new float[i];
                for (int i3 = 0; i3 < i && optJSONArray != null; i3++) {
                    fArr[i2][i3] = (float) optJSONArray.optDouble(i3, 0.0d);
                }
            }
            return fArr;
        }
    }

    private MascotArt() {
    }

    static Bitmap draw(Look look, Frame frame, int i) {
        int i2;
        char c;
        float[][] fArr;
        Bitmap createBitmap = Bitmap.createBitmap(i, i, Bitmap.Config.ARGB_8888);
        Canvas canvas = new Canvas(createBitmap);
        float f = i / 100.0f;
        canvas.scale(f, f);
        char c2 = 1;
        Paint paint = new Paint(1);
        paint.setColor(-13660325);
        canvas.drawOval(new RectF(8.0f, 78.0f, 92.0f, 98.0f), paint);
        paint.setColor(-12933784);
        canvas.drawOval(new RectF(12.0f, 79.0f, 88.0f, 95.0f), paint);
        paint.setColor(855638016);
        Path path = new Path();
        float f2 = 50.0f;
        path.moveTo(50.0f, 88.0f);
        path.lineTo(84.0f, 82.0f);
        path.lineTo(86.0f, 90.0f);
        path.close();
        canvas.drawPath(path, paint);
        if ("scene_lotus".equals(look.scene)) {
            lotus(canvas, 82.0f, 86.0f);
        }
        float min = 1.0f - (Math.min(frame.hop, 14.0f) / 30.0f);
        paint.setColor(1073741824);
        float f3 = 25.0f * min;
        float f4 = min * 4.0f;
        canvas.drawOval(new RectF(50.0f - f3, 84.0f - f4, f3 + 50.0f, f4 + 84.0f), paint);
        if ("glow".equals(look.special) || "stars".equals(look.special) || "rainbow".equals(look.special) || "crystal".equals(look.special)) {
            paint.setColor(855638016 | (look.accent & ViewCompat.MEASURED_SIZE_MASK));
            canvas.drawCircle(50.0f, 58.0f - frame.hop, 40.0f, paint);
        }
        canvas.save();
        canvas.translate(0.0f, -frame.hop);
        canvas.scale(((1.0f - frame.squash) * 0.6f) + 1.0f, frame.squash, 50.0f, 85.0f);
        Paint paint2 = new Paint(1);
        paint2.setStyle(Paint.Style.STROKE);
        paint2.setStrokeWidth(1.4f);
        paint2.setColor(1073741824);
        paint.setColor(look.primary);
        oval(canvas, paint, paint2, 28.0f, 75.0f, 12.0f, 10.0f);
        oval(canvas, paint, paint2, 72.0f, 75.0f, 12.0f, 10.0f);
        canvas.drawOval(new RectF(20.0f, 35.0f, 80.0f, 85.0f), paint);
        paint.setColor("speckles".equals(look.patternKind) ? 1493172224 : (look.accent & ViewCompat.MEASURED_SIZE_MASK) | (-1728053248));
        for (float[] fArr2 : look.dots) {
            canvas.drawCircle(fArr2[0] + 50.0f, fArr2[1] + 60.0f, fArr2[2], paint);
        }
        char c3 = 3;
        if (look.stripes.length > 0) {
            Paint paint3 = new Paint(1);
            paint3.setStyle(Paint.Style.STROKE);
            paint3.setStrokeWidth(3.2f);
            paint3.setStrokeCap(Paint.Cap.ROUND);
            paint3.setColor((look.accent & ViewCompat.MEASURED_SIZE_MASK) | (-1946157056));
            float[][] fArr3 = look.stripes;
            int length = fArr3.length;
            int i3 = 0;
            while (i3 < length) {
                float[] fArr4 = fArr3[i3];
                Path path2 = new Path();
                path2.moveTo(fArr4[0] + f2, fArr4[c2] + 60.0f);
                path2.quadTo(fArr4[2] + f2, fArr4[c3] + 60.0f, fArr4[4] + f2, fArr4[5] + 60.0f);
                canvas.drawPath(path2, paint3);
                i3++;
                c3 = 3;
                c2 = 1;
                f2 = 50.0f;
            }
        }
        if ("stars".equals(look.special)) {
            paint.setColor(-570425345);
            char c4 = 1;
            i2 = 3;
            float[][] fArr5 = {new float[]{-14.0f, -8.0f}, new float[]{8.0f, -14.0f}, new float[]{17.0f, -2.0f}, new float[]{-6.0f, -16.0f}, new float[]{-20.0f, 2.0f}};
            int i4 = 0;
            while (i4 < 5) {
                float[] fArr6 = fArr5[i4];
                canvas.drawCircle(fArr6[0] + 50.0f, fArr6[c4] + 60.0f, 1.3f, paint);
                i4++;
                c4 = 1;
            }
        } else {
            i2 = 3;
        }
        paint.setColor((look.secondary & ViewCompat.MEASURED_SIZE_MASK) | (-872415232));
        canvas.drawOval(new RectF(30.0f, 47.0f, 70.0f, 83.0f), paint);
        paint.setColor(look.primary);
        int i5 = i2;
        oval(canvas, paint, paint2, 38.0f, 80.0f, 8.0f, 6.0f);
        oval(canvas, paint, paint2, 62.0f, 80.0f, 8.0f, 6.0f);
        eyes(canvas, frame.face, look);
        mouth(canvas, frame.face, look);
        accessory(canvas, look.accessory, frame.face);
        canvas.restore();
        if (look.fireflies) {
            fireflies(canvas, ((double) frame.squash) < 0.97d ? 1 : 0);
        }
        if (frame.tongue > 0.0f) {
            Paint paint4 = new Paint(1);
            paint4.setStyle(Paint.Style.STROKE);
            paint4.setStrokeWidth(3.6f);
            paint4.setStrokeCap(Paint.Cap.ROUND);
            paint4.setColor(-757066);
            canvas.drawLine(50.0f, 70.0f, (frame.tongue * 23.0f) + 50.0f, (frame.tongue * (-38.0f)) + 70.0f, paint4);
        }
        if (frame.flyX >= 0.0f) {
            fly(canvas, frame.flyX, frame.flyY);
        } else if (frame.fly) {
            fly(canvas, 84.0f, 26.0f - (frame.hop * 0.3f));
        }
        if (frame.hearts > 0) {
            heart(canvas, 74.0f, frame.hearts == 1 ? 26.0f : 18.0f, 5.0f, -757066);
        }
        if (frame.zzz >= 0) {
            Paint paint5 = new Paint(1);
            paint5.setColor(-4203522);
            paint5.setTypeface(Typeface.create(Typeface.DEFAULT, 1));
            int i6 = 0;
            while (i6 <= frame.zzz) {
                paint5.setTextSize((i6 * 4) + 8);
                canvas.drawText(i6 == 2 ? "Z" : "z", (i6 * 7) + 70, 32 - (i6 * 9), paint5);
                i6++;
            }
        }
        if (frame.sparkle >= 0) {
            if (frame.sparkle == 0) {
                fArr = new float[i5][];
                float[] fArr7 = new float[i5];
                // fill-array-data instruction
                fArr7[0] = 18.0f;
                fArr7[1] = 30.0f;
                fArr7[2] = 5.0f;
                fArr[0] = fArr7;
                float[] fArr8 = new float[i5];
                // fill-array-data instruction
                fArr8[0] = 82.0f;
                fArr8[1] = 22.0f;
                fArr8[2] = 4.0f;
                c = 1;
                fArr[1] = fArr8;
                float[] fArr9 = new float[i5];
                // fill-array-data instruction
                fArr9[0] = 76.0f;
                fArr9[1] = 50.0f;
                fArr9[2] = 3.0f;
                fArr[2] = fArr9;
            } else {
                c = 1;
                fArr = new float[i5][];
                float[] fArr10 = new float[i5];
                // fill-array-data instruction
                fArr10[0] = 22.0f;
                fArr10[1] = 22.0f;
                fArr10[2] = 4.0f;
                fArr[0] = fArr10;
                float[] fArr11 = new float[i5];
                // fill-array-data instruction
                fArr11[0] = 84.0f;
                fArr11[1] = 34.0f;
                fArr11[2] = 5.0f;
                fArr[1] = fArr11;
                float[] fArr12 = new float[i5];
                // fill-array-data instruction
                fArr12[0] = 16.0f;
                fArr12[1] = 50.0f;
                fArr12[2] = 3.0f;
                fArr[2] = fArr12;
            }
            for (float[] fArr13 : fArr) {
                sparkle(canvas, fArr13[0], fArr13[c], fArr13[2]);
            }
        }
        return createBitmap;
    }

    private static void oval(Canvas canvas, Paint paint, Paint paint2, float f, float f2, float f3, float f4) {
        RectF rectF = new RectF(f - f3, f2 - f4, f + f3, f2 + f4);
        canvas.drawOval(rectF, paint);
        canvas.drawOval(rectF, paint2);
    }

    private static void eyes(Canvas canvas, Face face, Look look) {
        Paint paint = new Paint(1);
        float[] fArr = {40.0f, 60.0f};
        for (int i = 0; i < 2; i++) {
            float f = fArr[i];
            int ordinal = face.ordinal();
            if (ordinal == 1 || ordinal == 3) {
                paint.setColor(look.primary);
                canvas.drawCircle(f, 45.0f, 10.0f, paint);
                Paint paint2 = new Paint(1);
                paint2.setStyle(Paint.Style.STROKE);
                paint2.setStrokeWidth(1.8f);
                paint2.setStrokeCap(Paint.Cap.ROUND);
                paint2.setColor(darker(look.primary));
                Path path = new Path();
                path.moveTo(f - 7.0f, 46.0f);
                path.quadTo(f, 49.0f, 7.0f + f, 46.0f);
                canvas.drawPath(path, paint2);
            } else if (ordinal == 8) {
                paint.setColor(look.primary);
                canvas.drawCircle(f, 45.0f, 10.0f, paint);
                Paint paint3 = new Paint(1);
                paint3.setStyle(Paint.Style.STROKE);
                paint3.setStrokeWidth(2.6f);
                paint3.setStrokeCap(Paint.Cap.ROUND);
                paint3.setColor(-1728053248);
                Path path2 = new Path();
                path2.moveTo(f - 7.0f, 48.0f);
                path2.quadTo(f, 39.0f, 7.0f + f, 48.0f);
                canvas.drawPath(path2, paint3);
            } else {
                paint.setColor(-1);
                canvas.drawCircle(f, 45.0f, 10.0f, paint);
                float f2 = face == Face.EAT ? 3.0f : 0.0f;
                float f3 = (face == Face.LOOKUP || face == Face.HUNGRY || face == Face.EAT) ? -3.5f : 0.0f;
                float f4 = (face == Face.HAPPY || face == Face.PROUD) ? 5.6f : face == Face.EAT ? 4.6f : 5.0f;
                paint.setColor(ViewCompat.MEASURED_STATE_MASK);
                float f5 = f + f2;
                canvas.drawCircle(f5, 45.0f + f3, f4, paint);
                paint.setColor(-1);
                canvas.drawCircle(f5 + 1.8f, f3 + 43.0f, (face == Face.HAPPY || face == Face.PROUD) ? 2.0f : 1.5f, paint);
            }
        }
    }

    private static void mouth(Canvas canvas, Face face, Look look) {
        Paint paint = new Paint(1);
        paint.setStyle(Paint.Style.STROKE);
        paint.setStrokeWidth(2.0f);
        paint.setStrokeCap(Paint.Cap.ROUND);
        paint.setColor(look.secondary);
        Path path = new Path();
        int ordinal = face.ordinal();
        if (ordinal != 2) {
            if (ordinal == 3) {
                path.moveTo(47.0f, 69.0f);
                path.lineTo(53.0f, 69.0f);
                canvas.drawPath(path, paint);
                return;
            }
            if (ordinal == 4) {
                Paint paint2 = new Paint(1);
                paint2.setColor(darker(look.primary));
                canvas.drawOval(new RectF(47.0f, 66.5f, 53.0f, 71.0f), paint2);
                return;
            } else {
                if (ordinal == 5) {
                    Paint paint3 = new Paint(1);
                    paint3.setColor(-1946157056);
                    canvas.drawOval(new RectF(45.8f, 65.9f, 54.2f, 73.1f), paint3);
                    paint3.setColor(-757066);
                    canvas.drawOval(new RectF(47.4f, 69.4f, 52.6f, 72.6f), paint3);
                    return;
                }
                if (ordinal != 7 && ordinal != 8) {
                    path.moveTo(45.0f, 68.0f);
                    path.quadTo(50.0f, 72.0f, 55.0f, 68.0f);
                    canvas.drawPath(path, paint);
                    return;
                }
            }
        }
        Paint paint4 = new Paint(1);
        paint4.setColor(1509192374);
        canvas.drawOval(new RectF(29.0f, 61.6f, 37.0f, 66.4f), paint4);
        canvas.drawOval(new RectF(63.0f, 61.6f, 71.0f, 66.4f), paint4);
        paint.setStrokeWidth(2.2f);
        path.moveTo(42.0f, 66.0f);
        path.quadTo(50.0f, 75.0f, 58.0f, 66.0f);
        canvas.drawPath(path, paint);
    }


    /*
    */
    private static void accessory(Canvas canvas, String str, Face face) {
        char c = 1;
        Paint paint = new Paint(1);
        Paint paint2 = new Paint(1);
        paint2.setStyle(Paint.Style.STROKE);
        if (str == null) {
            str = "";
        }
        str.hashCode();
        switch (str.hashCode()) {
            case -1805022941:
                if (str.equals("acc_headphones")) {
                    c = 0;
                    break;
                }
                c = 65535;
                break;
            case -863030420:
                if (str.equals("acc_glasses")) {
                    c = 1;
                    break;
                }
                c = 65535;
                break;
            case 1633556484:
                if (str.equals("acc_bowtie")) {
                    c = 2;
                    break;
                }
                c = 65535;
                break;
            case 1993363321:
                if (str.equals("acc_crown")) {
                    c = 3;
                    break;
                }
                c = 65535;
                break;
            case 2142767196:
                if (str.equals("acc_leaf")) {
                    c = 4;
                    break;
                }
                c = 65535;
                break;
            default:
                c = 65535;
                break;
        }
        switch (c) {
            case 0:
                Path path = new Path();
                path.moveTo(25.0f, 50.0f);
                path.quadTo(25.0f, 22.0f, 50.0f, 22.0f);
                path.quadTo(75.0f, 22.0f, 75.0f, 50.0f);
                paint2.setColor(-14735049);
                paint2.setStrokeWidth(3.4f);
                canvas.drawPath(path, paint2);
                paint.setColor(-12877066);
                canvas.drawRoundRect(new RectF(19.0f, 44.0f, 28.0f, 59.0f), 4.0f, 4.0f, paint);
                canvas.drawRoundRect(new RectF(72.0f, 44.0f, 81.0f, 59.0f), 4.0f, 4.0f, paint);
                break;
            case 1:
                paint.setColor(-15656921);
                canvas.drawRoundRect(new RectF(29.0f, 40.0f, 49.0f, 51.0f), 5.0f, 5.0f, paint);
                canvas.drawRoundRect(new RectF(51.0f, 40.0f, 71.0f, 51.0f), 5.0f, 5.0f, paint);
                paint2.setColor(-15656921);
                paint2.setStrokeWidth(2.0f);
                canvas.drawLine(49.0f, 44.0f, 51.0f, 44.0f, paint2);
                paint2.setColor(1509949439);
                paint2.setStrokeWidth(1.6f);
                paint2.setStrokeCap(Paint.Cap.ROUND);
                canvas.drawLine(TONGUE_Y, 43.0f, 38.0f, 43.0f, paint2);
                break;
            case 2:
                Path path2 = new Path();
                path2.moveTo(50.0f, 76.0f);
                path2.lineTo(40.0f, 71.0f);
                path2.lineTo(40.0f, 81.0f);
                path2.close();
                path2.moveTo(50.0f, 76.0f);
                path2.lineTo(60.0f, 71.0f);
                path2.lineTo(60.0f, 81.0f);
                path2.close();
                paint.setColor(-2349530);
                canvas.drawPath(path2, paint);
                paint.setColor(-6743269);
                canvas.drawCircle(50.0f, 76.0f, 2.6f, paint);
                break;
            case 3:
                Path path3 = new Path();
                path3.moveTo(37.0f, 33.0f);
                path3.lineTo(39.0f, 20.0f);
                path3.lineTo(45.0f, 27.0f);
                path3.lineTo(50.0f, 17.0f);
                path3.lineTo(55.0f, 27.0f);
                path3.lineTo(61.0f, 20.0f);
                path3.lineTo(63.0f, 33.0f);
                path3.close();
                paint.setColor(-278748);
                canvas.drawPath(path3, paint);
                paint2.setColor(-4959479);
                paint2.setStrokeWidth(1.2f);
                canvas.drawPath(path3, paint2);
                paint.setColor(-2349530);
                canvas.drawCircle(50.0f, 28.0f, 1.8f, paint);
                break;
            case 4:
                Path path4 = new Path();
                path4.moveTo(50.0f, 34.0f);
                path4.quadTo(41.0f, 22.0f, 50.0f, 14.0f);
                path4.quadTo(59.0f, 22.0f, 50.0f, 34.0f);
                path4.close();
                paint.setColor(-11870592);
                canvas.drawPath(path4, paint);
                paint2.setColor(-15309516);
                paint2.setStrokeWidth(1.2f);
                canvas.drawPath(path4, paint2);
                canvas.drawLine(50.0f, TONGUE_Y, 50.0f, 19.0f, paint2);
                break;
        }
    }

    private static void lotus(Canvas canvas, float f, float f2) {
        Paint paint = new Paint(1);
        paint.setColor(-415532);
        int[] iArr = {-40, 0, 40};
        for (int i = 0; i < 3; i++) {
            int i2 = iArr[i];
            canvas.save();
            canvas.rotate(i2, f, f2);
            canvas.drawOval(new RectF(f - 3.4f, f2 - 12.0f, 3.4f + f, 2.0f + f2), paint);
            canvas.restore();
        }
        paint.setColor(-137590);
        canvas.drawCircle(f, f2 - 1.0f, 2.0f, paint);
    }

    private static void fireflies(Canvas canvas, int i) {
        float[][] fArr;
        if (i == 0) {
            fArr = new float[][]{new float[]{14.0f, 40.0f}, new float[]{86.0f, 30.0f}, new float[]{20.0f, 66.0f}, new float[]{80.0f, 60.0f}};
        } else {
            fArr = new float[][]{new float[]{18.0f, 34.0f}, new float[]{82.0f, 38.0f}, new float[]{12.0f, 58.0f}, new float[]{88.0f, 66.0f}};
        }
        Paint paint = new Paint(1);
        paint.setColor(1442701383);
        Paint paint2 = new Paint(1);
        paint2.setColor(-69494);
        for (float[] fArr2 : fArr) {
            canvas.drawCircle(fArr2[0], fArr2[1], 4.5f, paint);
            canvas.drawCircle(fArr2[0], fArr2[1], 1.6f, paint2);
        }
    }

    private static void fly(Canvas canvas, float f, float f2) {
        Paint paint = new Paint(1);
        paint.setColor(-857672962);
        float f3 = f2 - 6.0f;
        float f4 = f2 - 1.0f;
        canvas.drawOval(new RectF(f - 6.0f, f3, f - 0.5f, f4), paint);
        canvas.drawOval(new RectF(0.5f + f, f3, 6.0f + f, f4), paint);
        Paint paint2 = new Paint(1);
        paint2.setColor(-14735049);
        canvas.drawOval(new RectF(f - 3.0f, f2 - 2.2f, f + 3.0f, f2 + 2.2f), paint2);
    }

    private static void heart(Canvas canvas, float f, float f2, float f3, int i) {
        Paint paint = new Paint(1);
        paint.setColor(i);
        Path path = new Path();
        float f4 = f2 + (0.9f * f3);
        path.moveTo(f, f4);
        float f5 = f3 * 1.4f;
        float f6 = f2 - (0.1f * f3);
        float f7 = f3 * 0.7f;
        float f8 = f2 - (1.1f * f3);
        path.cubicTo(f - f5, f6, f - f7, f8, f, f2 - (0.35f * f3));
        path.cubicTo(f + f7, f8, f + f5, f6, f, f4);
        canvas.drawPath(path, paint);
    }

    private static void sparkle(Canvas canvas, float f, float f2, float f3) {
        Paint paint = new Paint(1);
        paint.setColor(-278748);
        Path path = new Path();
        float f4 = f2 - f3;
        path.moveTo(f, f4);
        path.quadTo(f, f2, f + f3, f2);
        path.quadTo(f, f2, f, f2 + f3);
        path.quadTo(f, f2, f - f3, f2);
        path.quadTo(f, f2, f, f4);
        canvas.drawPath(path, paint);
    }

    private static int darker(int i) {
        return Color.rgb((int) (Color.red(i) * 0.45f), (int) (Color.green(i) * 0.45f), (int) (Color.blue(i) * 0.45f));
    }
}
