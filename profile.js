// profile.js — side-by-side trainer + creature, changeable infinitely
import * as THREE from 'https://unpkg.com/three@0.152.2/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.152.2/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://unpkg.com/three@0.152.2/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'https://unpkg.com/three@0.152.2/examples/jsm/exporters/GLTFExporter.js';

// --- Optional Firebase imports if you configured upload — keep if you already have config
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-storage.js';
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// ---------- Put your firebaseConfig here if you want upload (or leave blank to skip upload) ----------
const firebaseConfig = {
  // paste your config or leave empty to disable upload
  // apiKey: "...",
  // authDomain: "...",
  // projectId: "...",
  // storageBucket: "...",
  // messagingSenderId: "...",
  // appId: "..."
};
let firebaseApp, storage, firestore;
try {
  if (firebaseConfig && firebaseConfig.projectId) {
    firebaseApp = initializeApp(firebaseConfig);
    storage = getStorage(firebaseApp);
    firestore = getFirestore(firebaseApp);
    console.log("[profile] Firebase ready");
  } else {
    console.log("[profile] Firebase not configured (uploads disabled)");
  }
} catch (e) {
  console.warn("[profile] Firebase init error:", e);
}

// safe DOM getter
const $ = id => document.getElementById(id);

// viewers + core elements
const avatar3D = $("avatar3D");
const animal3D = $("animal3D");
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

// fusion elements
const fusionModal = $("fusionModal");
const fusionViewport = $("fusionViewport");
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

// attach controls
const a_posX = $("a_posX");
const a_posY = $("a_posY");
const a_posZ = $("a_posZ");
const a_rotY = $("a_rotY");
const a_scale = $("a_scale");
const applyAttach = $("applyAttach");
const resetAttach = $("resetAttach");

// default animal url (fox sample)
const DEFAULT_ANIMAL = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";

