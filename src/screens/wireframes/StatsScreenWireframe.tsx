import React from 'react';

const WfMetricCard = ({ value, label, subtext }: { value: string, label: string, subtext: string }) => (
    <div className="wf-box wf-metric-card">
        <div className="wf-metric-value">{value}</div>
        <div className="wf-metric-label">{label}</div>
        <div className="wf-metric-subtext">{subtext}</div>
    </div>
);

const WfAchievement = ({ title, unlocked }: { title: string, unlocked: boolean }) => (
    <div className={`wf-achievement ${unlocked ? 'unlocked' : ''}`}>
        <div className="wf-icon-placeholder">[Icon]</div>
        <div className="wf-achievement-text">{title}</div>
        {unlocked && <div className="wf-badge">Conquistado</div>}
    </div>
);

export const StatsScreenWireframe = () => {
    return (
        <div className="wf-screen">
            <div className="wf-screen-header">
                <h3>Estatísticas</h3>
                <div className="wf-placeholder-segment-control">[ Semana | Mês ]</div>
            </div>

            <div className="wf-grid">
                <WfMetricCard value="[Data]" label="Dias em Sequência" subtext="Melhor: [Data]" />
                <WfMetricCard value="[Data]" label="Sessões de Foco" subtext="[Data]h de foco total" />
                <WfMetricCard value="[Data]" label="Tarefas Concluídas" subtext="[Data]% de sucesso" />
                <WfMetricCard value="[Data]" label="Pontos Ganhos" subtext="Total acumulado" />
            </div>

            <div className="wf-box">
                <h4>🔥 Corrente de Foco (Dias Consecutivos)</h4>
                <div className="wf-seinfeld-chain">
                    {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, i) => (
                        <div key={i} className={`wf-day-circle ${i < 4 ? 'complete' : ''}`}>{day}</div>
                    ))}
                </div>
            </div>

             <div className="wf-box">
                <h4>📈 Gráfico de Produtividade</h4>
                <div className="wf-chart-placeholder">
                    <p>[Placeholder para gráfico de barras mostrando tarefas concluídas por dia]</p>
                </div>
            </div>

            <div className="wf-box">
                <h4>🏆 Conquistas</h4>
                <div className="wf-achievements-list">
                    <WfAchievement title="Primeiro Foco" unlocked={true} />
                    <WfAchievement title="Engolindo o Sapo" unlocked={true} />
                    <WfAchievement title="Mestre do Pomodoro" unlocked={false} />
                    <WfAchievement title="Lenda das Sequências" unlocked={false} />
                </div>
            </div>
        </div>
    );
};
