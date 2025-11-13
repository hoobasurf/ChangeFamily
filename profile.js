// ===============================
// 🌟 VARIABLES GLOBALES
// ===============================
const miniCircle = document.getElementById("miniCircle");
const miniCircleImg = document.getElementById("miniCircleImg");
const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// ===============================
// 🌟 CHARGEMENT AU DÉMARRAGE
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  // Charger photo mini-cercle
  const savedPhoto = localStorage.getItem("miniCirclePhoto");
  if (savedPhoto) miniCircleImg.src = savedPhoto;

  // Charger pseudo + avatar Ready Player Me
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) {
    avatar3D.src = avatarURL;
    miniCircleImg.src = avatarURL; // ✅ L’avatar 3D s’affiche aussi dans le mini cercle
  }
});

// ===============================
// 🌟 OUVERTURE / FERMETURE MENU
// ===============================
editBtn.addEventListener("click", () => {
  editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
});

window.addEventListener("click", (e) => {
  if (e.target === editMenu) editMenu.style.display = "none";
});

// ===============================
// 🌟 CHOISIR DEPUIS PHOTOTHÈQUE
// ===============================
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      miniCircleImg.src = url;
      avatar3D.src = url; // ✅ Synchronisation avec avatar 3D
      localStorage.setItem("miniCirclePhoto", url);
      localStorage.setItem("avatarURL", url);
    }
  };
  input.click();
});

// ===============================
// 🌟 PRENDRE UNE PHOTO
// ===============================
takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "camera";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      miniCircleImg.src = url;
      avatar3D.src = url; // ✅ Synchronisation avec avatar 3D
      localStorage.setItem("miniCirclePhoto", url);
      localStorage.setItem("avatarURL", url);
    }
  };
  input.click();
});

// ===============================
// 🌟 CRÉER AVATAR (READY PLAYER ME)
// ===============================
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

// ===============================
// 🌟 ÉCOUTER LES MESSAGES DU FRAME RPM
// ===============================
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
        eventName: "v1.avatar.exported",
      }),
      "*"
    );
  }

  // Quand l’avatar est exporté après "Suivant"
  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    avatar3D.src = avatarURL;
    miniCircleImg.src = avatarURL; // ✅ Avatar visible aussi dans mini cercle
    localStorage.setItem("avatarURL", avatarURL);
    localStorage.setItem("miniCirclePhoto", avatarURL);
    rpmModal.style.display = "none";
  }
});

// ✅ Fermer Ready Player Me au clic extérieur
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});

// ===============================
// 🌟 DRAG DU MINI CERCLE
// ===============================
let isDragging = false,
  offsetX = 0,
  offsetY = 0;

miniCircle.addEventListener("mousedown", startDrag);
miniCircle.addEventListener("touchstart", startDrag);
miniCircle.addEventListener("mousemove", drag);
miniCircle.addEventListener("touchmove", drag);
miniCircle.addEventListener("mouseup", endDrag);
miniCircle.addEventListener("touchend", endDrag);

function startDrag(e) {
  isDragging = true;
  const rect = miniCircle.getBoundingClientRect();
  offsetX = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  offsetY = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
  miniCircle.style.cursor = "grabbing";
}

function drag(e) {
  if (!isDragging) return;
  e.preventDefault();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - offsetX;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - offsetY;
  miniCircle.style.left = `${x}px`;
  miniCircle.style.top = `${y}px`;
}

function endDrag() {
  isDragging = false;
  miniCircle.style.cursor = "grab";
}
