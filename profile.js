const miniCircle = document.getElementById("miniCircle");
const miniCircleImg = document.getElementById("miniCircleImg");
const avatar3D = document.getElementById("avatar3D");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// Charger photo + avatar
window.addEventListener("DOMContentLoaded", () => {
  const savedPhoto = localStorage.getItem("miniCirclePhoto");
  if (savedPhoto) miniCircleImg.src = savedPhoto;
  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) avatar3D.src = avatarURL;
});

// Ouvrir/fermer menu
editBtn.addEventListener("click", () => {
  editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
});
window.addEventListener("click", e => {
  if (e.target === editMenu) editMenu.style.display = "none";
});

// Photothèque
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      miniCircleImg.src = url;
      localStorage.setItem("miniCirclePhoto", url);
    }
  };
  input.click();
});

// Prendre photo
takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "camera";
  input.onchange = e => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      miniCircleImg.src = url;
      localStorage.setItem("miniCirclePhoto", url);
    }
  };
  input.click();
});

// Créer avatar Ready Player Me
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

rpmModal.addEventListener("click", e => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});

window.addEventListener("message", event => {
  let data;
  try { data = JSON.parse(event.data); } catch { data = event.data; }
  if (!data || data.source !== "readyplayerme") return;

  if (data.eventName === "v1.frame.ready") {
    rpmFrame.contentWindow.postMessage(JSON.stringify({
      target: "readyplayerme",
      type: "subscribe",
      eventName: "v1.avatar.exported"
    }), "*");
  }

  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    avatar3D.src = avatarURL;
    miniCircleImg.src = avatarURL;
    localStorage.setItem("avatarURL", avatarURL);
    localStorage.setItem("miniCirclePhoto", avatarURL);
    rpmModal.style.display = "none";
  }
});

// Drag mini-cercle
let isDragging = false, offsetX = 0, offsetY = 0;
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
