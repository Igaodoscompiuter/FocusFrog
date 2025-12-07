
import { useEffect } from 'react';

interface MediaSessionMetadata {
    title: string;
    artist: string;
    album: string;
    artwork: { src: string, sizes: string, type: string }[];
}

interface MediaSessionActions {
    onPlay?: () => void;
    onPause?: () => void;
    onStop?: () => void;
}

export const useMediaSession = (metadata: MediaSessionMetadata, actions: MediaSessionActions, status: 'playing' | 'paused') => {

    useEffect(() => {
        if (!('mediaSession' in navigator)) {
            return;
        }

        const { title, artist, album, artwork } = metadata;
        navigator.mediaSession.metadata = new (window as any).MediaMetadata({
            title,
            artist,
            album,
            artwork
        });

        // Define o estado de reprodução para a UI do sistema operacional
        navigator.mediaSession.playbackState = status === 'playing' ? 'playing' : 'paused';

        const { onPlay, onPause, onStop } = actions;

        const safeAction = (handler?: () => void) => {
            return () => {
                if (handler) handler();
            }
        }

        navigator.mediaSession.setActionHandler('play', safeAction(onPlay));
        navigator.mediaSession.setActionHandler('pause', safeAction(onPause));
        navigator.mediaSession.setActionHandler('stop', safeAction(onStop));
        

        // Cleanup
        return () => {
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = null;
                navigator.mediaSession.playbackState = 'none';
                navigator.mediaSession.setActionHandler('play', null);
                navigator.mediaSession.setActionHandler('pause', null);
                navigator.mediaSession.setActionHandler('stop', null);
            }
        };

    }, [metadata, actions, status]);
};