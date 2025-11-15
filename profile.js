// profile.js — version STABLE
// ------------------------------------------------------------
// GARDE TON HTML/CSS — RIEN NE CHANGE VISUELLEMENT
// ------------------------------------------------------------

// éléments DOM
const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editBtn");
const editMenu = document.getElementById("editMenu");
const uploadPhoto = document.getElementById("uploadPhoto");
const uploadBtn = document.getElementById("uploadBtn");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");
const danceBtn = document.getElementById("danceBtn");

const miniCircle = document.getElementById("miniCircle");
const miniAvatarImg = document.getElementById("miniAvatarImg");

// ---------- Chargement initial ----------
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const circlePhoto = localStorage.getItem("circlePhoto");
  const avatarURL = localStorage.getItem("avatarURL");

  // priorité photo mini-circle
  if (circlePhoto) {
    miniAvatarImg.src = circlePhoto;
  } else if (avatarURL) {
    miniAvatarImg.src = avatarURL;
  } else {
    miniAvatarImg.src = "default.jpg";
  }

  // avatar 3D humain RPM
  if (avatarURL) {
    avatar3D.src = avatarURL;
  }

  // ------------------------------------------------------------
  // 🔥 AJOUT ANIMAL (AU BON ENDROIT)
  // ------------------------------------------------------------
  const savedAnimal = localStorage.getItem("animalURL");
  const animalViewer = document.getElementById("animal3D");

  if (animalViewer) {
    if (savedAnimal) {
      animalViewer.src = savedAnimal;
    } else {
      // modèle animal par défaut si jamais rien n’a été choisi
      const defaultAnimal =
        "https://rawcdn.githack.com/KhronosGroup/glTF-Sample-Models/master/2.0/Fox/glTF-Binary/Fox.glb";

      animalViewer.src = defaultAnimal;
      localStorage.setItem("animalURL", defaultAnimal);
    }
  }
});

// ---------- Menu "Modifier" ----------
editBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  const visible = editMenu.style.display === "flex";
  editMenu.style.display = visible ? "none" : "flex";
  editMenu.setAttribute("aria-hidden", visible ? "true" : "false");
});

document.addEventListener("click", (e) => {
  if (editMenu.style.display === "flex") {
    if (!editMenu.contains(e.target) && e.target !== editBtn) {
      editMenu.style.display = "none";
      editMenu.setAttribute("aria-hidden", "true");
    }
  }
});

// ---------- Upload Photo mini-circle ----------
uploadBtn.addEventListener("click", () => {
  uploadPhoto.click();
  editMenu.style.display = "none";
});

uploadPhoto.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  setMiniAvatar(file);
});

takePhoto.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.onchange = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setMiniAvatar(f);
  };
  input.click();
  editMenu.style.display = "none";
});

function setMiniAvatar(file) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const dataUrl = ev.target.result;
    miniAvatarImg.src = dataUrl;
    localStorage.setItem("circlePhoto", dataUrl);
  };
  reader.readAsDataURL(file);
}

// ---------- Ready Player Me ----------
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  rpmModal.setAttribute("aria-hidden", "false");
  rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

window.addEventListener("message", (event) => {
  if (!event.data) return;

  let data;
  try {
    data =
      typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch (err) {
    return;
  }

  if (data.source !== "readyplayerme") return;

  if (data.eventName === "v1.avatar.exported") {
    const avatarURL = data.data.url;
    if (avatarURL) {
      avatar3D.src = avatarURL;
      localStorage.setItem("avatarURL", avatarURL);

      const circlePhoto = localStorage.getItem("circlePhoto");
      if (!circlePhoto) miniAvatarImg.src = avatarURL;
    }

    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
    rpmFrame.src = "";
  }

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

rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) {
    rpmModal.style.display = "none";
    rpmModal.setAttribute("aria-hidden", "true");
    rpmFrame.src = "";
  }
});

// ---------- Danse ----------
danceBtn.addEventListener("click", () => {
  avatar3D.style.transition = "transform 1.8s ease";
  avatar3D.style.transform = "rotateY(720deg)";
  setTimeout(() => {
    avatar3D.style.transform = "";
  }, 1800);
});

// ---------- MINI CIRCLE DRAG ----------
let dragging = false;
let offsetX = 0;
let offsetY = 0;

function startDrag(e) {
  dragging = true;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const rect = miniCircle.getBoundingClientRect();
  offsetX = clientX - rect.left;
  offsetY = clientY - rect.top;
  if (e.touches) e.preventDefault();
}

function onDrag(e) {
  if (!dragging) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const x = clientX - offsetX;
  const y = clientY - offsetY;

  const maxX = window.innerWidth - miniCircle.offsetWidth - 8;
  const maxY = window.innerHeight - miniCircle.offsetHeight - 8;

  miniCircle.style.left = Math.max(8, Math.min(maxX, x)) + "px";
  miniCircle.style.top = Math.max(8, Math.min(maxY, y)) + "px";
}

function endDrag() {
  dragging = false;
}

miniCircle.addEventListener("mousedown", startDrag);
miniCircle.addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("mousemove", onDrag);
document.addEventListener("touchmove", onDrag, { passive: false });
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);
