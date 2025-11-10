// camera.js
import { auth, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const db = getFirestore();
const video = document.getElementById('cameraPreview');
const takeBtn = document.getElementById('captureBtn');
const chooseBtn = document.getElementById('chooseBtn');
const chooseFile = document.getElementById('chooseFile');
const publishBtn = document.getElementById('publishBtn');
const captionEl = document.getElementById('caption');
const previewWrap = document.getElementById('previewWrap');

let lastFile = null;
let lastBlob = null;

// 🎥 Lancer la caméra
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
  } catch (e) {
    console.warn('📛 Caméra non disponible', e);
  }
}
startCamera();

// 📸 Capture photo
takeBtn.addEventListener('click', async () => {
  const track = video.srcObject && video.srcObject.getVideoTracks()[0];
  if (!track) {
    alert('⚠️ Caméra non dispo — sélectionne une image.');
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.toBlob(blob => {
    lastBlob = blob;
    lastFile = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
    showPreview(URL.createObjectURL(lastFile));
  }, 'image/jpeg', 0.9);
});

// 📁 Choisir une photo
chooseBtn.addEventListener('click', () => chooseFile.click());
chooseFile.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  lastFile = f;
  lastBlob = null;
  showPreview(URL.createObjectURL(f));
});

// 🖼 Afficher aperçu
function showPreview(url) {
  previewWrap.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '16px';
  previewWrap.appendChild(img);
}

// 🚀 Publication (Upload + Enregistrer dans Firestore)
publishBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert('❗Connecte-toi d’abord');

  const visibility = document.querySelector('input[name="visibility"]:checked')?.value || "public";
  const caption = captionEl.value || '';

  if (!lastFile) return alert('⚠️ Ajoute une photo avant de publier');

  const storagePath = `posts/${user.uid}/${Date.now()}_${lastFile.name}`;
  const sRef = ref(storage, storagePath);

  try {
    await uploadBytes(sRef, lastFile);
    const url = await getDownloadURL(sRef);

    const postData = {
      uid: user.uid,
      pseudo: user.displayName || user.email.split("@")[0] || "Anonyme",
      photoURL: url,
      caption: caption,
      visibility: visibility,
      timestamp: serverTimestamp()
    };

    await addDoc(collection(db, "posts"), postData);

    alert('✅ Publication réussie !');
    window.location.href = "home.html";

  } catch (err) {
    console.error("Erreur upload :", err);
    alert("Erreur lors de la publication");
  }
});