// ------------------ init UI behaviors (original features preserved) ------------------
window.addEventListener("DOMContentLoaded", () => {
  // pseudo
  try {
    const pseudo = localStorage.getItem("pseudo");
    if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;
  } catch (e) {}

  // mini-circle
  try {
    const circlePhoto = localStorage.getItem("circlePhoto");
    const avatarURL = localStorage.getItem("avatarURL");
    if (miniAvatarImg) {
      if (circlePhoto) miniAvatarImg.src = circlePhoto;
      else if (avatarURL) miniAvatarImg.src = avatarURL;
      else miniAvatarImg.src = "default.jpg";
    }
    if (avatarURL && avatar3D) avatar3D.src = avatarURL;
  } catch (e) {}

  // animal viewer load saved or default
  try {
    const animalURL = localStorage.getItem("animalURL");
    if (animal3D) {
      if (animalURL) animal3D.src = animalURL;
      else { animal3D.src = DEFAULT_ANIMAL; localStorage.setItem("animalURL", DEFAULT_ANIMAL); }
    }
  } catch (e) {}

  // wire remaining if elements exist
  if (editBtn && editMenu) {
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const visible = editMenu.style.display === "flex";
      editMenu.style.display = visible ? "none" : "flex";
      editMenu.setAttribute("aria-hidden", visible ? "true" : "false");
    });
  }

  document.addEventListener("click", (e) => {
    if (editMenu && editMenu.style.display === "flex") {
      if (!editMenu.contains(e.target) && e.target !== editBtn) {
        editMenu.style.display = "none";
        editMenu.setAttribute("aria-hidden", "true");
      }
    }
  });

  if (uploadBtn && uploadPhoto) {
    uploadBtn.addEventListener("click", () => { uploadPhoto.click(); if (editMenu) editMenu.style.display = "none"; });
    uploadPhoto.addEventListener("change", (e) => { const f = e.target.files && e.target.files[0]; if (f) setMiniAvatar(f); });
  }

  if (takePhoto) {
    takePhoto.addEventListener("click", () => {
      const input = document.createElement("input"); input.type = "file"; input.accept = "image/*"; input.capture = "environment";
      input.onchange = (e) => { const f = e.target.files && e.target.files[0]; if (f) setMiniAvatar(f); };
      input.click(); if (editMenu) editMenu.style.display = "none";
    });
  }

  function setMiniAvatar(file) {
    const reader = new FileReader();
    reader.onload = (ev) => { if (miniAvatarImg) miniAvatarImg.src = ev.target.result; try { localStorage.setItem("circlePhoto", ev.target.result); } catch(e){} };
    reader.readAsDataURL(file);
  }

  if (createAvatar && rpmModal && rpmFrame) {
    createAvatar.addEventListener("click", () => {
      rpmModal.style.display = "flex";
      rpmModal.setAttribute("aria-hidden", "false");
      rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
      if (editMenu) editMenu.style.display = "none";
    });
  }

  window.addEventListener("message", (event) => {
    if (!event.data) return;
    let data;
    try { data = typeof event.data === "string" ? JSON.parse(event.data) : event.data; } catch (e) { data = event.data; }

    // Ready Player Me events
    try {
      if (data?.eventName === "v1.avatar.exported" || data?.name === "avatar-exported") {
        const avatarURL = data.data?.url || data.url || data?.avatarUrl || data?.url;
        if (avatarURL && avatar3D) {
          avatar3D.src = avatarURL;
          try { localStorage.setItem("avatarURL", avatarURL); } catch(e){}
          const circlePhoto = localStorage.getItem("circlePhoto");
          if (!circlePhoto && miniAvatarImg) miniAvatarImg.src = avatarURL;
        }
        if (rpmModal) { rpmModal.style.display = "none"; rpmModal.setAttribute("aria-hidden", "true"); rpmFrame.src = ""; }
      }
    } catch(e){}

    // animal creator messages
    try {
      if (data?.source === "animalcreator" && data?.event === "avatar-ready" && data?.url) {
        const url = data.url;
        if (animal3D) animal3D.src = url;
        try { localStorage.setItem("animalURL", url); } catch(e){}
        if (animalModal) animalModal.style.display = "none";
      }
    } catch(e){}
  });

  if (rpmModal) rpmModal.addEventListener("click", (e) => { if (e.target === rpmModal) { rpmModal.style.display = "none"; rpmModal.setAttribute("aria-hidden","true"); rpmFrame.src = ""; }});
  if (animalModal) animalModal.addEventListener("click", (e) => { if (e.target === animalModal) animalModal.style.display = "none"; });

  if (danceBtn && avatar3D) {
    danceBtn.addEventListener("click", () => {
      try {
        avatar3D.style.transition = "transform 1.8s ease";
        avatar3D.style.transform = "rotateY(720deg)";
        setTimeout(()=> avatar3D.style.transform = "", 1800);
      } catch(e) {}
    });
  }

  // open animal creator
  if (createAnimal && animalModal && animalFrame) {
    createAnimal.addEventListener("click", () => {
      animalModal.style.display = "flex";
      animalFrame.src = "https://animal-avatar.styled3d.app/?frameApi";
      if (editMenu) editMenu.style.display = "none";
    });
  }

  // open fusion by button (or doubleclick can also be added)
  if (openFusionBtn && fusionModal) {
    openFusionBtn.addEventListener("click", () => {
      fusionModal.style.display = "flex";
      initFusionScene();
      const animalSaved = localStorage.getItem("animalURL") || DEFAULT_ANIMAL;
      if (animalUrlInput) animalUrlInput.value = animalSaved;
    });
  }
});

