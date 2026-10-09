import { useEffect } from 'react';
import { usePomodoro } from '../context/PomodoroContext';
import { useTheme } from '../context/ThemeContext';
import { useUI } from '../context/UIContext';
import { SOUND_CATALOG, playLoop } from '../store/soundCatalog';

/** Toca o som de fundo escolhido na Loja enquanto o foco está rodando. */
export const AmbientSoundPlayer: React.FC = () => {
  const { sessionStatus, isPaused } = usePomodoro();
  const { activeSoundId } = useTheme();
  const { soundEnabled } = useUI();
  useEffect(() => {
    if (!soundEnabled || sessionStatus !== 'focus' || isPaused) return;
    const item = SOUND_CATALOG.find(s => s.id === activeSoundId);
    if (!item || item.id === 'none' || !item.ready) return;
    return playLoop(item, 0.45);
  }, [soundEnabled, sessionStatus, isPaused, activeSoundId]);
  return null;
};
