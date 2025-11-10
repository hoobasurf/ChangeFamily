import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Upload image + ajouter document Firestore
export async function uploadImage(file, userId) {
  const name = `${Date.now()}.jpg`;
  const storageRef = ref(storage, `snaps/${userId}/${name}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  // Ajouter dans Firestore (timestamp si tu veux plus tard)
  await addDoc(collection(db, "snaps"), {
    userId,
    imageUrl: url,
    timestamp: Date.now()
  });

  return url;
}

export async function getMessagesForUser(uid) {
    // temporaire (mock data)
    return [
        { username: "prettyone", last: "Hello!", avatar: "avatar-default.png" },
        { username: "kate123", last: "Great photo!", avatar: "avatar-default.png" }
    ];
}
