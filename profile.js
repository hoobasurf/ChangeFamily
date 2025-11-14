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

/* --- Charger le pseudo et l'avatar --- */
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

/* --- Upload Photothèque --- */
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

/* --- Créer Avatar : Ready Player Me --- */
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

window.addEventListener("message", (event) => {
  if (!event.data || event.data.source !== "readyplayerme") return;

  if (event.data.eventName === "v1.avatar.exported") {
    const avatarURL = event.data.data.url;
    avatar3D.src = avatarURL;
    miniAvatar.src = avatarURL;
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

/* --- Fermer RPM si clic extérieur --- */
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});

/* --- Effet danse simple --- */
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 2s linear";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => (avatar3D.style.transform = "rotateY(0deg)"), 2000);
});

/* --- DRAG MINI CIRCLE --- */
let offsetX = 0, offsetY = 0, dragging = false;

miniCircle.addEventListener("mousedown", (e) => {
  dragging = true;
  offsetX = e.clientX - miniCircle.offsetLeft;
  offsetY = e.clientY - miniCircle.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  miniCircle.style.left = `${e.clientX - offsetX}px`;
  miniCircle.style.top = `${e.clientY - offsetY}px`;
});

document.addEventListener("mouseup", () => dragging = false);
