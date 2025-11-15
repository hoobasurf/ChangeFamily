// profile.js — version complète restaurée + fixes
// - garde tout (RPM, mini-circle, animal creator, fusion three.js, presets, firebase upload optionally)
// - attach-controls hidden by default (toggle via menu)
// - safe DOM getters to avoid crashes

// ---------- Optional imports for Three.js and Firebase (only used if needed) ----------
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'https://unpkg.com/three@0.152.2/examples/jsm/exporters/GLTFExporter.js';

// Firebase modular SDK (optional - used if firebaseConfig provided)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// --------------------------
// FIREBASE CONFIG (OPTIONAL)
// If you want upload, replace values below; otherwise leave empty to skip uploads.
const firebaseConfig = {
  // Example: replace or leave empty
  // apiKey: "YOUR_API_KEY",
  // authDomain: "your-app.firebaseapp.com",
  // projectId: "your-app",
  // storageBucket: "your-app.appspot.com",
  // messagingSenderId: "...",
  // appId: "..."
};

let firebaseApp, storage, firestore;
try {
  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = initializeApp(firebaseConfig);
    storage = getStorage(firebaseApp);
    firestore = getFirestore(firebaseApp);
    console.log("[profile] Firebase initialized");
  } else {
    console.log("[profile] Firebase not configured — uploads disabled");
  }
} catch (e) {
  console.warn("[profile] Firebase init error:", e);
}

// --------------------------
// Helper - safe DOM getter
// --------------------------
const $ = (id) => {
  const el = document.getElementById(id);
  if (!el) {
    // console.debug(`[profile] missing element #${id}`);
  }
  return el;
};

// --------------------------
// DOM Elements (safe)
// --------------------------
const avatar3D = $("avatar3D");
const animal3D = $("animal3D"); // may be null if not in HTML
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
const openFusionBtn = $("openFusionBtn");

// Fusion elements (may be missing)
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
const savePreset = $("savePreset");
const presetList = $("presetList");

// Attach controls (floating)
const attachControls = $("attachControls"); // the floating panel
const a_posX = $("a_posX");
const a_posY = $("a_posY");
const a_posZ = $("a_posZ");
const a_rotY = $("a_rotY");
const a_scale = $("a_scale");
const applyAttach = $("applyAttach");
const resetAttach = $("resetAttach");

// --------------------------
// Defaults
// --------------------------
const DEFAULT_MINI = "default.jpg";
const DEFAULT_ANIMAL = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";

// Hide attach-controls by default so it doesn't block your view
try { if (attachControls) attachControls.style.display = "none"; } catch (e) {}

// --------------------------
// Load initial state (avatar, mini circle, animal viewer)
// --------------------------
window.addEventListener("DOMContentLoaded", () => {
  // pseudo
  try {
    const pseudo = localStorage.getItem("pseudo");
    if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;
  } catch (e) { console.warn("[profile] Read pseudo failed", e); }

  // mini circle image priority: circlePhoto -> avatarURL -> default
  try {
    const circlePhoto = localStorage.getItem("circlePhoto");
    const avatarURL = localStorage.getItem("avatarURL");
    if (miniAvatarImg) {
      if (circlePhoto) miniAvatarImg.src = circlePhoto;
      else if (avatarURL) miniAvatarImg.src = avatarURL;
      else miniAvatarImg.src = DEFAULT_MINI;
    }
    if (avatar3D) {
      if (avatarURL) avatar3D.src = avatarURL;
      else avatar3D.removeAttribute && avatar3D.removeAttribute("src");
    }

    // animal viewer
    const animalURL = localStorage.getItem("animalURL");
    if (animal3D) {
      if (animalURL) animal3D.src = animalURL;
      else { animal3D.src = DEFAULT_ANIMAL; try { localStorage.setItem("animalURL", DEFAULT_ANIMAL); } catch (e){} }
    }
  } catch (e) { console.warn("[profile] initial load error", e); }
});

