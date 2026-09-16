const cache = new Map();

export async function fileExists(path) {
  if (cache.get(path) === true) return true;
  try {
    const res = await fetch(path, { method: "GET", cache: "no-store" });
    if (res.ok) {
      cache.set(path, true);
      return true;
    }
  } catch {
    /* 파일이 아직 없으면 다음 후보를 봅니다. */
  }
  return false;
}

export async function firstExisting(paths) {
  for (const path of paths) {
    if (await fileExists(path)) return path;
  }
  return "";
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
