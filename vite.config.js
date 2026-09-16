import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const AUDIO_SOURCE_DIR = "E:\\대빵 키오스크";
const AUDIO_DEST_DIR = path.resolve("public/assets/audio");
const AUDIO_FILES = ["BGM.mp3", "UI_sound.mp3", "gacha.mp3", "Loading.mp3", "congratulation.mp3"];
const DIST_DIR = path.resolve("dist");

function syncAudioFromSource() {
  fs.mkdirSync(AUDIO_DEST_DIR, { recursive: true });
  for (const name of AUDIO_FILES) {
    const from = path.join(AUDIO_SOURCE_DIR, name);
    if (!fs.existsSync(from)) continue;
    fs.copyFileSync(from, path.join(AUDIO_DEST_DIR, name));
  }
}

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(full);
    return [full];
  });
}

/** 오프라인 실행용. 빌드 결과 파일 목록과 버전을 sw.js 에 심습니다. */
function fillServiceWorker() {
  const swPath = path.join(DIST_DIR, "sw.js");
  if (!fs.existsSync(swPath)) return;

  const files = listFiles(DIST_DIR).filter((file) => {
    const name = path.basename(file);
    return name !== "sw.js" && !name.startsWith(".") && name !== "README.txt";
  });
  const urls = files.map((file) => `./${path.relative(DIST_DIR, file).split(path.sep).join("/")}`);
  const fingerprint = files
    .map((file) => `${path.relative(DIST_DIR, file)}:${fs.statSync(file).size}`)
    .sort()
    .join("|");
  const version = crypto.createHash("sha1").update(fingerprint).digest("hex").slice(0, 10);

  const source = fs
    .readFileSync(swPath, "utf8")
    .replace('"__SW_VERSION__"', JSON.stringify(version))
    .replace('"__SW_PRECACHE__"', JSON.stringify(["./", ...urls]));
  fs.writeFileSync(swPath, source);
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
    {
      name: "fill-service-worker",
      apply: "build",
      closeBundle() {
        fillServiceWorker();
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