// --------------------------
// Edit menu toggle & outside click
// --------------------------
if (editBtn && editMenu) {
  editBtn.setAttribute("aria-haspopup", "true");
  editBtn.setAttribute("aria-expanded", "false");
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const shown = editMenu.style.display === "flex";
    editMenu.style.display = shown ? "none" : "flex";
    editBtn.setAttribute("aria-expanded", String(!shown));
  });

  // safe add a "Afficher attache" button if attachControls exists
  try {
    if (attachControls) {
      const menuCircle = editMenu.querySelector(".menu-circle");
      if (menuCircle && !menuCircle.querySelector("#toggleAttachBtn")) {
        const btn = document.createElement("button");
        btn.id = "toggleAttachBtn";
        btn.className = "menu-btn";
        btn.textContent = "Afficher attache";
        btn.addEventListener("click", () => {
          attachControls.style.display = attachControls.style.display === "none" ? "block" : "none";
          // close edit menu
          editMenu.style.display = "none";
        });
        menuCircle.appendChild(btn);
      }
    }
  } catch (e) {}

  document.addEventListener("click", (ev) => {
    if (editMenu.style.display === "flex") {
      if (!editMenu.contains(ev.target) && ev.target !== editBtn) {
        editMenu.style.display = "none";
        editBtn.setAttribute("aria-expanded", "false");
      }
    }
  });
}

// --------------------------
// Upload photo -> mini circle
// --------------------------
if (uploadBtn && uploadPhoto) {
  uploadBtn.addEventListener("click", () => {
    uploadPhoto.click();
    if (editMenu) editMenu.style.display = "none";
  });
  uploadPhoto.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
        localStorage.setItem("circlePhoto", ev.target.result);
      } catch (err) { console.warn(err); }
    };
    reader.readAsDataURL(file);
  });
}

// --------------------------
// Take photo (mobile)
if (takePhoto) {
  takePhoto.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => {
        try {
          if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
          localStorage.setItem("circlePhoto", ev.target.result);
        } catch (err) {}
      };
      r.readAsDataURL(f);
    };
    input.click();
    if (editMenu) editMenu.style.display = "none";
  });
}

// --------------------------
// Ready Player Me integration
// --------------------------
if (createAvatar && rpmModal && rpmFrame) {
  createAvatar.addEventListener("click", () => {
    rpmModal.style.display = "flex";
    rpmModal.setAttribute("aria-hidden", "false");
    rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
    if (editMenu) editMenu.style.display = "none";
  });
}

// RPM message handler (robust)
window.addEventListener("message", (event) => {
  if (!event.data) return;
  let data = event.data;
  try { data = (typeof event.data === "string") ? JSON.parse(event.data) : event.data; } catch (e) { data = event.data; }

  // Ready Player Me exported avatar
  try {
    if (data?.eventName === "v1.avatar.exported" || data?.name === "avatar-exported") {
      const avatarURL = data.data?.url || data.url || data.avatarUrl || data?.data;
      if (avatarURL && avatar3D) {
        avatar3D.src = avatarURL;
        try { localStorage.setItem("avatarURL", avatarURL); } catch (e) {}
        const circle = localStorage.getItem("circlePhoto");
        if (!circle && miniAvatarImg) miniAvatarImg.src = avatarURL;
      }
      if (rpmModal) { rpmModal.style.display = "none"; rpmModal.setAttribute("aria-hidden", "true"); rpmFrame.src = ""; }
      return;
    }
  } catch (e) {}

  // subscribe when frame ready
  try {
    const isReady = data?.eventName === "v1.frame.ready" || data?.name === "frame-ready";
    if (isReady && rpmFrame && rpmFrame.contentWindow) {
      try {
        rpmFrame.contentWindow.postMessage(JSON.stringify({ target: "readyplayerme", type: "subscribe", eventName: "v1.avatar.exported" }), "*");
      } catch (e) { /* ignore */ }
    }
  } catch (e) {}

  // animal creator events (various producers)
  try {
    if (data?.source === "animalcreator" && (data?.event === "avatar-ready" || data?.name === "avatar-ready")) {
      const url = data.url || data.data?.url;
      if (url) {
        if (animal3D) animal3D.src = url;
        try { localStorage.setItem("animalURL", url); } catch (e) {}
      }
      if (animalModal) animalModal.style.display = "none";
      return;
    }
  } catch (e) {}
});

