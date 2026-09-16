import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const AUDIO_SOURCE_DIR = "E:\\대빵 키오스크";
const AUDIO_DEST_DIR = path.resolve("public/assets/audio");
const AUDIO_FILES = ["BGM.mp3", "UI_sound.mp3", "gacha.mp3", "Loading.mp3", "congratulation.mp3"];

function syncAudioFromSource() {
  fs.mkdirSync(AUDIO_DEST_DIR, { recursive: true });
  for (const name of AUDIO_FILES) {
    const from = path.join(AUDIO_SOURCE_DIR, name);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(AUDIO_DEST_DIR, name));
  }
}

export default defineConfig({
  // 상대 경로로 빌드해서 깃허브 페이지(하위 폴더)와 APK 모두에서 열립니다.
  base: "./",
  plugins: [
    {
      name: "sync-kiosk-audio",
      buildStart() {
        syncAudioFromSource();
      },
    },
  ],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 4173,
  },
});
