// profile.js (complet) — remplace ton fichier par celui-ci
import { realistic, fantasy } from "./creature-list.js";

const $ = id => document.getElementById(id);

// DOM (peut être absent si page différente — on protège)
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');
const pseudoInput = $('pseudoInput');

const openCreate = $('openCreateMenu');
const createMenu = $('createMenu');
const btnPhoto = $('btnPhoto');
const btnAvatar = $('btnAvatar');
const btnCreature = $('btnCreature');

const menuPhoto = $('menuPhoto');
const photoLib = $('photoLib');
const takePhoto = $('takePhoto');
const hiddenFileChoose = $('hiddenFileChoose');
const hiddenFile = $('hiddenFile');

const chooseCreatureMenu = $('chooseCreatureMenu');
const toggleViewBtn = $('toggleView');
const creatureContainer = $('creatureContainer');

const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const closeRpm = $('closeRpm');

const avatar3D = $('avatar3D');
const animal3D = $('animal3D');

// fallback guards
if (!miniCircle || !miniAvatar) {
  console.warn("miniCircle / miniAvatar manquant(s) — drag non initialisé");
}

// ---------------------------
// Mini-circle draggable (mouse + touch)
// ---------------------------
(function initMiniDrag() {
  if (!miniCircle) return;

  miniCircle.style.position = miniCircle.style.position || 'fixed';
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  function start(e) {
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    const rect = miniCircle.getBoundingClientRect();
    offsetX = p.clientX - rect.left;
    offsetY = p.clientY - rect.top;
    // prevent page scroll on touch while dragging
    if (e.touches) e.preventDefault();
  }

  function move(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    let x = p.clientX - offsetX;
    let y = p.clientY - offsetY;
    // clamp into viewport
    x = Math.max(8, Math.min(window.innerWidth - miniCircle.offsetWidth - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - miniCircle.offsetHeight - 8, y));
    miniCircle.style.left = x + 'px';
    miniCircle.style.top = y + 'px';
  }

  function end() {
    dragging = false;
  }

  miniCircle.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);

  miniCircle.addEventListener('touchstart', start, { passive: false });
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('touchend', end);
})();

// ---------------------------
// Save/load pseudo
// ---------------------------
if (pseudoInput) {
  const saved = localStorage.getItem('pseudo');
  if (saved) pseudoInput.value = saved;
  pseudoInput.addEventListener('change', () => localStorage.setItem('pseudo', pseudoInput.value));
}

// ---------------------------
// Load saved mini-avatar / avatar / creature
// ---------------------------
(function initSaved() {
  try {
    if (miniAvatar) {
      const circle = localStorage.getItem('circlePhoto');
      const avatarURL = localStorage.getItem('avatarURL');
      if (circle) miniAvatar.src = circle;
      else if (avatarURL) miniAvatar.src = avatarURL;
    }
    if (avatar3D) {
      const avatarURL = localStorage.getItem('avatarURL');
      if (avatarURL) avatar3D.src = avatarURL;
    }
    if (animal3D) {
      const creatureURL = localStorage.getItem('creatureURL');
      if (creatureURL) animal3D.src = creatureURL;
      else {
        // default test model so animal viewer exists
        animal3D.src = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";
      }
    }
  } catch (e) {
    console.warn("initSaved error", e);
  }
})();

// ---------------------------
// Popups helpers (ne garde pas d'autres modifs)
// ---------------------------
const allPopups = [createMenu, menuPhoto, chooseCreatureMenu, rpmModal].filter(Boolean);
function closeAll() { allPopups.forEach(p => p.classList.add('hidden')); }
allPopups.forEach(p => p && p.addEventListener('click', e => e.stopPropagation()));
document.body.addEventListener('click', closeAll);

// ---------------------------
// Create menu toggle
// ---------------------------
if (openCreate) {
  openCreate.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    createMenu.classList.toggle('hidden');
  });
}

// ---------------------------
// Photo menu wiring -> works (photoLib & takePhoto)
// ---------------------------
if (btnPhoto) {
  btnPhoto.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    if (menuPhoto) menuPhoto.classList.remove('hidden');
  });
}

if (photoLib) {
  photoLib.addEventListener('click', e => {
    e.stopPropagation();
    if (hiddenFileChoose) hiddenFileChoose.click();
  });
}

if (takePhoto) {
  takePhoto.addEventListener('click', e => {
    e.stopPropagation();
    if (hiddenFile) hiddenFile.click();
  });
}

if (hiddenFileChoose) {
  hiddenFileChoose.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (miniAvatar) miniAvatar.src = ev.target.result;
      try { localStorage.setItem('circlePhoto', ev.target.result); } catch (_) {}
      closeAll();
    };
    reader.readAsDataURL(f);
  });
}

if (hiddenFile) {
  hiddenFile.addEventListener('change', e => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (miniAvatar) miniAvatar.src = ev.target.result;
      try { localStorage.setItem('circlePhoto', ev.target.result); } catch (_) {}
      closeAll();
    };
    reader.readAsDataURL(f);
  });
}

// ---------------------------
// Avatar (Ready Player Me) modal integrated & direct import
// ---------------------------

