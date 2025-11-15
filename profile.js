// ==========================
// MINI CIRCLE PHOTO FIX
// ==========================
let savedMiniAvatar = localStorage.getItem("miniAvatar");
const miniAvatarImg = document.getElementById("miniAvatarImg");

if (savedMiniAvatar) {
    miniAvatarImg.src = savedMiniAvatar;
}

function setMiniAvatar(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        miniAvatarImg.src = e.target.result;
        localStorage.setItem("miniAvatar", e.target.result);
    };
    reader.readAsDataURL(file);
}


// ==========================
// MENUS / BOUTONS
// ==========================
const btnCreate = document.getElementById("btnCreate");
const createMenu = document.getElementById("createMenu");

const btnPhoto = document.getElementById("btnPhoto");
const btnAvatar = document.getElementById("btnAvatar");
const btnCreature = document.getElementById("btnCreature");

const photoMenu = document.getElementById("photoMenu");
const libraryBtn = document.getElementById("libraryBtn");
const cameraBtn = document.getElementById("cameraBtn");


// ==========================
// FERMETURE DES MENUS
// ==========================
function closeAll() {
    createMenu.style.display = "none";
    photoMenu.style.display = "none";
}

document.addEventListener("click", () => {
    closeAll();
});


// Empêche la fermeture lorsqu'on clique sur les menus
createMenu.addEventListener("click", e => e.stopPropagation());
photoMenu.addEventListener("click", e => e.stopPropagation());


// ==========================
// BOUTON CREER (FIX)
// ==========================
btnCreate.addEventListener("click", function (e) {
    e.stopPropagation(); // IMPORTANT : empêche le body de fermer
    if (createMenu.style.display === "flex") {
        createMenu.style.display = "none";
    } else {
        closeAll();
        createMenu.style.display = "flex";
    }
});


// ==========================
// BOUTON PHOTO
// ==========================
btnPhoto.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAll();
    photoMenu.style.display = "flex";
});


// ==========================
// BOUTON AVATAR
// ==========================
btnAvatar.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAll();

    // OUVERTURE REALITY PLAYER ME
    window.location.href = "/avatar.html"; 
});


// ==========================
// BOUTON CREATURE
// ==========================
btnCreature.addEventListener("click", function (e) {
    e.stopPropagation();
    closeAll();

    // PAGE SELECTION CREATURE
    window.location.href = "/creature.html";
});


// ==========================
// PHOTO : OUVERTURE LIBRARY
// ==========================
libraryBtn.addEventListener("click", function () {
    document.getElementById("photoInput").click();
});

// ==========================
// PHOTO : OUVERTURE CAMERA
// ==========================
cameraBtn.addEventListener("click", function () {
    document.getElementById("cameraInput").click();
});
