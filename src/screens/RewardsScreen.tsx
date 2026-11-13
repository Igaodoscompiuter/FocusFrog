// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import Y from './RewardsScreen.module.css';
import * as React from 'react';
import * as jsxRuntime from 'react/jsx-runtime';
import { Capacitor } from '@capacitor/core';
import { useUI } from '../context/UIContext';
import { K2 } from '../hooks/useUserData';
import { useUser } from '../context/UserContext';
import { nP, tP } from '../sync/cloudSync';
import { useAuth } from '../hooks/useAuth';
import { C_rS } from './onboarding/Onboarding';
import { FiBell, FiCheckCircle, FiCloudLightning, FiCode, FiCoffee, FiDatabase, FiDownload, FiEdit3, FiHardDrive, FiHeart, FiHelpCircle, FiInfo, FiInstagram, FiLayout, FiLogOut, FiPower, FiShield, FiSmile, FiTrash2, FiType, FiUpload, FiUser, FiVolume2, FiZap } from 'react-icons/fi';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Cm, ES } from '../notifications';
import { Preferences } from '@capacitor/preferences';
import { yn } from '../components/ui/Sheet';
import { useTour } from '../components/tour/TourContext';
import { C_xl } from '../components/modals/ConfirmationModal';
import { gv } from './store/StoreScreen';
import { TT } from './focus/ZenLakeScreen';
import { jg } from '../components/UpdateAvailableModal';
import { C__r, C_gY, C_la, C_mY, No, Yw, Zw, up, yY } from '../components/dev/DevPanel';

export { Y };

import ET from "../assets/focusfrog-coffee.png";
export { ET };

const NT = "mascotNudges";

const AT = "mascotIcon";

async function aJ() {
  const [e, t] = await Promise.all([Preferences.get({
    key: NT
  }), Preferences.get({
    key: AT
  })]);
  return {
    nudges: e.value !== "off",
    icon: t.value === "on"
  };
}

async function iJ(e) {
  if (await Preferences.set({
    key: NT,
    value: e ? "on" : "off"
  }), e && Capacitor.isNativePlatform()) try {
    const {
      display: t
    } = await LocalNotifications.checkPermissions();
    t !== "granted" && (await LocalNotifications.requestPermissions());
  } catch {}
}

async function lJ(e) {
  await Preferences.set({
    key: AT,
    value: e ? "on" : "off"
  });
}

let Ue;

