const $ = id => document.getElementById(id);

// Boutons et menus
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

const photoLib = $('photoLib');
const takePhoto = $('takePhoto');
const hiddenFile = $('hiddenFile');
const hiddenFileChoose = $('hiddenFileChoose');

const miniCircle = $('miniCircle');
const miniAvatar = $('miniAvatar');

const creatureContainer = $('creatureContainer');
const animal3D = $('animal3D');

const colorCreature = $('colorCreature');
const sizeCreature = $('sizeCreature');

// Menu management
const menus = [menuCreate, menuPhoto, menuCreature, chooseCreatureMenu, createCreatureMenu];

function closeAllMenus(){ menus.forEach(m=>m.classList.add('hidden')); }
function openMenu(menuEl){ closeAllMenus(); menuEl.classList.remove('hidden'); }

btnOpenCreate.onclick = e=>{ e.stopPropagation(); openMenu(menuCreate); };
btnPhoto.onclick = e=>{ e.stopPropagation(); openMenu(menuPhoto); };
btnAvatar.onclick = e=>{ e.stopPropagation(); openMenu(menuPhoto); }; // placeholder
btnCreature.onclick = e=>{ e.stopPropagation(); openMenu(menuCreature); };
chooseCreatureBtn.onclick = e=>{ e.stopPropagation(); openMenu(chooseCreatureMenu); };
createCreatureBtn.onclick = e=>{ e.stopPropagation(); openMenu(createCreatureMenu); };

// Prevent closing when clicking inside menus
menus.forEach(m=>{ if(m) m.onclick=e=>e.stopPropagation(); });
// Close menus on outside click
document.body.onclick = ()=>closeAllMenus();

// ESC closes menus
document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeAllMenus(); });

// --- PHOTO ---
photoLib.addEventListener('click', ()=> hiddenFileChoose.click());
takePhoto.addEventListener('click', ()=> {
    const input = document.createElement('input');
    input.type='file'; input.accept='image/*'; input.capture='environment';
    input.onchange = onChooseFile;
    input.click();
});
hiddenFile.addEventListener('change', onChooseFile);
hiddenFileChoose.addEventListener('change', onChooseFile);

function onChooseFile(e){
    const f = e.target.files && e.target.files[0];
    if(!f) return;
    const reader = new FileReader();
    reader.onload = ev=>{
        miniAvatar.src = ev.target.result;
        localStorage.setItem('circlePhoto', ev.target.result);
        closeAllMenus();
    };
    reader.readAsDataURL(f);
}

// --- MINI CIRCLE DRAG ---
(function(){
  let dragging=false, offsetX=0, offsetY=0;
  function start(e){ dragging=true; const p=(e.touches?e.touches[0]:e);
    const rect=miniCircle.getBoundingClientRect();
    offsetX=p.clientX-rect.left; offsetY=p.clientY-rect.top;
    if(e.touches) e.preventDefault();
  }
  function move(e){ if(!dragging) return;
    const p=(e.touches?e.touches[0]:e);
    let x=p.clientX-offsetX, y=p.clientY-offsetY;
    x=Math.max(8,Math.min(window.innerWidth-miniCircle.offsetWidth-8,x));
    y=Math.max(8,Math.min(window.innerHeight-miniCircle.offsetHeight-8,y));
    miniCircle.style.left=x+'px'; miniCircle.style.top=y+'px';
  }
  function end(){ dragging=false; }
  miniCircle.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);
  miniCircle.addEventListener('touchstart', start, {passive:false});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end);
})();

// --- CREATURE APPLY ---
const validateCreature = $('validateCreature');
validateCreature.addEventListener('click', ()=>{
    const scale = parseFloat(sizeCreature.value==="Petite"?0.6:sizeCreature.value==="Moyenne"?1:1.5);
    const color = colorCreature.value;
    if(animal3D){
        animal3D.style.transform=`scale(${scale})`;
        // future: apply color/material if glb supports
    }
    closeAllMenus();
});
