// profile.js (remplace intégralement l'ancien)
// utilities
const $ = id => document.getElementById(id);

// --- Mini-circle draggable (inchangé, responsive) ---
(function(){
  const mini = $('miniCircle');
  if (!mini) return;
  let dragging=false, offsetX=0, offsetY=0;
  function start(e){
    dragging=true;
    const p = e.touches ? e.touches[0] : e;
    const rect = mini.getBoundingClientRect();
    offsetX = p.clientX - rect.left;
    offsetY = p.clientY - rect.top;
    if (e.touches) e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    let x = p.clientX - offsetX;
    let y = p.clientY - offsetY;
    x = Math.max(0, Math.min(window.innerWidth - mini.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - mini.offsetHeight, y));
    mini.style.left = x + 'px';
    mini.style.top = y + 'px';
  }
  function end(){ dragging = false; }
  mini.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  mini.addEventListener('touchstart', start, {passive:false});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end);
})();

// --- elements safely ---
const ids = [
  'miniAvatar','pseudoInput',
  'openCreateMenu','createMenu','menuPhoto','menuCreature',
  'chooseCreatureMenu','createCreatureMenu','rpmModal','rpmFrame','closeRpm',
  'btnPhoto','btnAvatar','btnCreature','photoLib','takePhoto','hiddenFile','hiddenFileChoose',
  'chooseCreature','createCreature','validateCreature','colorCreature','sizeCreature',
  'avatar3D','animal3D'
];
const E = {};
ids.forEach(id=>{ E[id]=$(id); });

// --- load persisted data (pseudo / circle photo / avatar / creature) ---
window.addEventListener('DOMContentLoaded', () => {
  try {
    if (E.pseudoInput && localStorage.getItem('pseudo')) {
      E.pseudoInput.value = localStorage.getItem('pseudo');
    }
    const circle = localStorage.getItem('circlePhoto');
    if (E.miniAvatar) E.miniAvatar.src = circle || 'default.jpg';

    const avatarURL = localStorage.getItem('avatarURL');
    if (E.avatar3D && avatarURL) E.avatar3D.src = avatarURL;

    const animalURL = localStorage.getItem('animalURL');
    if (E.animal3D && animalURL) {
      E.animal3D.src = animalURL;
      // optional size from storage
      const animalSize = localStorage.getItem('animalSize') || 'Moyenne';
      applyCreatureSize(E.animal3D, animalSize);
    }
  } catch (err) {
    console.warn('load error', err);
  }
});

// --- pseudo save ---
if (E.pseudoInput) {
  E.pseudoInput.addEventListener('change', () => {
    localStorage.setItem('pseudo', E.pseudoInput.value || '');
  });
}

// --- menu helpers ---
const menus = [
  E.createMenu, E.menuPhoto, E.menuCreature,
  E.chooseCreatureMenu, E.createCreatureMenu, E.rpmModal
].filter(Boolean);

function closeAll() { menus.forEach(m=>m.classList && m.classList.add('hidden')); }
function openMenu(m){ closeAll(); if (m && m.classList) m.classList.remove('hidden'); }

// stop propagation for internal clicks
menus.forEach(m=>{
  if(!m) return;
  m.addEventListener('click', e=>e.stopPropagation());
});

// global close on body click (will close menus)
document.body.addEventListener('click', closeAll);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

// --- create button open ---
if (E.openCreateMenu) {
  E.openCreateMenu.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(E.createMenu);
  });
}

// --- sub menu buttons ---
if (E.btnPhoto) {
  E.btnPhoto.addEventListener('click', e => { e.stopPropagation(); openMenu(E.menuPhoto); });
}
if (E.btnAvatar) {
  E.btnAvatar.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(E.rpmModal);
    // set src lazily only if needed
    if (E.rpmFrame && !E.rpmFrame.src) E.rpmFrame.src = 'https://iframe.readyplayer.me/avatar?frameApi';
  });
}
if (E.btnCreature) {
  E.btnCreature.addEventListener('click', e => { e.stopPropagation(); openMenu(E.menuCreature); });
}

