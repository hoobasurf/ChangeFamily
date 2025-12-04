import { realistic, fantasy } from "./creature-list.js";

const $ = id => document.getElementById(id);

// DOM refs
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');
const pseudoInput = $('pseudoInput');

const openCreate = $('openCreateMenu');
const createMenu = $('createMenu');
const btnPhoto = $('btnPhoto');
const btnAvatar = $('btnAvatar');
const btnCreature = $('btnCreature');

const menuPhoto = $('menuPhoto');

const photoLib = $('photoLib');     // ← ajouté
const takePhoto = $('takePhoto');   // ← ajouté

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

// ---------------------------
// Mini-circle draggable
// ---------------------------
(function initMiniDrag() {
  if (!miniCircle) return;

  miniCircle.style.position = 'fixed';
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

  function end() { dragging = false; }

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

  pseudoInput.addEventListener('change', () => {
    localStorage.setItem('pseudo', pseudoInput.value);
  });
}

// ---------------------------
// Load saved mini-avatar + avatar + creature
// ---------------------------
(function initSaved() {
  try {
    if (miniAvatar) {
      const circle = localStorage.getItem('circlePhoto');
      const avatarURL = localStorage.getItem('avatarURL');

      if (circle && circle !== "") miniAvatar.src = circle;
      else if (avatarURL && avatarURL !== "") miniAvatar.src = avatarURL;
      else miniAvatar.src = "default.jpg";
    }

    if (avatar3D) {
      const avatarURL = localStorage.getItem('avatarURL');
      if (avatarURL) avatar3D.src = avatarURL;
    }

    if (animal3D) {
      const creatureURL = localStorage.getItem('creatureURL');
      if (creatureURL) animal3D.src = creatureURL;
      else animal3D.src =
        "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";
    }
  } catch (e) {
    console.warn("initSaved error", e);
  }
})();

// ---------------------------
// Popups helpers
// ---------------------------
const allPopups = [createMenu, menuPhoto, chooseCreatureMenu, rpmModal].filter(Boolean);

function closeAll() {
  allPopups.forEach(p => p.classList.add('hidden'));
}

// CLOSE ON CLICK OUTSIDE (corrigé)
document.body.addEventListener('click', (e) => {
  if (e.target.closest('.popup') || e.target.closest('.pill-btn') || e.target.closest('input[type="file"]')) {
    return;
  }
  closeAll();
});

allPopups.forEach(p => p.addEventListener('click', e => e.stopPropagation()));

// ---------------------------
// Create menu
// ---------------------------
openCreate?.addEventListener('click', e => {
  e.preventDefault();
  e.stopPropagation();
  createMenu.classList.toggle('hidden');
});

// ---------------------------
// Photo menu
// ---------------------------
btnPhoto?.addEventListener('click', e => {
  e.stopPropagation();
  closeAll();
  menuPhoto.classList.remove('hidden');
});

// --- Photothèque ---
photoLib?.addEventListener('click', e => {
  e.stopPropagation();
  hiddenFileChoose.click();
});

// --- Prendre photo ---
takePhoto?.addEventListener('click', e => {
  e.stopPropagation();
  hiddenFile.click();
});

// File handlers
function handleImageSelection(f) {
  const reader = new FileReader();
  reader.onload = ev => {
    miniAvatar.src = ev.target.result;
    try { localStorage.setItem('circlePhoto', ev.target.result); } catch (_) {}
    closeAll();
  };
  reader.readAsDataURL(f);
}

hiddenFileChoose?.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) handleImageSelection(f);
});

hiddenFile?.addEventListener('change', e => {
  const f = e.target.files[0];
  if (f) handleImageSelection(f);
});

// ---------------------------
// Ready Player Me
// ---------------------------
const btnAvatar = document.getElementById('btnAvatar');
const rpmModal = document.getElementById('rpmModal');
const rpmFrame = document.getElementById('rpmFrame');
const closeRpm = document.getElementById('closeRpm');
const miniAvatar = document.getElementById('miniAvatar');
const avatar3D = document.getElementById('avatar3D');

