/** 테마·파일명·기본값. 나중에 바꿀 때는 여기만 고치면 됩니다. */
export const THEME = {
  brand: "#FFAB4A",
  brandDark: "#E8892A",
  ink: "#5C2E00",
  inkSoft: "#7A4A18",
  paper: "#FFF6EA",
  ok: "#2A9D8F",
  danger: "#E63946",
};

export const TICKER_TEXT = "DAEPPANG ☆ ";

/** 깃허브 페이지처럼 하위 폴더에 올려도 경로가 맞도록 기준 주소를 붙입니다. */
const BASE = import.meta.env.BASE_URL;

export const UI_FILES = {
  logo: [`${BASE}assets/ui/Logo.png`, `${BASE}assets/ui/Logo.webp`, `${BASE}assets/ui/Logo.svg`],
  loading: [`${BASE}assets/ui/Loading.mp4`, `${BASE}assets/ui/Loading.webm`],
  draw: [`${BASE}assets/ui/Draw.webm`, `${BASE}assets/ui/Draw.mp4`],
};

export const AUDIO_FILES = {
  bgm: `${BASE}assets/audio/BGM.mp3`,
  ui: `${BASE}assets/audio/UI_sound.mp3`,
  gacha: `${BASE}assets/audio/gacha.mp3`,
  loading: `${BASE}assets/audio/Loading.mp3`,
  win: `${BASE}assets/audio/congratulation.mp3`,
};

/** 시작 화면에서 뽑기 화면으로 갈 때 BGM을 이만큼 낮춥니다. */
export const BGM_DUCK_DB = -10;

export const SLOT = {
  cellPx: 104,
  loops: 16,
  spinMs: 2400,
  holdMs: 900,
};

export const DEFAULT_SETTINGS = {
  pin: "1234",
  rates: { 3: 90, 2: 9, 1: 1 },
  lastConfirm: null,
};

export const STAFF_ONLY_TEXT = "직원 외 사용금지";

export const FONTS = {
  display: '"Paperlogy", sans-serif',
  ui: '"Paperlogy", sans-serif',
};
