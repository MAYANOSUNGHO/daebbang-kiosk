import { tickerMarkup } from "../lib/markup.js";
import { cropImageToSquare } from "../lib/crop.js";
import { formatRates, gradeLabel } from "../draw.js";
import {
  clearAllItems,
  deleteItem,
  factoryReset,
  getAllItems,
  getItem,
  loadSettings,
  saveItem,
  saveSettings,
} from "../db.js";

export function renderPin(app, ctx) {
  app.innerHTML = `
    <section class="screen screen-plain">
      ${tickerMarkup()}
      <div class="panel">
        <h2>직원 확인</h2>
        <div class="form-grid">
          <label>PIN <input id="pin" type="password" inputmode="numeric" maxlength="8" /></label>
          <div class="btn-row">
            <button class="btn btn-primary" id="pin-ok" type="button">확인</button>
            <button class="btn btn-ghost" data-go="home" type="button">취소</button>
          </div>
          <p class="hint">처음 PIN은 1234 입니다. 설정에서 바꿀 수 있습니다.</p>
        </div>
      </div>
    </section>`;
  bindGo(app, ctx.go);
  document.getElementById("pin-ok")?.addEventListener("click", () => {
    const value = document.getElementById("pin").value;
    if (value === ctx.state.settings.pin) ctx.go("settings");
    else alert("PIN이 올바르지 않습니다.");
  });
}

export async function renderSettings(app, ctx) {
  ctx.state.items = await getAllItems();
  ctx.state.items.sort(
    (a, b) => Number(a.grade) - Number(b.grade) || a.name.localeCompare(b.name, "ko"),
  );
  const last = ctx.state.settings.lastConfirm;
  app.innerHTML = `
    <section class="screen screen-plain screen-scroll">
      ${tickerMarkup()}
      <div class="top-bar">
        <button class="btn btn-ghost" data-go="home" type="button">메인</button>
        <h2>설정</h2>
        <button class="btn btn-primary" id="add-item" type="button">품목 추가</button>
      </div>
      <div class="panel">
        <h3>등급 확률 (%)</h3>
        <div class="rates">
          <label>3등상 <input id="rate3" type="number" value="${ctx.state.settings.rates[3]}" /></label>
          <label>2등상 <input id="rate2" type="number" value="${ctx.state.settings.rates[2]}" /></label>
          <label>1등상 <input id="rate1" type="number" value="${ctx.state.settings.rates[1]}" /></label>
        </div>
        <label>PIN 변경 <input id="new-pin" type="text" value="${ctx.escapeHtml(ctx.state.settings.pin)}" /></label>
        <p class="rate-notice" id="settings-rate-preview">${ctx.escapeHtml(formatRates(ctx.state.settings.rates))}</p>
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-ok" id="save-rates" type="button">PIN 저장</button>
          <button class="btn btn-ghost" id="undo" type="button" ${last ? "" : "disabled"}>마지막 지급 취소</button>
          <button class="btn btn-danger" id="factory-reset" type="button">공장초기화</button>
        </div>
        <p class="hint">확률 숫자는 입력하는 즉시 뽑기 화면 고지에 반영됩니다. PIN만 아래 저장을 누르면 됩니다. 1·2·3등상 확률은 등급끼리만 적용되고, 같은 등급 안에서는 남은 재고가 많을수록 더 자주 나옵니다.</p>
      </div>
      <div class="panel item-list" style="margin-top:16px">
        ${
          ctx.state.items.length
            ? ctx.state.items.map((item) => itemRow(item, ctx)).join("")
            : `<p class="hint">아직 품목이 없습니다. 품목 추가를 눌러 사진·이름·재고를 넣으세요.</p>`
        }
      </div>
    </section>`;
  bindGo(app, ctx.go);
  document.getElementById("add-item")?.addEventListener("click", () => {
    ctx.state.draft = emptyDraft();
    ctx.go("item-form");
  });
  document.getElementById("save-rates")?.addEventListener("click", () => saveRates(ctx));
  ["rate3", "rate2", "rate1"].forEach((id) => {
    document.getElementById(id)?.addEventListener("input", () => applyRatesFromForm(ctx, false));
  });
  document.getElementById("undo")?.addEventListener("click", () => undoLast(ctx));
  document.getElementById("factory-reset")?.addEventListener("click", () => onFactoryReset(ctx));
  app.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const item = await getItem(btn.dataset.edit);
      ctx.state.draft = { ...item };
      ctx.go("item-form");
    });
  });
}

