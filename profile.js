// profile.js (module complet — remplace ton profile.js par celui-ci)
// ATTENTION : ce fichier suppose que creature-list.js est dans le même dossier
import { realistic, fantasy } from "./creature-list.js";

// helper rapide
const $ = id => document.getElementById(id);

// DOM
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

// safety checks
if (!miniCircle || !miniAvatar) console.warn("miniCircle or miniAvatar missing");

// ========== mini-circle draggable ==========
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

// ========== pseudo ==========
if(pseudoInput){
  const saved = localStorage.getItem('pseudo');
  if(saved) pseudoInput.value = saved;
  pseudoInput.addEventListener('change', ()=> localStorage.setItem('pseudo', pseudoInput.value));
}

// ========== load saved models & mini photo ==========
(function initSaved(){
  const savedMini = localStorage.getItem('circlePhoto');
  const savedAvatar = localStorage.getItem('avatarURL');
  const savedCreature = localStorage.getItem('creatureURL');
  const savedPosition = localStorage.getItem('creaturePosition') || 'shoulder';

  if(savedMini) miniAvatar.src = savedMini;
  if(savedAvatar && avatar3D) avatar3D.src = savedAvatar;
  if(savedCreature && animal3D) {
    animal3D.src = savedCreature;
    applyCreaturePosition(savedPosition);
  } else if(animal3D) {
    // default guest model
    animal3D.src = "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";
    applyCreaturePosition(savedPosition);
  }
})();

// ========== menus utilities ==========
const allPopups = [createMenu, menuPhoto, chooseCreatureMenu, createCreatureMenu, positionMenu, rpmModal].filter(Boolean);
function closeAll(){ allPopups.forEach(p => p.classList.add('hidden')); }
allPopups.forEach(p => p && p.addEventListener('click', e => e.stopPropagation()));
document.body.addEventListener('click', closeAll);

// open/create menu
openCreate.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  createMenu.classList.toggle('hidden');
});

// --- Photo menu wiring
btnPhoto.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  menuPhoto.classList.remove('hidden');
});
if($('photoLib')) $('photoLib').addEventListener('click', ()=> hiddenFileChoose.click());
if($('takePhoto')) $('takePhoto').addEventListener('click', ()=> hiddenFile.click());

if(hiddenFileChoose) hiddenFileChoose.addEventListener('change', onChooseFile);
if(hiddenFile) hiddenFile.addEventListener('change', onChooseFile);

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

// --- Avatar (Ready Player Me) wiring
btnAvatar.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  rpmModal.classList.remove('hidden');
  if(!rpmFrame.src) rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
});

if(closeRpm) closeRpm.addEventListener('click', () => {
  rpmModal.classList.add('hidden');
  try { rpmFrame.src = ""; } catch(e){}
});

// RPM message listener
window.addEventListener('message', (event)=>{
  if(!event.data) return;
  let data = event.data;
  try { data = typeof data === 'string' ? JSON.parse(data) : data; } catch(e){}
  // avatar exported
  if(data?.eventName === 'v1.avatar.exported' || data?.name === 'avatar-exported'){
    const url = data.data?.url || data.url || data.avatarUrl;
    if(url && avatar3D){
      avatar3D.src = url;
      localStorage.setItem('avatarURL', url);
    }
    rpmModal.classList.add('hidden');
    try { rpmFrame.src = ""; } catch(e){}
  }
  // frame ready -> subscribe
  if(data?.eventName === 'v1.frame.ready'){
    if(rpmFrame && rpmFrame.contentWindow){
      rpmFrame.contentWindow.postMessage(JSON.stringify({
        target:'readyplayerme',
        type:'subscribe',
        eventName:'v1.avatar.exported'
      }),'*');
    }
  }
});

// ========== Creature menu build (utilise creature-list.js) ==========
function buildCreatureMenu(){
  // clear content
  chooseCreatureMenu.innerHTML = '';
  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.marginBottom = '8px';
  title.textContent = 'Choisir une créature';
  chooseCreatureMenu.appendChild(title);

  const sectionReal = document.createElement('div');
  const lblR = document.createElement('div'); lblR.textContent = 'Réaliste'; lblR.style.marginTop = '6px';
  sectionReal.appendChild(lblR);

  const rowR = document.createElement('div'); rowR.className = 'pill-row';
  realistic.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = item.name;
    btn.onclick = () => {
      if(!item.url || item.url.length===0) return alert('URL manquante pour ' + item.name);
      setCreature(item.url, item.name);
      closeAll();
    };
    rowR.appendChild(btn);
  });
  sectionReal.appendChild(rowR);
  chooseCreatureMenu.appendChild(sectionReal);

  const sectionF = document.createElement('div');
  const lblF = document.createElement('div'); lblF.textContent = 'Fantaisie'; lblF.style.marginTop = '12px';
  sectionF.appendChild(lblF);
  const rowF = document.createElement('div'); rowF.className = 'pill-row';
  fantasy.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = item.name;
    btn.onclick = () => {
      if(!item.url || item.url.length===0) return alert('URL manquante pour ' + item.name);
      setCreature(item.url, item.name);
      closeAll();
    };
    rowF.appendChild(btn);
  });
  sectionF.appendChild(rowF);
  chooseCreatureMenu.appendChild(sectionF);

  // allow custom URL at bottom
  const customRow = document.createElement('div');
  customRow.style.marginTop = '12px';
  const customBtn = document.createElement('button');
  customBtn.className = 'pill';
  customBtn.textContent = 'Coller URL .glb';
  customBtn.onclick = () => {
    const url = prompt('Colle une URL publique .glb :');
    if(url) { setCreature(url, 'Custom'); closeAll(); }
  };
  customRow.appendChild(customBtn);
  chooseCreatureMenu.appendChild(customRow);
}
buildCreatureMenu();

// --- open creature menu action
btnCreature.addEventListener('click', (e)=>{
  e.stopPropagation();
  closeAll();
  chooseCreatureMenu.classList.remove('hidden');
});

// ========== setCreature & position ==========
function setCreature(url, name){
  if(!animal3D) return;
  // reset then set to avoid caching glitches
  animal3D.src = "";
  setTimeout(()=> {
    animal3D.src = url;
  }, 60);
  localStorage.setItem('creatureURL', url);
  // default attach position (shoulder)
  applyCreaturePosition(localStorage.getItem('creaturePosition') || 'shoulder');
}

// position radio wiring (if you have radio inputs with name="position")
const posRadios = document.querySelectorAll('input[name="position"]');
posRadios.forEach(r=>{
  r.addEventListener('change', ()=> {
    applyCreaturePosition(r.value);
    localStorage.setItem('creaturePosition', r.value);
  });
});

function applyCreaturePosition(pos){
  if(!animal3D) return;
  animal3D.style.transition = 'transform 300ms ease';
  // these CSS transforms approximate attachment; ajuste selon ton layout
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

// ========== small helpers & keyboard escape ==========
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeAll();
});
