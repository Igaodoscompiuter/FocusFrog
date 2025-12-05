
import { registerPlugin } from '@capacitor/core';

export interface BackgroundTimerPlugin {
  start(options: { duration: number }): Promise<{ status: string }>;
  stop(): Promise<{ status: string }>;
}

const BackgroundTimer = registerPlugin<BackgroundTimerPlugin>('BackgroundTimer');

export default BackgroundTimer;