// close RPM & animal modals on background click safely
if (rpmModal) rpmModal.addEventListener("click", (e) => { if (e.target === rpmModal) { rpmModal.style.display = "none"; rpmFrame.src = ""; }});
if (animalModal) animalModal.addEventListener("click", (e) => { if (e.target === animalModal) animalModal.style.display = "none"; });

// dance button (visual)
if (danceBtn && avatar3D) {
  danceBtn.addEventListener("click", () => {
    try {
      avatar3D.style.transition = "transform 1.8s ease";
      avatar3D.style.transform = "rotateY(720deg)";
      setTimeout(() => { avatar3D.style.transform = ""; }, 1800);
    } catch (e) { console.warn(e); }
  });
}

// --------------------------
// mini-circle draggable
// --------------------------
(function initMiniDrag() {
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
    const x = clientX - offsetX;
    const y = clientY - offsetY;
    const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
    const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
    miniCircle.style.left = Math.max(8, Math.min(maxX, x)) + "px";
    miniCircle.style.top = Math.max(8, Math.min(maxY, y)) + "px";
  }
  function endDrag() { dragging = false; }
  miniCircle.addEventListener("mousedown", startDrag);
  miniCircle.addEventListener("touchstart", startDrag, { passive:false });
  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive:false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
})();

// --------------------------
// ANIMAL CREATOR open
// --------------------------
if (createAnimal && animalModal && animalFrame) {
  createAnimal.addEventListener("click", () => {
    animalModal.style.display = "flex";
    animalFrame.src = "https://animal-avatar.styled3d.app/?frameApi";
    if (editMenu) editMenu.style.display = "none";
  });
  animalModal.addEventListener("click", (e) => { if (e.target === animalModal) animalModal.style.display = "none"; });
}

// --------------------------
// ATTACH CONTROLS (floating) - apply visual transform to the .viewer-wrap of animal
// --------------------------
function applyAttachToAnimalViewer() {
  try {
    const ax = parseFloat(a_posX?.value || 0);
    const ay = parseFloat(a_posY?.value || 0);
    const az = parseFloat(a_posZ?.value || 0);
    const ar = parseFloat(a_rotY?.value || 0);
    const ascale = parseFloat(a_scale?.value || 1);

    const avWrap = animal3D?.closest(".viewer-wrap") || animal3D;
    const hvWrap = avatar3D?.closest(".viewer-wrap") || avatar3D;
    if (!avWrap || !hvWrap) return;

    const hvRect = hvWrap.getBoundingClientRect();
    const offsetXpx = (ax / 2) * hvRect.width;
    const offsetYpx = (-ay / 2) * hvRect.height;

    avWrap.style.position = "relative";
    avWrap.style.transform = `translate(${offsetXpx}px, ${offsetYpx}px) scale(${ascale})`;
    avWrap.style.transition = "transform 0.12s linear";
    if (animal3D) animal3D.style.transform = `rotateY(${ar}deg)`;
  } catch (e) { console.warn("applyAttach error", e); }
}
if (applyAttach) applyAttach.addEventListener("click", applyAttachToAnimalViewer);
if (resetAttach) resetAttach.addEventListener("click", () => {
  try {
    const avWrap = animal3D?.closest(".viewer-wrap") || animal3D;
    if (avWrap) avWrap.style.transform = "";
    if (animal3D) animal3D.style.transform = "";
    [a_posX, a_posY, a_posZ, a_rotY, a_scale].forEach(el => { if (el) el.value = el.defaultValue || 0; });
  } catch(e){}
});
[a_posX, a_posY, a_posZ, a_rotY, a_scale].forEach(el => { if (el) el.addEventListener && el.addEventListener("input", applyAttachToAnimalViewer); });

// --------------------------
// FUSION ENGINE (Three.js) - advanced accurate attach + export
// --------------------------
let renderer, scene, camera, controls;
let humanRoot = null, animalRoot = null;
const loader = new GLTFLoader();
const exporter = new GLTFExporter();

