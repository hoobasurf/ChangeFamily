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
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// ✅ Charger pseudo + avatar sauvegardés
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
  const url = prompt("Entre l’URL de ton avatar (.glb)");
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

// ✅ Ouvre Ready Player Me intégré
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
});

// ✅ Écoute les messages du frame Ready Player Me
window.addEventListener("message", (event) => {
  if (!event.data || !event.data.source || event.data.source !== "readyplayerme") return;

  if (event.data.eventName === "v1.avatar.exported") {
    const avatarURL = event.data.data.url;
    avatar3D.src = avatarURL;
    avatarFull.src = avatarURL;
    localStorage.setItem("avatarURL", avatarURL);
    rpmModal.style.display = "none";
  }

  if (event.data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(
      JSON.stringify({
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported"
      }),
      "*"
    );
  }
});

// ✅ Avatar plein écran
avatar3D.addEventListener("click", () => {
  avatarModal.style.display = "flex";
});
avatarModal.addEventListener("click", () => {
  avatarModal.style.display = "none";
});
