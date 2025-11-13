const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");
const danceBtn = document.getElementById("danceBtn");

// ✅ Charger pseudo + avatar sauvegardés
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) avatar3D.src = avatarURL;
});

// ✅ Bouton Modifier -> ouvre/ferme le menu
editBtn.addEventListener("click", () => {
  const visible = editMenu.style.display === "flex";
  editMenu.style.display = visible ? "none" : "flex";
});

// ✅ Fermer si on clique hors du menu
document.addEventListener("click", (e) => {
  if (!editMenu.contains(e.target) && e.target !== editBtn) {
    editMenu.style.display = "none";
  }
});

// ✅ Photothèque
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      avatar3D.src = url;
      localStorage.setItem("avatarURL", url);
    }
  };
  input.click();
});

// ✅ Prendre une photo
takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "camera";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      avatar3D.src = url;
      localStorage.setItem("avatarURL", url);
    }
  };
  input.click();
});

// ✅ Créer avatar (Ready Player Me)
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

// ✅ Écoute les messages du frame Ready Player Me
window.addEventListener("message", (event) => {
  if (!event.data || !event.data.source || event.data.source !== "readyplayerme") return;

  if (event.data.eventName === "v1.avatar.exported") {
    const avatarURL = event.data.data.url;
    avatar3D.src = avatarURL;
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

// Fermer Ready Player Me au clic extérieur
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});

// ✅ Effet "Danser" — rotation rapide 2 secondes
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 2s linear";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => {
    avatar3D.style.transform = "rotateY(0deg)";
  }, 2000);
});
