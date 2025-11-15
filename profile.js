// profile.js - Intégration avatar (RPM), mini-circle photo, creature system
// Remplace ton profile.js par ce fichier complet.

const $ = id => document.getElementById(id);

// DOM
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');

const editBtn = $('editProfile');
const editMenu = $('editMenu');
const photoLib = $('photoLib');
const takePhoto = $('takePhoto');
const chooseFile = $('chooseFile');
const hiddenFile = $('hiddenFile');
const hiddenFileChoose = $('hiddenFileChoose');
const closeEdit = $('closeEdit');

const createAvatar = $('createAvatar');
const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const closeRpm = $('closeRpm');

const avatar3D = $('avatar3D');
const pseudoDisplay = $('pseudoDisplay');

const toggleCreaturePanel = $('toggleCreaturePanel');
const creaturePanel = $('creaturePanel');
const creatureChoices = document.querySelectorAll('.creature-choice');
const previewCreature = $('previewCreature');
const creatureColor = $('creatureColor');
const creatureScale = $('creatureScale');
const creaturePosition = $('creaturePosition');
const applyCreature = $('applyCreature');
const closeCreature = $('closeCreature');
const animal3D = $('animal3D') || $('animal3D'); // if exists later
const creatureContainer = $('creatureContainer');

// default models (public sample glb urls)
const CREATURE_MODELS = {
  Fox: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
  Unicorn: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb', // placeholder
  WingedCat: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb', // placeholder
  Dragon: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb' // placeholder
};

// persistence keys
const K = {
  CIRCLE: 'circlePhoto',
  AVATAR: 'avatarURL',
  CREATURE: 'creatureState'
};

// ------- init load persisted data -------
function initProfile() {
  try {
    const circle = localStorage.getItem(K.CIRCLE);
    if (circle) miniAvatar.src = circle;

    const avatarURL = localStorage.getItem(K.AVATAR);
    if (avatarURL && avatar3D) avatar3D.src = avatarURL;

    const creatureState = JSON.parse(localStorage.getItem(K.CREATURE) || '{}');
    if (creatureState && creatureState.model && creatureContainer) {
      // create or update animal model viewer inside creatureContainer
      ensureAnimalViewer();
      setCreatureFromState(creatureState);
    }
  } catch (e) { console.warn(e); }
}
initProfile();

// ------- helpers to ensure animal model-viewer exists -------
function ensureAnimalViewer() {
  if (!document.getElementById('animal3D')) {
    const mv = document.createElement('model-viewer');
    mv.id = 'animal3D';
    mv.setAttribute('camera-controls','');
    mv.setAttribute('auto-rotate','');
    mv.setAttribute('shadow-intensity','1');
    mv.style.width = '180px';
    mv.style.height = '180px';
    mv.style.transition = 'transform 300ms ease';
    creatureContainer.appendChild(mv);
  }
}

// ------- EDIT MENU logic -------
editBtn.addEventListener('click', e => {
  e.stopPropagation();
  const visible = editMenu.style.display === 'flex';
  editMenu.style.display = visible ? 'none' : 'flex';
  editMenu.setAttribute('aria-hidden', visible ? 'true' : 'false');
});

// close edit menu clicking outside
document.addEventListener('click', e => {
  if (editMenu.style.display === 'flex' && !editMenu.contains(e.target) && e.target !== editBtn) {
    editMenu.style.display = 'none';
  }
});
closeEdit.addEventListener('click', () => {
  editMenu.style.display = 'none';
});

// ------- PhotoLib / TakePhoto / ChooseFile -------
photoLib.addEventListener('click', () => hiddenFileChoose.click());
chooseFile.addEventListener('click', () => hiddenFile.click());
hiddenFileChoose.addEventListener('change', onChooseFile);
hiddenFile.addEventListener('change', onChooseFile);

function onChooseFile(e) {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    miniAvatar.src = ev.target.result;
    localStorage.setItem(K.CIRCLE, ev.target.result);
    // close menu automatically
    editMenu.style.display = 'none';
  };
  reader.readAsDataURL(f);
}

// take photo uses capture attribute to open camera on mobile
takePhoto.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = onChooseFile;
  input.click();
  editMenu.style.display = 'none';
});

// ------- Ready Player Me (RPM) integration -------
const RPM_URL = 'https://iframe.readyplayer.me/avatar?frameApi';