export function renderItemForm(app, ctx) {
  const item = ctx.state.draft;
  const img = ctx.blobUrl(item.image);
  app.innerHTML = `
    <section class="screen screen-plain screen-scroll">
      ${tickerMarkup()}
      <div class="top-bar">
        <button class="btn btn-ghost" data-go="settings" type="button">목록</button>
        <h2>${item.id ? "품목 수정" : "품목 추가"}</h2>
        <span></span>
      </div>
      <div class="panel form-grid">
        ${
          img
            ? `<div class="item-frame form-frame"><img class="result-image" src="${img}" alt="" /></div>`
            : ""
        }
        <label>이미지 <input id="image" type="file" accept="image/*" /></label>
        <label>이름 <input id="name" type="text" value="${ctx.escapeHtml(item.name)}" /></label>
        <label>남은 재고 <input id="stock" type="number" min="0" value="${item.stock}" /></label>
        <label>등급
          <select id="grade">
            <option value="3" ${Number(item.grade) === 3 ? "selected" : ""}>3등상 (키링 등)</option>
            <option value="2" ${Number(item.grade) === 2 ? "selected" : ""}>2등상 (중형 인형)</option>
            <option value="1" ${Number(item.grade) === 1 ? "selected" : ""}>1등상 (피규어 등)</option>
          </select>
        </label>
        <label>추가 배율 (기본 1, 같은 등급 안에서만) <input id="weight" type="number" min="0.1" step="0.1" value="${item.weight}" /></label>
        <div class="btn-row">
          <button class="btn btn-ok" id="save-item" type="button">저장</button>
          ${item.id ? `<button class="btn btn-danger" id="delete-item" type="button">삭제</button>` : ""}
        </div>
      </div>
    </section>`;
  bindGo(app, ctx.go);
  document.getElementById("image")?.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      ctx.state.draft.image = await cropImageToSquare(file);
    } catch {
      ctx.state.draft.image = file;
    }
    ctx.go("item-form");
  });
  document.getElementById("save-item")?.addEventListener("click", () => saveDraft(ctx));
  document.getElementById("delete-item")?.addEventListener("click", async () => {
    if (!confirm("이 품목을 삭제할까요?")) return;
    await deleteItem(item.id);
    ctx.go("settings");
  });
}

function bindGo(app, go) {
  app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });
}

function itemRow(item, ctx) {
  const img = ctx.blobUrl(item.image);
  return `
    <div class="item-row">
      ${
        img
          ? `<div class="item-frame thumb-frame"><img class="thumb" src="${img}" alt="" /></div>`
          : `<div class="thumb"></div>`
      }
      <div>
        <strong>${ctx.escapeHtml(item.name)}</strong>
        <div class="hint">${gradeLabel(item.grade)} · 재고 ${item.stock} · 배율 ${item.weight}</div>
      </div>
      <button class="btn btn-ghost" data-edit="${item.id}" type="button">수정</button>
    </div>`;
}

function emptyDraft() {
  return { id: "", name: "", stock: 1, grade: 3, weight: 1, image: null, enabled: true };
}

function applyRatesFromForm(ctx, includePin) {
  ctx.state.settings.rates = {
    3: Number(document.getElementById("rate3").value) || 0,
    2: Number(document.getElementById("rate2").value) || 0,
    1: Number(document.getElementById("rate1").value) || 0,
  };
  if (includePin) {
    ctx.state.settings.pin = document.getElementById("new-pin").value || "1234";
  }
  saveSettings(ctx.state.settings);
  const preview = document.getElementById("settings-rate-preview");
  if (preview) preview.textContent = formatRates(ctx.state.settings.rates);
}

function saveRates(ctx) {
  applyRatesFromForm(ctx, true);
  alert("PIN을 저장했습니다. 확률은 숫자를 바꿀 때마다 이미 반영됩니다.");
}

async function saveDraft(ctx) {
  const name = document.getElementById("name").value.trim();
  if (!name) {
    alert("이름을 입력하세요.");
    return;
  }
  const item = {
    ...ctx.state.draft,
    id: ctx.state.draft.id || crypto.randomUUID(),
    name,
    stock: Math.max(0, Number(document.getElementById("stock").value) || 0),
    grade: Number(document.getElementById("grade").value),
    weight: Math.max(0.1, Number(document.getElementById("weight").value) || 1),
  };
  await saveItem(item);
  ctx.go("settings");
}

async function onFactoryReset(ctx) {
  if (!confirm("모든 품목과 설정을 지우고 처음 상태로 되돌릴까요?")) return;
  if (!confirm("정말로 공장초기화할까요? 이 작업은 되돌릴 수 없습니다.")) return;
  await clearAllItems();
  factoryReset();
  ctx.state.items = [];
  ctx.state.settings = loadSettings();
  ctx.state.draft = null;
  ctx.state.result = null;
  ctx.go("home");
}

async function undoLast(ctx) {
  const last = ctx.state.settings.lastConfirm;
  if (!last) return;
  const item = await getItem(last.id);
  if (!item) {
    alert("해당 품목을 찾을 수 없습니다.");
    return;
  }
  item.stock += 1;
  await saveItem(item);
  ctx.state.settings.lastConfirm = null;
  saveSettings(ctx.state.settings);
  ctx.go("settings");
}