const C_vY = ({
  onBack: e
}) => {
  var C, S, T;
  const {
      user: t,
      isConfigured: n,
      isSigningIn: s,
      lastSyncAt: r,
      signIn: o,
      signOut: a,
      syncNowManual: l
    } = useAuth(),
    {
      addNotification: c
    } = useUI(),
    [u, d] = React.useState(null),
    [f, h] = React.useState(false),
    [m, v] = React.useState(false),
    [x, k] = React.useState(false),
    y = tP();
  if (!n) return <div className={`${Y.tabContent} ${Y.profileScreen}`}><No title="Conta e Sincronização" onBack={e} /><div className={Y.authCard}><span className={Y.authIcon}><FiCloudLightning size={40} /></span><h3>Sincronização indisponível</h3><p>Esta versão do app não tem a nuvem configurada. Seus dados continuam salvos neste celular.</p></div></div>;
  const p = async () => {
      k(true);
      const P = await l();
      k(false);
      const [O, V, U] = yY[P];
      c(O, V, U);
    },
    g = async () => {
      v(false), (await nP()) && (c("Dados anteriores do aparelho restaurados. Recarregando…", "↩️", "success"), setTimeout(() => window.location.reload(), 800));
    },
    b = ((C = t == null ? undefined : t.app_metadata) == null ? undefined : C.provider) || "",
    j = ((S = t == null ? undefined : t.user_metadata) == null ? undefined : S.full_name) || ((T = t == null ? undefined : t.user_metadata) == null ? undefined : T.name);
  return <div className={`${Y.tabContent} ${Y.profileScreen}`}><No title="Conta e Sincronização" onBack={e} />{t ? <div className={Y.authCard}><span className={Y.authIcon}><FiCheckCircle size={40} /></span><h3>{j || "Conectado"}</h3><p className={Y.accountMeta}>{t.email}{b && up[b] ? ` · ${up[b]}` : ""}</p><p className={Y.accountSync}>{"Última sincronização: "}<strong>{Zw(r)}</strong></p><p className={Y.accountNote}>O app sincroniza sozinho uma vez por dia ao abrir. Tarefas, rotinas, pontos e sapos ficam guardados na sua conta.</p><div className={Y.accountActions}><button className="btn btn-primary" onClick={p} disabled={x}><FiCloudLightning />{" "}{x ? "Sincronizando…" : "Sincronizar agora"}</button><button className="btn btn-secondary" onClick={() => h(true)}><FiLogOut />{" Sair da conta"}</button></div></div> : <div className={Y.authCard}><span className={Y.authIcon}><FiCloudLightning size={40} /></span><h3>Guarde seu progresso na nuvem</h3><p>Entre com uma conta pra não perder tarefas, rotinas, pontos e sapos se trocar de celular.</p><div className={Y.accountActions}><button className="account-btn account-google" onClick={() => d("google")} disabled={s}><C_rS />{" Entrar com Google"}</button></div>{s && <p className={Y.accountSync}>Esperando o login no navegador…</p>}<p className={Y.accountNote}>Se a conta já tiver dados, eles substituem os deste celular. Uma cópia do que está aqui fica guardada por 7 dias.</p></div>}{y && <div className={Y.undoCard}><p>{"Cópia dos dados anteriores deste celular, de "}{Zw(y.savedAt)}.</p><button className="btn btn-secondary" onClick={() => v(true)}>Desfazer e voltar pra ela</button></div>}{u && <C_xl title={`Entrar com ${up[u]}?`} message="Se essa conta já tiver dados salvos, eles vão substituir os deste celular (guardamos uma cópia por 7 dias, dá pra desfazer aqui). Se for uma conta nova, o que está neste celular sobe pra ela." confirmText="Entrar" onConfirm={() => {
      const P = u;
      d(null), o(P, "settings");
    }} onCancel={() => d(null)} />}{f && <C_xl title="Sair da conta?" message="Antes de sair, salvamos tudo na nuvem. Seus dados continuam neste celular e você pode entrar de novo quando quiser." confirmText="Sair" onConfirm={async () => {
      h(false), await a(), c("Você saiu da conta.", "👋", "info");
    }} onCancel={() => h(false)} />}{m && <C_xl title="Desfazer o login?" message="O celular volta pros dados que tinha antes de entrar na conta, e você sai da conta. A nuvem não é alterada." confirmText="Desfazer" variant="danger" onConfirm={g} onCancel={() => v(false)} />}</div>;
};

const C__Y = ({
  onBack: e,
  exportData: t,
  importDataFromFile: n,
  showResetModal: s
}) => {
  const r = React.useRef(null),
    o = () => {
      var l;
      (l = r.current) == null || l.click();
    },
    a = l => {
      var u;
      const c = (u = l.target.files) == null ? undefined : u[0];
      c && n(c);
    };
  return <div className={Y.tabContent}><No title="Dados do Aplicativo" onBack={e} /><div className={Y.dataInfoCard}><FiHardDrive className={Y.dataInfoIcon} /><div><h4>Seu cofre de dados local</h4><p>O FocusFrog salva tudo diretamente no seu dispositivo. Para evitar perdas, use os botões abaixo para{" "}<strong>Exportar (salvar)</strong>{" um arquivo de segurança e "}<strong>Importar (restaurar)</strong>{" seus dados."}</p></div></div><div className={Y.dataActions}><button className="btn btn-secondary" onClick={t}><FiDownload />{" Exportar para Arquivo"}</button><button className="btn btn-secondary" onClick={o}><FiUpload />{" Importar de Arquivo"}</button><button className={`btn ${Y.buttonDanger}`} onClick={s}><FiTrash2 />{" Resetar Dados Locais"}</button></div><input type="file" ref={r} style={{
      display: "none"
    }} accept=".json" onChange={a} /></div>;
};

