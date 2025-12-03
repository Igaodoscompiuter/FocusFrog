import React, { useState } from 'react';
import { HomeScreenWireframe } from './HomeScreenWireframe';
import { PlanScreenWireframe } from './PlanScreenWireframe';
import { StatsScreenWireframe } from './StatsScreenWireframe';

type WireframeScreen = 'Home' | 'Planejar' | 'Estatísticas';

export const WireframeViewer = () => {
    const [activeScreen, setActiveScreen] = useState<WireframeScreen>('Home');

    const renderScreen = () => {
        switch (activeScreen) {
            case 'Home':
                return <HomeScreenWireframe />;
            case 'Planejar':
                return <PlanScreenWireframe />;
            case 'Estatísticas':
                return <StatsScreenWireframe />;
            default:
                return <HomeScreenWireframe />;
        }
    };

    return (
        <div className="wf-viewer">
            <header className="wf-header">
                <div className="wf-header-left">
                    <span className="wf-logo">[FF]</span>
                    <h2>Wireframes - FocusFrog</h2>
                </div>
                <div className="wf-nav">
                    {(['Home', 'Planejar', 'Estatísticas'] as WireframeScreen[]).map(screen => (
                        <button
                            key={screen}
                            className={`wf-nav-button ${activeScreen === screen ? 'active' : ''}`}
                            onClick={() => setActiveScreen(screen)}
                        >
                            {screen}
                        </button>
                    ))}
                </div>
            </header>
            <main className="wf-content">
                {renderScreen()}
            </main>
        </div>
    );
};
