import { auth, storage, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const avatarImg = document.getElementById("avatarImg");
const fileInput = document.getElementById("avatarFile");
const chooseAvatar = document.getElementById("chooseAvatar");
const openCam = document.getElementById("openCameraAvatar");
const cam = document.getElementById("selfieCam");
const takeSelfie = document.getElementById("takeSelfie");
const pseudoInput = document.getElementById("pseudoInput");
const savePseudo = document.getElementById("savePseudo");
const pseudoDisplay = document.getElementById("pseudoDisplay");

let stream = null;

// ✅ Charger données utilisateur
auth.onAuthStateChanged(async user => {
  if (!user) return;
  pseudoDisplay.textContent = user.displayName || "Sans pseudo";
  if (user.photoURL) avatarImg.src = user.photoURL;

  const snap = await getDoc(doc(db, "users", user.uid));
  if (snap.exists()) {
    if (snap.data().photoURL) avatarImg.src = snap.data().photoURL;
    if (snap.data().pseudo) pseudoDisplay.textContent = snap.data().pseudo;
  }
});

// ✅ Choisir image depuis galerie
chooseAvatar.onclick = () => fileInput.click();
fileInput.onchange = () => uploadAvatar(fileInput.files[0]);

// ✅ Ouvrir caméra selfie
openCam.onclick = async () => {
  stream = await navigator.mediaDevices.getUserMedia({ 
    video: { facingMode: "user" } 
  });
  cam.srcObject = stream;
  cam.hidden = false;
  takeSelfie.hidden = false;
};

// ✅ Prendre selfie sans effet miroir enregistré
takeSelfie.onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = cam.videoWidth;
  canvas.height = cam.videoHeight;
  const ctx = canvas.getContext("2d");

  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(cam, 0, 0);

  canvas.toBlob(blob => uploadAvatar(new File([blob], "selfie.jpg", { type: "image/jpeg" })));
  stream.getTracks().forEach(t => t.stop());
  cam.hidden = true;
  takeSelfie.hidden = true;
};

// ✅ Upload avatar
async function uploadAvatar(file) {
  const user = auth.currentUser;
  const refImg = ref(storage, `avatar/${user.uid}.jpg`);
  await uploadBytes(refImg, file);
  const url = await getDownloadURL(refImg);

  await updateProfile(user, { photoURL: url });
  await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });

  avatarImg.src = url;
}

// ✅ Enregistrer pseudo
savePseudo.onclick = async () => {
  const user = auth.currentUser;
  const pseudo = pseudoInput.value.trim();
  if (!pseudo) return;

  await updateProfile(user, { displayName: pseudo });
  await setDoc(doc(db, "users", user.uid), { pseudo }, { merge: true });

  pseudoDisplay.textContent = pseudo;
  pseudoInput.value = "";
};