if (btnAvatar) {
    btnAvatar.addEventListener('click', (e) => {
        e.preventDefault();
        rpmModal.classList.remove('hidden');   // Ouvre le modal
        rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";  // Charge iframe
    });
}

if (closeRpm) {
    closeRpm.addEventListener('click', () => {
        rpmModal.classList.add('hidden');
        rpmFrame.src = "";
    });
}

if (rpmModal) {
    rpmModal.addEventListener('click', (e) => {
        if (e.target === rpmModal) {
            rpmModal.classList.add('hidden');
            rpmFrame.src = "";
        }
    });
}

// Écoute messages de l'iframe Ready Player Me
window.addEventListener('message', (event) => {
    if (!event.data) return;
    let data = event.data;
    try { data = typeof data === "string" ? JSON.parse(data) : data; } catch (_) {}

    if (data?.source !== "readyplayerme") return;

    if (data.eventName === "v1.frame.ready") {
        rpmFrame.contentWindow.postMessage(JSON.stringify({
            target: "readyplayerme",
            type: "subscribe",
            eventName: "v1.avatar.exported"
        }), "*");
    }

    if (data.eventName === "v1.avatar.exported") {
        const avatarUrl = data?.data?.url;
        if (avatarUrl) {
            avatar3D.src = avatarUrl;
            if (!localStorage.getItem('circlePhoto')) miniAvatar.src = avatarUrl;
            localStorage.setItem('avatarURL', avatarUrl);
        }
        rpmModal.classList.add('hidden');
        rpmFrame.src = "";
    }
});


  if (data.eventName === "v1.avatar.exported") {
    const avatarUrl = data?.data?.url;

    if (avatarUrl) {
      avatar3D.src = avatarUrl;          // met à jour l'avatar 3D
      if (!localStorage.getItem('circlePhoto')) miniAvatar.src = avatarUrl; // mini-avatar si vide
      localStorage.setItem('avatarURL', avatarUrl);  // sauvegarde localStorage
    }

    rpmModal.classList.add('hidden');    // ferme modal
    rpmFrame.src = "";                   // vide iframe
  }
});
// RPM events
window.addEventListener('message', event => {
  if (!event.data) return;

  let data = event.data;
  try {
    data = typeof data === "string" ? JSON.parse(data) : data;
  } catch (_) {}

  if (data?.source !== "readyplayerme") return;

  if (data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(JSON.stringify({
      target: "readyplayerme",
      type: "subscribe",
      eventName: "v1.avatar.exported"
    }), "*");
  }

  if (data.eventName === "v1.avatar.exported") {
    const avatarUrl = data?.data?.url;

    if (avatarUrl) {
      if (avatar3D) avatar3D.src = avatarUrl;

      const circle = localStorage.getItem('circlePhoto');
      if (!circle && miniAvatar) miniAvatar.src = avatarUrl;

      try { localStorage.setItem('avatarURL', avatarUrl); } catch (_) {}
    }

    rpmModal.classList.add('hidden');
    rpmFrame.src = "";
  }
});

// ---------------------------
// Creature menu
// ---------------------------
function buildCreatureMenu() {
  if (!creatureContainer) return;
  creatureContainer.innerHTML = "";

  const all = [...realistic, ...fantasy];

  all.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = item.name;
    btn.dataset.url = item.url;

    btn.onclick = () => {
      if (!item.url) {
        alert("Modèle .glb manquant : " + item.name);
        return;
      }

      animal3D.src = "";
      setTimeout(() => animal3D.src = item.url, 50);

      try { localStorage.setItem('creatureURL', item.url); } catch (_) {}
      closeAll();
    };

    creatureContainer.appendChild(btn);
  });
}

buildCreatureMenu();

toggleViewBtn?.addEventListener('click', () => {
  const isRow = creatureContainer.style.flexDirection !== 'column';
  creatureContainer.style.flexDirection = isRow ? 'column' : 'row';
});

btnCreature?.addEventListener('click', e => {
  e.stopPropagation();
  closeAll();
  chooseCreatureMenu.classList.remove('hidden');
});

// ESC closes popups
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeAll();
});
