import React from 'react';

// FIX: Make children optional in WfBox props to satisfy TS when used in JSX
const WfBox = ({ children, className = '' }: { children?: React.ReactNode, className?: string }) => (
    <div className={`wf-box ${className}`}>{children}</div>
);

const WfTaskItem = ({ text, type }: { text: string, type: 'frog' | 'agenda' | 'inbox' }) => (
    <div className={`wf-task-item wf-task-${type}`}>
        {type !== 'inbox' && <span className="wf-checkbox"></span>}
        <span className="wf-task-text">{text}</span>
        {type === 'frog' && <span className="wf-icon-placeholder">[F]</span>}
    </div>
);

export const HomeScreenWireframe = () => {
    return (
        <div className="wf-screen">
            <div className="wf-screen-header">
                <h3>Home</h3>
                <div className="wf-placeholder-button">[+] Nova Tarefa Rápida</div>
            </div>

            <WfBox className="wf-highlight-box">
                <h4>🐸 Sapo do Dia</h4>
                <p className="wf-secondary-text">Sua tarefa mais importante.</p>
                <WfTaskItem text="Finalizar relatório de design" type="frog" />
                <div className="wf-placeholder-button-primary">[Iniciar Foco]</div>
            </WfBox>

            <WfBox>
                <h4>🗓️ Agenda de Hoje</h4>
                <div className="wf-agenda-columns">
                    <div className="wf-agenda-period">
                        <h5>Manhã</h5>
                        <WfTaskItem text="Reunião de alinhamento" type="agenda" />
                        <WfTaskItem text="Responder e-mails" type="agenda" />
                    </div>
                    <div className="wf-agenda-period">
                        <h5>Tarde</h5>
                        <WfTaskItem text="Sessão de Foco: Protótipo" type="agenda" />
                        <div className="wf-empty-state">-- Vazio --</div>
                    </div>
                    <div className="wf-agenda-period">
                        <h5>Noite</h5>
                        <WfTaskItem text="Planejar o dia seguinte" type="agenda" />
                    </div>
                </div>
            </WfBox>
            
            <WfBox>
                <h4>📥 Caixa de Entrada</h4>
                <p className="wf-secondary-text">Tarefas a serem priorizadas.</p>
                <WfTaskItem text="Comprar pilhas" type="inbox" />
                <WfTaskItem text="Ligar para o dentista" type="inbox" />
                <div className="wf-input-placeholder">Adicionar uma tarefa...</div>
            </WfBox>
        </div>
    );
};