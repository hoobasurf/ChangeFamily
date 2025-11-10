// camera.js
import { auth, storage } from './firebase.js';
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const db = getFirestore();
const video = document.getElementById('cameraPreview');
const takeBtn = document.getElementById('takeBtn');
const chooseBtn = document.getElementById('chooseBtn');
const chooseFile = document.getElementById('chooseFile');
const publishBtn = document.getElementById('publishBtn');
const captionEl = document.getElementById('caption');
const previewWrap = document.getElementById('previewWrap');

let lastFile = null;
let lastBlob = null;

// Start camera if available
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
  } catch (e) {
    console.warn('Camera not available', e);
  }
}
startCamera();

// take snapshot to blob
takeBtn.addEventListener('click', async () => {
  const track = video.srcObject && video.srcObject.getVideoTracks()[0];
  if (!track) {
    alert('Caméra non disponible — choisis un fichier.');
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

// choose file fallback (opens native chooser)
chooseBtn.addEventListener('click', () => chooseFile.click());
chooseFile.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  lastFile = f;
  lastBlob = null;
  showPreview(URL.createObjectURL(f));
});

function showPreview(url) {
  previewWrap.innerHTML = '';
  const img = document.createElement('img');
  img.src = url;
  img.style.maxWidth = '100%';
  img.style.borderRadius = '12px';
  previewWrap.appendChild(img);
}

// publish -> upload to storage + add post document
publishBtn.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) return alert('Connecte-toi d’abord !');
  const visibility = document.querySelector('input[name="visibility"]:checked').value;
  const caption = captionEl.value || '';

  if (!lastFile) return alert('Prends ou choisis un fichier avant de publier.');

  // upload
  const storagePath = `posts/${user.uid}/${Date.now()}_${lastFile.name}`;
  const sRef = ref(storage, storagePath);
  try {
    const snap = await uploadBytes(sRef, lastFile);
    const url = await getDownloadURL(sRef);

    // create post doc
    const post = {
      ownerUid: user.uid,
      ownerEmail: user.email || null,
      ownerPseudo: user.displayName || null,
      storagePath,
      url,
      caption,
      visibility,
      createdAt: serverTimestamp()
    };
    await addDoc(collection(db, 'posts'), post);

    alert('Publication réussie ✅');
    // clear
    lastFile = null;
    previewWrap.innerHTML = '';
    captionEl.value = '';
    // redirect home to show it
    window.location.href = 'home.html';
  } catch (err) {
    console.error(err);
    alert('Erreur upload : ' + err.message);
  }
});
