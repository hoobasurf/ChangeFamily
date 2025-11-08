import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { collection, addDoc, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Upload image + ajouter document Firestore
async function uploadImage(file, userId) {
  const uniqueName = `${Date.now()}_${file.name}`; // nom unique
  const storageRef = ref(storage, `snaps/${userId}/${uniqueName}`);
  await uploadBytes(storageRef, file);

  const url = await getDownloadURL(storageRef);

  if(url) {
    await addDoc(collection(db, "snaps"), {
      userId,
      imageUrl: url,
      timestamp: Date.now()
    });
  }

  return url;
}

// Récupérer tous les snaps triés par timestamp descendant
async function getAllSnaps() {
  const snapsCol = collection(db, "snaps");
  const snapsQuery = query(snapsCol, orderBy("timestamp", "desc"));
  const snapsSnapshot = await getDocs(snapsQuery);
  return snapsSnapshot.docs.map(doc => doc.data());
}

export { uploadImage, getAllSnaps };
