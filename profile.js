// profile.js - Version corrigée : Création + sous-menus fonctionnels, suppression boutons Modifier/Danser/Creature

const $ = id => document.getElementById(id);

// DOM
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');

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

const creatureContainer = $('creatureContainer');
const previewCreature = $('previewCreature');
const creatureColor = $('creatureColor');
const creatureScale = $('creatureScale');
const creaturePosition = $('creaturePosition');
const applyCreature = $('applyCreature');
const closeCreature = $('closeCreature');


// --- MENU CREER ---
const btnOpenCreate = $('openCreateMenu');
const btnPhoto = $('btnPhoto');
const btnAvatar = $('btnAvatar');
const btnCreature = $('btnCreature');
const menuCreate = $('createMenu');
const menuPhoto = $('menuPhoto');
const menuCreature = $('menuCreature');
const chooseCreatureBtn = $('chooseCreature');
const createCreatureBtn = $('createCreature');
const chooseCreatureMenu = $('chooseCreatureMenu');
const createCreatureMenu = $('createCreatureMenu');

const menus = [menuCreate, menuPhoto, menuCreature, chooseCreatureMenu, createCreatureMenu];

// --- persistence keys ---
const K = {
  CIRCLE: 'circlePhoto',
  AVATAR: 'avatarURL',
  CREATURE: 'creatureState'
};

// --- default models ---
const CREATURE_MODELS = {
  Fox: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb',
  Unicorn: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
  WingedCat: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
  Dragon: 'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb'
};

// ------- INIT PROFILE -------
function initProfile() {
  try {
    const circle = localStorage.getItem(K.CIRCLE);
    if (circle) miniAvatar.src = circle;

    const avatarURL = localStorage.getItem(K.AVATAR);
    if (avatarURL && avatar3D) avatar3D.src = avatarURL;

    const creatureState = JSON.parse(localStorage.getItem(K.CREATURE) || '{}');
    if (creatureState && creatureState.model && creatureContainer) {
      ensureAnimalViewer();
      setCreatureFromState(creatureState);
    }
  } catch(e){ console.warn(e); }
}
initProfile();

function ensureAnimalViewer() {
  if (!document.getElementById('animal3D')) {
    const mv = document.createElement('model-viewer');
    mv.id = 'animal3D';
    mv.setAttribute('camera-controls','');
    mv.setAttribute('auto-rotate','');
    mv.setAttribute('shadow-intensity','1');
    mv.style.width = '180px';
    mv.style.height = '180px';
    creatureContainer.appendChild(mv);
  }
}

// ------- EDIT MENU (photothèque / prendre / avatar) -------
document.addEventListener('click', e => {
  if (editMenu.style.display === 'flex' && !editMenu.contains(e.target)) {
    editMenu.style.display = 'none';
  }
});
closeEdit.addEventListener('click', () => { editMenu.style.display = 'none'; });

photoLib.addEventListener('click', () => hiddenFileChoose.click());
chooseFile.addEventListener('click', () => hiddenFile.click());
hiddenFileChoose.addEventListener('change', onChooseFile);
hiddenFile.addEventListener('change', onChooseFile);

function onChooseFile(e){
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    miniAvatar.src = ev.target.result;
    localStorage.setItem(K.CIRCLE, ev.target.result);
    editMenu.style.display = 'none';
  };
  reader.readAsDataURL(f);
}

// take photo
takePhoto.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment';
  input.onchange = onChooseFile;
  input.click();
  editMenu.style.display = 'none';
});

// ------- RPM (Avatar) -------
const RPM_URL = 'https://iframe.readyplayer.me/avatar?frameApi';

createAvatar.addEventListener('click', () => {
  rpmModal.style.display = 'flex';
  rpmModal.setAttribute('aria-hidden','false');
  if (!rpmFrame.src) rpmFrame.src = RPM_URL;
});

closeRpm.addEventListener('click', () => { rpmModal.style.display = 'none'; rpmFrame.src=''; });
rpmModal.addEventListener('click', e => { if(e.target===rpmModal){ rpmModal.style.display='none'; rpmFrame.src=''; } });

window.addEventListener('message', e => {
  if(!e.data) return;
  let data = e.data;
  try{ data = (typeof e.data==='string') ? JSON.parse(e.data) : e.data; } catch{}
  if(data?.eventName==='v1.avatar.exported'||data?.name==='avatar-exported'){
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if(avatarURL && avatar3D){
      avatar3D.src = avatarURL;
      localStorage.setItem(K.AVATAR, avatarURL);
      if(!localStorage.getItem(K.CIRCLE)) miniAvatar.src = avatarURL;
    }
    rpmModal.style.display='none'; rpmFrame.src='';
  }
  if(data?.eventName==='v1.frame.ready'||data?.name==='frame-ready'){
    try{
      rpmFrame.contentWindow.postMessage(JSON.stringify({target:'readyplayerme',type:'subscribe',eventName:'v1.avatar.exported'}),'*');
    }catch{}
  }
});

