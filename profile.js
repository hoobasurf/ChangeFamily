// profile.js — FIX final (long-press cancel on move, RPM open guarded, attach hidden)
// Replace your existing profile.js with this file (complete).

// safe DOM getter
const $ = id => document.getElementById(id);

// DOM elements (may be null)
const avatar3D = $('avatar3D');
const animal3D = $('animal3D');
const pseudoDisplay = $('pseudoDisplay');
const editBtn = $('editBtn') || $('editProfile');
const editMenu = $('editMenu');
const uploadPhoto = $('uploadPhoto');
const uploadBtn = $('uploadBtn');
const takePhoto = $('takePhoto');
const createAvatar = $('createAvatar');
const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const danceBtn = $('danceBtn');
const miniCircle = $('miniCircle');
const miniAvatarImg = $('miniAvatarImg');
const createAnimal = $('createAnimal');
const animalModal = $('animalModal');
const animalFrame = $('animalFrame');
const animalUrlInput = $('animalUrlInput');
const loadAnimalUrl = $('loadAnimalUrl');
const animalFileInput = $('animalFileInput');
const closeMenu = $('closeMenu');

// defaults
const DEFAULT_MINI = 'default.jpg';
const DEFAULT_ANIMAL = 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb';

// hide attach UI if present
try {
  const attachPanel = document.getElementById('attachControls') || document.querySelector('.attach-controls');
  if (attachPanel) attachPanel.style.display = 'none';
} catch (e) {}

/* ------------------- INIT ------------------- */
window.addEventListener('DOMContentLoaded', () => {
  try {
    const circle = (() => { try { return localStorage.getItem('circlePhoto'); } catch(e){ return null; } })();
    const avatarURL = (() => { try { return localStorage.getItem('avatarURL'); } catch(e){ return null; } })();
    const animalURL = (() => { try { return localStorage.getItem('animalURL'); } catch(e){ return null; } })();

    if (miniAvatarImg) {
      if (circle) miniAvatarImg.src = circle;
      else if (avatarURL) miniAvatarImg.src = avatarURL;
      else miniAvatarImg.src = DEFAULT_MINI;
    }

    if (avatar3D) {
      if (avatarURL) avatar3D.src = avatarURL;
      else avatar3D.removeAttribute && avatar3D.removeAttribute('src');
    }

    if (animal3D) {
      if (animalURL) animal3D.src = animalURL;
      else { animal3D.src = DEFAULT_ANIMAL; try { localStorage.setItem('animalURL', DEFAULT_ANIMAL); } catch(e){} }
    }
  } catch (e) {
    console.warn('[profile] init error', e);
  }
});

/* ------------------- Edit menu toggle ------------------- */
if (editBtn && editMenu) {
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    editMenu.style.display = editMenu.style.display === 'flex' ? 'none' : 'flex';
  });
  document.addEventListener('click', (e) => {
    if (editMenu.style.display === 'flex' && !editMenu.contains(e.target) && e.target !== editBtn) {
      editMenu.style.display = 'none';
    }
  });
  if (closeMenu) closeMenu.addEventListener('click', () => { editMenu.style.display = 'none'; });
}

/* ------------------- Mini-circle upload & camera ------------------- */
if (uploadBtn && uploadPhoto) {
  uploadBtn.addEventListener('click', () => {
    uploadPhoto.click();
    if (editMenu) editMenu.style.display = 'none';
  });
  uploadPhoto.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try { if (miniAvatarImg) miniAvatarImg.src = ev.target.result; localStorage.setItem('circlePhoto', ev.target.result); } catch(err){ console.warn(err); }
    };
    r.readAsDataURL(f);
  });
}

if (takePhoto) {
  takePhoto.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (ev) => {
        try { if (miniAvatarImg) miniAvatarImg.src = ev.target.result; localStorage.setItem('circlePhoto', ev.target.result); } catch(err) {}
      };
      r.readAsDataURL(f);
    };
    input.click();
    if (editMenu) editMenu.style.display = 'none';
  });
}

/* ------------------- RPM open guard & message handling ------------------- */
// State to avoid reloading src repeatedly
let rpmOpened = false;
const RPM_IFRAME_URL = 'https://iframe.readyplayer.me/avatar?frameApi';

if (createAvatar && rpmModal && rpmFrame) {
  createAvatar.addEventListener('click', () => {
    try {
      // set src only if not already opened in this session
      if (!rpmOpened) {
        rpmFrame.src = RPM_IFRAME_URL;
        rpmOpened = true;
      }
      rpmModal.style.display = 'flex';
      rpmModal.setAttribute('aria-hidden','false');
      if (editMenu) editMenu.style.display = 'none';
    } catch (e) { console.warn(e); }
  });
}

