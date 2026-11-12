package com.focusfrog.app;

import android.content.Context;
import androidx.core.app.NotificationCompat;
import androidx.vectordrawable.graphics.drawable.PathInterpolatorCompat;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Locale;
import java.util.TimeZone;
import org.json.JSONObject;

/* loaded from: classes.dex */
final class MascotCore {
    private static final long H = 3600000;
    static final String KEY = "mascotState";
    private static final String[] MISSION_ORDER = {"focos2", "frog", "tasks3", "break1", "feed2", "quick2"};
    static final String PREFS = "CapacitorStorage";
    static final int SLEEP_FROM = 22;
    static final int SLEEP_TO = 7;

    static boolean isSleepHour(int i) {
        return i >= 22 || i < 7;
    }

    private MascotCore() {
    }

    static JSONObject load(Context context, long j) {
        JSONObject fresh;
        try {
            fresh = new JSONObject(context.getSharedPreferences(PREFS, 0).getString(KEY, ""));
            if (fresh.optInt("v") != 1) {
                fresh = fresh(j);
            }
        } catch (Exception unused) {
            fresh = fresh(j);
        }
        settle(fresh, j);
        return fresh;
    }

    static void save(Context context, JSONObject jSONObject) {
        context.getSharedPreferences(PREFS, 0).edit().putString(KEY, jSONObject.toString()).apply();
    }

    static JSONObject fresh(long j) {
        JSONObject jSONObject = new JSONObject();
        try {
            String dayOf = dayOf(j);
            jSONObject.put("v", 1).put("food", 70).put("energy", 80).put("mood", 65).put("at", j).put("xp", 0).put("flies", 3).put("streak", 0).put("lastCareDay", "").put("lastSeen", j).put("mission", new JSONObject().put("day", dayOf).put("id", missionFor(dayOf)).put(NotificationCompat.CATEGORY_PROGRESS, 0).put("done", false)).put("pets", new JSONObject().put("start", 0).put("n", 0));
        } catch (Exception unused) {
        }
        return jSONObject;
    }

