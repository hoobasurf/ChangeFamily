// profile.js — version augmentée avec upload Firebase (module ES)
// Remplace ton profile.js par ceci (conserve ton HTML/CSS existants)

// --------------------------
// IMPORTS (three.js + firebase modular SDK)
// --------------------------
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'https://unpkg.com/three@0.152.2/examples/jsm/exporters/GLTFExporter.js';

// Firebase (modular)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// --------------------------
// CONFIG FIREBASE (REMPLACE PAR LES TIENNES)
// --------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCVl5ktUmuiVeMtYUHtxORytkeu71_XBF0",
  authDomain: "changefamilysnap.firebaseapp.com",
  projectId: "changefamilysnap",
  storageBucket: "changefamilysnap.firebasestorage.app",
  messagingSenderId: "335835110495",
  appId: "1:335835110495:web:13194c4bd4579d4f434fea", 
};
// initialisation
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);
const firestore = getFirestore(firebaseApp);

// --------------------------
// === START: Ton code original (conservé)
// --------------------------

// éléments DOM
const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editBtn");
const editMenu = document.getElementById("editMenu");
const uploadPhoto = document.getElementById("uploadPhoto");
const uploadBtn = document.getElementById("uploadBtn");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");
const danceBtn = document.getElementById("danceBtn");

const miniCircle = document.getElementById("miniCircle");
const miniAvatarImg = document.getElementById("miniAvatarImg");

// ---------- Chargement initial ----------
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const circlePhoto = localStorage.getItem("circlePhoto");
  const avatarURL = localStorage.getItem("avatarURL");

  // priorité : circlePhoto (photo persistante du mini-circle)
  if (circlePhoto) {
    miniAvatarImg.src = circlePhoto;
  } else if (avatarURL) {
    miniAvatarImg.src = avatarURL;
  } else {
    miniAvatarImg.src = "default.jpg";
  }

  if (avatarURL) {
    avatar3D.src = avatarURL;
  }

  // also load saved animal if exists
  const animalURL = localStorage.getItem("animalURL");
  if (animalURL) {
    const animalViewer = document.getElementById("animal3D");
    if (animalViewer) animalViewer.src = animalURL;
  }
});

// ---------- Menu "Modifier" toggle + fermeture au clic hors ----------
editBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const visible = editMenu.style.display === "flex";
  editMenu.style.display = visible ? "none" : "flex";
  editMenu.setAttribute("aria-hidden", visible ? "true" : "false");
});

document.addEventListener("click", (e) => {
  if (editMenu.style.display === "flex") {
    if (!editMenu.contains(e.target) && e.target !== editBtn) {
      editMenu.style.display = "none";
      editMenu.setAttribute("aria-hidden", "true");
    }
  }
});

// ---------- Upload / Prendre photo (mini-circle) ----------
uploadBtn.addEventListener("click", () => {
  uploadPhoto.click();
  editMenu.style.display = "none";
});

uploadPhoto.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  setMiniAvatar(file);
});

takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setMiniAvatar(f);
  };
  input.click();
  editMenu.style.display = "none";
});

function setMiniAvatar(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    miniAvatarImg.src = dataUrl;
    localStorage.setItem("circlePhoto", dataUrl);
  };
  reader.readAsDataURL(file);
}

// ---------- Ready Player Me intégré ----------
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmModal.setAttribute("aria-hidden", "false");
  rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

// réception messages du frame RPM
window.addEventListener("message", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch (err) {
    return;
  }

  if (data.source !== "readyplayerme") return;

  // avatar exporté : on met à jour avatar3D + sauvegarde
  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    if (avatarURL) {
      avatar3D.src = avatarURL;
      localStorage.setItem("avatarURL", avatarURL);

      // si mini-circle n'a pas de photo persistante, on l'affiche dedans
      const circlePhoto = localStorage.getItem("circlePhoto");
      if (!circlePhoto) {
        miniAvatarImg.src = avatarURL;
      }
    }
    // fermer modal RPM
    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
    rpmFrame.src = "";
  }

  // abonnement quand le frame est prêt
  if (data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(
      JSON.stringify({
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported"
      }),
      "*"
    );
  }
});

