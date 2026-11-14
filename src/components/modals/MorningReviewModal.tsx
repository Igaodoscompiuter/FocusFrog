// @ts-nocheck
// Recuperado do build 2.4.9 (tipagem e nomes locais ainda por revisar).
import nt from "./MorningReviewModal.module.css";
import * as jsxRuntime from "react/jsx-runtime";
import { Icon } from "../Icon";
import { icons } from "../Icons";

export const MorningReviewModal = () => (
  <div className={nt.moodboardContainer}>
    <header className={nt.moodboardHeader}>
      <div className={nt.logoConcept}>
        <Icon path={icons.frog} className={nt.logoIcon} />
        <h1>FocusFrog</h1>
      </div>
      <h2>{"Guia de Estilo & Arquitetura"}</h2>
      <p className={nt.subtitle}>
        Um guia vivo para a identidade visual, filosofia e arquitetura técnica
        do projeto.
      </p>
    </header>
    <main className={nt.moodboardContent}>
      <section className={nt.moodboardSection}>
        <h3>{"Filosofia & Arquitetura"}</h3>
        <div className={nt.philosophyGrid}>
          <div className={nt.philosophyCard}>
            <h4>
              <Icon path={icons.eye} />
              {" Foco Direcionado"}
            </h4>
            <p>
              O fundo escuro elimina distrações. O brilho das cores primárias
              guia o olho para ações importantes.
            </p>
          </div>
          <div className={nt.philosophyCard}>
            <h4>
              <Icon path={icons.gift} />
              {" Recompensa Imediata"}
            </h4>
            <p>
              Cores quentes e vibrantes são usadas para recompensas e
              celebrações, criando um feedback visual positivo.
            </p>
          </div>
          <div className={nt.philosophyCard}>
            <h4>
              <Icon path={icons.home} />
              {" Arquitetura da Casa"}
            </h4>
            <p>
              <strong>Fundação:</strong>
              {" `App.css` e `ThemeContext` (regras globais). "}
              <strong>Cômodos:</strong>
              {" As Telas (`/screens`), que usam a classe `.screen-content`. "}
              <strong>Móveis:</strong>
              {
                " Os Componentes (`/components`), padronizados para qualquer cômodo."
              }
            </p>
          </div>
          <div className={nt.philosophyCard}>
            <h4>
              <Icon path={icons.fileCode} />
              {" CSS Modules são Lei"}
            </h4>
            <p>
              Cada tela ou componente tem seu próprio arquivo `.module.css` para
              estilos. Não poluímos mais o escopo global com estilos específicos
              de componentes.
            </p>
          </div>
        </div>
      </section>
      <section className={nt.moodboardSection}>
        <h3>Componentes Reais (Nossos "Móveis")</h3>
        <div className={nt.gridComponents}>
          <div className="card">
            <h4 className={nt.componentTitle}>Botões Padrão (`.btn`)</h4>
            <div className={nt.componentExample}>
              <button className="btn btn-primary">
                <Icon path={icons.plus} />
                {" Primário"}
              </button>
              <button className="btn btn-secondary">
                <Icon path={icons.settings} />
                {" Secundário"}
              </button>
              <button className="btn btn-danger">
                <Icon path={icons.trash} />
                {" Perigo"}
              </button>
            </div>
          </div>
          <div className="card">
            <h4 className={nt.componentTitle}>Cartão Base (`.card`)</h4>
            <div className={`${nt.componentExample} ${nt.cardExampleContent}`}>
              <span>
                {"Este é um "}
                <strong>.card</strong>.
              </span>
              <p>
                Ele é a base para a maioria dos nossos contêineres de conteúdo,
                como este.
              </p>
            </div>
          </div>
          <div className="card">
            <h4 className={nt.componentTitle}>Cartão de Tarefa (`TaskCard`)</h4>
            <div className={nt.componentExample}>
              <div className={nt.mockTaskCard}>
                <div>
                  <p className={nt.mockTaskTitle}>Reformar o Moodboard</p>
                  <span className={nt.mockTaskTag}>#dev</span>
                </div>
                <Icon path={icons.chevronRight} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={nt.moodboardSection}>
        <h3>Paleta de Cores</h3>
        <div className={nt.gridColors} />
      </section>
      <section className={nt.moodboardSection}>
        <h3>Tipografia</h3>
        <div className={nt.gridTypography} />
      </section>
    </main>
  </div>
);
