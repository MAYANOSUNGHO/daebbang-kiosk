import { AUDIO_FILES, BGM_DUCK_DB } from "./config.js";
import { fileExists } from "./lib/dom.js";

const duckGain = 10 ** (BGM_DUCK_DB / 20);
const BGM_VOLUME = 0.85;

const sfx = {
  ui: null,
  gacha: null,
  loading: null,
  win: null,
};

let bgm = null;
let unlocked = false;
let ducked = false;

async function load(path) {
  if (!(await fileExists(path))) return null;
  const audio = new Audio(path);
  audio.preload = "auto";
  return audio;
}

function clonePlay(source) {
  if (!source) return;
  const node = source.cloneNode();
  node.currentTime = 0;
  node.play().catch(() => {});
}

export async function initAudio() {
  bgm = await load(AUDIO_FILES.bgm);
  if (bgm) {
    bgm.loop = true;
    bgm.volume = BGM_VOLUME;
  }
  sfx.ui = await load(AUDIO_FILES.ui);
  sfx.gacha = await load(AUDIO_FILES.gacha);
  sfx.loading = await load(AUDIO_FILES.loading);
  sfx.win = await load(AUDIO_FILES.win);
  if (sfx.loading) sfx.loading.loop = true;
}

export function unlockAudio() {
  if (unlocked) {
    ensureBgm();
    return;
  }
  unlocked = true;
  ensureBgm();
}

function ensureBgm() {
  if (!bgm) return;
  bgm.volume = ducked ? BGM_VOLUME * duckGain : BGM_VOLUME;
  if (bgm.paused) bgm.play().catch(() => {});
}

export function setBgmDucked(next) {
  ducked = next;
  if (!bgm) return;
  bgm.volume = ducked ? BGM_VOLUME * duckGain : BGM_VOLUME;
}

export function playUi() {
  clonePlay(sfx.ui);
}

export function playGacha() {
  clonePlay(sfx.gacha);
}

export function startLoadingSfx() {
  if (!sfx.loading) return;
  sfx.loading.currentTime = 0;
  sfx.loading.play().catch(() => {});
}

export function stopLoadingSfx() {
  if (!sfx.loading) return;
  sfx.loading.pause();
  sfx.loading.currentTime = 0;
}

export function playWin() {
  clonePlay(sfx.win);
}

export function applyScreenAudio(screen) {
  const inPlayFlow = screen === "play" || screen === "rolling" || screen === "result";
  setBgmDucked(inPlayFlow);
  if (screen === "rolling") startLoadingSfx();
  else stopLoadingSfx();
}
