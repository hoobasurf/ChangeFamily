import { storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

export async function uploadImage(file, userId) {
  const name = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `snaps/${userId}/${name}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}
