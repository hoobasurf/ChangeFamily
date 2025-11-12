const avatar3D = document.getElementById("avatar3D");
const avatarFull = document.getElementById("avatarFull");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editSection = document.getElementById("editSection");
const pseudoInput = document.getElementById("pseudoInput");
const saveBtn = document.getElementById("saveProfile");
const chooseAvatar = document.getElementById("chooseAvatar");
const createAvatar = document.getElementById("createAvatar");
const avatarModal = document.getElementById("avatarModal");

// ✅ Charger pseudo + avatar au démarrage
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) {
    avatar3D.src = avatarURL;
    avatarFull.src = avatarURL;
  }
});

// ✅ Ouvrir / fermer édition
editBtn.addEventListener("click", () => {
  editSection.style.display = editSection.style.display === "flex" ? "none" : "flex";
});

// ✅ Import manuel d’un avatar
chooseAvatar.addEventListener("click", () => {
  const url = prompt("Entre l’URL de ton avatar Ready Player Me (.glb)");
  if (url) {
    avatar3D.src = url;
    avatarFull.src = url;
    localStorage.setItem("avatarURL", url);
  }
});

// ✅ Sauvegarde pseudo
saveBtn.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (!pseudo) return;
  localStorage.setItem("pseudo", pseudo);
  pseudoDisplay.textContent = pseudo;
  editSection.style.display = "none";
});

// ✅ Ouvrir Ready Player Me pour créer un avatar
createAvatar.addEventListener("click", () => {
  window.open("https://readyplayer.me/avatar", "_blank");
});

// ✅ Clic sur l’avatar pour l’agrandir
avatar3D.addEventListener("click", () => {
  avatarModal.style.display = "flex";
});

// ✅ Fermer le plein écran
avatarModal.addEventListener("click", () => {
  avatarModal.style.display = "none";
});