    static String dayOf(long j) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(j);
        return String.format(Locale.US, "%04d-%02d-%02d", Integer.valueOf(calendar.get(1)), Integer.valueOf(calendar.get(2) + 1), Integer.valueOf(calendar.get(5)));
    }

    static long daysBetween(String str, String str2) {
        try {
            SimpleDateFormat r0 = new SimpleDateFormat("yyyy-MM-dd", Locale.US);
            r0.setTimeZone(TimeZone.getTimeZone("UTC"));
            return Math.round((r0.parse(str2).getTime() - r0.parse(str).getTime()) / 8.64E7d);
        } catch (Exception unused) {
            return 2305843009213693951L;
        }
    }

    private static int hourOf(long j) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(j);
        return calendar.get(11);
    }

    private static double clamp(double d) {
        return Math.max(0.0d, Math.min(100.0d, d));
    }

    static String missionFor(String str) {
        long j = 0;
        for (int i = 0; i < str.length(); i++) {
            j = ((j * 31) + str.charAt(i)) & 4294967295L;
        }
        return MISSION_ORDER[(int) (j % MISSION_ORDER.length)];
    }

    static int missionTarget(String str) {
        str.hashCode();
        switch (str) {
            case "focos2":
            case "quick2":
            case "feed2":
                return 2;
            case "tasks3":
            case "pet3":
                return 3;
            default:
                return 1;
        }
    }

    static String missionLabel(String str) {
        str.hashCode();
        switch (str) {
            case "break1":
                return "Fazer uma pausa até o fim";
            case "focos2":
                return "Fazer 2 focos";
            case "quick2":
                return "Concluir 2 tarefas rápidas";
            case "tasks3":
                return "Concluir 3 tarefas";
            case "frog":
                return "Engolir o Sapo do Dia";
            case "feed2":
                return "Alimentar o mascote 2 vezes";
            default:
                return "Fazer 3 carinhos";
        }
    }

    static void settle(JSONObject jSONObject, long j) {
        JSONObject optJSONObject;
        try {
            double optDouble = jSONObject.optDouble("food", 70.0d);
            double optDouble2 = jSONObject.optDouble("energy", 80.0d);
            double optDouble3 = jSONObject.optDouble("mood", 65.0d);
            long optLong = jSONObject.optLong("at", j);
            long min = Math.min(j, optLong + 259200000);
            long j2 = optLong;
            double d = optDouble3;
            double d2 = optDouble;
            double d3 = optDouble2;
            while (j2 < min) {
                long j3 = optLong;
                long j4 = min;
                double min2 = Math.min(900000L, min - j2) / 3600000.0d;
                boolean isSleepHour = isSleepHour(hourOf(j2));
                d2 = clamp(d2 - ((isSleepHour ? 1.5d : 4.0d) * min2));
                d3 = clamp(d3 + ((isSleepHour ? 12 : -3) * min2));
                d = clamp(d - ((1.5d + (d2 < 25.0d ? 1.5d : 0.0d)) * min2));
                j2 += 900000;
                optLong = j3;
                min = j4;
            }
            jSONObject.put("food", d2).put("energy", d3).put("mood", d).put("at", Math.max(optLong, j));
            String dayOf = dayOf(j);
            JSONObject optJSONObject2 = jSONObject.optJSONObject("mission");
            if (optJSONObject2 != null) {
                if (!dayOf.equals(optJSONObject2.optString("day"))) {
                }
                optJSONObject = jSONObject.optJSONObject("react");
                if (optJSONObject != null || optJSONObject.optLong("until") > j) {
                }
                jSONObject.remove("react");
                return;
            }
            jSONObject.put("mission", new JSONObject().put("day", dayOf).put("id", missionFor(dayOf)).put(NotificationCompat.CATEGORY_PROGRESS, 0).put("done", false));
            optJSONObject = jSONObject.optJSONObject("react");
            if (optJSONObject != null) {
            }
        } catch (Exception unused) {
        }
    }

    static int levelFor(int i) {
        int[] iArr = {0, 0, 60, 160, 300, 500, 800, 1200, 1700, 2300, PathInterpolatorCompat.MAX_NUM_POINTS};
        int i2 = 1;
        for (int i3 = 2; i3 < 11; i3++) {
            if (i >= iArr[i3]) {
                i2 = i3;
            }
        }
        return i >= 3000 ? ((i - PathInterpolatorCompat.MAX_NUM_POINTS) / 800) + 10 : i2;
    }

    static String titleFor(int i) {
        if (i <= 2) {
            return "Girino";
        }
        if (i <= 4) {
            return "Sapinho";
        }
        if (i <= 6) {
            return "Saltador";
        }
        if (i <= 8) {
            return "Cantor da lagoa";
        }
        if (i == 9) {
            return "Guardião da lagoa";
        }
        return "Sábio da lagoa";
    }

    private static void react(JSONObject jSONObject, String str, long j, double d, Integer num) throws Exception {
        JSONObject optJSONObject = jSONObject.optJSONObject("react");
        if (optJSONObject != null && optJSONObject.optLong("until") > j && !"levelup".equals(str)) {
            String optString = optJSONObject.optString("kind");
            if ("levelup".equals(optString) || "streak".equals(optString) || "combo".equals(optString)) {
                return;
            }
        }
        JSONObject put = new JSONObject().put("kind", str).put("until", j + ((long) (d * 60000.0d)));
        if (num != null) {
            put.put("n", num);
        }
        jSONObject.put("react", put);
    }

    private static void gainXp(JSONObject jSONObject, int i, long j) throws Exception {
        int levelFor = levelFor(jSONObject.optInt("xp"));
        jSONObject.put("xp", jSONObject.optInt("xp") + i);
        int levelFor2 = levelFor(jSONObject.optInt("xp"));
        if (levelFor2 > levelFor) {
            jSONObject.put("flies", jSONObject.optInt("flies") + 2);
            react(jSONObject, "levelup", j, 30.0d, Integer.valueOf(levelFor2));
        }
    }

    private static void progress(JSONObject jSONObject, String str, int i, long j) throws Exception {
        JSONObject optJSONObject = jSONObject.optJSONObject("mission");
        if (optJSONObject == null || !str.equals(optJSONObject.optString("id")) || optJSONObject.optBoolean("done")) {
            return;
        }
        int missionTarget = missionTarget(str);
        optJSONObject.put(NotificationCompat.CATEGORY_PROGRESS, Math.min(missionTarget, optJSONObject.optInt(NotificationCompat.CATEGORY_PROGRESS) + i));
        if (optJSONObject.optInt(NotificationCompat.CATEGORY_PROGRESS) >= missionTarget) {
            optJSONObject.put("done", true);
            jSONObject.put("flies", jSONObject.optInt("flies") + 2);
            gainXp(jSONObject, 25, j);
            JSONObject optJSONObject2 = jSONObject.optJSONObject("react");
            if (optJSONObject2 == null || !"levelup".equals(optJSONObject2.optString("kind"))) {
                react(jSONObject, "mission", j, 30.0d, null);
            }
        }
    }

    static void feed(JSONObject jSONObject, long j) {
        try {
            settle(jSONObject, j);
            if (jSONObject.optInt("flies") <= 0) {
                react(jSONObject, "nofly", j, 0.15d, null);
            } else {
                jSONObject.put("flies", jSONObject.optInt("flies") - 1);
                jSONObject.put("food", clamp(jSONObject.optDouble("food") + 28.0d)).put("mood", clamp(jSONObject.optDouble("mood") + 3.0d));
                react(jSONObject, "eat", j, 0.15d, null);
                gainXp(jSONObject, 2, j);
                progress(jSONObject, "feed2", 1, j);
            }
            jSONObject.put("lastSeen", j);
        } catch (Exception unused) {
        }
    }



    /*
    */
    static void pet(JSONObject jSONObject, long j) {
        try {
            settle(jSONObject, j);
            JSONObject pets = jSONObject.optJSONObject("pets");
            if (pets == null || j - pets.optLong("start") > H) {
                pets = new JSONObject().put("start", j).put("n", 0);
            }
            if (pets.optInt("n") < 5) {
                jSONObject.put("mood", clamp(jSONObject.optDouble("mood") + 5.0d));
                pets.put("n", pets.optInt("n") + 1);
                gainXp(jSONObject, 1, j);
                react(jSONObject, "pet", j, 0.15d, null);
            } else {
                react(jSONObject, "tickled", j, 0.15d, null);
            }
            jSONObject.put("pets", pets);
            progress(jSONObject, "pet3", 1, j);
            jSONObject.put("lastSeen", j);
        } catch (Exception unused) {
        }
    }

    static String status(JSONObject jSONObject, long j) {
        JSONObject optJSONObject = jSONObject.optJSONObject("react");
        return (optJSONObject == null || optJSONObject.optLong("until") <= j) ? isSleepHour(hourOf(j)) ? "sleepy" : jSONObject.optDouble("food") < 25.0d ? "hungry" : jSONObject.optDouble("energy") < 25.0d ? "tired" : jSONObject.optDouble("mood") < 30.0d ? "sad" : (jSONObject.optDouble("mood") <= 75.0d || jSONObject.optDouble("food") <= 50.0d) ? "normal" : "happy" : optJSONObject.optString("kind");
    }

    static String label(String str) {
        str.hashCode();
        switch (str) {
            case "tickled":
                return "Rindo";
            case "hungry":
            case "nofly":
                return "Com fome";
            case "missed":
                return "Com saudade";
            case "sleepy":
                return "Dormindo";
            case "streak":
                return "Comemorando";
            case "eat":
                return "Comendo";
            case "pet":
            case "happy":
                return "Feliz";
            case "sad":
                return "Pra baixo";
            case "frog":
            case "mission":
                return "Orgulhoso";
            case "task":
                return "Contente";
            case "levelup":
                return "Subiu de nível";
            case "break":
                return "Descansando";
            case "combo":
                return "No embalo";
            case "focus":
                return "Animado";
            case "tired":
                return "Cansado";
            default:
                return "Tranquilo";
        }
    }


    /*
    */
    static String speech(JSONObject jSONObject, String str) {
        String str2;
        String str3;
        JSONObject optJSONObject = jSONObject.optJSONObject("react");
        char c = 0;
        int optInt = optJSONObject == null ? 0 : optJSONObject.optInt("n");
        int optInt2 = jSONObject.optInt("flies");
        str.hashCode();
        switch (str.hashCode()) {
            case -1322971314:
                if (str.equals("tickled")) {
                    c = 0;
                    break;
                }
                c = 65535;
                break;
            case -1206103987:
                if (str.equals("hungry")) {
                    c = 1;
                    break;
                }
                c = 65535;
                break;
            case -1073880421:
                if (str.equals("missed")) {
                    c = 2;
                    break;
                }
                c = 65535;
                break;
            case -899765118:
                if (str.equals("sleepy")) {
                    c = 3;
                    break;
                }
                c = 65535;
                break;
            case -891990146:
                if (str.equals("streak")) {
                    c = 4;
                    break;
                }
                c = 65535;
                break;
            case 100184:
                if (str.equals("eat")) {
                    c = 5;
                    break;
                }
                c = 65535;
                break;
            case 113622:
                if (str.equals("sad")) {
                    c = 6;
                    break;
                }
                c = 65535;
                break;
            case 3151780:
                if (str.equals("frog")) {
                    c = 7;
                    break;
                }
                c = 65535;
                break;
            case 3552645:
                if (str.equals("task")) {
                    c = '\b';
                    break;
                }
                c = 65535;
                break;
            case 69785887:
                if (str.equals("levelup")) {
                    c = '\t';
                    break;
                }
                c = 65535;
                break;
            case 94001407:
                if (str.equals("break")) {
                    c = '\n';
                    break;
                }
                c = 65535;
                break;
            case 94843278:
                if (str.equals("combo")) {
                    c = 11;
                    break;
                }
                c = 65535;
                break;
            case 97604824:
                if (str.equals("focus")) {
                    c = '\f';
                    break;
                }
                c = 65535;
                break;
            case 104995602:
                if (str.equals("nofly")) {
                    c = '\r';
                    break;
                }
                c = 65535;
                break;
            case 110369276:
                if (str.equals("tired")) {
                    c = 14;
                    break;
                }
                c = 65535;
                break;
            case 1069449612:
                if (str.equals("mission")) {
                    c = 15;
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
                return "Haha, já chega. Bora focar?";
            case 1:
                if (optInt2 <= 0) {
                    return "Tô com fome. Um foco me traz uma mosca.";
                }
                StringBuilder sb = new StringBuilder("Tô com fome. Tem ");
                if (optInt2 == 1) {
                    str2 = "uma mosca guardada.";
                } else {
                    str2 = optInt2 + " moscas guardadas.";
                }
                sb.append(str2);
                return sb.toString();
            case 2:
                if (optInt <= 1) {
                    return "Senti sua falta. Bora começar com algo pequeno?";
                }
                return "A sequência de " + optInt + " dias acabou, mas o recorde fica. Bora começar outra hoje?";
            case 3:
                return "Zzz… descansar também faz parte.";
            case 4:
                return optInt + " dias seguidos! Ganhei moscas de presente.";
            case 5:
                return "Valeu pela mosca.";
            case 6:
                return "Tô meio pra baixo. Um carinho ajuda.";
            case 7:
                return "Você engoliu o Sapo do Dia. O resto é lucro.";
            case '\b':
                return "Mais uma concluída. Bora!";
            case '\t':
                return "Subi pro nível " + optInt + ": " + titleFor(optInt) + "! Ganhei 2 moscas.";
            case '\n':
                return "Pausa feita. Recarreguei a energia.";
            case 11:
                return "Combo de " + optInt + "! Uma mosca extra pra mim.";
            case '\f':
                StringBuilder sb2 = new StringBuilder("Mandou bem! Ganhei ");
                if (optInt == 1) {
                    str3 = "uma mosca.";
                } else {
                    str3 = optInt + " moscas.";
                }
                sb2.append(str3);
                return sb2.toString();
            case '\r':
                return "Sem moscas. Cada foco completo rende uma.";
            case 14:
                return "Tô cansado. Que tal uma pausa de 5 min?";
            case 15:
                return "Missão do dia cumprida! +2 moscas.";
            default:
                return null;
        }
    }
}
