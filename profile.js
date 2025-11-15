// profile.js - gestion profil + avatar + créature + mini-circle
const $ = id => document.getElementById(id);

// --- Constantes ---
const menusIds = ['createMenu','menuPhoto','menuCreature','chooseCreatureMenu','createCreatureMenu','rpmModal'];
const menus = menusIds.map($);
const K = { CIRCLE:'circlePhoto', AVATAR:'avatarURL', CREATURE:'creatureState' };
const CREATURE_MODELS = {
  'Licorne':'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/CesiumMilkTruck/glTF-Binary/CesiumMilkTruck.glb',
  'Dragon':'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
  'Chat ailé':'https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb'
};

// --- Helper ---
function closeAll(){ menus.forEach(m=>m.classList.add('hidden')) }
function openMenu(m){ closeAll(); m.classList.remove('hidden') }

// --- INIT LOAD ---
function initProfile(){
  try {
    const circle = localStorage.getItem(K.CIRCLE);
    if(circle) $('miniAvatar').src = circle;

    const avatarURL = localStorage.getItem(K.AVATAR);
    if(avatarURL) $('avatar3D').src = avatarURL;

    const creatureState = JSON.parse(localStorage.getItem(K.CREATURE)||'{}');
    if(creatureState && creatureState.model){
      ensureAnimalViewer();
      setCreatureFromState(creatureState);
    }
  } catch(e){ console.warn(e); }
}
initProfile();

// --- Animal viewer ---
function ensureAnimalViewer(){
  if(!$('animal3D')){
    const mv = document.createElement('model-viewer');
    mv.id = 'animal3D';
    mv.setAttribute('camera-controls','');
    mv.setAttribute('auto-rotate','');
    mv.setAttribute('shadow-intensity','1');
    mv.style.width='180px'; mv.style.height='180px';
    $('creatureContainer').appendChild(mv);
  }
}

// --- CREATE BUTTON ---
$('openCreateMenu').onclick=e=>{ e.stopPropagation(); openMenu($('createMenu')) }
$('btnPhoto').onclick=e=>{ e.stopPropagation(); openMenu($('menuPhoto')) }
$('btnAvatar').onclick=e=>{
  e.stopPropagation();
  openMenu($('rpmModal'));
  if(!$('rpmFrame').src) $('rpmFrame').src='https://iframe.readyplayer.me/avatar?frameApi';
}
$('btnCreature').onclick=e=>{ e.stopPropagation(); openMenu($('menuCreature')) }
$('chooseCreature').onclick=e=>{ e.stopPropagation(); openMenu($('chooseCreatureMenu')) }
$('createCreature').onclick=e=>{ e.stopPropagation(); openMenu($('createCreatureMenu')) }

// --- Prevent closing popup when click inside ---
menus.forEach(m=>{ if(m) m.onclick=e=>e.stopPropagation() })
document.body.onclick=closeAll
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAll(); })

// --- MINI-CIRCLE DRAG ---
(function(){
  let dragging=false,offsetX=0,offsetY=0;
  const mini=$('miniCircle');
  mini.addEventListener('mousedown',start);
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',end);
  mini.addEventListener('touchstart',start,{passive:false});
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',end);

  function start(e){
    dragging=true;
    const p=e.touches?e.touches[0]:e;
    const rect=mini.getBoundingClientRect();
    offsetX=p.clientX-rect.left; offsetY=p.clientY-rect.top;
    if(e.touches) e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const p=e.touches?e.touches[0]:e;
    let x=p.clientX-offsetX; let y=p.clientY-offsetY;
    x=Math.max(0,Math.min(window.innerWidth-mini.offsetWidth,x));
    y=Math.max(0,Math.min(window.innerHeight-mini.offsetHeight,y));
    mini.style.left=x+'px'; mini.style.top=y+'px';
  }
  function end(){ dragging=false; }
})();

// --- PHOTO ---
$('photoLib').onclick=()=>$('hiddenFileChoose').click();
$('takePhoto').onclick=()=>{
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*'; input.capture='environment';
  input.onchange=onChooseFile; input.click();
}
$('hiddenFile').onchange=$('hiddenFileChoose').onchange=onChooseFile;
function onChooseFile(e){
  const f=e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    $('miniAvatar').src=ev.target.result;
    localStorage.setItem(K.CIRCLE,ev.target.result);
    closeAll();
  }
  reader.readAsDataURL(f);
}

// --- RPM CLOSE ---
$('closeRpm').onclick=()=>{ $('rpmModal').classList.add('hidden'); $('rpmFrame').src=''; }

// --- READY PLAYER ME LISTENER ---
window.addEventListener('message',event=>{
  if(!event.data) return;
  let data=event.data;
  try{ data=typeof data==='string'?JSON.parse(data):data; }catch(e){ data=event.data }

  if(data?.eventName==='v1.avatar.exported' || data?.name==='avatar-exported'){
    const url=data.data?.url||data.url||null;
    if(url){
      $('avatar3D').src=url;
      localStorage.setItem(K.AVATAR,url);
      if(!localStorage.getItem(K.CIRCLE)) $('miniAvatar').src=url;
    }
    $('rpmModal').classList.add('hidden'); $('rpmFrame').src='';
  }

  if(data?.eventName==='v1.frame.ready' || data?.name==='frame-ready'){
    try{
      $('rpmFrame').contentWindow.postMessage(JSON.stringify({target:'readyplayerme',type:'subscribe',eventName:'v1.avatar.exported'}),'*');
    }catch(e){}
  }
});

// --- CREATURE LOGIC ---
const previewCreature = document.createElement('model-viewer');
previewCreature.style.width='160px'; previewCreature.style.height='160px';

$('validateCreature').onclick=()=>{
  const model = previewCreature.dataset.model || CREATURE_MODELS['Licorne'];
  const color = $('colorCreature').value||'#ff69b4';
  const sizeVal = $('sizeCreature').value||'Moyenne';
  let scale=1; if(sizeVal==='Petite') scale=0.6; else if(sizeVal==='Grande') scale=1.4;
  ensureAnimalViewer();
  const animal = $('animal3D');
  animal.src=model;
  animal.style.transform=`scale(${scale})`;
  localStorage.setItem(K.CREATURE, JSON.stringify({model,color,scale}));
  closeAll();
}

function setCreatureFromState(state){
  ensureAnimalViewer();
  const animal=$('animal3D');
  animal.src=state.model;
  animal.style.transform=`scale(${state.scale||1})`;
}

// Choix créature preview
const creatureButtons = document.querySelectorAll('#chooseCreatureMenu .pill-btn');
creatureButtons.forEach(btn=>{
  btn.onclick=e=>{
    const key=btn.textContent.trim();
    previewCreature.dataset.model = CREATURE_MODELS[key] || CREATURE_MODELS['Licorne'];
  }
});
