
// Web Audio API Sound Generators
// Using these avoids needing to host and load audio files.

type SoundGenerator = (context: AudioContext, destination: AudioNode) => void;
type EffectGenerator = (context: AudioContext, destination: AudioNode) => void;

export interface Sound {
    id: string;
    name: string;
    generator: SoundGenerator;
}

export interface Effect {
    id: string;
    generator: EffectGenerator;
}

// --- Noise Functions ---

const createWhiteNoiseBuffer = (context: AudioContext): AudioBuffer => {
    const bufferSize = 2 * context.sampleRate;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    return buffer;
}

const createPinkNoiseBuffer = (context: AudioContext): AudioBuffer => {
    const bufferSize = 4096;
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const output = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11; // Compensate for gain
        b6 = white * 0.115926;
    }
    return buffer;
}

// --- AMBIENT SOUND GENERATORS ---

const rainGenerator: SoundGenerator = (context, destination) => {
    const buffer = createWhiteNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    filter.Q.value = 1;

    source.connect(filter);
    filter.connect(destination);
    source.start();
};

const wavesGenerator: SoundGenerator = (context, destination) => {
    const buffer = createPinkNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    source.connect(filter);
    filter.connect(destination);
    source.start();
};

const forestGenerator: SoundGenerator = (context, destination) => {
    const buffer = createPinkNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 400;

    source.connect(filter);
    filter.connect(destination);
    source.start();
};

const simpleToneGenerator: SoundGenerator = (context, destination) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, context.currentTime); 

    oscillator.connect(destination);
    oscillator.start();
};

// --- UI EFFECT GENERATORS ---

const timerStartGenerator: EffectGenerator = (context, destination) => {
    const osc = context.createOscillator();
    const gainNode = context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, context.currentTime); // A4
    osc.frequency.linearRampToValueAtTime(880, context.currentTime + 0.1); // ramp to A5

    gainNode.gain.setValueAtTime(0.5, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(destination);
    
    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.2);
};

const timerEndGenerator: EffectGenerator = (context, destination) => {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, context.currentTime); // C5

    gainNode.gain.setValueAtTime(0.4, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.8);
    
    osc.connect(gainNode);
    gainNode.connect(destination);

    osc.start(context.currentTime);
    osc.stop(context.currentTime + 1.0);
};

const sessionCompleteGenerator: EffectGenerator = (context, destination) => {
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gainNode = context.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, context.currentTime); // C5
    osc1.frequency.linearRampToValueAtTime(659.25, context.currentTime + 0.1); // E5
    
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(783.99, context.currentTime); // G5
    osc2.frequency.linearRampToValueAtTime(1046.50, context.currentTime + 0.1); // C6

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.3);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(destination);

    osc1.start(context.currentTime);
    osc1.stop(context.currentTime + 0.3);
    osc2.start(context.currentTime);
    osc2.stop(context.currentTime + 0.3);
}

const breakStartGenerator: EffectGenerator = (context, destination) => {
    const osc = context.createOscillator();
    const gainNode = context.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, context.currentTime);
    osc.frequency.linearRampToValueAtTime(440, context.currentTime + 0.15);

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.2);

    osc.connect(gainNode);
    gainNode.connect(destination);

    osc.start(context.currentTime);
    osc.stop(context.currentTime + 0.2);
}

const levelUpGenerator: EffectGenerator = (context, destination) => {
    const osc1 = context.createOscillator();
    const osc2 = context.createOscillator();
    const gainNode = context.createGain();

    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(659.25, context.currentTime); // E5
    osc1.frequency.linearRampToValueAtTime(1318.51, context.currentTime + 0.2); // E6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(783.99, context.currentTime); // G5
    osc2.frequency.linearRampToValueAtTime(1567.98, context.currentTime + 0.2); // G6

    gainNode.gain.setValueAtTime(0.3, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(destination);

    osc1.start(context.currentTime);
    osc1.stop(context.currentTime + 0.4);
    osc2.start(context.currentTime);
    osc2.stop(context.currentTime + 0.4);
}

export const ambientSounds: { [key: string]: Sound } = {
  'none': {
    id: 'none',
    name: 'Silêncio',
    generator: () => { /* Do nothing */ },
  },
  'rain': {
    id: 'rain',
    name: 'Chuva',
    generator: rainGenerator,
  },
  'waves': {
    id: 'waves',
    name: 'Ondas',
    generator: wavesGenerator,
  },
  'forest': {
    id: 'forest',
    name: 'Floresta',
    generator: forestGenerator,
  },
  'piano': {
    id: 'piano',
    name: 'Piano (Drone)',
    generator: simpleToneGenerator,
  }
};

export const uiEffects: { [key: string]: Effect } = {
    timerStart: {
        id: 'timerStart',
        generator: timerStartGenerator,
    },
    timerEnd: {
        id: 'timerEnd',
        generator: timerEndGenerator,
    },
    sessionComplete: {
        id: 'sessionComplete',
        generator: sessionCompleteGenerator,
    },
    breakStart: {
        id: 'breakStart',
        generator: breakStartGenerator,
    },
    levelUp: {
        id: 'levelUp',
        generator: levelUpGenerator
    }
}
