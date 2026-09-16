import { SLOT, STAFF_ONLY_TEXT } from "../config.js";
import { tickerMarkup } from "../lib/markup.js";
import { playWin } from "../audio.js";
import { formatRates, gradeLabel, pickItem } from "../draw.js";
import {
  SETTINGS_EVENT,
  getAllItems,
  getItem,
  loadSettings,
  saveItem,
  saveSettings,
} from "../db.js";

const GRADE_CYCLE = [3, 2, 1];

export async function renderPlay(app, ctx) {
  ctx.state.settings = loadSettings();
  app.innerHTML = `
    <section class="screen screen-plain">
      ${tickerMarkup()}
      <div class="top-bar">
        <button class="btn btn-ghost" data-go="home" type="button">메인</button>
        <span class="touch-label"> TOUCH ! </span>
        <span></span>
      </div>
      <p class="staff-only">${ctx.escapeHtml(STAFF_ONLY_TEXT)}</p>
      <button class="btn btn-primary draw-btn" id="draw" type="button">뽑기</button>
      <p class="rate-notice" id="rate-notice">${ctx.escapeHtml(formatRates(ctx.state.settings.rates))}</p>
    </section>`;
  bindGo(app, ctx.go);
  document.getElementById("draw")?.addEventListener("click", () => onDraw(ctx));

  const refreshRates = () => {
    ctx.state.settings = loadSettings();
    const notice = document.getElementById("rate-notice");
    if (notice) notice.textContent = formatRates(ctx.state.settings.rates);
  };
  window.addEventListener(SETTINGS_EVENT, refreshRates);
  window.addEventListener("storage", refreshRates);
  ctx.onCleanup(() => {
    window.removeEventListener(SETTINGS_EVENT, refreshRates);
    window.removeEventListener("storage", refreshRates);
  });
}

export function renderRolling(app, ctx) {
  const picked = ctx.state.result;
  if (!picked) {
    ctx.later(400, () => ctx.go("result"));
    app.innerHTML = `
      <section class="screen screen-plain">
        ${tickerMarkup()}
        <p>지급 가능한 재고가 없습니다.</p>
      </section>`;
    return;
  }

  const grade = Number(picked.grade) || 3;
  const cells = [];
  for (let loop = 0; loop < SLOT.loops + 2; loop += 1) {
    for (const g of GRADE_CYCLE) cells.push(g);
  }
  const landIndex = SLOT.loops * GRADE_CYCLE.length + GRADE_CYCLE.indexOf(grade);

  app.innerHTML = `
    <section class="screen screen-plain">
      ${tickerMarkup()}
      <p class="slot-caption">뽑는 중...</p>
      <div class="slot-window" style="--slot-h:${SLOT.cellPx}px">
        <div class="slot-fade slot-fade-top"></div>
        <div class="slot-fade slot-fade-bottom"></div>
        <div class="slot-highlight"></div>
        <div class="slot-reel" id="slot-reel">
          ${cells
            .map(
              (g) =>
                `<div class="slot-cell slot-grade-${g}">${gradeLabel(g)}</div>`,
            )
            .join("")}
        </div>
      </div>
      <p class="slot-result-label" id="slot-result-label"></p>
    </section>`;

  const reel = document.getElementById("slot-reel");
  const label = document.getElementById("slot-result-label");
  const offset = -(landIndex * SLOT.cellPx - SLOT.cellPx);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (!reel) return;
      reel.style.transition = `transform ${SLOT.spinMs}ms cubic-bezier(0.12, 0.7, 0.08, 1)`;
      reel.style.transform = `translateY(${offset}px)`;
    });
  });

  ctx.later(SLOT.spinMs + 40, () => {
    if (label) {
      label.textContent = gradeLabel(grade);
      label.classList.add("is-on");
    }
    document.querySelector(".slot-window")?.classList.add("is-landed");
  });

  ctx.later(SLOT.spinMs + SLOT.holdMs, () => ctx.go("result"));
}

function starBurstMarkup() {
  const count = 18;
  const reach = Math.round(Math.min(window.innerWidth, window.innerHeight) * 0.42);
  const stars = Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + 0.2;
    const dist = reach * (0.7 + (i % 4) * 0.1);
    const dx = Math.round(Math.cos(angle) * dist);
    const dy = Math.round(Math.sin(angle) * dist);
    const delay = (i % 5) * 30;
    return `<span class="burst-star" data-dx="${dx}" data-dy="${dy}" data-delay="${delay}">★</span>`;
  }).join("");
  return `<div class="star-burst" aria-hidden="true">${stars}</div>`;
}

function playStarBurst(root) {
  root.querySelectorAll(".burst-star").forEach((star) => {
    const dx = Number(star.dataset.dx) || 0;
    const dy = Number(star.dataset.dy) || 0;
    const delay = Number(star.dataset.delay) || 0;
    if (star.animate) {
      star.animate(
        [
          { transform: "translate3d(0,0,0) scale(0.35)", opacity: 1 },
          { transform: `translate3d(${dx}px, ${dy}px, 0) scale(1.25)`, opacity: 0 },
        ],
        { duration: 1250, delay, easing: "ease-out", fill: "forwards" },
      );
    } else {
      star.style.setProperty("--dx", `${dx}px`);
      star.style.setProperty("--dy", `${dy}px`);
      star.style.animation = `star-burst 1.25s ${delay}ms ease-out forwards`;
    }
  });
}

export function renderResult(app, ctx) {
  const item = ctx.state.result;
  if (!item) {
    app.innerHTML = `
      <section class="screen screen-plain">
        ${tickerMarkup()}
        <p>지급 가능한 재고가 없습니다.</p>
        <button class="btn btn-ghost" data-go="play" type="button">돌아가기</button>
      </section>`;
    bindGo(app, ctx.go);
    return;
  }
  const img = ctx.blobUrl(item.image);
  app.innerHTML = `
    <section class="screen screen-plain screen-result">
      ${tickerMarkup()}
      ${starBurstMarkup()}
      <p class="result-grade">${gradeLabel(item.grade)}</p>
      <div class="result-hero">
        <div class="item-frame result-frame logo-pop">
          ${img ? `<img class="result-image" alt="" src="${img}" />` : `<div class="result-image"></div>`}
        </div>
        <h2 class="result-name logo-pop">${ctx.escapeHtml(item.name)}</h2>
      </div>
      <p>남은 재고 ${item.stock}개</p>
      <div class="btn-row">
        <button class="btn btn-ok" id="confirm" type="button">확인 (재고 -1)</button>
        <button class="btn btn-danger" id="cancel" type="button">취소</button>
      </div>
    </section>`;
  playWin();
  playStarBurst(app);
  document.getElementById("confirm")?.addEventListener("click", () => onConfirm(ctx));
  document.getElementById("cancel")?.addEventListener("click", () => ctx.go("play"));
}

function bindGo(app, go) {
  app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });
}

async function onDraw(ctx) {
  ctx.state.settings = loadSettings();
  ctx.state.items = await getAllItems();
  const picked = pickItem(ctx.state.items, ctx.state.settings.rates);
  ctx.go("rolling", { result: picked });
}

async function onConfirm(ctx) {
  const current = await getItem(ctx.state.result.id);
  if (!current || current.stock < 1) {
    alert("재고가 없습니다.");
    ctx.go("play");
    return;
  }
  current.stock -= 1;
  await saveItem(current);
  ctx.state.settings.lastConfirm = { id: current.id, at: Date.now() };
  saveSettings(ctx.state.settings);
  ctx.go("play");
}