function initFusionScene() {
  if (renderer) return;
  if (!fusionViewport) return;
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(fusionViewport.clientWidth, fusionViewport.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  fusionViewport.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, fusionViewport.clientWidth/fusionViewport.clientHeight, 0.1, 1000);
  camera.position.set(0,1.6,3);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0,1.2,0);
  controls.update();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0); scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1.0); dir.position.set(5,10,7); scene.add(dir);

  window.addEventListener("resize", onFusionResize);
  animateFusion();
}

function onFusionResize() {
  if (!renderer) return;
  renderer.setSize(fusionViewport.clientWidth, fusionViewport.clientHeight);
  camera.aspect = fusionViewport.clientWidth/fusionViewport.clientHeight;
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
  return new Promise((resolve,reject) => {
    loader.load(url, g => resolve(g.scene.clone()), undefined, err => reject(err));
  });
}

async function loadGLBFromFile(file) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      loader.parse(reader.result, '', g => resolve(g.scene.clone()), err => reject(err));
    };
    reader.readAsArrayBuffer(file);
  });
}

function applyAnimalTransform3() {
  try {
    if (!animalRoot) return;
    const x = parseFloat(posX?.value || 0);
    const y = parseFloat(posY?.value || 0);
    const z = parseFloat(posZ?.value || 0);
    const ry = parseFloat(rotY?.value || 0);
    const sc = parseFloat(scaleAnimal?.value || 1);
    animalRoot.position.set(x,y,z);
    animalRoot.rotation.set(0, THREE.MathUtils.degToRad(ry), 0);
    animalRoot.scale.setScalar(sc);
  } catch(e){ console.warn(e); }
}

async function loadHumanFromSaved() {
  const humanUrl = localStorage.getItem("avatarURL");
  if (!humanUrl) { alert("Aucun avatar humain sauvegardé trouvé. Crée un avatar humain d'abord."); return; }
  if (!scene) initFusionScene();
  if (humanRoot) { scene.remove(humanRoot); humanRoot = null; }
  try {
    const s = await loadGLBFromUrl(humanUrl);
    humanRoot = s;
    humanRoot.position.set(0,0,0);
    humanRoot.scale.setScalar(1.0);
    scene.add(humanRoot);
    if (animalRoot) applyAnimalTransform3();
  } catch (err) { console.error("Erreur chargement humain :", err); alert("Impossible de charger l'humain."); }
}

async function loadAnimalFromUrl() {
  const url = (animalUrlInput?.value || '').trim();
  if (!url) { alert("Colle une URL .glb valide."); return; }
  if (!scene) initFusionScene();
  if (animalRoot) { scene.remove(animalRoot); animalRoot = null; }
  try {
    const s = await loadGLBFromUrl(url);
    animalRoot = s;
    scene.add(animalRoot);
    applyAnimalTransform3();
    localStorage.setItem("animalURL_temp", url);
  } catch (err) { console.error("Erreur chargement animal URL :", err); alert("Impossible de charger l'animal depuis l'URL."); }
}

async function loadAnimalFromFile(file) {
  if (!scene) initFusionScene();
  if (animalRoot) { scene.remove(animalRoot); animalRoot = null; }
  try {
    const s = await loadGLBFromFile(file);
    animalRoot = s;
    scene.add(animalRoot);
    applyAnimalTransform3();
  } catch (err) { console.error("Erreur chargement animal fichier :", err); alert("Impossible de charger l'animal depuis le fichier."); }
}

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
        try { localStorage.setItem("avatarURL", downloadUrl); localStorage.setItem("mergedAvatarURL", downloadUrl); if (avatar3D) avatar3D.src = downloadUrl; } catch(e){}
        alert("Export & upload réussis — avatar appliqué automatiquement.");
      } catch (err) {
        console.error("Erreur upload Firebase :", err);
        alert("Erreur lors de l'upload sur Firebase. Téléchargement local en secours.");
        const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `merged_${Date.now()}.glb`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      }
    } else {
      const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `merged_${Date.now()}.glb`; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
      alert("Export terminé (pas d'upload Firebase configuré).");
    }
  }, { binary: true });
}

