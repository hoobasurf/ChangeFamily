// profile.js — Fix final : mini-circle draggable, supprime attach panel, corrige RPM boucle
// Standalone (pas d'import), prêt pour Netlify / iPhone.

// Safe DOM getter
const $ = id => document.getElementById(id);

// Elements (may be null)
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

// --- Remove/hide any attach-controls UI if present (guarantee no attach window) ---
try {
  const attachPanel = document.getElementById('attachControls') || document.querySelector('.attach-controls');
  if (attachPanel) attachPanel.style.display = 'none';
} catch (e) { /* ignore */ }

// --- INIT : restore mini circle, avatar, animal ---
window.addEventListener('DOMContentLoaded', () => {
  try {
    const circle = (() => { try { return localStorage.getItem('circlePhoto'); } catch (e) { return null; } })();
    const avatarURL = (() => { try { return localStorage.getItem('avatarURL'); } catch (e) { return null; } })();
    const animalURL = (() => { try { return localStorage.getItem('animalURL'); } catch (e) { return null; } })();

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

// --- Edit menu toggle (safe) ---
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

// --- Mini-circle upload & camera ---
if (uploadBtn && uploadPhoto) {
  uploadBtn.addEventListener('click', () => {
    uploadPhoto.click();
    if (editMenu) editMenu.style.display = 'none';
  });

  uploadPhoto.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
        localStorage.setItem('circlePhoto', ev.target.result);
      } catch (err) { console.warn(err); }
    };
    reader.readAsDataURL(f);
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
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
          localStorage.setItem('circlePhoto', ev.target.result);
        } catch (err) {}
      };
      reader.readAsDataURL(f);
    };
    input.click();
    if (editMenu) editMenu.style.display = 'none';
  });
}

// --- Ready Player Me: open only once, protect from loop ---
// We set rpmFrame.src only when user clicks. In message handler we won't set src again.
// We'll accept messages only when rpmModal is open OR data.eventName indicates final exported.
if (createAvatar && rpmModal && rpmFrame) {
  createAvatar.addEventListener('click', () => {
    try {
      // only set src if not already set to avoid reload loops
      if (!rpmFrame.src || rpmFrame.dataset.customOpened !== '1') {
        rpmFrame.src = 'https://iframe.readyplayer.me/avatar?frameApi';
        rpmFrame.dataset.customOpened = '1';
      }
      rpmModal.style.display = 'flex';
      rpmModal.setAttribute('aria-hidden', 'false');
      if (editMenu) editMenu.style.display = 'none';
    } catch (e) { console.warn(e); }
  });
}

// --- message handler (RPM + animal creator) ---
window.addEventListener('message', (event) => {
  if (!event.data) return;
  // try parse if string
  let data = event.data;
  try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch (e) { data = event.data; }

  // Guard: prevent infinite loops by ignoring messages without known keys
  const isRpmExport = data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported';
  const isRpmReady = data?.eventName === 'v1.frame.ready' || data?.name === 'frame-ready';
  const isAnimalReady = (data?.source === 'animalcreator' && (data?.event === 'avatar-ready' || data?.name === 'avatar-ready')) || data?.eventName === 'animal.avatar.exported';

  // Handle RPM exported avatar (final URL)
  if (isRpmExport) {
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if (avatarURL && avatar3D) {
      avatar3D.src = avatarURL;
      try { localStorage.setItem('avatarURL', avatarURL); } catch (e) {}
      const circle = localStorage.getItem('circlePhoto');
      if (!circle && miniAvatarImg) miniAvatarImg.src = avatarURL;
    }
    // close modal and clear src marker (so next time we reload fresh)
    if (rpmModal) rpmModal.style.display = 'none';
    try { rpmFrame.dataset.customOpened = '0'; } catch(e){}
    return;
  }

  // When frame is ready, subscribe once (but only if modal open)
  if (isRpmReady) {
    try {
      // only subscribe if modal is open - avoids subscribing in background messages
      if (rpmModal && rpmModal.style.display === 'flex' && rpmFrame && rpmFrame.contentWindow) {
        rpmFrame.contentWindow.postMessage(JSON.stringify({ target: 'readyplayerme', type: 'subscribe', eventName: 'v1.avatar.exported' }), '*');
      }
    } catch (e) { /* ignore */ }
    return;
  }

  // Handle animal creator exported
  if (isAnimalReady) {
    const url = data.url || data.data?.url || data.avatarUrl || null;
    if (url && animal3D) {
      animal3D.src = url;
      try { localStorage.setItem('animalURL', url); } catch(e){}
    }
    if (animalModal) animalModal.style.display = 'none';
    return;
  }
});

// close rpm modal when clicking outside (and reset dataset so it can be reloaded next time)
if (rpmModal && rpmFrame) {
  rpmModal.addEventListener('click', (e) => {
    if (e.target === rpmModal) {
      rpmModal.style.display = 'none';
      try { rpmFrame.dataset.customOpened = '0'; } catch(e){}
      // do NOT clear rpmFrame.src here to avoid losing immediate postMessage context,
      // but it's safe to clear to free memory if needed:
      // rpmFrame.src = '';
    }
  });
}

// --- load animal by URL/file from edit menu ---
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
      const u = URL.createObjectURL(f);
      animal3D.src = u;
      try { localStorage.setItem('animalURL', u); } catch(e){}
      if (editMenu) editMenu.style.display = 'none';
    } catch (err) { alert('Erreur chargement fichier'); }
  });
}

// --- dance visual ---
if (danceBtn && avatar3D) {
  danceBtn.addEventListener('click', () => {
    try {
      avatar3D.style.transition = 'transform 1.6s ease';
      avatar3D.style.transform = 'rotateY(720deg)';
      setTimeout(() => { avatar3D.style.transform = ''; }, 1600);
    } catch (e) { console.warn(e); }
  });
}

// --- mini-circle draggable (touch + mouse) ---
(function setupMiniDrag() {
  if (!miniCircle) return;
  // ensure position style exists
  miniCircle.style.position = miniCircle.style.position || 'fixed';
  // keep within viewport
  let dragging = false;
  let offsetX = 0, offsetY = 0;

  function start(e) {
    dragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const rect = miniCircle.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    if (e.touches) e.preventDefault();
  }

  function move(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let x = clientX - offsetX;
    let y = clientY - offsetY;
    const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
    const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
    x = Math.max(8, Math.min(maxX, x));
    y = Math.max(8, Math.min(maxY, y));
    miniCircle.style.left = x + 'px';
    miniCircle.style.top = y + 'px';
  }

  function end() { dragging = false; }

  miniCircle.addEventListener('mousedown', start);
  miniCircle.addEventListener('touchstart', start, { passive: false });
  document.addEventListener('mousemove', move);
  document.addEventListener('touchmove', move, { passive: false });
  document.addEventListener('mouseup', end);
  document.addEventListener('touchend', end);
})();

// --- mini-circle quick reset (long press) ---
if (miniCircle && miniAvatarImg) {
  let t;
  miniCircle.addEventListener('touchstart', () => {
    t = setTimeout(() => {
      if (confirm('Réinitialiser la photo du mini-circle ?')) {
        try { localStorage.removeItem('circlePhoto'); miniAvatarImg.src = DEFAULT_MINI; } catch(e){}
      }
    }, 800);
  });
  miniCircle.addEventListener('touchend', () => clearTimeout(t));
  miniCircle.addEventListener('dblclick', () => { if (editMenu) editMenu.style.display = 'flex'; });
}

console.log('[profile.js] fixes applied: mini-circle draggable, attach hidden, RPM loop guarded');
