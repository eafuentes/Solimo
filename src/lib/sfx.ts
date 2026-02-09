import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { isSoundEnabled } from './storage';

let correctPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let wrongPlayer: ReturnType<typeof createAudioPlayer> | null = null;
let audioModeReady = false;

async function ensureAudioMode() {
  if (audioModeReady) return;
  await setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });
  audioModeReady = true;
}

async function play(player: ReturnType<typeof createAudioPlayer> | null) {
  if (!player) return;
  try {
    await player.seekTo(0);
  } catch {
    // ignore seek errors
  }
  player.play();
}

export async function playCorrectSfx(): Promise<void> {
  const enabled = await isSoundEnabled();
  if (!enabled) return;
  await ensureAudioMode();
  if (!correctPlayer) {
    correctPlayer = createAudioPlayer(require('../../assets/sfx/correct.wav'));
  }
  await play(correctPlayer);
}

export async function playWrongSfx(): Promise<void> {
  const enabled = await isSoundEnabled();
  if (!enabled) return;
  await ensureAudioMode();
  if (!wrongPlayer) {
    wrongPlayer = createAudioPlayer(require('../../assets/sfx/wrong.wav'));
  }
  await play(wrongPlayer);
}
