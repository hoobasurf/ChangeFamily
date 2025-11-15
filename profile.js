const $ = id => document.getElementById(id);

// Menus et boutons
const btnCreate = $('openCreateMenu');
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
const photoLib = $('photoLib');
const takePhoto = $('takePhoto');
const hiddenFile = $('hiddenFile');
const hiddenFileChoose = $('hiddenFileChoose');
const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');
const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const closeRpm = $('closeRpm');

const menus = [menuCreate, menuPhoto, menuCreature, chooseCreatureMenu, createCreatureMenu, rpmModal];

// --- Menu ouvrir/fermer ---
function closeAll(){menus.forEach(m=>m.classList.add('hidden'))}
function openMenu(m){closeAll();m.classList.remove('hidden')}

btnCreate.onclick=e=>{e.stopPropagation();openMenu(menuCreate);}
btnPhoto.onclick=e=>{e.stopPropagation();openMenu(menuPhoto);}
btnAvatar.onclick=e=>{
  e.stopPropagation();
  openMenu(rpmModal);
  if(!rpmFrame.src) rpmFrame.src='https://iframe.readyplayer.me/avatar?frameApi';
}
btnCreature.onclick=e=>{e.stopPropagation();openMenu(menuCreature);}
chooseCreatureBtn.onclick=e=>{e.stopPropagation();openMenu(chooseCreatureMenu);}
createCreatureBtn.onclick=e=>{e.stopPropagation();openMenu(createCreatureMenu);}

// Empêche fermeture en cliquant dedans
menus.forEach(m=>{m.onclick=e=>e.stopPropagation()})
document.body.onclick=closeAll
document.addEventListener('keydown', e=>{if(e.key==='Escape')closeAll();});

// --- Mini-circle draggable ---
(function(){
  let dragging=false,offsetX=0,offsetY=0;
  function start(e){
    dragging=true;
    const p=e.touches?e.touches[0]:e;
    const rect=miniCircle.getBoundingClientRect();
    offsetX=p.clientX-rect.left; offsetY=p.clientY-rect.top;
    if(e.touches)e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const p=e.touches?e.touches[0]:e;
    let x=p.clientX-offsetX;
    let y=p.clientY-offsetY;
    x=Math.max(0,Math.min(window.innerWidth-miniCircle.offsetWidth,x));
    y=Math.max(0,Math.min(window.innerHeight-miniCircle.offsetHeight,y));
    miniCircle.style.left=x+'px';
    miniCircle.style.top=y+'px';
  }
  function end(){dragging=false;}
  miniCircle.addEventListener('mousedown',start);
  document.addEventListener('mousemove',move);
  document.addEventListener('mouseup',end);
  miniCircle.addEventListener('touchstart',start,{passive:false});
  document.addEventListener('touchmove',move,{passive:false});
  document.addEventListener('touchend',end);
})();

// --- Photo ---
photoLib.onclick=()=>hiddenFileChoose.click();
takePhoto.onclick=()=>{
  const input=document.createElement('input');
  input.type='file';input.accept='image/*';input.capture='environment';
  input.onchange=onChooseFile; input.click();
}
hiddenFile.onchange=onChooseFile;
hiddenFileChoose.onchange=onChooseFile;

function onChooseFile(e){
  const f=e.target.files[0]; if(!f)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    miniAvatar.src=ev.target.result;
    localStorage.setItem('circlePhoto',ev.target.result);
    closeAll();
  }
  reader.readAsDataURL(f);
}

// --- RPM close ---
closeRpm.onclick=()=>{rpmModal.classList.add('hidden');rpmFrame.src='';}
