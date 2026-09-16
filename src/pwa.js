/**
 * 아이패드/안드로이드에서 홈 화면에 추가했을 때 인터넷 없이도 열리게 합니다.
 * APK(Capacitor)로 실행할 때는 이미 앱 안에 파일이 있어서 등록하지 않습니다.
 */
export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (!/^https?:$/.test(location.protocol)) return;
  if (window.Capacitor?.isNativePlatform?.()) return;

  const base = import.meta.env.BASE_URL;
  const register = () => {
    navigator.serviceWorker.register(`${base}sw.js`, { scope: base }).catch(() => {
      /* 오프라인 저장에 실패해도 앱은 그대로 동작합니다. */
    });
  };

  if (document.readyState === "complete") register();
  else window.addEventListener("load", register, { once: true });
}
