/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let humOscillator: OscillatorNode | null = null;
let humGain: GainNode | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a beautiful, futuristic synthesize twinkle sound.
 * Rare auras produce higher frequencies and longer echo/decay!
 */
export function playRollSound(freq: number, isRare: boolean) {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    // Core Oscillator for the primary tone
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    
    osc.type = isRare ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, time);
    
    // Frequency sweep for a classic sci-fi "laser/aura" sweep
    if (isRare) {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, time + 0.3);
      oscGain.gain.setValueAtTime(0.3, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.8);
    } else {
      oscGain.gain.setValueAtTime(0.15, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
    }
    
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + (isRare ? 0.95 : 0.3));

    // For rare items, add a tiny high-pitched harmonic echo
    if (isRare) {
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(freq * 2, time + 0.08);
      subGain.gain.setValueAtTime(0.1, time + 0.08);
      subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
      subOsc.connect(subGain);
      subGain.connect(ctx.destination);
      subOsc.start(time + 0.08);
      subOsc.stop(time + 0.65);
    }
  } catch (error) {
    console.warn('Audio play failed:', error);
  }
}

/**
 * Synthesize a sound when an egg is collected!
 */
export function playEggCollectSound(type: 'SMALL' | 'NORMAL' | 'GILDED') {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    
    if (type === 'GILDED') {
      osc.frequency.setValueAtTime(329.63, time); // E4
      osc.frequency.exponentialRampToValueAtTime(659.25, time + 0.15); // E5
      osc.frequency.exponentialRampToValueAtTime(1318.51, time + 0.35); // E6
      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.5);
    } else if (type === 'NORMAL') {
      osc.frequency.setValueAtTime(440.00, time); // A4
      osc.frequency.exponentialRampToValueAtTime(880.00, time + 0.18); // A5
      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    } else {
      osc.frequency.setValueAtTime(600, time);
      osc.frequency.exponentialRampToValueAtTime(300, time + 0.12);
      gain.gain.setValueAtTime(0.1, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);
  } catch (error) {
    console.warn('Egg audio failed:', error);
  }
}

/**
 * Start a low pitched humming sound to signify NULL biome
 */
export function startNullBiomeHum() {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    if (humOscillator) return; // Already running
    
    humOscillator = ctx.createOscillator();
    humGain = ctx.createGain();
    
    humOscillator.type = 'sawtooth';
    humOscillator.frequency.value = 65.41; // C2 (Very low hum)
    
    // Filter out high frequencies to make it a deep, low-pass hover/hum
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 130; // cut off mids/highs
    
    humGain.gain.setValueAtTime(0.001, time);
    humGain.gain.linearRampToValueAtTime(0.15, time + 1.5); // Smooth fade-in
    
    humOscillator.connect(lowpass);
    lowpass.connect(humGain);
    humGain.connect(ctx.destination);
    
    humOscillator.start(time);
  } catch (error) {
    console.warn('Null biome hum start failed:', error);
  }
}

/**
 * Smoothly fade out and stop NULL biome hum
 */
export function stopNullBiomeHum() {
  try {
    if (!humOscillator || !humGain) return;
    
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    
    humGain.gain.setValueAtTime(humGain.gain.value, time);
    humGain.gain.linearRampToValueAtTime(0.001, time + 1.0); // Smooth fade-out before stop
    
    const oldOsc = humOscillator;
    humOscillator = null;
    humGain = null;
    
    setTimeout(() => {
      try {
        oldOsc.stop();
      } catch (e) {}
    }, 1200);
  } catch (error) {
    console.warn('Null biome hum stop failed:', error);
  }
}

/**
 * Click sound UI feed back
 */
export function playClickSound() {
  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.05);
    
    gain.gain.setValueAtTime(0.05, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.06);
  } catch (e) {}
}

let musicInterval: any = null;
let currentChordIndex = 0;

const CHORDS = [
  [130.81, 196.00, 246.94, 329.63], // C3, G3, B3, E4 (Cmaj7)
  [110.00, 196.00, 261.63, 329.63], // A2, G3, C4, E4 (Am7)
  [87.31, 220.00, 261.63, 329.63],  // F2, A3, C4, E4 (Fmaj7)
  [98.00, 196.00, 261.63, 293.66],  // G2, G3, C4, D4 (Gsus4)
];

/**
 * Start procedural ambient space music chords loop
 */
export function startSpaceMusic() {
  try {
    const ctx = getAudioContext();
    if (musicInterval) return; // Already running

    const playChord = () => {
      const time = ctx.currentTime;
      const notes = CHORDS[currentChordIndex];
      currentChordIndex = (currentChordIndex + 1) % CHORDS.length;

      // Master chord dampener
      const chordGain = ctx.createGain();
      chordGain.gain.setValueAtTime(0, time);
      chordGain.gain.linearRampToValueAtTime(0.05, time + 1.5); // Warm attack fade-in
      chordGain.gain.setValueAtTime(0.05, time + 3.2);
      chordGain.gain.exponentialRampToValueAtTime(0.001, time + 4.9);
      chordGain.connect(ctx.destination);

      const oscillators: OscillatorNode[] = [];

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = idx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        // Slow detune to mimic beautiful analog pitch drift
        osc.detune.setValueAtTime((Math.random() - 0.5) * 8, time);

        // Cozy lowpass space filters
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(idx === 0 ? 250 : 650, time);

        osc.connect(filter);
        filter.connect(chordGain);
        osc.start(time);
        oscillators.push(osc);
      });

      // High stellar twinkle bell
      if (Math.random() < 0.65) {
        const bellOsc = ctx.createOscillator();
        const bellGain = ctx.createGain();
        bellOsc.type = 'sine';
        const bellFreq = notes[2] * 4; // High octave twinkle
        bellOsc.frequency.setValueAtTime(bellFreq, time + 1.2);
        bellGain.gain.setValueAtTime(0, time + 1.2);
        bellGain.gain.linearRampToValueAtTime(0.015, time + 1.3);
        bellGain.gain.exponentialRampToValueAtTime(0.001, time + 2.8);

        bellOsc.connect(bellGain);
        bellGain.connect(ctx.destination);
        bellOsc.start(time + 1.2);
        setTimeout(() => {
          try { bellOsc.stop(); } catch (e) {}
        }, 3200);
      }

      // Cleanup
      setTimeout(() => {
        oscillators.forEach(osc => {
          try { osc.stop(); } catch (e) {}
        });
      }, 5000);
    };

    playChord();
    musicInterval = setInterval(playChord, 5000);
  } catch (error) {
    console.warn('Space music failed to trigger:', error);
  }
}

/**
 * Stop space music loop
 */
export function stopSpaceMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}