// ferme RPM clic hors iframe
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) {
    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
    rpmFrame.src = "";
  }
});

// ---------- Danse (effet visuel rapide) ----------
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 1.8s ease";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => {
    avatar3D.style.transform = "";
  }, 1800);
});

// ---------- MINI CIRCLE DRAGGABLE (mobile + desktop) ----------
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  dragging = true;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const rect = miniCircle.getBoundingClientRect();
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;

  if (e.touches) e.preventDefault();
}

function onDrag(e) {
  if (!dragging) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = clientX - offsetX;
  const y = clientY - offsetY;

  const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
  const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
  miniCircle.style.left = Math.max(8, Math.min(maxX, x)) + "px";
  miniCircle.style.top = Math.max(8, Math.min(maxY, y)) + "px";
}

function endDrag() {
  dragging = false;
}

miniCircle.addEventListener("mousedown", startDrag);
miniCircle.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("mousemove", onDrag);
document.addEventListener("touchmove", onDrag, { passive: false });
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// ---------------------
//   AVATAR ANIMAL 3D
// ---------------------

const createAnimal = document.getElementById("createAnimal");
const animalModal = document.getElementById("animalModal");
const animalFrame = document.getElementById("animalFrame");

// ouvrir créateur animal (iframe externe si tu veux)
createAnimal.addEventListener("click", () => {
  animalModal.style.display = "flex";
  animalFrame.src = "https://animal-avatar.styled3d.app/?frameApi";
  editMenu.style.display = "none";
});

// écoute messages de l'iframe animal creator
window.addEventListener("message", (event) => {
  if (!event.data) return;
  try {
    const msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
    if (msg?.source === "animalcreator" && msg?.event === "avatar-ready") {
      const url = msg.url;
      // affiche dans animal viewer (sépare de l'humain)
      const animalViewer = document.getElementById("animal3D");
      if (animalViewer && url) {
        animalViewer.src = url;
        localStorage.setItem("animalURL", url);
      }
      animalModal.style.display = "none";
    }
  } catch (e) {
    // ignore
  }
});

// ferme animal modal si clic en dehors
animalModal.addEventListener("click", (e) => {
  if (e.target === animalModal) animalModal.style.display = "none";
});

//////////////////////////////////////////
// === END: Ton code original (conservé)
//////////////////////////////////////////

/* ============================
   START: Fusion engine (three.js)
   - charge humain (.glb) + animal (.glb)
   - positionne, scale, rotate
   - exporte GLB fusionné AND upload to Firebase Storage
   ============================ */

const fusionModal = document.getElementById("fusionModal");
const fusionViewport = document.getElementById("fusionViewport");
const fusionClose = document.getElementById("fusionClose");
const fusionPanel = document.getElementById("fusionPanel");

const useCurrentHuman = document.getElementById("useCurrentHuman");
const animalUrlInput = document.getElementById("animalUrlInput");
const loadAnimalUrl = document.getElementById("loadAnimalUrl");
const animalFileInput = document.getElementById("animalFileInput");

const posX = document.getElementById("posX");
const posY = document.getElementById("posY");
const posZ = document.getElementById("posZ");
const rotY = document.getElementById("rotY");
const scaleAnimal = document.getElementById("scaleAnimal");

const exportMerged = document.getElementById("exportMerged");
const closeFusion = document.getElementById("closeFusion");

// Three.js core objects
let renderer, scene, camera, controls;
let humanRoot = null;
let animalRoot = null;
const loader = new GLTFLoader();
const exporter = new GLTFExporter();

function initFusionScene() {
  // only init once
  if (renderer) return;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(fusionViewport.clientWidth, fusionViewport.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  fusionViewport.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, fusionViewport.clientWidth / fusionViewport.clientHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.2, 0);
  controls.update();

  // lighting
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0);
  dir.position.set(5, 10, 7);
  scene.add(dir);

  window.addEventListener("resize", onFusionResize);
  animateFusion();
}

