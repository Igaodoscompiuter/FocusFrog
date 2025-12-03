
import React from 'react';
import './SplashScreen.css';

const LOGO_URL = '/icon-512.png';

export const SplashScreen: React.FC<{ isFadingOut: boolean }> = ({ isFadingOut }) => {
  return (
    <div className={`splash-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-content">
        <img src={LOGO_URL} alt="FocusFrog Logo" className="splash-logo" />
        <h1 className="splash-title">FocusFrog</h1>
      </div>
    </div>
  );
};
