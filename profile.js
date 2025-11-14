// profile.js — version robuste, restaure mini-circle/avatar par défaut, garde RPM, animal creator, fusion + upload Firebase
// NOTE: fichier conçu pour être utilisé avec <script type="module" src="profile.js"></script>

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
// CONFIG FIREBASE (REMPLACE PAR LES TIENNES si besoin)
// --------------------------
const firebaseConfig = {
  apiKey: "AIzaSyCVl5ktUmuiVeMtYUHtxORytkeu71_XBF0",
  authDomain: "changefamilysnap.firebaseapp.com",
  projectId: "changefamilysnap",
  storageBucket: "changefamilysnap.appspot.com", // <-- corrigé
  messagingSenderId: "335835110495",
  appId: "1:335835110495:web:13194c4bd4579d4f434fea"
};
let firebaseApp, storage, firestore;
try {
  firebaseApp = initializeApp(firebaseConfig);
  storage = getStorage(firebaseApp);
  firestore = getFirestore(firebaseApp);
  console.log("[profile] Firebase initialisé");
} catch (e) {
  console.warn("[profile] Firebase non initialisé (dev ou erreur) :", e);
}

// --------------------------
// Helper: safe DOM getter
// --------------------------
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`[profile] élément introuvable #${id}`);
  return el;
}

// éléments DOM (safe)
const avatar3D = $("avatar3D");
const pseudoDisplay = $("pseudoDisplay");
const editBtn = $("editBtn");
const editMenu = $("editMenu");
const uploadPhoto = $("uploadPhoto");
const uploadBtn = $("uploadBtn");
const takePhoto = $("takePhoto");
const createAvatar = $("createAvatar");
const rpmModal = $("rpmModal");
const rpmFrame = $("rpmFrame");
const danceBtn = $("danceBtn");

const miniCircle = $("miniCircle");
const miniAvatarImg = $("miniAvatarImg");

const createAnimal = $("createAnimal");
const animalModal = $("animalModal");
const animalFrame = $("animalFrame");

// Fusion editor elements (safe)
const fusionModal = $("fusionModal");
const fusionViewport = $("fusionViewport");
const fusionClose = $("fusionClose");
const fusionPanel = $("fusionPanel");

const useCurrentHuman = $("useCurrentHuman");
const animalUrlInput = $("animalUrlInput");
const loadAnimalUrl = $("loadAnimalUrl");
const animalFileInput = $("animalFileInput");

const posX = $("posX");
const posY = $("posY");
const posZ = $("posZ");
const rotY = $("rotY");
const scaleAnimal = $("scaleAnimal");

const exportMerged = $("exportMerged");
const closeFusion = $("closeFusion");

// --------------------------
// Defaults & safety
// --------------------------
const DEFAULT_MINI = "default.jpg"; // image fallback pour mini-circle
const DEFAULT_GLTF_PLACEHOLDER = ""; // si tu as un .glb placeholder, mets le chemin ici

// --------------------------
// START: Comportements d'origine (robustes)
// --------------------------

window.addEventListener("DOMContentLoaded", () => {
  console.log("[profile] DOMContentLoaded — initialisation");

  // pseudo
  try {
    const pseudo = localStorage.getItem("pseudo");
    if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;
  } catch (e) { console.warn("[profile] impossible récupérer pseudo :", e); }

  // mini-circle
  try {
    const circlePhoto = localStorage.getItem("circlePhoto");
    const avatarURL = localStorage.getItem("avatarURL");
    if (miniAvatarImg) {
      if (circlePhoto) miniAvatarImg.src = circlePhoto;
      else if (avatarURL) miniAvatarImg.src = avatarURL;
      else miniAvatarImg.src = DEFAULT_MINI;
    }
  } catch (e) { console.warn("[profile] mini-circle init error:", e); }

  // avatar3D
  try {
    const avatarURL = localStorage.getItem("avatarURL");
    if (avatar3D) {
      if (avatarURL) avatar3D.src = avatarURL;
      else if (DEFAULT_GLTF_PLACEHOLDER) avatar3D.src = DEFAULT_GLTF_PLACEHOLDER;
      else avatar3D.removeAttribute("src"); // keep empty
    }
  } catch (e) { console.warn("[profile] avatar3D init error:", e); }

  // animal3D if present
  try {
    const animalURL = localStorage.getItem("animalURL");
    const animalViewer = $("animal3D");
    if (animalViewer) {
      if (animalURL) animalViewer.src = animalURL;
    }
  } catch (e) { console.warn("[profile] animal3D init error:", e); }
});