/*
 Behavior:
  - btnAvatar opens rpmModal and sets iframe src (only if not already set) to avoid reload loops
  - listens to window.postMessage from RPM (string JSON or object)
  - when event 'v1.avatar.exported' arrives, set avatar3D.src and (if no circlePhoto) set miniAvatar.src
  - close modal and clear iframe.src to free camera
*/

// We'll load the iframe on demand and subscribe safely
if (btnAvatar) {
  btnAvatar.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    if (!rpmModal) {
      console.warn("rpmModal absent");
      return;
    }
    rpmModal.classList.remove('hidden');

    // set src each time to ensure a fresh iframe and camera permission flow
    try {
      if (rpmFrame) {
        // Use the official frame API URL
        rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
        console.info("RPM iframe src set");
      } else {
        console.warn("rpmFrame absent");
      }
    } catch (err) {
      console.warn("Impossible d'ouvrir RPM iframe", err);
    }
  });
}

// Close RPM modal (button)
if (closeRpm) {
  closeRpm.addEventListener('click', () => {
    if (rpmModal) rpmModal.classList.add('hidden');
    try { if (rpmFrame) rpmFrame.src = ""; } catch (e) { console.warn("clear rpmFrame failed", e); }
  });
}

// Close RPM by clicking modal background
if (rpmModal) {
  rpmModal.addEventListener('click', (ev) => {
    if (ev.target === rpmModal) {
      rpmModal.classList.add('hidden');
      try { if (rpmFrame) rpmFrame.src = ""; } catch (e) { console.warn("clear rpmFrame failed", e); }
    }
  });
}

// Handle messages from RPM (and tolerate different message shapes)
window.addEventListener('message', (event) => {
  if (!event || !event.data) return;

  let data = event.data;
  try { data = (typeof data === 'string') ? JSON.parse(data) : data; } catch (err) { /* keep original */ }

  // Accept readyplayerme events — tolerate variations
  const isRPM = data && (data.source === 'readyplayerme' || data.eventName || data.name);
  if (!isRPM) return;

  // When avatar exported
  if (data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported' || data?.type === 'avatar-exported') {
    const avatarURL = data?.data?.url || data?.url || data?.avatarUrl || data?.avatarURL || null;
    if (avatarURL) {
      console.info("Avatar exported from RPM:", avatarURL);
      if (avatar3D) {
        try { avatar3D.src = avatarURL; } catch (e) { console.warn("set avatar3D failed", e); }
      }
      // update mini circle if no custom circle photo
      try {
        const circle = localStorage.getItem('circlePhoto');
        if (!circle && miniAvatar) miniAvatar.src = avatarURL;
      } catch (e) { /* ignore */ }
      try { localStorage.setItem('avatarURL', avatarURL); } catch (e) {}
    } else {
      console.warn("RPM exported event had no avatar URL", data);
    }

    // cleanup modal & iframe (free camera)
    try {
      if (rpmModal) rpmModal.classList.add('hidden');
      if (rpmFrame && rpmFrame.src) rpmFrame.src = "";
      console.info("RPM modal closed and iframe cleared");
    } catch (e) { console.warn("RPM cleanup failed", e); }
    return;
  }

  // Frame ready -> subscribe safely (only if iframe exists)
  if (data?.eventName === 'v1.frame.ready' || data?.name === 'frame-ready') {
    try {
      if (rpmFrame && rpmFrame.contentWindow) {
        rpmFrame.contentWindow.postMessage(JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.avatar.exported'
        }), '*');
        console.info("Subscribed to RPM avatar export");
      } else {
        console.warn("rpmFrame.contentWindow not ready for subscribe");
      }
    } catch (e) {
      console.warn("subscribe error", e);
    }
    return;
  }
});

// ---------------------------
// Creature list build (keeps your UI intact)
// ---------------------------
function buildCreatureMenu() {
  if (!creatureContainer) return;
  creatureContainer.innerHTML = '';
  const all = [...(realistic || []), ...(fantasy || [])];
  all.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = item.name;
    btn.dataset.url = item.url || '';
    btn.onclick = () => {
      if (!animal3D) return;
      // set creature (if url empty we alert)
      if (!item.url || item.url.length === 0) {
        alert("Modèle .glb manquant pour " + item.name + " — colle un .glb public.");
        return;
      }
      // safe set (reset to avoid some viewer caching)
      animal3D.src = "";
      setTimeout(() => { animal3D.src = item.url; }, 60);
      try { localStorage.setItem('creatureURL', item.url); } catch (_) {}
      closeAll();
    };
    creatureContainer.appendChild(btn);
  });
}
buildCreatureMenu();

// toggle grid/list (if toggle exists)
if (toggleViewBtn && creatureContainer) {
  let isGrid = true;
  toggleViewBtn.addEventListener('click', () => {
    isGrid = !isGrid;
    creatureContainer.style.flexDirection = isGrid ? 'row' : 'column';
  });
}

// ---------------------------
// Open creature menu
// ---------------------------
if (btnCreature) {
  btnCreature.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    if (chooseCreatureMenu) chooseCreatureMenu.classList.remove('hidden');
  });
}

// ---------------------------
// Helpers: close on ESC
// ---------------------------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

// End of file
