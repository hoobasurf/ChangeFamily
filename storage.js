import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

async function uploadImage(file, userId) {
  const storageRef = ref(storage, `snaps/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await addDoc(collection(db, "snaps"), { userId, imageUrl: url, timestamp: Date.now() });
  return url;
}

async function getAllSnaps() {
  const snapsSnapshot = await getDocs(collection(db, "snaps"));
  return snapsSnapshot.docs.map(doc => doc.data());
}

export { uploadImage, getAllSnaps };
