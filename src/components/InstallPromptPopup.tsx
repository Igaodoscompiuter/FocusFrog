
import React from 'react';
import focusfrogCoffee from '../assets/focusfrog-coffee.png';

interface InstallPromptPopupProps {
  show: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

const InstallPromptPopup: React.FC<InstallPromptPopupProps> = ({ show, onInstall, onDismiss }) => {
  if (!show) {
    return null;
  }

  // O container agora é o backdrop escuro que cobre a tela inteira
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo preto com 50% de opacidade
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    }}>
      {/* Popup Box - O mesmo estilo de vidro, agora sobre um fundo limpo */}
      <div style={{
        backgroundColor: 'rgba(44, 62, 80, 0.75)', // Cor de fundo com 75% de opacidade
        color: 'white',
        padding: '30px',
        borderRadius: '20px',
        textAlign: 'center',
        maxWidth: '340px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)', 
        border: '1px solid rgba(255, 255, 255, 0.18)',
      }}>
        <img 
          src={focusfrogCoffee} 
          alt="Mascote FocusFrog com uma chávena de café"
          style={{
            width: '120px', // Maior
            height: '120px', // Maior
            borderRadius: '50%', // Circular
            objectFit: 'cover',
            marginBottom: '20px',
            border: '2px solid rgba(255, 255, 255, 0.2)', // Borda sutil na imagem
          }} 
        />
        <h3 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: 600 }}>Instale o FocusFrog</h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>Leve seus focos para qualquer lugar. Instale o app em seu dispositivo para uma experiência mais rápida e integrada.</p>
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '30px' }}>
          <button 
            onClick={onDismiss}
            style={{
              padding: '12px 24px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              backgroundColor: 'transparent',
              color: '#ecf0f1',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Agora não
          </button>
          <button 
            onClick={onInstall}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: '#f1c40f',
              color: '#2c3e50',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
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