// ------------------ Attach logic: position animal relative to human (applies to animal3D viewer) ------------------
function applyAttachToAnimalViewer() {
  // model-viewer doesn't support per-model transforms easily; so we emulate by pre-transforming the model URL via parameters only if using three.js fusion.
  // For quick visual: we use CSS transforms on the animal3D element to move it relative to avatar3D container.
  // This approach keeps your visuals and is cross-platform. For precise 3D attach use the Fusion editor (three.js).
  try {
    const ax = parseFloat(a_posX?.value || 0);
    const ay = parseFloat(a_posY?.value || 0);
    const az = parseFloat(a_posZ?.value || 0);
    const ar = parseFloat(a_rotY?.value || 0);
    const ascale = parseFloat(a_scale?.value || 1);

    const avWrap = animal3D?.closest(".viewer-wrap") || animal3D;
    const hvWrap = avatar3D?.closest(".viewer-wrap") || avatar3D;
    if (!avWrap || !hvWrap) return;

    // compute pixel offsets based on viewer sizes
    const hvRect = hvWrap.getBoundingClientRect();
    const avRect = avWrap.getBoundingClientRect();
    // basic mapping: X in [-2..2] => -50%..50% of viewer width
    const offsetXpx = (ax / 2) * hvRect.width;
    const offsetYpx = (-ay / 2) * hvRect.height;
    // Translate animal viewer relative to human viewer center - using absolute positioning fallback
    avWrap.style.position = "relative";
    avWrap.style.transform = `translate(${offsetXpx}px, ${offsetYpx}px) scale(${ascale})`;
    avWrap.style.transition = "transform 0.12s linear";
    // rotation Y on animal viewer element
    animal3D.style.transform = `rotateY(${ar}deg)`;
  } catch (e) {
    console.warn("applyAttach error", e);
  }
}
if (applyAttach) applyAttach.addEventListener("click", applyAttachToAnimalViewer);
if (resetAttach) resetAttach.addEventListener("click", () => {
  if (animal3D?.closest(".viewer-wrap")) {
    animal3D.closest(".viewer-wrap").style.transform = "";
  }
  if (animal3D) animal3D.style.transform = "";
  [a_posX, a_posY, a_posZ, a_rotY, a_scale].forEach(el => { if (el) el.value = el.defaultValue || 0; });
});

// live attach sliders
[a_posX,a_posY,a_posZ,a_rotY,a_scale].forEach(el => { if (el) el.addEventListener("input", applyAttachToAnimalViewer); });

// ------------------ Fusion editor (three.js) minimal (advanced precise attach & export) ------------------
let renderer, scene, camera, controls;
let humanRoot = null, animalRoot = null;
const loader = new GLTFLoader();
const exporter = new GLTFExporter();

function initFusionScene() {
  if (renderer) return;
  const viewport = fusionViewport;
  renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
  renderer.setSize(viewport.clientWidth, viewport.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
  viewport.appendChild(renderer.domElement);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(45, viewport.clientWidth/viewport.clientHeight, 0.1, 1000);
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
  if (humanRoot) { scene.remove(humanRoot); humanRoot.traverse(disposeNode); humanRoot=null; }
  if (animalRoot) { scene.remove(animalRoot); animalRoot.traverse(disposeNode); animalRoot=null; }
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

// apply animal transform in three.js scene
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
  } catch(e) { console.warn(e); }
}

// load human + animal into fusion scene
async function loadHumanFromSaved() {
  const humanUrl = localStorage.getItem("avatarURL");
  if (!humanUrl) { alert("Aucun avatar humain sauvegardé trouvé."); return; }
  if (!scene) initFusionScene();
  clearFusionScene();
  try {
    humanRoot = await loadGLBFromUrl(humanUrl);
    humanRoot.position.set(0,0,0);
    humanRoot.scale.setScalar(1);
    scene.add(humanRoot);
    if (animalRoot) applyAnimalTransform3();
  } catch(e) { console.error("loadHuman error", e); alert("Impossible de charger l'humain."); }
}

async function loadAnimalFromUrl() {
  const url = (animalUrlInput?.value || '').trim();
  if (!url) { alert("Colle une URL .glb valide."); return; }
  if (!scene) initFusionScene();
  try {
    if (animalRoot) { scene.remove(animalRoot); animalRoot.traverse(disposeNode); animalRoot=null; }
    animalRoot = await loadGLBFromUrl(url);
    scene.add(animalRoot);
    applyAnimalTransform3();
    localStorage.setItem("animalURL_temp", url);
  } catch(e) { console.error("loadAnimalFromUrl", e); alert("Impossible de charger animal depuis URL"); }
}

async function loadAnimalFromFile(file) {
  if (!scene) initFusionScene();
  try {
    if (animalRoot) { scene.remove(animalRoot); animalRoot.traverse(disposeNode); animalRoot=null; }
    animalRoot = await loadGLBFromFile(file);
    scene.add(animalRoot);
    applyAnimalTransform3();
  } catch(e) { console.error("loadAnimalFromFile", e); alert("Impossible de charger animal depuis fichier"); }
}

