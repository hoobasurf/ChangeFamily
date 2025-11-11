import { auth, storage, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const avatarImg = document.getElementById("avatarImg");
  const fileInput = document.getElementById("avatarFile");
  const chooseAvatar = document.getElementById("chooseAvatar");
  const openCam = document.getElementById("openCameraAvatar");
  const cam = document.getElementById("selfieCam");
  const takeSelfie = document.getElementById("takeSelfie");
  const pseudoDisplay = document.getElementById("pseudoDisplay");
  const pseudoInput = document.getElementById("pseudoInput");
  const savePseudo = document.getElementById("savePseudo");
  const panel = document.getElementById("editPanel");
  const editProfile = document.getElementById("editProfile");

  let selfieBlob = null;

  // Toggle panneau édition
  editProfile.onclick = () => panel.classList.toggle("hidden");

  // Charger profil
  auth.onAuthStateChanged(async user => {
    if (!user) return;
    pseudoDisplay.textContent = user.displayName || "Sans pseudo";
    const docSnap = await getDoc(doc(db, "users", user.uid));
    if (docSnap.exists()) {
      if (docSnap.data().photoURL) avatarImg.src = docSnap.data().photoURL;
      if (docSnap.data().pseudo) pseudoDisplay.textContent = docSnap.data().pseudo;
    }
  });

  // Galerie
  chooseAvatar.onclick = () => fileInput.click();
  fileInput.onchange = () => {
    if (fileInput.files[0]) uploadAvatar(fileInput.files[0]);
  };

  // Caméra selfie
  openCam.onclick = async () => {
    cam.hidden = false;
    takeSelfie.hidden = false;
    cam.srcObject = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
  };

  takeSelfie.onclick = () => {
    const canvas = document.createElement("canvas");
    canvas.width = cam.videoWidth;
    canvas.height = cam.videoHeight;
    canvas.getContext("2d").drawImage(cam, 0, 0);
    canvas.toBlob(blob => {
      selfieBlob = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      uploadAvatar(selfieBlob);
    });
  };

  async function uploadAvatar(file) {
    const user = auth.currentUser;
    const path = `avatar/${user.uid}.jpg`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);
    await updateProfile(user, { photoURL: url });
    await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });
    avatarImg.src = url;
  }

  savePseudo.onclick = async () => {
    const user = auth.currentUser;
    const pseudo = pseudoInput.value.trim();
    if (!pseudo) return;
    await updateProfile(user, { displayName: pseudo });
    await setDoc(doc(db, "users", user.uid), { pseudo }, { merge: true });
    pseudoDisplay.textContent = pseudo;
    panel.classList.add("hidden");
  };
});
