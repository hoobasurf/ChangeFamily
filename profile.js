import { realistic, fantasy } from "./creature-list.js";

const $ = id => document.getElementById(id);

const openCreate = $('openCreateMenu');
const createMenu = $('createMenu');
const btnPhoto = $('btnPhoto');
const btnAvatar = $('btnAvatar');
const btnCreature = $('btnCreature');

const menuPhoto = $('menuPhoto');
const hiddenFileChoose = $('hiddenFileChoose');
const hiddenFile = $('hiddenFile');

const chooseCreatureMenu = $('chooseCreatureMenu');
const toggleViewBtn = $('toggleView');
const creatureContainer = $('creatureContainer');

const rpmModal = $('rpmModal');
const rpmFrame = $('rpmFrame');
const closeRpm = $('closeRpm');

const miniAvatar = $('miniAvatar');
const avatar3D = $('avatar3D');
const animal3D = $('animal3D');

const allPopups = [createMenu, menuPhoto, chooseCreatureMenu, rpmModal].filter(Boolean);
function closeAll(){ allPopups.forEach(p => p.classList.add('hidden')); }
allPopups.forEach(p => p.addEventListener('click', e => e.stopPropagation()));
document.body.addEventListener('click', closeAll);

// ========== Open Create Menu ==========
openCreate.addEventListener('click', e=>{
  e.stopPropagation();
  closeAll();
  createMenu.classList.toggle('hidden');
});

// ========== Photo Menu ==========
btnPhoto.addEventListener('click', e=>{
  e.stopPropagation();
  closeAll();
  menuPhoto.classList.remove('hidden');
});

// Photothèque
if (hiddenFileChoose) hiddenFileChoose.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const img = ev.target.result;
    miniAvatar.src = img;
    localStorage.setItem('circlePhoto', img); // SAUVEGARDE FIX
  };
  reader.readAsDataURL(file);

  closeAll();
});

// Prendre photo (camera)
if (hiddenFile) hiddenFile.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = ev => {
    const img = ev.target.result;
    miniAvatar.src = img;
    localStorage.setItem('circlePhoto', img); // SAUVEGARDE FIX
  };
  reader.readAsDataURL(file);

  closeAll();
});
// === Avatar RPM ===
btnAvatar.addEventListener('click', e=>{
  e.stopPropagation();
  closeAll();
  rpmModal.classList.remove('hidden');

  if (!rpmFrame.src)
    rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
});

// fermeture
if (closeRpm) closeRpm.addEventListener('click', e => {
  e.stopPropagation();
  rpmModal.classList.add('hidden');
  rpmFrame.src = "";
});

// écoute Ready Player Me
window.addEventListener('message', event => {
  if (!event.data) return;

  let data = event.data;
  try { data = JSON.parse(event.data); } catch {}

  if (data.eventName === "v1.avatar.exported") {
    const url = data.data.url;
    avatar3D.src = url;
    localStorage.setItem('avatarURL', url);

    rpmModal.classList.add("hidden");
    rpmFrame.src = "";
  }

  if (data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(JSON.stringify({
      target: "readyplayerme",
      type: "subscribe",
      eventName: "v1.avatar.exported"
    }), "*");
  }
});
// ========== Creature Menu (F1) ==========
function buildCreatureMenu(){
  creatureContainer.innerHTML = '';
  const allCreatures = [...realistic, ...fantasy];

  allCreatures.forEach(item=>{
    const btn = document.createElement('button');
    btn.className = 'pill';
    btn.textContent = item.name;
    btn.dataset.url = item.url;
    btn.onclick = () => {
      animal3D.src = item.url;
      closeAll();
    };
    creatureContainer.appendChild(btn);
  });
}
buildCreatureMenu();

// === Toggle Grille / Liste ===
let isGrid = true;
toggleViewBtn.addEventListener('click', ()=>{
  isGrid = !isGrid;
  creatureContainer.style.flexDirection = isGrid ? 'row' : 'column';
});

// === Open Creature Menu ===
btnCreature.addEventListener('click', e=>{
  e.stopPropagation();
  closeAll();
  chooseCreatureMenu.classList.remove('hidden');
});
