import { TICKER_TEXT } from "../config.js";
import { escapeHtml } from "./dom.js";

export function tickerMarkup(text = TICKER_TEXT) {
  const safe = escapeHtml(text.repeat(20));
  const row = (reverse) =>
    `<div class="ticker-row${reverse ? " is-reverse" : ""}"><span>${safe}</span><span>${safe}</span></div>`;
  const rows = Array.from({ length: 28 }, (_, i) => row(i % 2 === 1)).join("");
  return `<div class="ticker-clip" aria-hidden="true"><div class="ticker">${rows}</div></div>`;
}

export function gearIcon() {
  return `
    <svg viewBox="0 0 24 24" width="36" height="36" aria-hidden="true">
      <path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.03 7.03 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.55-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.81 8.48a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94L2.93 14.16a.5.5 0 0 0-.12.64l1.92 3.32c.13.23.4.32.64.22l2.39-.96c.5.39 1.04.7 1.63.94l.36 2.54c.05.24.25.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.55 1.63-.94l2.39.96c.24.1.51.01.64-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"/>
    </svg>`;
}
