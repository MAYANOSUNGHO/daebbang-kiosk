import { UI_FILES } from "./config.js";
import { loadSettings } from "./db.js";
import { applyScreenAudio, initAudio, playGacha, playUi, unlockAudio } from "./audio.js";
import { escapeHtml, firstExisting } from "./lib/dom.js";
import { tickerMarkup } from "./lib/markup.js";
import { renderHome } from "./screens/home.js";
import { renderPlay, renderResult, renderRolling } from "./screens/play.js";
import { renderItemForm, renderPin, renderSettings } from "./screens/settings.js";
import { setupNative } from "./native.js";
import { registerServiceWorker } from "./pwa.js";

const app = document.getElementById("app");

const state = {
  screen: "boot",
  items: [],
  settings: loadSettings(),
  draft: null,
  result: null,
  objectUrls: [],
};

let navGen = 0;
const cleanups = [];

function onCleanup(fn) {
  cleanups.push(fn);
}

function runCleanups() {
  while (cleanups.length) {
    const fn = cleanups.pop();
    try {
      fn();
    } catch {
      /* 화면을 떠나는 중이므로 무시합니다. */
    }
  }
}

function revokeUrls() {
  for (const url of state.objectUrls) URL.revokeObjectURL(url);
  state.objectUrls = [];
}

function blobUrl(blob) {
  if (!blob) return "";
  const url = URL.createObjectURL(blob);
  state.objectUrls.push(url);
  return url;
}

function later(ms, fn) {
  const token = navGen;
  window.setTimeout(() => {
    if (token === navGen) fn();
  }, ms);
}

function go(screen, extra = {}) {
  navGen += 1;
  Object.assign(state, extra, { screen });
  applyScreenAudio(screen);
  render();
}

const ctx = { state, go, later, blobUrl, escapeHtml, onCleanup };

app.addEventListener(
  "click",
  (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    unlockAudio();
    if (button.id === "draw") playGacha();
    else playUi();
  },
  true,
);

window.addEventListener("pointerdown", () => unlockAudio(), { once: true });

async function render() {
  runCleanups();
  revokeUrls();
  const { screen } = state;
  if (screen === "boot") {
    const videoPath = await firstExisting(UI_FILES.loading);
    if (!videoPath) {
      go("home");
      return;
    }
    app.innerHTML = `
      <section class="screen screen-home">
        ${tickerMarkup()}
        <video class="fill" id="loading-video" muted autoplay playsinline></video>
      </section>`;
    const video = document.getElementById("loading-video");
    video.src = videoPath;
    const done = () => go("home");
    video.addEventListener("ended", done, { once: true });
    later(4000, done);
    return;
  }
  if (screen === "home") return renderHome(app, ctx);
  if (screen === "play") return renderPlay(app, ctx);
  if (screen === "rolling") return renderRolling(app, ctx);
  if (screen === "result") return renderResult(app, ctx);
  if (screen === "pin") return renderPin(app, ctx);
  if (screen === "settings") return renderSettings(app, ctx);
  if (screen === "item-form") return renderItemForm(app, ctx);
}

initAudio().then(() => {
  setupNative();
  registerServiceWorker();
  render();
});
