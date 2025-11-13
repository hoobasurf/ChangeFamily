const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// ✅ Charger pseudo + avatar sauvegardés
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) avatar3D.src = avatarURL;
});

// ✅ Bouton Modifier -> ouvre le menu
editBtn.addEventListener("click", () => {
  editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
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

// ✅ Écouter les messages du frame Ready Player Me
window.addEventListener("message", (event) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch {
    data = event.data;
  }

  if (!data || data.source !== "readyplayerme") return;

  // Quand le frame est prêt
  if (data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(
      JSON.stringify({
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported"
      }),
      "*"
    );
  }

  // Quand l’avatar est exporté après "Suivant"
  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    avatar3D.src = avatarURL;
    localStorage.setItem("avatarURL", avatarURL);
    rpmModal.style.display = "none";
  }
});

// ✅ Fermer Ready Player Me au clic extérieur
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});
