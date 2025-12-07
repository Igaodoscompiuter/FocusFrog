
import { useState, useEffect, useCallback } from 'react';

type WakeLockSentinel = any; // A API WakeLock ainda é experimental

export const useWakeLock = () => {
    const [wakeLock, setWakeLock] = useState<WakeLockSentinel>(null);

    const requestWakeLock = useCallback(async () => {
        if ('wakeLock' in navigator && !wakeLock) {
            try {
                const wl = await (navigator as any).wakeLock.request('screen');
                setWakeLock(wl);
                console.log('Screen Wake Lock ativado!');
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, [wakeLock]);

    const releaseWakeLock = useCallback(async () => {
        if (wakeLock) {
            try {
                await wakeLock.release();
                setWakeLock(null);
                console.log('Screen Wake Lock liberado.');
            } catch (err: any) {
                console.error(`${err.name}, ${err.message}`);
            }
        }
    }, [wakeLock]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                requestWakeLock();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleVisibilityChange);

        return () => {
            releaseWakeLock();
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleVisibilityChange);
        };
    }, [requestWakeLock, releaseWakeLock]);

    return { request: requestWakeLock, release: releaseWakeLock, isActive: !!wakeLock };
};
