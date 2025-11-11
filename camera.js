// camera.js
import { auth, storage, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const cam = document.getElementById("cam");
const flipBtn = document.getElementById("flipBtn");
const shutter = document.getElementById("shutter");
const chooseBtn = document.getElementById("chooseBtn");
const fileInput = document.getElementById("fileInput");
const previewModal = document.getElementById("previewModal");
const previewMedia = document.getElementById("previewMedia");
const useAsAvatarBtn = document.getElementById("useAsAvatarBtn");
const publishPostBtn = document.getElementById("publishPostBtn");
const cancelPreviewBtn = document.getElementById("cancelPreviewBtn");

let stream = null;
let useFront = true;
let lastFile = null; // File or Blob
let lastType = null; // "image" or "video"

// helper : start camera with facingMode
async function startCamera() {
  try {
    stream?.getTracks().forEach(t => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: useFront ? "user" : "environment" }, audio: false });
    cam.srcObject = stream;
    // mirror preview for front camera
    cam.style.transform = useFront ? "scaleX(-1)" : "scaleX(1)";
  } catch (e) {
    console.error("Erreur démarrage caméra", e);
    alert("Caméra non disponible sur cet appareil.");
  }
}
startCamera();

flipBtn.addEventListener("click", () => {
  useFront = !useFront;
  startCamera();
});

// shutter : take photo
shutter.addEventListener("click", async () => {
  if (!stream) return alert("Caméra non prête");
  const track = stream.getVideoTracks()[0];
  const settings = track.getSettings();
  const w = settings.width || cam.videoWidth || 1280;
  const h = settings.height || cam.videoHeight || 720;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // if front camera, flip so saved image is not mirrored
  if (useFront) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(cam, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    lastFile = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
    lastType = "image";
    showPreview(lastFile, lastType);
  }, "image/jpeg", 0.9);
});

// choose from files
chooseBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", (e) => {
  const f = e.target.files[0];
  if (!f) return;
  lastFile = f;
  lastType = f.type.startsWith("video") ? "video" : "image";
  showPreview(f, lastType);
});

// show preview modal
function showPreview(file, type) {
  previewMedia.innerHTML = "";
  if (type === "video") {
    const v = document.createElement("video");
    v.src = URL.createObjectURL(file);
    v.controls = true;
    v.loop = false;
    v.style.width = "100%";
    previewMedia.appendChild(v);
  } else {
    const i = document.createElement("img");
    i.src = URL.createObjectURL(file);
    i.style.width = "100%";
    previewMedia.appendChild(i);
  }
  previewModal.style.display = "flex";
}

// cancel preview
cancelPreviewBtn.addEventListener("click", () => {
  previewModal.style.display = "none";
  lastFile = null;
  lastType = null;
  previewMedia.innerHTML = "";
});

// upload helper
async function uploadFile(path, file) {
  const r = ref(storage, path);
  await uploadBytes(r, file);
  return await getDownloadURL(r);
}

// use as avatar: upload to avatar/uid.jpg and set in auth + users doc
useAsAvatarBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Connecte-toi d'abord");
  if (!lastFile) return alert("Aucune image sélectionnée");

  const storagePath = `avatar/${user.uid}.jpg`;
  try {
    const url = await uploadFile(storagePath, lastFile);

    // update profile photo
    await updateProfile(user, { photoURL: url });
    await setDoc(doc(db, "users", user.uid), { photoURL: url, pseudo: user.displayName || null }, { merge: true });

    previewModal.style.display = "none";
    // stop camera
    stream?.getTracks().forEach(t => t.stop());
    window.location.href = "profile.html";
  } catch (e) {
    console.error(e);
    alert("Erreur upload avatar");
  }
});

// publish post to feed (public by default)
publishPostBtn.addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Connecte-toi d'abord");
  if (!lastFile) return alert("Aucune image sélectionnée");

  const storagePath = `posts/${user.uid}/${Date.now()}_${lastFile.name || "media"}`;
  try {
    const url = await uploadFile(storagePath, lastFile);

    // create post doc
    await addDoc(collection(db, "posts"), {
      uid: user.uid,
      pseudo: user.displayName || (user.email ? user.email.split("@")[0] : "Anonyme"),
      avatar: user.photoURL || null,
      url,
      type: lastType === "video" ? "video" : "image",
      visibility: "public",
      createdAt: serverTimestamp(),
      likesCount: 0
    });

    previewModal.style.display = "none";
    stream?.getTracks().forEach(t => t.stop());
    window.location.href = "home.html";
  } catch (e) {
    console.error(e);
    alert("Erreur publication");
  }
});
