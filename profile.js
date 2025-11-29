// profile.js (complet) — ajoute ceci à la place de ton ancien profile.js
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
const photoLib = $('photoLib');          // <-- nécessaire
const takePhoto = $('takePhoto');        // <-- nécessaire
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
// Mini-circle draggable
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
    if (e.touches) e.preventDefault();
  }

  function move(e) {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    let x = p.clientX - offsetX;
    let y = p.clientY - offsetY;
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
        animal3D.src = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";
      }
    }
  } catch (e) {
    console.warn("initSaved error", e);
  }
})();

// ---------------------------
// Popups helpers
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
// Photo menu wiring
// ---------------------------
if (btnPhoto) {
  btnPhoto.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    if (menuPhoto) menuPhoto.classList.remove('hidden');
  });
}

// 📌 ***CORRECTION 1 : Photothèque***
if (photoLib) {
  photoLib.addEventListener('click', e => {
    e.stopPropagation();
    if (hiddenFileChoose) hiddenFileChoose.click();
  });
}

// 📌 ***CORRECTION 2 : Prendre une photo***
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
// Avatar (Ready Player Me)
// ---------------------------
let rpmOpened = false;
let rpmSubscribed = false;
const RPM_IFRAME = "https://iframe.readyplayer.me/avatar?frameApi";

if (btnAvatar) {
  btnAvatar.addEventListener('click', e => {
    e.stopPropagation();
    closeAll();
    if (rpmModal) rpmModal.classList.remove('hidden');

    // Charger l’iframe uniquement au moment de l’ouverture
    try {
      rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
    } catch (err) {
      console.warn("Impossible d’ouvrir Ready Player Me", err);
    }
  });
}

if (closeRpm) {
  closeRpm.addEventListener('click', () => {
    if (rpmModal) rpmModal.classList.add('hidden');
    // NE PAS vider l'iframe ici sinon RPM ne se recharge plus
    rpmOpened = false;
    rpmSubscribed = false;
  });
}

if (rpmModal) {
  rpmModal.addEventListener('click', (ev) => {
    if (ev.target === rpmModal) {
      rpmModal.classList.add('hidden');
      try { rpmFrame.src = ""; } catch (_) {}
      rpmOpened = false;
      rpmSubscribed = false;
    }
  });
}

window.addEventListener('message', (event) => {
  if (!event.data) return;

  let data = event.data;
  try { data = (typeof data === 'string') ? JSON.parse(data) : data; } catch {}

  const isRPM = (data && (data.source === 'readyplayerme' || data.eventName || data.name));
  if (!isRPM) return;

  if (data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported' || data?.type === 'avatar-exported') {
    const avatarURL = data?.data?.url || data?.url || data?.avatarUrl || null;
    if (avatarURL) {
      if (avatar3D) avatar3D.src = avatarURL;
      try {
        const circle = localStorage.getItem('circlePhoto');
        if (!circle && miniAvatar) miniAvatar.src = avatarURL;
      } catch {}
      try { localStorage.setItem('avatarURL', avatarURL); } catch {}
    }

    try {
      if (rpmModal) rpmModal.classList.add('hidden');
      if (rpmFrame) rpmFrame.src = "";
    } catch {}
    rpmOpened = false;
    rpmSubscribed = false;
    return;
  }

  if (data?.eventName === 'v1.frame.ready') {
    try {
      if (!rpmSubscribed) {
        rpmFrame.contentWindow.postMessage(JSON.stringify({
          target: 'readyplayerme',
          type: 'subscribe',
          eventName: 'v1.avatar.exported'
        }), '*');
        rpmSubscribed = true;
      }
    } catch {}
  }
});

// ---------------------------
// Creature list build
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
      if (!item.url || item.url.length === 0) {
        alert("Modèle .glb manquant pour " + item.name);
        return;
      }
      animal3D.src = "";
      setTimeout(() => { animal3D.src = item.url; }, 60);
      try { localStorage.setItem('creatureURL', item.url); } catch {}
      closeAll();
    };
    creatureContainer.appendChild(btn);
  });
}
buildCreatureMenu();

// toggle grid/list
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
// ESC = close menus
// ---------------------------
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAll();
});

// End of file
