// storage.js
import { getStorage, ref, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { app } from './firebase.js';

const storage = getStorage(app);

// Upload d’un fichier
export async function uploadImage(file, userId) {
  const storageRef = ref(storage, `users/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export { storage };