// ------- MINI-CIRCLE DRAG -------
(function(){
  let dragging=false, offsetX=0, offsetY=0;
  function start(e){ dragging=true; const p=(e.touches&&e.touches[0])||e; const rect=miniCircle.getBoundingClientRect(); offsetX=p.clientX-rect.left; offsetY=p.clientY-rect.top; if(e.touches) e.preventDefault();}
  function move(e){ if(!dragging) return; const p=(e.touches&&e.touches[0])||e; let x=p.clientX-offsetX; let y=p.clientY-offsetY; const maxX=window.innerWidth-miniCircle.offsetWidth-8; const maxY=window.innerHeight-miniCircle.offsetHeight-8; x=Math.max(8,Math.min(maxX,x)); y=Math.max(8,Math.min(maxY,y)); miniCircle.style.left=x+'px'; miniCircle.style.top=y+'px';}
  function end(){ dragging=false; }
  miniCircle.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  miniCircle.addEventListener('touchstart', start,{passive:false});
  document.addEventListener('touchmove', move,{passive:false});
  document.addEventListener('touchend', end);
})();

// ------- CREATURE -------
applyCreature.addEventListener('click',()=>{
  const model=previewCreature.dataset.model||CREATURE_MODELS.Fox;
  const scale=parseFloat(creatureScale.value||'1');
  const pos=creaturePosition.value||'shoulder';
  ensureAnimalViewer();
  const animal=document.getElementById('animal3D');
  animal.src=model;
  animal.style.transform=`scale(${scale})`;
  setCreaturePosition(pos,animal,scale);
  const state={model,scale,position:pos,color:creatureColor.value||'#ff69b4'};
  localStorage.setItem(K.CREATURE,JSON.stringify(state));
});

closeCreature.addEventListener('click',()=>{
  createCreatureMenu.classList.add('hidden');
  chooseCreatureMenu.classList.add('hidden');
});

// --- SET CREATURE STATE ---
function setCreatureFromState(state){
  ensureAnimalViewer();
  const animal=document.getElementById('animal3D');
  animal.src=state.model;
  animal.style.transform=`scale(${state.scale||1})`;
  setCreaturePosition(state.position||'side',animal,state.scale||1);
}

// --- POSITION CREATURE ---
function setCreaturePosition(position, animalEl, scale=1){
  const c=creatureContainer;
  if(!c||!animalEl) return;
  c.style.position='absolute';
  c.style.transition='transform 220ms ease,bottom 220ms ease';
  switch(position){
    case'shoulder':c.style.left='60%';c.style.bottom='40%';animalEl.style.transform=`translateX(-20px) scale(${scale})`;break;
    case'hand':c.style.left='70%';c.style.bottom='18%';animalEl.style.transform=`translateX(0) scale(${scale})`;break;
    case'side':c.style.left='10%';c.style.bottom='20%';animalEl.style.transform=`translateX(0) scale(${scale})`;break;
    case'ride':c.style.left='50%';c.style.bottom='50%';animalEl.style.transform=`translateX(0) scale(${scale})`;break;
    default:c.style.left='65%';c.style.bottom='20%';
  }
}

// ------- BOUTON CREER ET MENUS -------
function closeAllMenus(){menus.forEach(m=>m.classList.add('hidden'));}
function openMenu(menuEl){closeAllMenus();menuEl.classList.remove('hidden');}

btnOpenCreate.onclick = e=>{ e.stopPropagation(); openMenu(menuCreate);};
btnPhoto.onclick = e=>{ e.stopPropagation(); openMenu(menuPhoto);};
btnAvatar.onclick = e=>{ e.stopPropagation(); openMenu(menuPhoto);}; // placeholder
btnCreature.onclick = e=>{ e.stopPropagation(); openMenu(menuCreature);};
chooseCreatureBtn.onclick = e=>{ e.stopPropagation(); openMenu(chooseCreatureMenu);};
createCreatureBtn.onclick = e=>{ e.stopPropagation(); openMenu(createCreatureMenu);};

// prevent closing when clicking inside menu
menus.forEach(m=>{m.onclick=e=>e.stopPropagation();});

// close when clicking outside
document.body.onclick = ()=>closeAllMenus();

// ESC closes menus
document.addEventListener('keydown', e=>{if(e.key==='Escape') closeAllMenus();});
