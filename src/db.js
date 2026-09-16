import { DEFAULT_SETTINGS } from "./config.js";

const DB_NAME = "daebbang-kiosk";
const DB_VERSION = 1;
const ITEM_STORE = "items";
const SETTINGS_KEY = "daebbang-settings";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(ITEM_STORE)) {
        db.createObjectStore(ITEM_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllItems() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const req = tx.objectStore(ITEM_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getItem(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEM_STORE, "readonly");
    const req = tx.objectStore(ITEM_STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveItem(item) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    tx.objectStore(ITEM_STORE).put(item);
    tx.oncomplete = () => resolve(item);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteItem(id) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    tx.objectStore(ITEM_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export const SETTINGS_EVENT = "daebbang:settings";

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: settings }));
}

export async function clearAllItems() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ITEM_STORE, "readwrite");
    tx.objectStore(ITEM_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function factoryReset() {
  localStorage.removeItem(SETTINGS_KEY);
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: { ...DEFAULT_SETTINGS } }));
}