export const xY = () => {
  const {
      addNotification: e,
      soundEnabled: t,
      toggleSoundEnabled: n,
      hapticsEnabled: s,
      setHapticsEnabled: r,
      devModeEnabled: o,
      setDevModeEnabled: a,
      fontSize: l,
      setFontSize: c
    } = useUI(),
    {
      exportData: u,
      importDataFromFile: d,
      resetData: f
    } = K2(),
    {
      userName: h,
      setUserName: m
    } = useUser(),
    [v, x] = React.useState(""),
    {
      addNotification: k
    } = useUI(),
    y = () => {
      const $ = v.trim();
      $ && (m($), k(`Prontinho, ${$}!`, "🐸", "success"), G("main"));
    },
    {
      restart: p
    } = useTour(),
    [g, b] = React.useState("2.4.9"),
    [j, C] = React.useState("idle");
  React.useEffect(() => {
    TT().then($ => {
      $ && b($.versionName);
    });
  }, []), React.useEffect(() => {
    const $ = je => {
      var R;
      return C((R = je.detail) != null && R.found ? "idle" : "latest");
    };
    return window.addEventListener("focusfrog:update-result", $), () => window.removeEventListener("focusfrog:update-result", $);
  }, []);
  const S = () => {
      C("checking"), window.dispatchEvent(new Event(jg));
    },
    [T, P] = React.useState(Cm),
    O = $ => {
      P($), ES($);
    },
    [V, U] = React.useState(true),
    [E, K] = React.useState(false);
  React.useEffect(() => {
    aJ().then($ => {
      U($.nudges), K($.icon);
    }).catch(() => {});
  }, []);
  const oe = $ => {
      U($), iJ($).catch(() => {});
    },
    ve = $ => {
      K($), lJ($).catch(() => {});
    },
    {
      user: Z,
      isLoading: D
    } = useAuth(),
    [q, G] = React.useState("main");
  yn(() => G("main"), q !== "main");
  const [de, re] = React.useState(false),
    [X, Ie] = React.useState(0),
    $e = React.useRef(null),
    Je = () => {
      $e.current && clearTimeout($e.current);
      const $ = X + 1;
      Ie($), $ >= 7 ? (a(true), e("Modo desenvolvedor ligado", "👾", "info"), Ie(0)) : $e.current = setTimeout(() => Ie(0), 1500);
    },
    z = () => re(true),
    F = () => re(false),
    J = () => {
      f(), F();
    },
    pe = $ => {
      r($), $ && navigator.vibrate && navigator.vibrate(50);
    },
    We = async () => {
      try {
        await navigator.clipboard.writeText(Yw);
      } catch {
        const $ = document.createElement("textarea");
        $.value = Yw, document.body.appendChild($), $.select(), document.execCommand("copy"), $.remove();
      }
      e("Chave Pix copiada! Cole no Pix do seu banco. Obrigado pelo apoio 💚", "🐸", "success");
    },
    Ct = () => {
      window.open("https://focusfrog.netlify.app/", "_blank");
    },
    H = () => {
      switch (q) {
        case "profile":
          return <C_vY onBack={() => G("main")} />;
        case "appearance":
          return <div className={Y.tabContent}><No title="Aparência" onBack={() => G("main")} /><C__r icon={FiLayout} title="Temas e sons de foco" description="Na Loja do Sapo, com seus pontos de foco" onClick={gv} /><div className={Y.settingRow}><label><FiVolume2 />{" Efeitos sonoros"}</label><label className={Y.switch}><input type="checkbox" checked={t} onChange={n} /><span className={Y.switchSlider} /></label></div><div className={Y.settingRow}><label><FiZap />{" Vibração (Haptics)"}</label><label className={Y.switch}><input type="checkbox" checked={s} onChange={$ => pe($.target.checked)} /><span className={Y.switchSlider} /></label></div><div className={Y.settingRow}><label><FiType />{" Tamanho do Texto"}</label><C_gY options={[{
                label: "P",
                value: "small"
              }, {
                label: "N",
                value: "normal"
              }, {
                label: "G",
                value: "large"
              }]} value={l} onChange={$ => c($)} /></div></div>;
        case "devImport":
          return <div className={Y.tabContent}><No title="Importar tarefas (JSON)" onBack={() => G("main")} /><C_mY onDone={() => G("main")} /></div>;
        case "data":
          return <C__Y onBack={() => G("main")} exportData={u} importDataFromFile={$ => d($, null)} showResetModal={z} />;
        case "name":
          return <div className={Y.tabContent}><No title="Seu nome" onBack={() => G("main")} /><form className={Y.nameForm} onSubmit={$ => {
              $.preventDefault(), y();
            }}><label htmlFor="ff-name">Como o app chama você</label><input id="ff-name" className={Y.nameInput} value={v} maxLength={30} autoFocus autoComplete="given-name" onChange={$ => x($.target.value)} placeholder="Seu nome" /><p className={Y.guardHint}>Aparece na saudação da tela inicial. Só fica no seu celular (e na sua conta, se você entrou com o Google).</p><button type="submit" className={Y.nameSave} disabled={!v.trim() || v.trim() === h}>Salvar</button></form></div>;
        case "about":
          return <div className={`${Y.tabContent} ${Y.aboutScreen}`}><No title="De Usuário para Usuário 🐸" onBack={() => G("main")} /><div className={Y.aboutContentWrapper}><img src={ET} alt="Mascote FocusFrog com café" className={Y.aboutAppIcon} /><div className={Y.founderCard}><div className={Y.founderHeader}><FiUser className={Y.founderIcon} /><p className={Y.founderGreeting}>Olá! Eu sou o Igor, e antes de ser o fundador, eu sou o<br /><strong>usuário #1</strong>{" do FocusFrog."}</p></div><div className={Y.founderBody}><p>{"Esta ferramenta não nasceu de um plano de negócios, mas da "}<strong>necessidade real</strong>. Eu luto diariamente contra a paralisia da escolha, o caos nas rotinas e o esquecimento constante,{" "}<strong>assim como você</strong>.</p><p>{"Entendi que o cérebro com TDAH e criatividade precisa de "}<strong>apoio</strong>, não de cobrança. Por isso, construí o FocusFrog: um sistema que realmente funciona para mim.</p></div></div><div className={Y.supportCard}><div className={Y.missionStatement}><FiHeart className={Y.missionIcon} /><h3>Nossa Missão</h3><p>{"Levar "}<strong>PRODUTIVIDADE CALMA</strong>{" e clareza para todos que se sentem sobrecarregados."}</p></div><p>{"Ao apoiar esta missão, você garante que o FocusFrog permaneça "}<strong>livre de anúncios</strong>{" e continue a evoluir para a nossa comunidade."}</p></div><div className={Y.socialActions}><button className={Y.coffeeButton} onClick={Ct}><FiCoffee />{" Apoie com um café"}</button><a href="https://www.instagram.com/focus.frog" target="_blank" rel="noopener noreferrer" className={Y.instagramButton}><FiInstagram />{" Siga-nos"}</a><button className={Y.pixButton} onClick={We}><span className={Y.pixIcon}>◆</span>{" Apoiar via Pix"}</button></div>{Capacitor.isNativePlatform() && <button className={Y.updateButton} onClick={S} disabled={j === "checking"}>{j === "checking" ? "Verificando…" : j === "latest" ? "✓ Você está na versão mais recente" : "Verificar atualizações"}</button>}<div className={Y.appVersion} onClick={Je}>FocusFrog v{g}{" • Feito com 💚🐸"}</div></div></div>;
        case "main":
        default:
          return <div className={Y.tabContent}><div className={Y.header}><h2>Ajustes</h2></div><div className={Y.settingsBody}><button type="button" className={Y.profileCard} onClick={() => {
                x(h || ""), G("name");
              }}><span className={Y.avatar} aria-hidden="true">{(h || "?").trim().charAt(0).toUpperCase() || "?"}</span><span className={Y.profileText}><strong>{h || "Como quer ser chamado?"}</strong><small>{Z ? `Conta Google · ${Z.email ?? "conectada"}` : "Dados só neste celular"}</small></span><span className={Y.profileEdit}><FiEdit3 />{" Editar"}</span></button><C_la title="Conta"><C__r icon={FiUser} title="Conta e sincronização" description={Z ? "Salvando na nuvem" : "Entre com o Google pra salvar"} onClick={() => G("profile")} /><C__r icon={FiDatabase} title="Gerenciar dados" description="Backup, restauração e reset" onClick={() => G("data")} /></C_la><C_la title="Foco"><div className={Y.guardCard}><div className={Y.guardHead}><div className={Y.navRowIconWrapper}><FiShield /></div><div className={Y.navRowText}><h4>Proteger o foco</h4><p>{T ? "Ligado" : "Desligado"}</p></div><label className={Y.switch} aria-label="Proteger o foco"><input type="checkbox" checked={T} onChange={$ => O($.target.checked)} /><span className={Y.switchSlider} /></label></div><ul className={Y.guardList}><li>Se você abrir outro app durante o foco, o FocusFrog te chama de volta.</li><li>O sapo vem se o tempo fora ficar abaixo de 10% do foco (até 2,5 min num foco de 25).</li><li>Usa o celular pra fazer a tarefa? Desligue aqui e o sapo vem do mesmo jeito.</li></ul></div></C_la><C_la title="Sapo mascote"><div className={Y.guardCard}><div className={Y.guardHead}><div className={Y.navRowIconWrapper}><FiBell /></div><div className={Y.navRowText}><h4>Recados do sapo</h4><p>{V ? "Ligado · no máximo 2 por dia" : "Desligado"}</p></div><label className={Y.switch} aria-label="Recados do sapo"><input type="checkbox" checked={V} onChange={$ => oe($.target.checked)} /><span className={Y.switchSlider} /></label></div><ul className={Y.guardList}><li>Ele avisa quando a sequência vai acabar, quando o Sapo do Dia ainda espera, quando bate a fome ou falta a missão.</li><li>Nunca de madrugada e nunca logo depois de você usar o app. Sem motivo, ele fica quieto.</li></ul></div>{Capacitor.isNativePlatform() && <div className={Y.guardCard}><div className={Y.guardHead}><div className={Y.navRowIconWrapper}><FiSmile /></div><div className={Y.navRowText}><h4>Ícone com o humor do sapo</h4><p>{E ? "Ligado" : "Desligado"}</p></div><label className={Y.switch} aria-label="Ícone com o humor do sapo"><input type="checkbox" checked={E} onChange={$ => ve($.target.checked)} /><span className={Y.switchSlider} /></label></div><ul className={Y.guardList}><li>O ícone do FocusFrog vira o sapinho: feliz, com sono ou pedindo atenção.</li><li>Ele só troca com o app fechado há um tempo. Em alguns celulares, o atalho na tela inicial some na troca. Se acontecer, é só pôr de novo, ou desligar aqui.</li></ul></div>}</C_la><C_la title="Personalizar"><C__r icon={FiLayout} title="Aparência" description="Tema, sons e outros ajustes" onClick={() => G("appearance")} /></C_la><C_la title="Ajuda"><C__r icon={FiHelpCircle} title="Refazer tutorial" description="Ver o passo a passo de novo" onClick={p} /><C__r icon={FiInfo} title="Sobre" description="Nossa história e missão" onClick={() => G("about")} /></C_la>{o && <C_la title="Desenvolvedor"><C__r icon={FiCode} title="Importar tarefas (JSON)" description="De um arquivo, de um link ou colando o texto" onClick={() => G("devImport")} /><C__r icon={FiPower} title="Desligar modo desenvolvedor" description="Esconde esta seção" onClick={() => {
                  a(false), e("Modo desenvolvedor desligado", "👾", "info");
                }} /></C_la>}</div></div>;
      }
    };
  return <main className="screen-content">{de && <C_xl title="Resetar Todos os Dados" message="Tem a certeza? Esta ação é irreversível e irá apagar todas as suas tarefas, pontos e personalizações." confirmText="Sim, Resetar Tudo" cancelText="Cancelar" onConfirm={J} onCancel={F} variant="danger" icon="trash" />}{D ? <p>Carregando...</p> : H()}</main>;
};
