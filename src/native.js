import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";
import { StatusBar } from "@capacitor/status-bar";

export async function setupNative() {
  if (!Capacitor.isNativePlatform()) return;
  try {
    await StatusBar.hide();
    await StatusBar.setOverlaysWebView({ overlay: true });
  } catch {
    /* 웹뷰에 따라 상태바가 없을 수 있음 */
  }
  App.addListener("backButton", () => {});
}
