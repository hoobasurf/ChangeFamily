// -----------------------------------
// SAFE GET
// -----------------------------------
const $ = id => document.getElementById(id);

// -----------------------------------
// LISTE MENUS (sans rpmModal !)
// -----------------------------------
const menus = [
  $('createMenu'),
  $('menuPhoto'),
  $('menuCreature'),
  $('chooseCreatureMenu'),
  $('createCreatureMenu')
];

// Pas rpmModal ici, sinon bug
function closeAll(){
  menus.forEach(m => m?.classList.add('hidden'));
}
function openMenu(m){
  closeAll();
  m?.classList.remove('hidden');
}

// -----------------------------------
// MINI-CIRCLE DRAGGABLE
// -----------------------------------
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
    offsetX=p.clientX-rect.left;
    offsetY=p.clientY-rect.top;
    if(e.touches) e.preventDefault();
  }
  function move(e){
    if(!dragging) return;
    const p=e.touches?e.touches[0]:e;
    let x=p.clientX-offsetX;
    let y=p.clientY-offsetY;
    x=Math.max(0,Math.min(window.innerWidth-mini.offsetWidth,x));
    y=Math.max(0,Math.min(window.innerHeight-mini.offsetHeight,y));
    mini.style.left=x+'px';
    mini.style.top=y+'px';
  }
  function end(){ dragging=false; }
})();

// -----------------------------------
// PSEUDO
// -----------------------------------
const pseudo=$('pseudoInput');
if(localStorage.getItem('pseudo'))
  pseudo.value=localStorage.getItem('pseudo');

pseudo.addEventListener('change',()=>{
  localStorage.setItem('pseudo', pseudo.value);
});

// -----------------------------------
// MENU CREER
// -----------------------------------
$('openCreateMenu').onclick=e=>{
  e.stopPropagation();
  openMenu($('createMenu'));
};

// PHOTO
$('btnPhoto').onclick=e=>{
  e.stopPropagation();
  openMenu($('menuPhoto'));
};

// AVATAR RPM
$('btnAvatar').onclick=e=>{
  e.stopPropagation();
  const frame = $('rpmFrame');
  openMenu($('rpmModal'));
  if(frame && !frame.src)
    frame.src = "https://iframe.readyplayer.me/avatar?frameApi";
};

// CREATURE
$('btnCreature').onclick=e=>{
  e.stopPropagation();
  openMenu($('menuCreature'));
};

// Choose / Create
$('chooseCreature').onclick=e=>{
  e.stopPropagation();
  openMenu($('chooseCreatureMenu'));
};
$('createCreature').onclick=e=>{
  e.stopPropagation();
  openMenu($('createCreatureMenu'));
};

// -----------------------------------
// Fermer si clic dehors
// -----------------------------------
menus.forEach(m => m.onclick = e => e.stopPropagation());
document.body.onclick = closeAll;
document.addEventListener('keydown',e=>{
  if(e.key==='Escape') closeAll();
});

// -----------------------------------
// PHOTO IMPORT
// -----------------------------------
function onChooseFile(e){
  const f = e.target.files[0];
  if(!f) return;

  const r = new FileReader();
  r.onload = ev=>{
    $('miniAvatar').src = ev.target.result;
    localStorage.setItem('circlePhoto', ev.target.result);
    closeAll();
  };
  r.readAsDataURL(f);
}
$('hiddenFile').onchange = onChooseFile;
$('hiddenFileChoose').onchange = onChooseFile;

$('photoLib').onclick=()=> $('hiddenFileChoose').click();

$('takePhoto').onclick=()=>{
  const input=document.createElement('input');
  input.type='file';
  input.accept='image/*';
  input.capture='environment';
  input.onchange = onChooseFile;
  input.click();
};

// -----------------------------------
// READY PLAYER ME
// -----------------------------------
$('closeRpm').onclick=()=>{
  $('rpmModal').classList.add('hidden');
  $('rpmFrame').src='';
};

window.addEventListener('message',event=>{
  if(!event.data) return;
  let data = event.data;
  try{ data = typeof data==='string'?JSON.parse(data):data }catch{}

  if(data?.eventName==='v1.avatar.exported' || data?.name==='avatar-exported'){
    const url = data.data?.url || data.url || data.avatarUrl;
    if(url){
      $('avatar3D').src = url;
      localStorage.setItem('avatarURL', url);
    }
    $('rpmModal').classList.add('hidden');
    $('rpmFrame').src='';
  }
});

// -----------------------------------
// CHOIX CREATURE (fonctionnel + stocké)
// -----------------------------------
document.querySelectorAll('#chooseCreatureMenu button').forEach(btn=>{
  btn.onclick = ()=>{
    const type = btn.dataset.creature;
    let model;

    if(type==="Licorne") model="creatures/licorne.glb";
    if(type==="Dragon")  model="creatures/dragon.glb";
    if(type==="ChatAile") model="creatures/chataile.glb";

    $('animal3D').src = model;
    localStorage.setItem('creatureModel', model);

    closeAll();
  };
});
