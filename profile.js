// profile.js (complet)
// helper
const $ = id => document.getElementById(id);

// éléments importants
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');
const pseudoInput = $('pseudoInput');

const openCreate = $('openCreateMenu');
const createMenu = $('createMenu');
const btnPhoto = $('btnPhoto');
const btnAvatar = $('btnAvatar');
const btnCreature = $('btnCreature');

const menuPhoto = $('menuPhoto');
const hiddenFileChoose = $('hiddenFileChoose');
const hiddenFile = $('hiddenFile');

const chooseCreatureMenu = $('chooseCreatureMenu');
const createCreatureMenu = $('createCreatureMenu');
const validateCreature = $('validateCreature');

const positionMenu = $('positionMenu');

const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const closeRpm = $('closeRpm');

const avatar3D = $('avatar3D');
const animal3D = $('animal3D');

// --- mini-circle draggable (touch + mouse)
(function(){
  if(!miniCircle) return;
  let dragging=false, offX=0, offY=0;
  function start(e){
    dragging=true;
    const p = e.touches ? e.touches[0] : e;
    const r = miniCircle.getBoundingClientRect();
    offX = p.clientX - r.left;
    offY = p.clientY - r.top;
    if(e.touches) e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    let x = p.clientX - offX;
    let y = p.clientY - offY;
    x = Math.max(8, Math.min(window.innerWidth - miniCircle.offsetWidth - 8, x));
    y = Math.max(8, Math.min(window.innerHeight - miniCircle.offsetHeight - 8, y));
    miniCircle.style.left = x + 'px';
    miniCircle.style.top = y + 'px';
  }
  function end(){ dragging=false; }
  miniCircle.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  miniCircle.addEventListener('touchstart', start, {passive:false});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end);
})();

// --- pseudo
if(pseudoInput){
  const saved = localStorage.getItem('pseudo');
  if(saved) pseudoInput.value = saved;
  pseudoInput.addEventListener('change', ()=> localStorage.setItem('pseudo', pseudoInput.value));
}

// --- load saved mini avatar + models
(function initSaved(){
  const savedMini = localStorage.getItem('circlePhoto');
  const savedAvatar = localStorage.getItem('avatarURL');
  const savedCreature = localStorage.getItem('creatureURL');
  const savedPosition = localStorage.getItem('creaturePosition') || 'shoulder';

  if(savedMini) miniAvatar.src = savedMini;
  if(savedAvatar) avatar3D.src = savedAvatar;
  if(savedCreature) {
    animal3D.src = savedCreature;
    applyCreaturePosition(savedPosition);
  } else {
    // default test model
    animal3D.src = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";
    applyCreaturePosition(savedPosition);
  }
})();

// --- menus utilities
const allPopups = [createMenu, menuPhoto, chooseCreatureMenu, createCreatureMenu, positionMenu, rpmModal].filter(Boolean);

function closeAll(){
  allPopups.forEach(p => p.classList.add('hidden'));
}
allPopups.forEach(p => p.addEventListener('click', e => e.stopPropagation()));
document.body.addEventListener('click', closeAll);

// --- open create
openCreate.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  createMenu.classList.toggle('hidden');
});

// --- Photo menu
btnPhoto.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  menuPhoto.classList.remove('hidden');
});
$('photoLib').addEventListener('click', ()=> hiddenFileChoose.click());
$('takePhoto').addEventListener('click', ()=> hiddenFile.click());

hiddenFileChoose.addEventListener('change', onChooseFile);
hiddenFile.addEventListener('change', onChooseFile);

function onChooseFile(e){
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    miniAvatar.src = ev.target.result;
    localStorage.setItem('circlePhoto', ev.target.result);
    closeAll();
  };
  reader.readAsDataURL(f);
}

// --- Avatar (Ready Player Me)
btnAvatar.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  rpmModal.classList.remove('hidden');
  if(!rpmFrame.src) rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
});

closeRpm.addEventListener('click', () => {
  rpmModal.classList.add('hidden');
  try { rpmFrame.src = ""; } catch(e){}
});

