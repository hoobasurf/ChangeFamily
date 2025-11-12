const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// ✅ Barre URL avatar
const urlInput = document.createElement("input");
urlInput.placeholder = "Entre l’URL de ton avatar 3D";
urlInput.className = "url-input";
urlInput.style.display = "none";
document.body.appendChild(urlInput);

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
      const reader = new FileReader();
      reader.onload = () => {
        avatar3D.src = reader.result;
        localStorage.setItem("avatarURL", reader.result);
      };
      reader.readAsDataURL(file);
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
      const reader = new FileReader();
      reader.onload = () => {
        avatar3D.src = reader.result;
        localStorage.setItem("avatarURL", reader.result);
      };
      reader.readAsDataURL(file);
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

// ✅ Barre URL (coller un lien d’avatar)
avatar3D.addEventListener("dblclick", () => {
  urlInput.style.display = "block";
  urlInput.focus();
});

urlInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const url = urlInput.value.trim();
    if (url) {
      avatar3D.src = url;
      localStorage.setItem("avatarURL", url);
      urlInput.style.display = "none";
      urlInput.value = "";
    }
  }
});

// Fermer Ready Player Me au clic extérieur
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});

// --- Sélection des éléments ---
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");

// --- Ouvrir / fermer le menu ---
editBtn.addEventListener("click", () => {
  editMenu.classList.toggle("show");
});

// --- Fermer le menu si on clique à l'extérieur ---
document.addEventListener("click", (e) => {
  if (!editMenu.contains(e.target) && e.target !== editBtn) {
    editMenu.classList.remove("show");
  }
});

// --- Actions des boutons du menu ---
document.getElementById("photoLib").addEventListener("click", () => {
  alert("📷 Ouvrir la photothèque (à coder)");
});

document.getElementById("takePhoto").addEventListener("click", () => {
  alert("🤳 Prendre une photo (à coder)");
});

document.getElementById("createAvatar").addEventListener("click", () => {
  alert("✨ Créer avatar (à coder)");
});