// Toggle edit menu
if (editBtn && editMenu) {
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const visible = editMenu.style.display === "flex";
    editMenu.style.display = visible ? "none" : "flex";
    editMenu.setAttribute("aria-hidden", visible ? "true" : "false");
  });
} else {
  console.warn("[profile] editBtn ou editMenu manquant -> menu modifier désactivé");
}

// Close menu clicking outside
document.addEventListener("click", (e) => {
  if (editMenu && editMenu.style.display === "flex") {
    if (!editMenu.contains(e.target) && e.target !== editBtn) {
      editMenu.style.display = "none";
      editMenu.setAttribute("aria-hidden", "true");
    }
  }
});

// Upload photo (mini-circle)
if (uploadBtn && uploadPhoto) {
  uploadBtn.addEventListener("click", () => {
    uploadPhoto.click();
    if (editMenu) editMenu.style.display = "none";
  });

  uploadPhoto.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setMiniAvatar(file);
  });
} else {
  console.warn("[profile] uploadBtn/uploadPhoto manquant -> upload désactivé");
}

// Take photo
if (takePhoto) {
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
    if (editMenu) editMenu.style.display = "none";
  });
}

// set mini avatar helper
function setMiniAvatar(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    if (miniAvatarImg) miniAvatarImg.src = dataUrl;
    try { localStorage.setItem("circlePhoto", dataUrl); } catch (e) { console.warn(e); }
  };
  reader.readAsDataURL(file);
}

// Ready Player Me open
if (createAvatar && rpmModal && rpmFrame) {
  createAvatar.addEventListener("click", () => {
    rpmModal.style.display = "flex";
    rpmModal.setAttribute("aria-hidden", "false");
    rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
    if (editMenu) editMenu.style.display = "none";
  });
}