// --- PHOTO: choose file (mini-circle) ---
function onChooseFile(e){
  const f = (e.target && e.target.files && e.target.files[0]) || null;
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    if (E.miniAvatar) E.miniAvatar.src = ev.target.result;
    try { localStorage.setItem('circlePhoto', ev.target.result); } catch {}
    closeAll();
  };
  reader.readAsDataURL(f);
}
if (E.photoLib) E.photoLib.addEventListener('click', e => { e.stopPropagation(); (E.hiddenFileChoose || E.hiddenFile || createHidden('hiddenFileChoose')).click(); });
if (E.takePhoto) E.takePhoto.addEventListener('click', e=>{
  e.stopPropagation();
  // create capture input to open camera
  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/*'; input.capture = 'environment';
  input.onchange = onChooseFile;
  input.click();
});

// hook both hidden inputs if present
if (E.hiddenFile) E.hiddenFile.addEventListener('change', onChooseFile);
if (E.hiddenFileChoose) E.hiddenFileChoose.addEventListener('change', onChooseFile);

// helper to ensure element exists (if HTML missing)
function createHidden(id){
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('input');
    el.type = 'file'; el.accept='image/*'; el.style.display='none'; el.id = id;
    document.body.appendChild(el);
    el.addEventListener('change', onChooseFile);
  }
  return el;
}

// --- RPM modal close button ---
if (E.closeRpm) {
  E.closeRpm.addEventListener('click', e=>{ e.stopPropagation(); if (E.rpmModal) E.rpmModal.classList.add('hidden'); if (E.rpmFrame) { E.rpmFrame.src=''; } });
}

// --- message from Ready Player Me iframe ---
window.addEventListener('message', event => {
  if (!event.data) return;
  let data = event.data;
  try { data = (typeof data === 'string') ? JSON.parse(data) : data; } catch(e){}
  // handle RPM exported
  if (data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported') {
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if (avatarURL && E.avatar3D) {
      E.avatar3D.src = avatarURL;
      try { localStorage.setItem('avatarURL', avatarURL); } catch {}
    }
    if (E.rpmModal) E.rpmModal.classList.add('hidden');
    if (E.rpmFrame) E.rpmFrame.src = '';
  }
});

// --- CHOOSE CREATURE menu: pick one of presets ---
const presetModels = {
  'Licorne': 'https://models.babylonjs.com/horse.glb',       // placeholder public GLB (replace)
  'Dragon': 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/AntiqueCamera/glTF/AntiqueCamera.gltf', // placeholder
  'ChatAile': 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb'
};
// attach listeners for preset buttons inside chooseCreatureMenu
if (E.chooseCreatureMenu) {
  E.chooseCreatureMenu.querySelectorAll('button[data-creature]').forEach(btn=>{
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const key = btn.getAttribute('data-creature');
      const model = presetModels[key] || null;
      if (model && E.animal3D) {
        E.animal3D.src = model;
        try { localStorage.setItem('animalURL', model); localStorage.setItem('animalName', key); } catch {}
        // apply default size medium
        applyCreatureSize(E.animal3D, localStorage.getItem('animalSize') || 'Moyenne');
      }
      closeAll();
    });
  });
}

// --- CREATE CREATURE menu: custom color + size + validation ---
if (E.validateCreature) {
  E.validateCreature.addEventListener('click', e=>{
    e.stopPropagation();
    const col = (E.colorCreature && E.colorCreature.value) || '#ff66ff';
    const size = (E.sizeCreature && E.sizeCreature.value) || 'Moyenne';
    // create a tiny procedural placeholder: we'll use a simple colored sphere GLB replacement — as placeholder we store the color/size metadata
    // For now we don't generate real 3D on client; we store metadata and show an illustrative default model.
    const placeholder = presetModels['ChatAile'] || null;
    if (placeholder && E.animal3D) {
      E.animal3D.style.filter = `drop-shadow(0 0 10px ${col})`;
      E.animal3D.src = placeholder;
      try { localStorage.setItem('animalURL', placeholder); localStorage.setItem('animalColor', col); localStorage.setItem('animalSize', size); } catch {}
    }
    closeAll();
  });
}

// helper to apply creature size (scale) — simple transforms on model-viewer element
function applyCreatureSize(el, sizeText){
  if(!el) return;
  // resets
  el.style.width='';
  el.style.height='';
  el.style.transform='';
  if(sizeText === 'Petite'){
    el.style.width = '120px'; el.style.height = '120px';
  } else if(sizeText === 'Moyenne'){
    el.style.width = '180px'; el.style.height = '180px';
  } else if(sizeText === 'Grande'){
    el.style.width = '260px'; el.style.height = '260px';
  }
}

// --- createCreature opens createCreatureMenu ---
if (E.createCreature) {
  E.createCreature.addEventListener('click', e=>{ e.stopPropagation(); openMenu(E.createCreatureMenu); });
}

// --- ensure menu elements stopPropagation so clicking buttons doesn't bubble to body (which closes) ---
['createMenu','menuPhoto','menuCreature','chooseCreatureMenu','createCreatureMenu','rpmModal'].forEach(id=>{
  const el = $(id);
  if (el) el.addEventListener('click', e=>e.stopPropagation());
});

// --- small safety: if hidden file inputs missing, create them so file pick works ---
createHidden('hiddenFile');
createHidden('hiddenFileChoose');

// --- quick debug helper (optional) ---
console.log('[profile.js] loaded: menus ready, photo / avatar / creature handlers attached');
