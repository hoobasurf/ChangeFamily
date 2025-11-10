// ✅ storage.js

import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  listAll
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// ✅ envoi photo
export async function uploadImage(userId, blob) {
  const imageRef = ref(storage, `public/${userId}/${Date.now()}.jpg`);
  await uploadBytes(imageRef, blob);
}

// ✅ récupère la dernière photo du user
export async function getLastImageForUser(userId) {
  const folderRef = ref(storage, `public/${userId}`);
  const res = await listAll(folderRef);

  if (res.items.length === 0) return null;

  const last = res.items[res.items.length - 1];
  return await getDownloadURL(last);
}
