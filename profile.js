// profile.js
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

const miniCircle = document.getElementById("miniCircle");
const miniAvatar = document.getElementById("miniAvatar");

/* --- Charger le pseudo, avatar et photo mini au démarrage --- */
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const circlePhoto = localStorage.getItem("circlePhoto");
  const avatarURL = localStorage.getItem("avatarURL");

  // priorité : circlePhoto (la photo persistante du mini-circle)
  if (circlePhoto) {
    miniAvatar.src = circlePhoto;
  } else if (avatarURL) {
    // si pas de photo, mini-circle prend l'avatar (fallback)
    miniAvatar.src = avatarURL;
  } else {
    miniAvatar.src = "default.jpg";
  }

  if (avatarURL) {
    avatar3D.src = avatarURL;
  }
});

/* --- Menu Modifier toggle + fermeture en cliquant hors du menu --- */
editBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const visible = editMenu.style.display === "flex";
  editMenu.style.display = visible ? "none" : "flex";
  editMenu.setAttribute("aria-hidden", visible ? "true" : "false");
});

document.addEventListener("click", (e) => {
  // si le menu est ouvert et que le clic est en dehors -> fermer
  if (editMenu.style.display === "flex") {
    if (!editMenu.contains(e.target) && e.target !== editBtn) {
      editMenu.style.display = "none";
      editMenu.setAttribute("aria-hidden", "true");
    }
  }
});

/* --- Photothèque : enregistre DANS le mini-circle (circlePhoto) --- */
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    // mini-circle garde la photo
    miniAvatar.src = url;
    localStorage.setItem("circlePhoto", url);
    // ne PAS écraser avatar3D unless user wants
  };

  input.click();
  // fermer menu après choix ouverture
  editMenu.style.display = "none";
});

/* --- Prendre une photo : idem photothèque (mini-circle) --- */
takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "camera";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    miniAvatar.src = url;
    localStorage.setItem("circlePhoto", url);
  };

  input.click();
  editMenu.style.display = "none";
});

/* --- Ready Player Me intégré en modal (n'écrase pas circlePhoto) --- */
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmModal.setAttribute("aria-hidden", "false");
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

/* --- Réception messages de Ready Player Me ---
   Ready Player Me envoie des strings JSON, on parse et on gère.
   IMPORTANT : on stocke avatarURL séparé de circlePhoto.
*/
window.addEventListener("message", (event) => {
  if (!event.data) return;

  let data;
  try {
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch (err) {
    return;
  }

  if (data.source !== "readyplayerme") return;

  // avatar exporté → on met à jour avatar3D (et mini-circle seulement si pas de circlePhoto)
  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    if (avatarURL) {
      avatar3D.src = avatarURL;
      localStorage.setItem("avatarURL", avatarURL);

      // si le mini-circle n'a PAS de photo persistante, on montre l'avatar dedans
      const circlePhoto = localStorage.getItem("circlePhoto");
      if (!circlePhoto) {
        miniAvatar.src = avatarURL;
      }
    }
    // fermer modal RPM
    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
  }

  // quand le frame est prêt → on s'abonne (pas besoin d'URL copie)
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
});

/* --- Fermer RPM si clic hors iframe --- */
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) {
    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
    rpmFrame.src = ""; // nettoie le src pour libérer la caméra
  }
});

/* --- Effet danse simple (visuel temporaire) --- */
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 1.8s ease";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => {
    avatar3D.style.transform = "";
  }, 1800);
});

/* --- MINI CIRCLE DRAGGABLE mobile + desktop (touch + mouse) --- */
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  dragging = true;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  offsetX = clientX - miniCircle.getBoundingClientRect().left;
  offsetY = clientY - miniCircle.getBoundingClientRect().top;

  // prevent page scroll on touch drag
  if (e.touches) e.preventDefault();
}

function onDrag(e) {
  if (!dragging) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = clientX - offsetX;
  const y = clientY - offsetY;

  // clamp inside viewport (simple)
  const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
  const maxY = window.innerHeight - miniCircle.offsetHeight - 8;
  miniCircle.style.left = Math.max(8, Math.min(maxX, x)) + "px";
  miniCircle.style.top = Math.max(8, Math.min(maxY, y)) + "px";
}

function endDrag() {
  dragging = false;
}

// events
miniCircle.addEventListener("mousedown", startDrag);
miniCircle.addEventListener("touchstart", startDrag, { passive: false });

document.addEventListener("mousemove", onDrag);
document.addEventListener("touchmove", onDrag, { passive: false });

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// ==========================
// MINI CIRCLE PHOTO FIX
// ==========================

// On garde l'image même après rechargement interne
let savedMiniAvatar = localStorage.getItem("miniAvatar");
const miniAvatarImg = document.getElementById("miniAvatarImg");

if (savedMiniAvatar) {
    miniAvatarImg.src = savedMiniAvatar;
}

// Quand on choisit une photo
function setMiniAvatar(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        miniAvatarImg.src = e.target.result;
        localStorage.setItem("miniAvatar", e.target.result);
    };
    reader.readAsDataURL(file);
}


// ==========================
// FERMETURE DU MENU EN CLIQUANT AILLEURS
// ==========================

const modifyMenu = document.getElementById("modifyMenu");
const modifyBtn = document.getElementById("modifyBtn");

// Toggle normal
modifyBtn.addEventListener("click", () => {
    modifyMenu.classList.toggle("show");
});

// Ferme si on clique ailleurs
document.addEventListener("click", (e) => {
    if (!modifyMenu.contains(e.target) && !modifyBtn.contains(e.target)) {
        modifyMenu.classList.remove("show");
    }
});