function onFusionResize() {
  if (!renderer) return;
  renderer.setSize(fusionViewport.clientWidth, fusionViewport.clientHeight);
  camera.aspect = fusionViewport.clientWidth / fusionViewport.clientHeight;
  camera.updateProjectionMatrix();
}

function animateFusion() {
  requestAnimationFrame(animateFusion);
  if (humanRoot) humanRoot.rotation.y += 0.001;
  if (animalRoot) animalRoot.rotation.y += 0.001;
  renderer.render(scene, camera);
}

// helper: clear current scene
function clearFusionScene() {
  if (!scene) return;
  // dispose objects
  if (humanRoot) { scene.remove(humanRoot); humanRoot.traverse(disposeNode); humanRoot = null; }
  if (animalRoot) { scene.remove(animalRoot); animalRoot.traverse(disposeNode); animalRoot = null; }
}

function disposeNode(node) {
  if (node.geometry) { node.geometry.dispose(); }
  if (node.material) {
    if (Array.isArray(node.material)) node.material.forEach(m => m.dispose && m.dispose());
    else node.material.dispose && node.material.dispose();
  }
}

// load GLB from URL
async function loadGLBFromUrl(url) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (g) => resolve(g.scene.clone()),
      undefined,
      (err) => reject(err)
    );
  });
}

// load GLB from file (File object)
async function loadGLBFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      loader.parse(arrayBuffer, '', (g) => {
        resolve(g.scene.clone());
      }, (err) => reject(err));
    };
    reader.readAsArrayBuffer(file);
  });
}

// position/scale helpers
function applyAnimalTransform() {
  if (!animalRoot) return;
  animalRoot.position.set(parseFloat(posX.value), parseFloat(posY.value), parseFloat(posZ.value));
  animalRoot.rotation.set(0, THREE.MathUtils.degToRad(parseFloat(rotY.value)), 0);
  animalRoot.scale.setScalar(parseFloat(scaleAnimal.value));
}

// load human from saved avatarURL (localStorage)
async function loadHumanFromSaved() {
  const humanUrl = localStorage.getItem("avatarURL");
  if (!humanUrl) {
    alert("Aucun avatar humain sauvegardé trouvé. Crée un avatar humain d'abord.");
    return;
  }
  try {
    if (!scene) initFusionScene();
    if (humanRoot) { scene.remove(humanRoot); humanRoot = null; }
    const s = await loadGLBFromUrl(humanUrl);
    humanRoot = s;
    // normalize human scale/position
    humanRoot.position.set(0, 0, 0);
    humanRoot.scale.setScalar(1.0);
    scene.add(humanRoot);
    // ensure animal sits relative
    if (animalRoot) applyAnimalTransform();
  } catch (err) {
    console.error("Erreur chargement humain :", err);
    alert("Impossible de charger l'humain depuis l'URL sauvegardée.");
  }
}

// load animal from URL input
async function loadAnimalFromUrl() {
  const url = (animalUrlInput.value || '').trim();
  if (!url) { alert("Colle une URL .glb valide."); return; }
  try {
    if (!scene) initFusionScene();
    if (animalRoot) { scene.remove(animalRoot); animalRoot = null; }
    const s = await loadGLBFromUrl(url);
    animalRoot = s;
    scene.add(animalRoot);
    applyAnimalTransform();
    // save last animal URL for quick access
    localStorage.setItem("animalURL_temp", url);
  } catch (err) {
    console.error("Erreur chargement animal URL :", err);
    alert("Impossible de charger l'animal depuis l'URL.");
  }
}

// load animal from local file input
async function loadAnimalFromFile(file) {
  try {
    if (!scene) initFusionScene();
    if (animalRoot) { scene.remove(animalRoot); animalRoot = null; }
    const s = await loadGLBFromFile(file);
    animalRoot = s;
    scene.add(animalRoot);
    applyAnimalTransform();
  } catch (err) {
    console.error("Erreur chargement animal fichier :", err);
    alert("Impossible de charger l'animal depuis le fichier.");
  }
}

