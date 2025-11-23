
import React from 'react';
import { Icon } from '../components/Icon';
import { icons } from '../components/Icons';

const ColorSwatch = ({ hex, name }: { hex: string, name: string }) => (
    <div className="swatch">
        <div className="swatch-color" style={{ backgroundColor: hex }}></div>
        <div className="swatch-info">
            <span className="swatch-name">{name}</span>
            <span className="swatch-hex">{hex}</span>
        </div>
    </div>
);

const TypoExample = ({ size, weight, text, font, description }: { size: string, weight: number, text: string, font: string, description: string }) => (
    <div className="typo-example">
        <span className="typo-description">{description}</span>
        <p style={{ fontSize: size, fontWeight: weight, fontFamily: `'${font}', sans-serif` }}>{text}</p>
    </div>
);

export const MoodboardScreen = () => {
    return (
        <div className="moodboard-container">
            <header className="moodboard-header">
                <div className="logo-concept">
                    <Icon path={icons.frog} className="logo-icon" />
                    <h1>FocusFrog</h1>
                </div>
                <h2>Mood Board: Produtividade Energizante</h2>
                <p className="subtitle">Uma identidade visual que capacita, motiva e foca. A produtividade se torna um jogo que você quer vencer.</p>
            </header>

            <main className="moodboard-content">
                <section className="moodboard-section">
                    <h3>Paleta de Cores: Alto Contraste & Vibrante</h3>
                    <div className="grid-colors">
                        <ColorSwatch hex="#111827" name="Fundo (Deep Space)" />
                        <ColorSwatch hex="#1F2937" name="Card (Azul-Grafite)" />
                        <ColorSwatch hex="#3B82F6" name="Primária (Azul Elétrico)" />
                        <ColorSwatch hex="#FBBF24" name="Acento (Amarelo Solar)" />
                        <ColorSwatch hex="#F97316" name="Acento 2 (Laranja Vibrante)" />
                        <ColorSwatch hex="#10B981" name="Sucesso (Verde Esmeralda)" />
                        <ColorSwatch hex="#D1D5DB" name="Texto Principal" />
                        <ColorSwatch hex="#9CA3AF" name="Texto Secundário" />
                    </div>
                </section>

                <section className="moodboard-section">
                    <h3>Tipografia: Moderna & Amigável</h3>
                     <div className="grid-typography">
                        <TypoExample font="Poppins" size="2.5rem" weight={800} text="H1 Título Principal" description="Poppins ExtraBold - Títulos de Página" />
                        <TypoExample font="Poppins" size="1.5rem" weight={700} text="H2 Título de Seção" description="Poppins Bold - Títulos de Card" />
                        <TypoExample font="Inter" size="1rem" weight={400} text="Corpo de texto normal, para descrições e parágrafos." description="Inter Regular - Corpo de Texto" />
                        <TypoExample font="Inter" size="0.875rem" weight={600} text="Texto de Botão" description="Inter SemiBold - Botões & UI" />
                    </div>
                </section>
                
                <section className="moodboard-section">
                    <h3>Exemplos de Componentes</h3>
                    <div className="grid-components">
                        <div className="component-card">
                            <h4>Botões</h4>
                            <div className="component-example">
                                <button className="mood-button mood-button-primary">
                                    <Icon path={icons.plus} />
                                    <span>Ação Primária</span>
                                </button>
                                <button className="mood-button mood-button-accent">
                                    <Icon path={icons.zap} />
                                    <span>Ação de Destaque</span>
                                </button>
                                 <button className="mood-button mood-button-outline">
                                    <span>Ação Secundária</span>
                                </button>
                            </div>
                        </div>

                         <div className="component-card">
                            <h4>Card de Estatística</h4>
                            <div className="component-example">
                               <div className="mood-stat-card">
                                    <div className="stat-icon-wrapper">
                                        <Icon path={icons.checkCircle} />
                                    </div>
                                    <div className="stat-value">47</div>
                                    <div className="stat-label">Tarefas Concluídas</div>
                                    <div className="stat-badge">85% de sucesso</div>
                               </div>
                            </div>
                        </div>

                        <div className="component-card">
                            <h4>Barra de Navegação (Conceito)</h4>
                             <div className="component-example">
                                <div className="mood-nav">
                                    <a href="#" className="mood-nav-item"><Icon path={icons.layoutGrid} /></a>
                                    <a href="#" className="mood-nav-item active"><Icon path={icons.checkSquare} /></a>
                                    <a href="#" className="mood-nav-item"><Icon path={icons.timer} /></a>
                                    <a href="#" className="mood-nav-item"><Icon path={icons.star} /></a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                 <section className="moodboard-section">
                    <h3>Filosofia Visual</h3>
                    <ul className="philosophy-list">
                        <li><strong>Foco Direcionado:</strong> O fundo escuro elimina distrações. O brilho das cores primárias guia o olho exatamente para onde ele precisa ir.</li>
                        <li><strong>Recompensa Imediata:</strong> Cores quentes (amarelo, laranja) são usadas para recompensas e celebrações, criando um feedback visual positivo e viciante.</li>
                        <li><strong>Clareza e Legibilidade:</strong> A tipografia é escolhida por sua clareza. O contraste entre o texto claro e o fundo escuro garante conforto visual.</li>
                        <li><strong>Energia e Movimento:</strong> O design não é estático. Animações e micro-interações serão rápidas e elásticas, dando uma sensação de poder e responsividade.</li>
                    </ul>
                </section>
            </main>
        </div>
    );
};
