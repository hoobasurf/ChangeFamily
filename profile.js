// ====== UTILS ======
const $ = id => document.getElementById(id);

// ====== MENUS ======
const createMenu = $("createMenu");
const photoMenu = $("photoMenu");
const avatarMenu = $("avatarMenu");
const creatureMenu = $("creatureMenu");

// ====== BOUTONS ======
const btnCreate = $("btnCreate");
const btnPhoto = $("btnPhoto");
const btnAvatar = $("btnAvatar");
const btnCreature = $("btnCreature");

const photoLib = $("photoLib");
const takePhoto = $("takePhoto");

const chooseCreature = $("chooseCreature");
const createCreature = $("createCreature");

const creatureChoiceMenu = $("creatureChoiceMenu");
const creatureCreateMenu = $("creatureCreateMenu");


// ====== FERMETURE GLOBALE ======
function closeAll() {
    createMenu.style.display = "none";
    photoMenu.style.display = "none";
    avatarMenu.style.display = "none";
    creatureMenu.style.display = "none";
    creatureChoiceMenu.style.display = "none";
    creatureCreateMenu.style.display = "none";
}

document.body.addEventListener("click", closeAll);


// ====== EMPÊCHER FERMETURE INSTANTANÉE ======
[
    createMenu, photoMenu, avatarMenu, creatureMenu,
    creatureChoiceMenu, creatureCreateMenu
].forEach(menu => {
    if (menu) menu.addEventListener("click", e => e.stopPropagation());
});

[
    btnCreate, btnPhoto, btnAvatar, btnCreature,
    photoLib, takePhoto, chooseCreature, createCreature
].forEach(btn => {
    if (btn) btn.addEventListener("click", e => e.stopPropagation());
});


// ====== OUVERTURES DES MENUS ======

// ---- Main button "Créer"
btnCreate.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    createMenu.style.display = "flex";
});

// ---- Inside "Créer"
btnPhoto.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    photoMenu.style.display = "flex";
});

btnAvatar.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    avatarMenu.style.display = "flex";
});

btnCreature.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    creatureMenu.style.display = "flex";
});


// ====== PHOTO MENU ======
photoLib.addEventListener("click", () => {
    console.log("Photothèque ouverte");
});

takePhoto.addEventListener("click", () => {
    console.log("Prendre photo");
});


// ====== CREATURE MENU ======
chooseCreature.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    creatureChoiceMenu.style.display = "flex";
});

createCreature.addEventListener("click", e => {
    e.stopPropagation();
    closeAll();
    creatureCreateMenu.style.display = "flex";
});