// message handler - only accept v1.avatar.exported and frame.ready when modal open
window.addEventListener('message', (event) => {
  if (!event.data) return;
  let data = event.data;
  try { data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data; } catch (e) { data = event.data; }

  const isExport = data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported';
  const isFrameReady = data?.eventName === 'v1.frame.ready' || data?.name === 'frame-ready';
  const isAnimalExport = (data?.source === 'animalcreator' && (data?.event === 'avatar-ready' || data?.name === 'avatar-ready')) || data?.eventName === 'animal.avatar.exported';

  // RPM export
  if (isExport) {
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if (avatarURL && avatar3D) {
      avatar3D.src = avatarURL;
      try { localStorage.setItem('avatarURL', avatarURL); } catch(e){}
      const circle = localStorage.getItem('circlePhoto');
      if (!circle && miniAvatarImg) miniAvatarImg.src = avatarURL;
    }
    // close modal and unload iframe to prevent loops
    if (rpmModal) rpmModal.style.display = 'none';
    try { rpmFrame.src = ''; } catch(e) {}
    rpmOpened = false;
    return;
  }

  // subscribe when frame ready (but only if our modal is open)
  if (isFrameReady) {
    try {
      if (rpmModal && rpmModal.style.display === 'flex' && rpmFrame && rpmFrame.contentWindow) {
        rpmFrame.contentWindow.postMessage(JSON.stringify({ target: 'readyplayerme', type: 'subscribe', eventName: 'v1.avatar.exported' }), '*');
      }
    } catch (e) { /* ignore */ }
    return;
  }

  // animal creator export
  if (isAnimalExport) {
    const url = data.url || data.data?.url || data.avatarUrl || null;
    if (url && animal3D) {
      animal3D.src = url;
      try { localStorage.setItem('animalURL', url); } catch(e){}
    }
    if (animalModal) animalModal.style.display = 'none';
    return;
  }
});

/* ------------------- Close rpm modal by clicking outside ------------------- */
if (rpmModal && rpmFrame) {
  rpmModal.addEventListener('click', (e) => {
    if (e.target === rpmModal) {
      rpmModal.style.display = 'none';
      // unload iframe to avoid it continuing to run behind the scenes
      try { rpmFrame.src = ''; } catch(e) {}
      rpmOpened = false;
    }
  });
}

/* ------------------- Animal load (URL/file) ------------------- */
if (loadAnimalUrl && animalUrlInput) {
  loadAnimalUrl.addEventListener('click', () => {
    const url = (animalUrlInput.value || '').trim();
    if (!url) { alert('Colle une URL .glb valide'); return; }
    if (animal3D) animal3D.src = url;
    try { localStorage.setItem('animalURL', url); } catch(e){}
    if (editMenu) editMenu.style.display = 'none';
  });
}

if (animalFileInput && animal3D) {
  animalFileInput.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const obj = URL.createObjectURL(f);
      animal3D.src = obj;
      try { localStorage.setItem('animalURL', obj); } catch(e){}
      if (editMenu) editMenu.style.display = 'none';
    } catch (err) { alert('Erreur chargement fichier'); }
  });
}

/* ------------------- dance visual ------------------- */
if (danceBtn && avatar3D) {
  danceBtn.addEventListener('click', () => {
    try {
      avatar3D.style.transition = 'transform 1.6s ease';
      avatar3D.style.transform = 'rotateY(720deg)';
      setTimeout(() => { avatar3D.style.transform = ''; }, 1600);
    } catch (e) {}
  });
}

/* ------------------- Mini-circle draggable + LONG-PRESS handling (cancel on move) ------------------- */
(function setupMiniDragAndLongPress() {
  if (!miniCircle || !miniAvatarImg) return;

  // ensure positioned element
  if (!miniCircle.style.position) miniCircle.style.position = 'fixed';

  let dragging = false;
  let pointerId = null;
  let startX = 0, startY = 0;
  let offsetX = 0, offsetY = 0;
  let longPressTimer = null;
  const MOVE_CANCEL_PX = 10; // if moved more than this, cancel long press

  function startPointer(e) {
    // accept mouse or touch (pointer)
    const isTouch = e.type === 'touchstart';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const rect = miniCircle.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    startX = clientX;
    startY = clientY;
    dragging = true;

    // schedule long-press (only if not moving)
    clearTimeout(longPressTimer);
    longPressTimer = setTimeout(() => {
      // only fire if still dragging and not moved significantly
      if (!dragging) return;
      const dx = Math.abs((startX) - (startX)); // 0 by design— we check movement later in movePointer
      // show confirm reset only if user didn't move (we'll also check lastMoveDistance)
      if (lastMoveDistance < MOVE_CANCEL_PX) {
        if (confirm('Réinitialiser la photo du mini-circle ?')) {
          try { localStorage.removeItem('circlePhoto'); miniAvatarImg.src = DEFAULT_MINI; } catch(e) {}
        }
      }
    }, 700); // 700ms long press

    // prevent default on touch to avoid scrolling interfering
    if (isTouch) e.preventDefault();
  }

  let lastMoveDistance = 0;
  function movePointer(e) {
    if (!dragging) return;
    const isTouch = e.type === 'touchmove';
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    lastMoveDistance = Math.hypot(clientX - startX, clientY - startY);
    // if moved more than threshold, cancel long-press timer
    if (lastMoveDistance > MOVE_CANCEL_PX) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
    let x = clientX - offsetX;
    let y = clientY - offsetY;
    const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
    const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
    x = Math.max(8, Math.min(maxX, x));
    y = Math.max(8, Math.min(maxY, y));
    miniCircle.style.left = x + 'px';
    miniCircle.style.top = y + 'px';
  }

  function endPointer() {
    dragging = false;
    clearTimeout(longPressTimer);
    longPressTimer = null;
    lastMoveDistance = 0;
  }

  // Mouse events
  miniCircle.addEventListener('mousedown', startPointer);
  document.addEventListener('mousemove', movePointer);
  document.addEventListener('mouseup', endPointer);

  // Touch events
  miniCircle.addEventListener('touchstart', startPointer, { passive: false });
  document.addEventListener('touchmove', movePointer, { passive: false });
  document.addEventListener('touchend', endPointer);
})();

/* ------------------- Safety fallback logs ------------------- */
console.log('[profile.js] applied fixes: draggable mini-circle w/ safe long-press, RPM guarded, attach hidden');
