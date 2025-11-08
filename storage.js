import { storage, db } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// Upload image + ajouter document Firestore
async function uploadImage(file, userId) {
  const uniqueName = `${Date.now()}.jpg`; // nom unique simple
  const storageRef = ref(storage, `snaps/${userId}/${uniqueName}`);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  console.log("🔥 URL uploadée :", url); // debug

  if(url) {
    await addDoc(collection(db, "snaps"), {
      userId,
      imageUrl: url,
      timestamp: Date.now()
    });
  }

  return url;
}

export { uploadImage };
