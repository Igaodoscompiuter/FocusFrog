
import React from 'react';

interface InstallPromptPopupProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPromptPopup: React.FC<InstallPromptPopupProps> = ({ show, onInstall, onDismiss }) => {
  if (!show) {
    return null;
  }

  return (
    // Backdrop
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    }}>
      {/* Popup Box */}
      <div style={{
        backgroundColor: '#2c3e50', // Cor de fundo escura
        color: 'white',
        padding: '25px',
        borderRadius: '12px',
        textAlign: 'center',
        maxWidth: '320px',
        boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
      }}>
        <h3 style={{ marginTop: 0 }}>Instalar FocusFrog</h3>
        <p>Adicione o FocusFrog à sua tela inicial para uma experiência mais rápida e integrada.</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px' }}>
          <button 
            onClick={onDismiss}
            style={{
              padding: '10px 20px',
              border: '1px solid #7f8c8d',
              backgroundColor: 'transparent',
              color: '#ecf0f1',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Agora não
          </button>
          <button 
            onClick={onInstall}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: '#f1c40f', // Amarelo característico
              color: '#2c3e50',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptPopup;
