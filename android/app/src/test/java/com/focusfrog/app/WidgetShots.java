package com.focusfrog.app;

import static org.junit.Assert.assertNotNull;

import android.app.Application;
import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.RemoteViews;
import org.robolectric.RuntimeEnvironment;
import java.io.File;
import java.io.FileOutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.robolectric.RobolectricTestRunner;
import org.robolectric.annotation.Config;
import org.robolectric.annotation.GraphicsMode;

/** Desenha os widgets em vários tamanhos para conferência visual. Saída em build/widget-shots. */
@RunWith(RobolectricTestRunner.class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = 34, qualifiers = "w411dp-h891dp-xxhdpi")
public class WidgetShots {
    static final float[][] SIZES = {{110, 100}, {250, 100}, {250, 150}, {330, 100}, {330, 150}, {330, 220}, {330, 300}, {170, 170}, {170, 300}, {110, 150}};

    private void seed(Context c) {
        String today = new SimpleDateFormat("yyyy-MM-dd", Locale.US).format(new Date());
        String agenda = "{\"date\":\"" + today + "\",\"items\":["
            + "{\"id\":\"a\",\"title\":\"Responder e-mail da faculdade\",\"kind\":\"check\",\"time\":\"09:00\",\"label\":\"Rápida\"},"
            + "{\"id\":\"b\",\"title\":\"Estudar capítulo 3\",\"kind\":\"open\",\"label\":\"Sapo do Dia · bloco 25 min\"},"
            + "{\"id\":\"c\",\"title\":\"Manhã de Dopamina\",\"kind\":\"routine\",\"time\":\"07:30\",\"label\":\"Rotina · 5 passos\"},"
            + "{\"id\":\"d\",\"title\":\"Marcar dentista\",\"kind\":\"check\"},"
            + "{\"id\":\"e\",\"title\":\"Pagar a fatura do cartão\",\"kind\":\"check\",\"time\":\"18:00\"},"
            + "{\"id\":\"f\",\"title\":\"Lavar a louça\",\"kind\":\"check\"},"
            + "{\"id\":\"g\",\"title\":\"Revisar relatório do trimestre com a equipe\",\"kind\":\"open\"},"
            + "{\"id\":\"h\",\"title\":\"Ligar pra mãe\",\"kind\":\"check\"},"
            + "{\"id\":\"i\",\"title\":\"Fazer compras\",\"kind\":\"check\"}]}";
        String list = "[{\"id\":\"1\",\"text\":\"Chaves\",\"completed\":true},{\"id\":\"2\",\"text\":\"Carteira\",\"completed\":false},"
            + "{\"id\":\"3\",\"text\":\"Celular e carregador\",\"completed\":false},{\"id\":\"4\",\"text\":\"Fones de ouvido\",\"completed\":false},"
            + "{\"id\":\"5\",\"text\":\"Garrafa de água\",\"completed\":false},{\"id\":\"6\",\"text\":\"Documento\",\"completed\":false}]";
        String frog = "{\"state\":\"active\",\"id\":\"t1\",\"date\":\"" + today + "\",\"title\":\"Terminar o relatório do trimestre\",\"badge\":\"Bloco · 25 min\","
            + "\"total\":3,\"done\":1,\"next\":\"Escrever a parte de resultados\",\"focusable\":true,\"cta\":\"Focar · 25 min\","
            + "\"steps\":[{\"id\":\"s1\",\"text\":\"Abrir o arquivo\",\"completed\":true},{\"id\":\"s2\",\"text\":\"Escrever a parte de resultados\",\"completed\":false},{\"id\":\"s3\",\"text\":\"Revisar e enviar pra equipe\",\"completed\":false}]}";
        c.getSharedPreferences("CapacitorStorage", 0).edit()
            .putString("agendaWidget", agenda).putString("leavingHomeItems", list).putString("frogWidget", frog).commit();
    }

    private void shot(Context c, RemoteViews rv, float w, float h, String name) throws Exception {
        float d = c.getResources().getDisplayMetrics().density;
        int pw = Math.round(w * d), ph = Math.round(h * d);
        FrameLayout parent = new FrameLayout(c);
        View v = rv.apply(c, parent);
        parent.addView(v, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        parent.measure(View.MeasureSpec.makeMeasureSpec(pw, View.MeasureSpec.EXACTLY), View.MeasureSpec.makeMeasureSpec(ph, View.MeasureSpec.EXACTLY));
        parent.layout(0, 0, pw, ph);
        Bitmap bmp = Bitmap.createBitmap(pw, ph, Bitmap.Config.ARGB_8888);
        bmp.eraseColor(0xFF0B1220);
        parent.draw(new Canvas(bmp));
        File dir = new File("build/widget-shots");
        dir.mkdirs();
        try (FileOutputStream o = new FileOutputStream(new File(dir, name + "_" + Math.round(w) + "x" + Math.round(h) + ".png"))) {
            bmp.compress(Bitmap.CompressFormat.PNG, 100, o);
        }
    }

    @Test
    public void render() throws Exception {
        Context c = RuntimeEnvironment.getApplication();
        seed(c);
        for (float[] s : SIZES) {
            RemoteViews a = AgendaWidgetProvider.build(c, 1, s[0], s[1]);
            assertNotNull(a);
            shot(c, a, s[0], s[1], "agenda");
            shot(c, ChecklistWidgetProvider.build(c, 2, s[0], s[1]), s[0], s[1], "japegou");
            shot(c, FrogWidgetProvider.build(c, 3, s[0], s[1]), s[0], s[1], "sapo");
            shot(c, MascotWidgetProvider.build(c, MascotWidgetProvider.kindFor(s[0], s[1]), null, s[0], s[1]), s[0], s[1], "mascote");
        }
    }
}
