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

/* --- Charger le pseudo et avatar --- */
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) {
    avatar3D.src = avatarURL;
    miniAvatar.src = avatarURL;
  }
});


/* --- Menu Modifier --- */
editBtn.addEventListener("click", () => {
  editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
});

document.addEventListener("click", (e) => {
  if (!editMenu.contains(e.target) && e.target !== editBtn) {
    editMenu.style.display = "none";
  }
});


/* --- Photothèque --- */
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    avatar3D.src = url;
    miniAvatar.src = url;
    localStorage.setItem("avatarURL", url);
  };

  input.click();
});


/* --- Prendre une photo --- */
takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "camera";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    avatar3D.src = url;
    miniAvatar.src = url;
    localStorage.setItem("avatarURL", url);
  };

  input.click();
});


/* --- Ready Player Me intégré --- */
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

/* --- API ReadyPlayerMe (version correcte) --- */
window.addEventListener("message", (event) => {
  if (!event.data) return;

  let data = {};

  try { data = JSON.parse(event.data); } catch (e) { return; }

  if (data.source !== "readyplayerme") return;

  // Avatar prêt
  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;

    avatar3D.src = avatarURL;
    miniAvatar.src = avatarURL;

    localStorage.setItem("avatarURL", avatarURL);

    rpmModal.style.display = "none";
  }

  // Quand le frame est prêt → abonnement automatique
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

/* --- Fermer RPM au clic extérieur --- */
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});


/* --- Animation danse simple --- */
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 2s linear";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => {
    avatar3D.style.transform = "rotateY(0deg)";
  }, 2000);
});


/* --- MINI CIRCLE DRAGGABLE MOBILE + DESKTOP --- */
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  dragging = true;

  const isTouch = e.type === "touchstart";
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  offsetX = clientX - miniCircle.offsetLeft;
  offsetY = clientY - miniCircle.offsetTop;
}

function drag(e) {
  if (!dragging) return;

  const isTouch = e.type === "touchmove";
  const clientX = isTouch ? e.touches[0].clientX : e.clientX;
  const clientY = isTouch ? e.touches[0].clientY : e.clientY;

  miniCircle.style.left = `${clientX - offsetX}px`;
  miniCircle.style.top = `${clientY - offsetY}px`;
}

function endDrag() {
  dragging = false;
}

miniCircle.addEventListener("mousedown", startDrag);
miniCircle.addEventListener("touchstart", startDrag);

document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag);

document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);