// ------------------------------
// EXPORT MERGED GLB -> now uploads to Firebase
// ------------------------------
async function exportMergedGLB() {
  if (!scene) { alert("Rien à exporter."); return; }
  // create a temporary Group with clones to avoid side effects
  const exportScene = new THREE.Scene();
  if (humanRoot) exportScene.add(humanRoot.clone(true));
  if (animalRoot) exportScene.add(animalRoot.clone(true));

  // exporter.parse supports callback for binary
  exporter.parse(exportScene, async (result) => {
    let arrayBuffer;
    if (result instanceof ArrayBuffer) {
      arrayBuffer = result;
    } else {
      // JSON glTF -> convert to ArrayBuffer
      const str = JSON.stringify(result);
      arrayBuffer = new TextEncoder().encode(str).buffer;
    }

    // create blob
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });

    // --- Upload to Firebase Storage ---
    try {
      // create a filename: userId if available, else 'anon'
      const userId = localStorage.getItem("userId") || 'anon';
      const filename = `avatars/merged_${userId}_${Date.now()}.glb`;
      const ref = storageRef(storage, filename);

      // uploadBytes expects ArrayBuffer or Uint8Array/Blob
      await uploadBytes(ref, blob);
      const downloadUrl = await getDownloadURL(ref);

      // Save metadata in Firestore (optional)
      try {
        const metaDoc = doc(firestore, 'users', userId);
        await setDoc(metaDoc, { avatarURL: downloadUrl, mergedAt: new Date().toISOString() }, { merge: true });
      } catch (e) {
        console.warn("Impossible d'écrire metadata Firestore :", e);
      }

      // apply in-app & localStorage
      try {
        localStorage.setItem("avatarURL", downloadUrl);
        localStorage.setItem("mergedAvatarURL", downloadUrl);
        avatar3D.src = downloadUrl;
      } catch (e) {
        console.warn("Impossible de stocker avatarURL localStorage:", e);
      }

      // optionally set animal viewer saved URL
      const animalSaved = localStorage.getItem("animalURL") || localStorage.getItem("animalURL_temp");
      if (animalSaved) {
        const animalViewer = document.getElementById("animal3D");
        if (animalViewer) animalViewer.src = animalSaved;
      }

      alert("Export & upload réussis — avatar appliqué automatiquement.");
    } catch (err) {
      console.error("Erreur upload Firebase :", err);
      alert("Erreur lors de l'upload sur Firebase. Vérifie console.");
      // Fallback: trigger download locally
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_${Date.now()}.glb`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }
  }, { binary: true });
}

// wire UI
useCurrentHuman.addEventListener("click", loadHumanFromSaved);
loadAnimalUrl.addEventListener("click", loadAnimalFromUrl);
animalFileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) loadAnimalFromFile(f);
});

[posX, posY, posZ, rotY, scaleAnimal].forEach((el) => {
  el.addEventListener("input", applyAnimalTransform);
});

exportMerged.addEventListener("click", exportMergedGLB);

closeFusion.addEventListener("click", () => {
  fusionModal.style.display = "none";
});

// show fusion editor when double-click mini-circle or add a button: I'll add an easy trigger:
const avatarContainer = document.querySelector(".avatar-container-large");
if (avatarContainer) {
  avatarContainer.addEventListener("dblclick", () => {
    fusionModal.style.display = "flex";
    initFusionScene();
    const animalSaved = localStorage.getItem("animalURL") || localStorage.getItem("animalURL_temp");
    if (animalSaved) animalUrlInput.value = animalSaved;
  });
}

// clicking fusionClose icon should also close
if (fusionClose) fusionClose.addEventListener("click", () => { fusionModal.style.display = "none"; });

// ensure fusionModal fits viewport on open
window.addEventListener("resize", onFusionResize);

// small safety: if avatar3D fails to load, clear broken src
if (avatar3D) {
  avatar3D.addEventListener("error", () => {
    console.warn("avatar3D load error — resetting to default (no visual change).");
    try { avatar3D.src = ""; } catch (e) {}
  });
}
