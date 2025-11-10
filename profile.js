import { auth, db, storage } from "./firebase.js";
import {
  doc, getDoc, updateDoc, setDoc
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import {
  ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

const profilePic = document.getElementById("profilePic");
const newPhoto = document.getElementById("newPhoto");
const displayName = document.getElementById("displayName");
const bioInput = document.getElementById("bioInput");
const saveBtn = document.getElementById("saveProfile");

auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = "index.html");

  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    displayName.textContent = snap.data().pseudo || user.email;
    bioInput.value = snap.data().bio || "";
    profilePic.src = snap.data().photoURL || "default-avatar.png";
  }
});

// Upload photo
newPhoto.addEventListener("change", async e => {
  const file = e.target.files[0];
  if (!file) return;

  const fileRef = ref(storage, `profile/${auth.currentUser.uid}.jpg`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  await updateDoc(doc(db, "users", auth.currentUser.uid), { photoURL: url });
  profilePic.src = url;
});

// Sauvegarde bio
saveBtn.addEventListener("click", async () => {
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    bio: bioInput.value
  });
  alert("✅ Profil mis à jour !");
});