createAvatar.addEventListener('click', () => {
  rpmModal.style.display = 'flex';
  rpmModal.setAttribute('aria-hidden','false');
  // set src only when opening to avoid constant reload
  if (!rpmFrame.src || rpmFrame.src === '') rpmFrame.src = RPM_URL;
  editMenu.style.display = 'none';
});

// close RPM
closeRpm.addEventListener('click', () => {
  rpmModal.style.display = 'none';
  rpmFrame.src = '';
});

// close RPM by clicking background
rpmModal.addEventListener('click', (e) => {
  if (e.target === rpmModal) {
    rpmModal.style.display = 'none';
    rpmFrame.src = '';
  }
});

// listen for messages from RPM
window.addEventListener('message', (event) => {
  if (!event.data) return;
  let data = event.data;
  try { data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data; } catch(e) { data = event.data; }

  // exported avatar
  if (data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported') {
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if (avatarURL && avatar3D) {
      avatar3D.src = avatarURL;
      localStorage.setItem(K.AVATAR, avatarURL);
      // if mini-circle has no custom photo, set it to avatar
      if (!localStorage.getItem(K.CIRCLE)) miniAvatar.src = avatarURL;
    }
    // close rpm and clean src to free camera
    rpmModal.style.display = 'none';
    rpmFrame.src = '';
  }

  // frame ready -> subscribe
  if (data?.eventName === 'v1.frame.ready' || data?.name === 'frame-ready') {
    try {
      rpmFrame.contentWindow.postMessage(JSON.stringify({
        target: 'readyplayerme',
        type: 'subscribe',
        eventName: 'v1.avatar.exported'
      }), '*');
    } catch(e) {}
  }
});

