// =======================
// GETTER
// =======================
const $ = id => document.getElementById(id);

// =======================
// MINI-CIRCLE DRAG
// =======================
(function(){
  const mini = $('miniCircle');
  if(!mini) return;

  let drag = false, offX = 0, offY = 0;

  function start(e){
    drag = true;
    const p = e.touches ? e.touches[0] : e;
    const r = mini.getBoundingClientRect();
    offX = p.clientX - r.left;
    offY = p.clientY - r.top;
    if(e.touches) e.preventDefault();
  }

  function move(e){
    if(!drag) return;
    const p = e.touches ? e.touches[0] : e;
    let x = p.clientX - offX;
    let y = p.clientY - offY;
    x = Math.max(0, Math.min(window.innerWidth - mini.offsetWidth, x));
    y = Math.max(0, Math.min(window.innerHeight - mini.offsetHeight, y));
    mini.style.left = x + 'px';
    mini.style.top  = y + 'px';
  }

  function end(){ drag = false; }

  mini.addEventListener('mousedown', start);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', end);

  mini.addEventListener('touchstart', start, {passive:false});
  document.addEventListener('touchmove', move, {passive:false});
  document.addEventListener('touchend', end);
})();

// =======================
// INIT PSEUDO
// =======================
const pseudo = $('pseudoInput');
if (pseudo){
  if(localStorage.getItem('pseudo')) pseudo.value = localStorage.getItem('pseudo');
  pseudo.addEventListener('change', ()=> localStorage.setItem('pseudo', pseudo.value));
}

// =======================
// MENUS
// =======================
const M = {
  create: $('createMenu'),
  photo: $('menuPhoto'),
  creature: $('menuCreature'),
  chooseCreature: $('chooseCreatureMenu'),
  createCreature: $('createCreatureMenu'),
  rpm: $('rpmModal')
};

// liste pour fermer proprement
const allMenus = Object.values(M);

function closeAll(){
  allMenus.forEach(m => m && m.classList.add('hidden'));
}

function openMenu(menu){
  closeAll();
  if(menu) menu.classList.remove('hidden');
}

// rendre les popup étanches au clic
allMenus.forEach(m=>{
  if(!m) return;
  m.addEventListener('click', e => e.stopPropagation());
});

// clic sur le body = ferme
document.body.onclick = closeAll;

// =======================
// BOUTON CREER
// =======================
$('openCreateMenu').onclick = e => {
  e.stopPropagation();
  openMenu(M.create);
};

// =======================
// PHOTO
// =======================
$('btnPhoto').onclick = e => {
  e.stopPropagation();
  openMenu(M.photo);
};

$('photoLib').onclick = () => $('hiddenFileChoose').click();
$('takePhoto').onclick = () => {
  const input = document.createElement('input');
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = onChooseFile;
  input.click();
};

$('hiddenFile').onchange = onChooseFile;
$('hiddenFileChoose').onchange = onChooseFile;

function onChooseFile(e){
  const f = e.target.files[0];
  if(!f) return;

  const reader = new FileReader();
  reader.onload = ev => {
    $('miniAvatar').src = ev.target.result;
    localStorage.setItem('circlePhoto', ev.target.result);
    closeAll();
  };
  reader.readAsDataURL(f);
}

// =======================
// AVATAR — READY PLAYER ME
// =======================
$('btnAvatar').onclick = e => {
  e.stopPropagation();
  openMenu(M.rpm);

  if(!$('rpmFrame').src)
    $('rpmFrame').src = "https://iframe.readyplayer.me/avatar?frameApi";
};

$('closeRpm').onclick = () => {
  M.rpm.classList.add('hidden');
  $('rpmFrame').src = "";
};

window.addEventListener('message', (event)=>{
  if(!event.data) return;

  let data = event.data;
  try { data = typeof data === "string" ? JSON.parse(data) : data; }catch{}

  if(data?.eventName === "v1.avatar.exported" || data?.name === "avatar-exported"){
    const url = data.data?.url || data.url;
    if(url){
      $('avatar3D').src = url;
      localStorage.setItem("avatarURL", url);
    }
    M.rpm.classList.add('hidden');
    $('rpmFrame').src = "";
  }
});

// =======================
// CREATURE
// =======================
$('btnCreature').onclick = e => {
  e.stopPropagation();
  openMenu(M.creature);
};

$('chooseCreature').onclick = e => {
  e.stopPropagation();
  openMenu(M.chooseCreature);
};

$('createCreature').onclick = e => {
  e.stopPropagation();
  openMenu(M.createCreature);
};

// CHOISIR UNE CRÉATURE PRÉ-FABRIQUÉE
document.querySelectorAll('#chooseCreatureMenu button[data-creature]')
  .forEach(btn=>{
    btn.onclick = ()=>{
      const type = btn.dataset.creature;

      let url = "";
      if(type === "Licorne") url = "https://modelviewer.dev/shared-assets/models/Astronaut.glb";  
      if(type === "Dragon")  url = "https://modelviewer.dev/shared-assets/models/RobotExpressive.glb";
      if(type === "ChatAile") url = "https://modelviewer.dev/shared-assets/models/Robot.glb";

      $('animal3D').src = url;
      localStorage.setItem("creatureURL", url);

      closeAll();
    };
  });

// CREER UNE NOUVELLE CRÉATURE (fake)
$('validateCreature').onclick = ()=>{
  const size = $('sizeCreature').value;

  let url = "https://modelviewer.dev/shared-assets/models/Robot.glb";
  $('animal3D').src = url;

  closeAll();
};
