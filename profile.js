const $ = id => document.getElementById(id);

// Mini circle draggable
(function(){
  const mini = $('miniCircle');
  let dragging=false, offsetX=0, offsetY=0;

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
    const maxX=window.innerWidth-mini.offsetWidth;
    const maxY=window.innerHeight-mini.offsetHeight;
    x=Math.max(0, Math.min(maxX, x));
    y=Math.max(0, Math.min(maxY, y));
    mini.style.left=x+'px';
    mini.style.top=y+'px';
  }
  function end(){ dragging=false; }
  mini.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  mini.addEventListener('touchstart', start, {passive:false});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end);
})();

// Menu et sous-menu
const menus = ['createMenu','menuPhoto','menuCreature','chooseCreatureMenu','createCreatureMenu','rpmModal'].map($);
function closeAll(){ menus.forEach(m=>m.classList.add('hidden')) }
function openMenu(m){ closeAll(); m.classList.remove('hidden') }

// Boutons créer
$('openCreateMenu').onclick = e => { e.stopPropagation(); openMenu($('createMenu')) }
$('btnPhoto').onclick = e => { e.stopPropagation(); openMenu($('menuPhoto')) }
$('btnAvatar').onclick = e => {
  e.stopPropagation();
  openMenu($('rpmModal'));
  if(!$('rpmFrame').src) $('rpmFrame').src='https://iframe.readyplayer.me/avatar?frameApi';
}
$('btnCreature').onclick = e => { e.stopPropagation(); openMenu($('menuCreature')) }
$('chooseCreature').onclick = e => { e.stopPropagation(); openMenu($('chooseCreatureMenu')) }
$('createCreature').onclick = e => { e.stopPropagation(); openMenu($('createCreatureMenu')) }

// Empêche fermeture quand clique dans popup
menus.forEach(m=>{ if(m) m.onclick=e=>e.stopPropagation() });
document.body.onclick = closeAll;
document.addEventListener('keydown', e => { if(e.key==='Escape') closeAll(); });

// PHOTO input
$('photoLib').onclick = ()=>$('hiddenFileChoose').click();
$('takePhoto').onclick = ()=>{
  const input=document.createElement('input');
  input.type='file'; input.accept='image/*'; input.capture='environment';
  input.onchange=onChooseFile;
  input.click();
}
$('hiddenFile').onchange=$('hiddenFileChoose').onchange=onChooseFile;

function onChooseFile(e){
  const f=e.target.files[0]; if(!f) return;
  const reader=new FileReader();
  reader.onload=ev=>{
    $('miniAvatar').src=ev.target.result;
    localStorage.setItem('circlePhoto', ev.target.result);
    closeAll();
  }
  reader.readAsDataURL(f);
}

// RPM close
$('closeRpm').onclick = ()=>{ $('rpmModal').classList.add('hidden'); $('rpmFrame').src=''; }
