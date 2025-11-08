// storage.js
import { getStorage, ref, uploadBytes, getDownloadURL } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

import { getFirestore, collection, addDoc, query, orderBy, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { app } from './firebase.js';

const storage = getStorage(app);
const db = getFirestore(app);

// Upload d’une image et création du document Firestore
export async function uploadImage(file, userId) {
  // 1️⃣ Upload dans Storage
  const storageRef = ref(storage, `users/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // 2️⃣ Création d’un document dans Firestore
  await addDoc(collection(db, "snaps"), {
    userId,
    imageUrl: url,
    timestamp: new Date()
  });

  return url;
}

// Récupérer tous les snaps (ordre du plus récent)
export async function getAllSnaps() {
  const snapsCol = collection(db, "snaps");
  const q = query(snapsCol, orderBy("timestamp", "desc"));
  const snapDocs = await getDocs(q);
  return snapDocs.docs.map(doc => doc.data());
}

export { storage, db };
