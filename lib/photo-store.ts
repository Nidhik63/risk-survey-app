/**
 * Photo storage for survey progress persistence.
 * Uses localStorage as primary (with quota check),
 * falls back to IndexedDB if localStorage is full.
 */

import type { TaggedPhoto } from "./survey-types";

const LS_KEY = "ntru-survey-photos";
const DB_NAME = "ntru-survey";
const DB_VERSION = 1;
const STORE_NAME = "photos";
const PHOTOS_KEY = "survey-photos";

// ── IndexedDB helpers ───────────────────────────────────────
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function saveToIDB(photos: TaggedPhoto[]): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).put(photos, PHOTOS_KEY);
  await new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function loadFromIDB(): Promise<TaggedPhoto[]> {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const req = tx.objectStore(STORE_NAME).get(PHOTOS_KEY);
  return new Promise((resolve) => {
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
}

// ── Public API ──────────────────────────────────────────────

/** Save photos — tries localStorage first, then IndexedDB */
export async function savePhotos(photos: TaggedPhoto[]): Promise<void> {
  // Try localStorage first (more reliable on Safari/iOS)
  try {
    const json = JSON.stringify(photos);
    localStorage.setItem(LS_KEY, json);
    return; // success — done
  } catch {
    // localStorage full or unavailable — fall through to IndexedDB
  }

  // Fallback to IndexedDB
  try {
    await saveToIDB(photos);
  } catch {
    // Both failed — photos won't persist this session
  }
}

/** Load photos — checks localStorage first, then IndexedDB */
export async function loadPhotos(): Promise<TaggedPhoto[]> {
  // Try localStorage first
  try {
    const json = localStorage.getItem(LS_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore parse errors
  }

  // Fallback to IndexedDB
  try {
    return await loadFromIDB();
  } catch {
    return [];
  }
}

/** Clear saved photos from both storages */
export async function clearPhotos(): Promise<void> {
  try {
    localStorage.removeItem(LS_KEY);
  } catch {
    // ignore
  }
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(PHOTOS_KEY);
  } catch {
    // ignore
  }
}