// exporter + optional firebase upload
async function exportMergedGLB() {
  if (!scene) { alert("Rien à exporter"); return; }
  const exportScene = new THREE.Scene();
  if (humanRoot) exportScene.add(humanRoot.clone(true));
  if (animalRoot) exportScene.add(animalRoot.clone(true));

  exporter.parse(exportScene, async (result) => {
    let arrayBuffer;
    if (result instanceof ArrayBuffer) arrayBuffer = result;
    else { arrayBuffer = new TextEncoder().encode(JSON.stringify(result)).buffer; }
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });

    if (storage) {
      try {
        const userId = localStorage.getItem("userId") || 'anon';
        const filename = `avatars/merged_${userId}_${Date.now()}.glb`;
        const ref = storageRef(storage, filename);
        await uploadBytes(ref, blob);
        const downloadUrl = await getDownloadURL(ref);
        try { localStorage.setItem("avatarURL", downloadUrl); localStorage.setItem("mergedAvatarURL", downloadUrl); if (avatar3D) avatar3D.src = downloadUrl; } catch(e){}
        alert("Export & upload réussis — avatar appliqué automatiquement.");
      } catch(e) {
        console.error("upload error", e);
        // fallback download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `merged_${Date.now()}.glb`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
        alert("Export local (upload échoué).");
      }
    } else {
      // no upload - download file
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = `merged_${Date.now()}.glb`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      alert("Export terminé (pas d'upload Firebase).");
    }
  }, { binary:true });
}

// wire fusion UI
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
if ($("fusionClose")) $("fusionClose").addEventListener("click", () => { if (fusionModal) fusionModal.style.display = "none"; });

// presets (save / load)
if (savePreset && presetList) {
  savePreset.addEventListener("click", () => {
    const name = prompt("Nom du preset (ex: épaule droite, monter dessus):", "preset_" + Date.now());
    if (!name) return;
    const preset = {
      x: posX?.value || 0, y: posY?.value || 0, z: posZ?.value || 0,
      ry: rotY?.value || 0, s: scaleAnimal?.value || 1,
      animalUrl: animalUrlInput?.value || localStorage.getItem("animalURL_temp") || localStorage.getItem("animalURL") || DEFAULT_ANIMAL
    };
    // store list in localStorage
    const list = JSON.parse(localStorage.getItem("attachPresets" ) || "[]");
    list.push({ name, preset });
    localStorage.setItem("attachPresets", JSON.stringify(list));
    refreshPresetList();
  });
  function refreshPresetList() {
    const list = JSON.parse(localStorage.getItem("attachPresets" ) || "[]");
    presetList.innerHTML = "<option value=''>-- Presets --</option>";
    list.forEach((it, idx) => {
      const opt = document.createElement("option");
      opt.value = idx;
      opt.textContent = it.name;
      presetList.appendChild(opt);
    });
  }
  presetList.addEventListener("change", () => {
    const idx = presetList.value;
    if (idx === "") return;
    const list = JSON.parse(localStorage.getItem("attachPresets" ) || "[]");
    const it = list[idx];
    if (!it) return;
    const p = it.preset;
    posX.value = p.x; posY.value = p.y; posZ.value = p.z; rotY.value = p.ry; scaleAnimal.value = p.s;
    if (animalUrlInput) animalUrlInput.value = p.animalUrl;
    // reload animal in scene
    loadAnimalFromUrl();
  });
  refreshPresetList();
}

// double click avatar area opens fusion
const avatarContainer = document.querySelector(".avatar-container-large");
if (avatarContainer) avatarContainer.addEventListener("dblclick", () => { if (fusionModal) fusionModal.style.display = "flex"; initFusionScene(); });

// Save animal viewer changes when user chooses an animal (URL or creator)
if (loadAnimalUrl) loadAnimalUrl.addEventListener("click", () => {
  // after load, save to localStorage inside loadAnimalFromUrl
});
if (animalFileInput) animalFileInput.addEventListener("change", (e) => {
  const f = e.target.files && e.target.files[0];
  if (f) {
    loadAnimalFromFile(f).then(() => {
      // also set animal3D src from file by creating objectURL
      try {
        const u = URL.createObjectURL(f);
        if (animal3D) animal3D.src = u;
        try { localStorage.setItem("animalURL", u); } catch(e){}
      } catch(e){}
    });
  }
});

// final safety: if avatar3D fails to load -> clear src
if (avatar3D) avatar3D.addEventListener("error", () => { try { avatar3D.removeAttribute("src"); } catch(e){} });

// If animal3D exists apply attach defaults visually initially
setTimeout(() => { applyAttachToAnimalViewer(); }, 400);