// wire UI controls if present
if (useCurrentHuman) useCurrentHuman.addEventListener("click", loadHumanFromSaved);
if (loadAnimalUrl) loadAnimalUrl.addEventListener("click", loadAnimalFromUrl);
if (animalFileInput) animalFileInput.addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; if (f) loadAnimalFromFile(f); });
if (posX) posX.addEventListener("input", applyAnimalTransform3);
if (posY) posY.addEventListener("input", applyAnimalTransform3);
if (posZ) posZ.addEventListener("input", applyAnimalTransform3);
if (rotY) rotY.addEventListener("input", applyAnimalTransform3);
if (scaleAnimal) scaleAnimal.addEventListener("input", applyAnimalTransform3);
if (exportMerged) exportMerged.addEventListener("click", exportMergedGLB);
if (closeFusion) closeFusion.addEventListener("click", () => { if (fusionModal) fusionModal.style.display = "none"; });
if (fusionClose) fusionClose.addEventListener("click", () => { if (fusionModal) fusionModal.style.display = "none"; });

// Presets save/load
function refreshPresetList() {
  try {
    const list = JSON.parse(localStorage.getItem("attachPresets") || "[]");
    if (!presetList) return;
    presetList.innerHTML = "<option value=''>-- Presets --</option>";
    list.forEach((it, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = it.name;
      presetList.appendChild(opt);
    });
  } catch(e){}
}
if (savePreset && presetList) {
  savePreset.addEventListener("click", () => {
    const name = prompt("Nom du preset (ex: épaule droite):", "preset_" + Date.now());
    if (!name) return;
    const preset = {
      x: posX?.value || 0, y: posY?.value || 0, z: posZ?.value || 0,
      ry: rotY?.value || 0, s: scaleAnimal?.value || 1,
      animalUrl: animalUrlInput?.value || localStorage.getItem("animalURL_temp") || localStorage.getItem("animalURL") || DEFAULT_ANIMAL
    };
    const list = JSON.parse(localStorage.getItem("attachPresets") || "[]");
    list.push({ name, preset });
    localStorage.setItem("attachPresets", JSON.stringify(list));
    refreshPresetList();
  });
  presetList.addEventListener("change", () => {
    const idx = presetList.value;
    if (idx === "") return;
    const list = JSON.parse(localStorage.getItem("attachPresets") || "[]");
    const it = list[idx];
    if (!it) return;
    const p = it.preset;
    if (posX) posX.value = p.x;
    if (posY) posY.value = p.y;
    if (posZ) posZ.value = p.z;
    if (rotY) rotY.value = p.ry;
    if (scaleAnimal) scaleAnimal.value = p.s;
    if (animalUrlInput) animalUrlInput.value = p.animalUrl;
    loadAnimalFromUrl();
  });
  refreshPresetList();
}

// open fusion modal by button or double-click on avatar area
if (openFusionBtn && fusionModal) {
  openFusionBtn.addEventListener("click", () => {
    fusionModal.style.display = "flex";
    initFusionScene();
    const animalSaved = localStorage.getItem("animalURL") || DEFAULT_ANIMAL;
    if (animalUrlInput) animalUrlInput.value = animalSaved;
  });
}
const avatarContainer = document.querySelector(".avatar-container-large");
if (avatarContainer && fusionModal) {
  avatarContainer.addEventListener("dblclick", () => {
    fusionModal.style.display = "flex";
    initFusionScene();
    const animalSaved = localStorage.getItem("animalURL") || DEFAULT_ANIMAL;
    if (animalUrlInput) animalUrlInput.value = animalSaved;
  });
}

// animalFile selection also updates preview viewer when using local file
if (animalFileInput && animal3D) {
  animalFileInput.addEventListener("change", (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // show preview in animal3D via objectURL
    try {
      const url = URL.createObjectURL(f);
      animal3D.src = url;
      try { localStorage.setItem("animalURL", url); } catch(e){}
    } catch(e){}
  });
}

// safety: avatar3D error fallback
if (avatar3D) {
  avatar3D.addEventListener("error", () => {
    console.warn("[profile] avatar3D load error — clearing src");
    try { avatar3D.removeAttribute("src"); } catch(e){}
    if (miniAvatarImg) miniAvatarImg.src = DEFAULT_MINI;
  });
}

// final message
console.log("[profile] profile.js loaded — full feature set active (attach panel hidden by default)");
