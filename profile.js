const $ = id => document.getElementById(id);

// Mini-circle draggable
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
  function end(){dragging=false;}
})();

// Pseudo editable
const pseudo=$('pseudoInput');
if(localStorage.getItem('pseudo')) pseudo.value=localStorage.getItem('pseudo');
pseudo.addEventListener('change',()=>localStorage.setItem('pseudo',pseudo.value));

// CREATE MENU
const menus=['createMenu','menuPhoto','menuCreature','chooseCreatureMenu','createCreatureMenu','rpmModal'].map($);
function closeAll(){menus.forEach(m=>m.classList.add('hidden'))}
function openMenu(m){closeAll(); m.classList.remove('hidden')}

$('openCreateMenu').onclick=e=>{e.stopPropagation();openMenu($('createMenu'))}
$('btnPhoto').onclick=e=>{e.stopPropagation();openMenu($('menuPhoto'))}
$('btnAvatar').onclick=e=>{e.stopPropagation();openMenu($('rpmModal'));if(!$('rpmFrame').src)$('rpmFrame').src='https://iframe.readyplayer.me/avatar?frameApi';}
$('btnCreature').onclick=e=>{e.stopPropagation();openMenu($('menuCreature'))}
$('chooseCreature').onclick=e=>{e.stopPropagation();openMenu($('chooseCreatureMenu'))}
$('createCreature').onclick=e=>{e.stopPropagation();openMenu($('createCreatureMenu'))}

menus.forEach(m=>{m.onclick=e=>e.stopPropagation()})
document.body.onclick=closeAll
document.addEventListener('keydown', e=>{if(e.key==='Escape')closeAll();})

// PHOTO
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
    localStorage.setItem('circlePhoto',ev.target.result);
    closeAll();
  }
  reader.readAsDataURL(f);
}

// RPM modal
$('closeRpm').onclick=()=>{ $('rpmModal').classList.add('hidden'); $('rpmFrame').src=''; }
window.addEventListener('message',event=>{
  if(!event.data) return;
  let data = event.data;
  try{ data=typeof data==='string'?JSON.parse(data):data }catch{}
  if(data?.eventName==='v1.avatar.exported'||data?.name==='avatar-exported'){
    const avatarURL = data.data?.url || data.url || data.avatarUrl || null;
    if(avatarURL){
      $('avatar3D').src=avatarURL;
      localStorage.setItem('avatarURL',avatarURL);
    }
    $('rpmModal').classList.add('hidden'); $('rpmFrame').src='';
  }
});