// listen messages from RPM
window.addEventListener('message', (event)=>{
  if(!event.data) return;
  let data = event.data;
  try { data = typeof data === 'string' ? JSON.parse(data) : data; } catch(e){}
  if(data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported'){
    const url = data.data?.url || data.url || data.avatarUrl;
    if(url){
      avatar3D.src = url;
      localStorage.setItem('avatarURL', url);
    }
    rpmModal.classList.add('hidden');
    try { rpmFrame.src = ""; } catch(e){}
  }
  if(data?.eventName === 'v1.frame.ready'){
    // subscribe to avatar exported (safe)
    if(rpmFrame && rpmFrame.contentWindow){
      rpmFrame.contentWindow.postMessage(JSON.stringify({
        target:'readyplayerme',
        type:'subscribe',
        eventName:'v1.avatar.exported'
      }),'*');
    }
  }
});

// --- Creature menu
btnCreature.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  chooseCreatureMenu.classList.remove('hidden');
});

// choose creature buttons (data-url or blank => will prompt input)
document.querySelectorAll('#chooseCreatureMenu .creature-btn').forEach(b=>{
  b.addEventListener('click', ()=>{
    const url = b.dataset.url;
    if(url && url.length>0){
      setCreature(url, b.dataset.name);
      closeAll();
      return;
    }
    // prompt user to paste GLB url (for copyrighted characters)
    const paste = prompt(`Colle le lien .glb pour "${b.dataset.name}" (héberge ton .glb et colle l'URL)`);
    if(paste && paste.trim()){
      setCreature(paste.trim(), b.dataset.name);
      closeAll();
    }
  });
});

// create creature (simple fake)
validateCreature.addEventListener('click', ()=>{
  // for demo just set a test model then close
  const color = $('colorCreature').value;
  const size = $('sizeCreature').value;
  const chosen = "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb";
  setCreature(chosen, 'Creature custom');
  closeAll();
});

// position menu trigger
$('btnCreature').addEventListener('click', (e)=>{
  // already opens chooseCreatureMenu; also offer position selector
  positionMenu.classList.remove('hidden');
});

// apply creature into the scene
function setCreature(url, name){
  // reset src to avoid viewer caching glitch
  animal3D.src = "";
  setTimeout(()=> { animal3D.src = url; }, 60);
  localStorage.setItem('creatureURL', url);
  // default position = shoulder
  applyCreaturePosition(localStorage.getItem('creaturePosition') || 'shoulder');
}

// position control
document.querySelectorAll('input[name="position"]').forEach(r=>{
  r.addEventListener('change', ()=> {
    applyCreaturePosition(r.value);
    localStorage.setItem('creaturePosition', r.value);
  });
});

function applyCreaturePosition(pos){
  // we fake attachment by CSS transform on #animal3D
  animal3D.style.transition = 'transform 300ms ease';
  if(pos === 'shoulder'){
    animal3D.style.transform = 'translate(60px,-80px) scale(0.9) rotateY(0deg)';
    animal3D.style.left = '55%';
    animal3D.style.bottom = '130px';
    animal3D.style.position = 'absolute';
  } else if(pos === 'hand'){
    animal3D.style.transform = 'translate(30px,-120px) scale(0.7) rotateY(10deg)';
    animal3D.style.left = '60%';
    animal3D.style.bottom = '100px';
    animal3D.style.position = 'absolute';
  } else if(pos === 'mount'){
    animal3D.style.transform = 'translate(-20px,-60px) scale(1.4) rotateY(0deg)';
    animal3D.style.left = '50%';
    animal3D.style.bottom = '30px';
    animal3D.style.position = 'absolute';
  }
}

// allow user to enter direct URL for a creature (optional)
function askAndSetCreature(){
  const url = prompt("Colle l'URL publique .glb de la créature :");
  if(url) setCreature(url, 'Custom');
}

// keyboard escape closes modals
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeAll();
});
