import { UI_FILES } from "../config.js";
import { firstExisting } from "../lib/dom.js";
import { gearIcon, tickerMarkup } from "../lib/markup.js";

export async function renderHome(app, { go }) {
  const logo = await firstExisting(UI_FILES.logo);
  app.innerHTML = `
    <section class="screen screen-home">
      ${tickerMarkup()}
      <div class="home-logo-wrap">
        ${
          logo
            ? `<img class="home-logo logo-pop" src="${logo}" alt="대빵오락실" />`
            : `<p class="home-logo-text logo-pop">대빵오락실</p>`
        }
      </div>
      <div class="home-start-wrap">
        <button class="btn btn-start" data-go="play" type="button">시작</button>
      </div>
      <div class="home-tools">
        <button class="btn-gear" data-go="pin" type="button" aria-label="설정">${gearIcon()}</button>
      </div>
    </section>`;
  app.querySelectorAll("[data-go]").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.dataset.go));
  });
}
