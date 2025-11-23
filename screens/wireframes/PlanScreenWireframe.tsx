import React from 'react';

const WfQuadrant = ({ title, subtitle, tasks }: { title: string, subtitle: string, tasks: string[] }) => (
    <div className="wf-quadrant">
        <div className="wf-quadrant-header">
            <h5>{title}</h5>
            <p className="wf-secondary-text">{subtitle}</p>
        </div>
        <div className="wf-task-list">
            {tasks.map(task => <div key={task} className="wf-task-card">{task}</div>)}
            {tasks.length === 0 && <div className="wf-empty-state-small">+ Arraste tarefas aqui</div>}
        </div>
    </div>
);

export const PlanScreenWireframe = () => {
    return (
        <div className="wf-screen wf-plan-screen">
            <aside className="wf-inbox-panel">
                <h4>📥 Caixa de Entrada</h4>
                <div className="wf-task-list">
                    <div className="wf-task-card wf-draggable">Comprar pilhas</div>
                    <div className="wf-task-card wf-draggable">Ligar para o dentista</div>
                    <div className="wf-task-card wf-draggable">Pesquisar sobre API</div>
                    <div className="wf-task-card wf-draggable">Limpar a mesa</div>
                </div>
                <div className="wf-input-placeholder">Adicionar à caixa de entrada...</div>
            </aside>
            <main className="wf-matrix-panel">
                <div className="wf-screen-header">
                    <h3>Planejar</h3>
                    <div className="wf-placeholder-button">[+] Adicionar Tarefa</div>
                </div>
                <div className="wf-eisenhower-matrix">
                    <WfQuadrant title="Urgente & Importante" subtitle="Faça Agora" tasks={['Finalizar relatório de design']} />
                    <WfQuadrant title="Importante & Não Urgente" subtitle="Agende" tasks={['Sessão de Foco: Protótipo', 'Planejar dia seguinte']} />
                    <WfQuadrant title="Urgente & Não Importante" subtitle="Delegue" tasks={['Reunião de alinhamento']} />
                    <WfQuadrant title="Não Urgente & Não Importante" subtitle="Elimine" tasks={[]} />
                </div>
            </main>
        </div>
    );
};