// RPM message handler (robuste)
window.addEventListener("message", (event) => {
  if (!event.data) return;
  let data;
  try { data = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { data = event.data; }

  // support different RPM formats
  try {
    if (data?.eventName === "v1.avatar.exported" || data?.name === "avatar-exported") {
      const avatarURL = data.url || data.data?.url || data?.data;
      if (avatarURL && avatar3D) {
        avatar3D.src = avatarURL;
        try { localStorage.setItem("avatarURL", avatarURL); } catch (e) {}
        const circlePhoto = localStorage.getItem("circlePhoto");
        if (!circlePhoto && miniAvatarImg) miniAvatarImg.src = avatarURL;
      }
      if (rpmModal) { rpmModal.style.display = "none"; rpmModal.setAttribute("aria-hidden", "true"); }
      // don't clear src to avoid reload loops (only clear if intentionally needed)
    }
  } catch (e) { console.warn("[profile] erreur traitement message RPM:", e); }

  // subscribe when frame ready
  try {
    const isReady = data?.eventName === "v1.frame.ready" || data?.name === "frame-ready" || (typeof event.data === "string" && event.data.includes("v1.frame.ready"));
    if (isReady && rpmFrame && rpmFrame.contentWindow) {
      try {
        rpmFrame.contentWindow.postMessage(JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.avatar.exported" }), "*");
        console.log("[profile] subscribe envoyé au frame RPM");
      } catch (e) { console.warn("[profile] impossible d'envoyer subscribe:", e); }
    }
  } catch (e) { /* ignore */ }
});

// close rpm modal on outside click
if (rpmModal) {
  rpmModal.addEventListener("click", (e) => {
    if (e.target === rpmModal) {
      rpmModal.style.display = "none";
      rpmModal.setAttribute("aria-hidden", "true");
      try { rpmFrame.src = ""; } catch (e) {}
    }
  });
}

// dance button
if (danceBtn && avatar3D) {
  danceBtn.addEventListener("click", () => {
    try {
      avatar3D.style.transition = "transform 1.8s ease";
      avatar3D.style.transform = "rotateY(720deg)";
      setTimeout(() => { avatar3D.style.transform = ""; }, 1800);
    } catch (e) { console.warn(e); }
  });
}

// draggable mini-circle
(function initDrag() {
  if (!miniCircle) return;
  let dragging = false, offsetX = 0, offsetY = 0;

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
    const x = clientX - offsetX, y = clientY - offsetY;
    const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
    const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
    miniCircle.style.left = Math.max(8, Math.min(maxX, x)) + "px";
    miniCircle.style.top = Math.max(8, Math.min(maxY, y)) + "px";
  }
  function endDrag() { dragging = false; }

  miniCircle.addEventListener("mousedown", startDrag);
  miniCircle.addEventListener("touchstart", startDrag, { passive: false });
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
})();

// --------------------------
// ANIMAL CREATOR (iframe) handler
// --------------------------
if (createAnimal && animalModal && animalFrame) {
  createAnimal.addEventListener("click", () => {
    animalModal.style.display = "flex";
    animalFrame.src = "https://animal-avatar.styled3d.app/?frameApi";
    if (editMenu) editMenu.style.display = "none";
  });

  animalModal.addEventListener("click", (e) => {
    if (e.target === animalModal) animalModal.style.display = "none";
  });

  window.addEventListener("message", (event) => {
    if (!event.data) return;
    let msg;
    try { msg = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { msg = event.data; }
    try {
      if (msg?.source === "animalcreator" && msg?.event === "avatar-ready" && msg.url) {
        const url = msg.url;
        const animalViewer = $("animal3D");
        if (animalViewer) {
          animalViewer.src = url;
          try { localStorage.setItem("animalURL", url); } catch (e) {}
        }
        animalModal.style.display = "none";
      }
    } catch (e) { /* ignore */ }
  });
}

// --------------------------
// FUSION ENGINE (three.js) guarded
// --------------------------

// Only initialize fusion UI if fusionModal and viewport exist
if (fusionModal && fusionViewport && exportMerged) {
  // Three.js core objects
  let renderer, scene, camera, controls;
  let humanRoot = null;
  let animalRoot = null;
  const loader = new GLTFLoader();
  const exporter = new GLTFExporter();

  function initFusionScene() {
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

  function disposeNode(node) {
    if (node.geometry) node.geometry.dispose();
    if (node.material) {
      if (Array.isArray(node.material)) node.material.forEach(m => m.dispose && m.dispose());
      else node.material.dispose && node.material.dispose();
    }
  }

  function clearFusionScene() {
    if (!scene) return;
    if (humanRoot) { scene.remove(humanRoot); humanRoot.traverse(disposeNode); humanRoot = null; }
    if (animalRoot) { scene.remove(animalRoot); animalRoot.traverse(disposeNode); animalRoot = null; }
  }

  async function loadGLBFromUrl(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, (g) => resolve(g.scene.clone()), undefined, (err) => reject(err));
    });
  }

  async function loadGLBFromFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result;
        loader.parse(arrayBuffer, '', (g) => resolve(g.scene.clone()), (err) => reject(err));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  function applyAnimalTransform() {
    if (!animalRoot) return;
    animalRoot.position.set(parseFloat(posX?.value || 0), parseFloat(posY?.value || 0), parseFloat(posZ?.value || 0));
    animalRoot.rotation.set(0, THREE.MathUtils.degToRad(parseFloat(rotY?.value || 0)), 0);
    animalRoot.scale.setScalar(parseFloat(scaleAnimal?.value || 1));
  }

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
      humanRoot.position.set(0, 0, 0);
      humanRoot.scale.setScalar(1.0);
      scene.add(humanRoot);
      if (animalRoot) applyAnimalTransform();
    } catch (err) {
      console.error("Erreur chargement humain :", err);
      alert("Impossible de charger l'humain depuis l'URL sauvegardée.");
    }
  }

  async function loadAnimalFromUrl() {
    const url = (animalUrlInput?.value || '').trim();
    if (!url) { alert("Colle une URL .glb valide."); return; }
    try {
      if (!scene) initFusionScene();
      if (animalRoot) { scene.remove(animalRoot); animalRoot = null; }
      const s = await loadGLBFromUrl(url);
      animalRoot = s;
      scene.add(animalRoot);
      applyAnimalTransform();
      localStorage.setItem("animalURL_temp", url);
    } catch (err) {
      console.error("Erreur chargement animal URL :", err);
      alert("Impossible de charger l'animal depuis l'URL.");
    }
  }

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

  // EXPORT + UPLOAD
  async function exportMergedGLB() {
    if (!scene) { alert("Rien à exporter."); return; }
    const exportScene = new THREE.Scene();
    if (humanRoot) exportScene.add(humanRoot.clone(true));
    if (animalRoot) exportScene.add(animalRoot.clone(true));

    exporter.parse(exportScene, async (result) => {
      let arrayBuffer;
      if (result instanceof ArrayBuffer) arrayBuffer = result;
      else { const str = JSON.stringify(result); arrayBuffer = new TextEncoder().encode(str).buffer; }
      const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });

      // upload to firebase if available
      if (storage) {
        try {
          const userId = localStorage.getItem("userId") || 'anon';
          const filename = `avatars/merged_${userId}_${Date.now()}.glb`;
          const ref = storageRef(storage, filename);
          await uploadBytes(ref, blob);
          const downloadUrl = await getDownloadURL(ref);

          try {
            const metaDoc = doc(firestore, 'users', userId);
            await setDoc(metaDoc, { avatarURL: downloadUrl, mergedAt: new Date().toISOString() }, { merge: true });
          } catch (e) { console.warn("Impossible d'écrire metadata Firestore :", e); }

          try {
            localStorage.setItem("avatarURL", downloadUrl);
            localStorage.setItem("mergedAvatarURL", downloadUrl);
            if (avatar3D) avatar3D.src = downloadUrl;
            alert("Export & upload réussis — avatar appliqué automatiquement.");
          } catch (e) { console.warn("Erreur stockage local :", e); }

        } catch (err) {
          console.error("Erreur upload Firebase :", err);
          alert("Erreur lors de l'upload sur Firebase. Voir console. Un téléchargement local va démarrer en secours.");
          // fallback download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `merged_${Date.now()}.glb`;
          document.body.appendChild(link);
          link.click();
          link.remove();
          URL.revokeObjectURL(url);
        }
      } else {
        // no firebase - just download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `merged_${Date.now()}.glb`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        alert("Export terminé (pas d'upload Firebase configuré).");
      }
    }, { binary: true });
  }

  // wire UI if present
  if (useCurrentHuman) useCurrentHuman.addEventListener("click", loadHumanFromSaved);
  if (loadAnimalUrl) loadAnimalUrl.addEventListener("click", loadAnimalFromUrl);
  if (animalFileInput) animalFileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) loadAnimalFromFile(f);
  });

  [posX, posY, posZ, rotY, scaleAnimal].forEach((el) => {
    if (el) el.addEventListener("input", applyAnimalTransform);
  });

  if (exportMerged) exportMerged.addEventListener("click", exportMergedGLB);
  if (closeFusion) closeFusion.addEventListener("click", () => { fusionModal.style.display = "none"; });

  // open fusion on double click of avatar area
  const avatarContainer = document.querySelector(".avatar-container-large");
  if (avatarContainer) {
    avatarContainer.addEventListener("dblclick", () => {
      fusionModal.style.display = "flex";
      initFusionScene();
      const animalSaved = localStorage.getItem("animalURL") || localStorage.getItem("animalURL_temp");
      if (animalSaved && animalUrlInput) animalUrlInput.value = animalSaved;
    });
  }

  if (fusionClose) fusionClose.addEventListener("click", () => { fusionModal.style.display = "none"; });
  window.addEventListener("resize", onFusionResize);
} else {
  console.log("[profile] Fusion UI manquante -> fusion désactivée (éléments DOM non trouvés)");
}

// safety: if avatar3D fails to load, reset to default mini image and clear src
if (avatar3D) {
  avatar3D.addEventListener("error", () => {
    console.warn("[profile] avatar3D load error — clear src and show default mini");
    try {
      avatar3D.removeAttribute("src");
    } catch (e) {}
    if (miniAvatarImg) miniAvatarImg.src = DEFAULT_MINI;
  });
}

console.log("[profile] script initialisation terminé");
