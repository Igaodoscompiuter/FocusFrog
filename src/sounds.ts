
// Web Audio API Sound Generators
// Using these avoids needing to host and load audio files.

// Modified signature: generators now receive the destination node (usually a GainNode)
// so they can build internal chains (Source -> Filter -> Destination)
type SoundGenerator = (context: AudioContext, destination: AudioNode) => AudioScheduledSourceNode;

export interface Sound { // <--- ADICIONADO O 'EXPORT'
    id: string;
    name: string;
    generator: SoundGenerator;
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

// --- Generators ---

// 1. Rain: White Noise + LowPass Filter (Removes high pitch hiss)
const rainGenerator: SoundGenerator = (context, destination) => {
    const buffer = createWhiteNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Filter to make it sound like heavy rain instead of TV static
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400; // Cut off high frequencies
    filter.Q.value = 1; // Resonance

    source.connect(filter);
    filter.connect(destination);

    return source;
};

// 2. Waves/Wind: Pink Noise (Naturally deeper) + Dynamic Filter (Optional)
const wavesGenerator: SoundGenerator = (context, destination) => {
    const buffer = createPinkNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Pink noise is already good, but let's soften it slightly
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    source.connect(filter);
    filter.connect(destination);

    return source;
};

// 3. Forest: Pink Noise + HighPass (Leaves rustling)
const forestGenerator: SoundGenerator = (context, destination) => {
    const buffer = createPinkNoiseBuffer(context);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    // Focus on mid/high frequencies for "rustling" sound
    const filter = context.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 400;

    source.connect(filter);
    filter.connect(destination);

    return source;
};

// 4. Piano/Drone: Sine wave (unchanged)
const simpleToneGenerator: SoundGenerator = (context, destination) => {
    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, context.currentTime); // A3 (Lower/Calmer)

    // Add a slight LFO (Low Frequency Oscillator) to make it throb gently
    const lfo = context.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.5; // 0.5 Hz

    const lfoGain = context.createGain();
    lfoGain.gain.value = 50; // Depth of modulation

    lfo.connect(lfoGain);
    // lfoGain.connect(oscillator.frequency); // Vibrato effect
    
    oscillator.connect(destination);
    // lfo.start(); // Optional: start LFO if connected

    return oscillator;
};

export const sounds: { [key: string]: Sound } = {
  'none': {
    id: 'none',
    name: 'Silêncio',
    generator: () => { throw new Error('Cannot generate silence'); },
  },
  'rain-sound': {
    id: 'rain-sound',
    name: 'Chuva',
    generator: rainGenerator,
  },
  'waves-sound': {
    id: 'waves-sound',
    name: 'Ondas',
    generator: wavesGenerator,
  },
  'forest-sound': {
    id: 'forest-sound',
    name: 'Floresta',
    generator: forestGenerator,
  },
  'piano-sound': {
    id: 'piano-sound',
    name: 'Piano (Drone)',
    generator: simpleToneGenerator,
  }
};