// ------- mini-circle draggable (touch + mouse) -------
(function makeDraggable() {
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  function start(e) {
    dragging = true;
    const p = (e.touches && e.touches[0]) || e;
    const rect = miniCircle.getBoundingClientRect();
    offsetX = p.clientX - rect.left;
    offsetY = p.clientY - rect.top;
    if (e.touches) e.preventDefault();
  }
  function move(e) {
    if (!dragging) return;
    const p = (e.touches && e.touches[0]) || e;
    let x = p.clientX - offsetX;
    let y = p.clientY - offsetY;
    const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
    const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
    x = Math.max(8, Math.min(maxX, x));
    y = Math.max(8, Math.min(maxY, y));
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

// ------- Dance button (visual) -------
const danceBtnEl = $('danceBtn');
if (danceBtnEl && avatar3D) {
  danceBtnEl.addEventListener('click', () => {
    try {
      avatar3D.style.transition = 'transform 1.6s ease';
      avatar3D.style.transform = 'rotateY(720deg)';
      setTimeout(() => avatar3D.style.transform = '', 1600);
    } catch(e) {}
  });
}

// ------- Creature panel toggle -------
toggleCreaturePanel.addEventListener('click', () => {
  const visible = creaturePanel.style.display === 'flex';
  creaturePanel.style.display = visible ? 'none' : 'flex';
  creaturePanel.setAttribute('aria-hidden', visible ? 'true' : 'false');
});

// close creature panel
closeCreature.addEventListener('click', () => {
  creaturePanel.style.display = 'none';
});

// creature choice buttons populate preview
creatureChoices.forEach(btn => {
  btn.addEventListener('click', () => {
    const key = btn.dataset.creature;
    const model = CREATURE_MODELS[key] || CREATURE_MODELS.Fox;
    previewCreature.src = model;
    // save choice on preview element dataset
    previewCreature.dataset.model = model;
  });
});

// apply creature to main screen
applyCreature.addEventListener('click', () => {
  const model = previewCreature.dataset.model || CREATURE_MODELS.Fox;
  const color = creatureColor.value || '#ff69b4';
  const scale = parseFloat(creatureScale.value || '1');
  const position = creaturePosition.value || 'shoulder';
  ensureAnimalViewer();
  const animal = document.getElementById('animal3D');
  animal.src = model;
  // simple style transform to reflect scale and position
  animal.style.transform = `scale(${scale})`;
  setCreaturePosition(position, animal, scale);
  // persist creature state
  const state = { model, color, scale, position };
  localStorage.setItem(K.CREATURE, JSON.stringify(state));
  // show creature container
  creaturePanel.style.display = 'none';
});

// set creature from saved state on init
function setCreatureFromState(state) {
  ensureAnimalViewer();
  const animal = document.getElementById('animal3D');
  animal.src = state.model;
  animal.style.transform = `scale(${state.scale || 1})`;
  setCreaturePosition(state.position || 'side', animal, state.scale || 1);
  // color not used here as we use glb placeholders (would require material editing)
}

// simple placement logic for creature relative to avatar container
function setCreaturePosition(position, animalEl, scale = 1) {
  const c = creatureContainer;
  if (!c || !animalEl) return;
  // reset styles
  c.style.position = 'absolute';
  c.style.transition = 'transform 220ms ease, bottom 220ms ease';
  switch(position) {
    case 'shoulder':
      c.style.left = '60%';
      c.style.bottom = '40%';
      animalEl.style.transform = `translateX(-20px) scale(${scale})`;
      break;
    case 'hand':
      c.style.left = '70%';
      c.style.bottom = '18%';
      animalEl.style.transform = `translateX(0) scale(${scale})`;
      break;
    case 'side':
      c.style.left = '10%';
      c.style.bottom = '20%';
      animalEl.style.transform = `translateX(0) scale(${scale})`;
      break;
    case 'ride':
      c.style.left = '50%';
      c.style.bottom = '50%';
      animalEl.style.transform = `translateX(0) scale(${scale})`;
      break;
    default:
      c.style.left = '65%';
      c.style.bottom = '20%';
  }
}

// ------- utility: set creature from saved state after ensureAnimalViewer -------
(function loadCreatureFromStorage() {
  const s = localStorage.getItem(K.CREATURE);
  if (!s) return;
  try {
    const st = JSON.parse(s);
    ensureAnimalViewer();
    setCreatureFromState(st);
  } catch(e) {}
})();

// Close creature & RPM when clicking outside relevant panels
document.addEventListener('click', (e) => {
  if (creaturePanel.style.display === 'flex' && !creaturePanel.contains(e.target) && e.target !== toggleCreaturePanel) {
    creaturePanel.style.display = 'none';
  }
  if (rpmModal.style.display === 'flex' && !rpmModal.contains(e.target) && e.target !== createAvatar) {
    // NO automatic close here because rpmModal covers whole screen; keep close button
  }
});

// ensure animal viewer created if needed (called earlier too)
function ensureAnimalViewer() {
  if (!document.getElementById('animal3D')) {
    const mv = document.createElement('model-viewer');
    mv.id = 'animal3D';
    mv.setAttribute('camera-controls', '');
    mv.setAttribute('auto-rotate', '');
    mv.setAttribute('shadow-intensity', '1');
    mv.style.width = '180px';
    mv.style.height = '180px';
    mv.style.position = 'relative';
    creatureContainer.appendChild(mv);
  }
}

// Accessibility: keyboard Escape closes panels
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    editMenu.style.display = 'none';
    creaturePanel.style.display = 'none';
    rpmModal.style.display = 'none';
  }
});

// Raccourci
const $ = id => document.getElementById(id);

// Menus
const menus = [
    "createMenu",
    "menuPhoto",
    "menuCreature",
    "chooseCreatureMenu",
    "createCreatureMenu"
];

function closeAllMenus() {
    menus.forEach(id => $(id).classList.add("hidden"));
}

function openMenu(id) {
    closeAllMenus();
    $(id).classList.remove("hidden");
}

// OUVERTURE DU MENU CREER
$("#openCreateMenu").onclick = e => {
    e.stopPropagation();
    openMenu("createMenu");
};

// PHOTO
$("#btnPhoto").onclick = e => {
    e.stopPropagation();
    openMenu("menuPhoto");
};

// AVATAR
$("#btnAvatar").onclick = e => {
    e.stopPropagation();
    // tu as déjà avatar.js → je n’y touche pas
    openMenu("menuPhoto"); // à remplacer si tu veux un menu avatar plus tard
};

// CREATURE
$("#btnCreature").onclick = e => {
    e.stopPropagation();
    openMenu("menuCreature");
};

// Sous-menu créature
$("#chooseCreature").onclick = e => {
    e.stopPropagation();
    openMenu("chooseCreatureMenu");
};

$("#createCreature").onclick = e => {
    e.stopPropagation();
    openMenu("createCreatureMenu");
};

// FERMETURE EN CLIQUANT AILLEURS
document.body.onclick = () => closeAllMenus();

// Empêcher fermeture quand on clique dans un popup
menus.forEach(id => {
    if ($(id)) $(id).onclick = e => e.stopPropagation();
});
