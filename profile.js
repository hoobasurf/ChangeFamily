// profile.js — revert fix: remove attach panel, restore mini-circle & avatar + animal viewer
// SAFE, standalone (no module imports) — keeps Ready Player Me and upload/take photo features.

// safe getter
const $ = id => document.getElementById(id);

// DOM elements (may be null if not present in your HTML)
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
const miniAvatarImg = $('miniAvatarImg');
const miniCircle = $('miniCircle');
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

// ---------- initial load ----------
window.addEventListener('DOMContentLoaded', () => {
  try {
    // pseudo
    const pseudo = localStorage.getItem('pseudo');
    if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;

    // mini circle image priority: circlePhoto -> avatarURL -> default
    const circlePhoto = localStorage.getItem('circlePhoto');
    const avatarURL = localStorage.getItem('avatarURL');
    const animalURL = localStorage.getItem('animalURL');

    if (miniAvatarImg) {
      if (circlePhoto) miniAvatarImg.src = circlePhoto;
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

// ---------- menu toggle ----------
if (editBtn && editMenu) {
  editBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const visible = editMenu.style.display === 'flex';
    editMenu.style.display = visible ? 'none' : 'flex';
  });
  document.addEventListener('click', (e) => {
    if (editMenu && editMenu.style.display === 'flex') {
      if (!editMenu.contains(e.target) && e.target !== editBtn) {
        editMenu.style.display = 'none';
      }
    }
  });
  if (closeMenu) closeMenu.addEventListener('click', ()=> { if (editMenu) editMenu.style.display = 'none'; });
}

// ---------- mini-circle upload & camera ----------
if (uploadBtn && uploadPhoto) {
  uploadBtn.addEventListener('click', () => {
    uploadPhoto.click();
    if (editMenu) editMenu.style.display = 'none';
  });
  uploadPhoto.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
        localStorage.setItem('circlePhoto', ev.target.result);
      } catch (err) { console.warn(err); }
    };
    reader.readAsDataURL(file);
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
        try {
          if (miniAvatarImg) miniAvatarImg.src = ev.target.result;
          localStorage.setItem('circlePhoto', ev.target.result);
        } catch (err) {}
      };
      r.readAsDataURL(f);
    };
    input.click();
    if (editMenu) editMenu.style.display = 'none';
  });
}

// ---------- Ready Player Me integration ----------
if (createAvatar && rpmModal && rpmFrame) {
  createAvatar.addEventListener('click', () => {
    rpmModal.style.display = 'flex';
    rpmModal.setAttribute('aria-hidden', 'false');
    // use iframe readyplayer me with frameApi
    rpmFrame.src = 'https://iframe.readyplayer.me/avatar?frameApi';
    if (editMenu) editMenu.style.display = 'none';
  });
}

// handle messages from iframes (RPM + animal creator)
window.addEventListener('message', (event) => {
  if (!event.data) return;
  let data = event.data;
  try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch(e) { data = event.data; }

  // Ready Player Me exported avatar
  try {
    if (data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported') {
      const avatarURL = data.data?.url || data.url || data.avatarUrl;
      if (avatarURL && avatar3D) {
        avatar3D.src = avatarURL;
        try { localStorage.setItem('avatarURL', avatarURL); } catch(e) {}
        const circle = localStorage.getItem('circlePhoto');
        if (!circle && miniAvatarImg) miniAvatarImg.src = avatarURL;
      }
      if (rpmModal) { rpmModal.style.display = 'none'; rpmModal.setAttribute('aria-hidden','true'); rpmFrame.src = ''; }
      return;
    }
  } catch(e){}

  // animal creator (various formats)
  try {
    if ((data?.source === 'animalcreator' && (data?.event === 'avatar-ready' || data?.name === 'avatar-ready')) || data?.eventName === 'animal.avatar.exported') {
      const url = data.url || data.data?.url || data.avatarUrl || data.url;
      if (url && animal3D) {
        animal3D.src = url;
        try { localStorage.setItem('animalURL', url); } catch(e) {}
      }
      if (animalModal) animalModal.style.display = 'none';
      return;
    }
  } catch(e) {}
});

// close rpm modal when clicking outside
if (rpmModal) {
  rpmModal.addEventListener('click', (e) => {
    if (e.target === rpmModal) {
      rpmModal.style.display = 'none';
      if (rpmFrame) rpmFrame.src = '';
    }
  });
}

// ---------- load animal by URL or file from the edit menu ----------
if (loadAnimalUrl && animalUrlInput) {
  loadAnimalUrl.addEventListener('click', () => {
    const url = (animalUrlInput.value || '').trim();
    if (!url) { alert('Colle une URL .glb valide'); return; }
    if (animal3D) animal3D.src = url;
    try { localStorage.setItem('animalURL', url); } catch(e) {}
    if (editMenu) editMenu.style.display = 'none';
  });
}

if (animalFileInput && animal3D) {
  animalFileInput.addEventListener('change', (e)=> {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    try {
      const objectUrl = URL.createObjectURL(f);
      animal3D.src = objectUrl;
      try { localStorage.setItem('animalURL', objectUrl); } catch(e) {}
      if (editMenu) editMenu.style.display = 'none';
    } catch(err) {
      alert('Erreur chargement fichier');
    }
  });
}

// ---------- dance (visual) ----------
if (danceBtn && avatar3D) {
  danceBtn.addEventListener('click', () => {
    try {
      avatar3D.style.transition = 'transform 1.6s ease';
      avatar3D.style.transform = 'rotateY(720deg)';
      setTimeout(()=> { avatar3D.style.transform = ''; }, 1600);
    } catch(e) {}
  });
}

// ---------- mini-circle quick reset helper ----------
if (miniCircle && miniAvatarImg) {
  let t;
  miniCircle.addEventListener('touchstart', () => {
    t = setTimeout(()=> {
      if (confirm('Réinitialiser la photo du mini-circle ?')) {
        try { localStorage.removeItem('circlePhoto'); miniAvatarImg.src = DEFAULT_MINI; } catch(e){}
      }
    }, 800);
  });
  miniCircle.addEventListener('touchend', () => { clearTimeout(t); });
  miniCircle.addEventListener('dblclick', ()=> { if (editMenu) editMenu.style.display = 'flex'; });
}

// safety log
console.log('[profile.js] loaded — attach-controls removed, mini-circle & avatar restored');
