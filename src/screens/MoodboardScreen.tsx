
import React from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';
import styles from './MoodboardScreen.module.css'; // 1. Usando CSS Modules!

// Componentes internos agora usam styles
const ColorSwatch = ({ hex, name }: { hex: string, name: string }) => (
    <div className={styles.swatch}>
        <div className={styles.swatchColor} style={{ backgroundColor: hex }}></div>
        <div className={styles.swatchInfo}>
            <span className={styles.swatchName}>{name}</span>
            <span className={styles.swatchHex}>{hex}</span>
        </div>
    </div>
);

const TypoExample = ({ size, weight, text, font, description }: { size: string, weight: number, text: string, font: string, description: string }) => (
    <div className={styles.typoExample}>
        <span className={styles.typoDescription}>{description}</span>
        <p style={{ fontSize: size, fontWeight: weight, fontFamily: `'${font}', sans-serif` }}>{text}</p>
    </div>
);

export const MoodboardScreen = () => {
    return (
        <div className={styles.moodboardContainer}>
            <header className={styles.moodboardHeader}>
                <div className={styles.logoConcept}>
                    <Icon path={icons.frog} className={styles.logoIcon} />
                    <h1>FocusFrog</h1>
                </div>
                <h2>Guia de Estilo & Arquitetura</h2>
                <p className={styles.subtitle}>Um guia vivo para a identidade visual, filosofia e arquitetura técnica do projeto.</p>
            </header>

            <main className={styles.moodboardContent}>
                {/* Seção de Filosofia ATUALIZADA */}
                <section className={styles.moodboardSection}>
                    <h3>Filosofia & Arquitetura</h3>
                    <div className={styles.philosophyGrid}>
                        <div className={styles.philosophyCard}>
                            <h4><Icon path={icons.eye} /> Foco Direcionado</h4>
                            <p>O fundo escuro elimina distrações. O brilho das cores primárias guia o olho para ações importantes.</p>
                        </div>
                        <div className={styles.philosophyCard}>
                            <h4><Icon path={icons.gift} /> Recompensa Imediata</h4>
                            <p>Cores quentes e vibrantes são usadas para recompensas e celebrações, criando um feedback visual positivo.</p>
                        </div>
                        <div className={styles.philosophyCard}>
                            <h4><Icon path={icons.home} /> Arquitetura da Casa</h4>
                            <p><strong>Fundação:</strong> `App.css` e `ThemeContext` (regras globais). <strong>Cômodos:</strong> As Telas (`/screens`), que usam a classe `.screen-content`. <strong>Móveis:</strong> Os Componentes (`/components`), padronizados para qualquer cômodo.</p>
                        </div>
                        <div className={styles.philosophyCard}>
                            <h4><Icon path={icons.fileCode} /> CSS Modules são Lei</h4>
                            <p>Cada tela ou componente tem seu próprio arquivo `.module.css` para estilos. Não poluímos mais o escopo global com estilos específicos de componentes.</p>
                        </div>
                    </div>
                </section>

                {/* Seção de Componentes ATUALIZADA */}
                <section className={styles.moodboardSection}>
                    <h3>Componentes Reais (Nossos "Móveis")</h3>
                    <div className={styles.gridComponents}>
                        {/* Exemplo de Botões */}
                        <div className="card">
                            <h4 className={styles.componentTitle}>Botões Padrão (`.btn`)</h4>
                            <div className={styles.componentExample}>
                                <button className="btn btn-primary">
                                    <Icon path={icons.plus} /> Primário
                                </button>
                                <button className="btn btn-secondary">
                                    <Icon path={icons.settings} /> Secundário
                                </button>
                                 <button className="btn btn-danger">
                                    <Icon path={icons.trash} /> Perigo
                                </button>
                            </div>
                        </div>

                        {/* Exemplo de Cartão */}
                         <div className="card">
                            <h4 className={styles.componentTitle}>Cartão Base (`.card`)</h4>
                            <div className={`${styles.componentExample} ${styles.cardExampleContent}`}>
                                <span>Este é um <strong>.card</strong>.</span>
                                <p>Ele é a base para a maioria dos nossos contêineres de conteúdo, como este.</p>
                            </div>
                        </div>

                        {/* Exemplo de TaskCard (Simplificado) */}
                        <div className="card">
                            <h4 className={styles.componentTitle}>Cartão de Tarefa (`TaskCard`)</h4>
                             <div className={styles.componentExample}>
                                 {/* Maquete visual baseada no componente real */}
                                <div className={styles.mockTaskCard}>
                                    <div>
                                        <p className={styles.mockTaskTitle}>Reformar o Moodboard</p>
                                        <span className={styles.mockTaskTag}>#dev</span>
                                    </div>
                                    <Icon path={icons.chevronRight} />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Seções de Cores e Tipografia (inalteradas na estrutura, mas usarão styles) */}
                <section className={styles.moodboardSection}>
                    <h3>Paleta de Cores</h3>
                    <div className={styles.gridColors}>
                        {/* ...ColorSwatches... */}
                    </div>
                </section>

                <section className={styles.moodboardSection}>
                    <h3>Tipografia</h3>
                     <div className={styles.gridTypography}>
                        {/* ...TypoExamples... */}
                    </div>
                </section>
            </main>
        </div>
    );
};
