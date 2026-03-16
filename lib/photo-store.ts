/**
 * IndexedDB-backed photo storage for survey progress persistence.
 * localStorage caps at ~5 MB — a single compressed photo can be 200 KB+,
 * so we use IndexedDB which typically offers hundreds of MB.
 */

import type { TaggedPhoto } from "./survey-types";

const DB_NAME = "ntru-survey";
const DB_VERSION = 1;
const STORE_NAME = "photos";
const PHOTOS_KEY = "survey-photos";

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

/** Save photos to IndexedDB */
export async function savePhotos(photos: TaggedPhoto[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(photos, PHOTOS_KEY);
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail — photos just won't persist
  }
}

/** Load photos from IndexedDB */
export async function loadPhotos(): Promise<TaggedPhoto[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(PHOTOS_KEY);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/** Clear saved photos from IndexedDB */
export async function clearPhotos(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(PHOTOS_KEY);
  } catch {
    // ignore
  }
}
