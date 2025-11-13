const miniCircle = document.getElementById("miniCircle");
const miniCircleImg = document.getElementById("miniCircleImg");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const avatar3D = document.getElementById("avatar3D");

// ✅ Charger la photo enregistrée
window.addEventListener("DOMContentLoaded", () => {
  const savedPhoto = localStorage.getItem("miniCirclePhoto");
  if (savedPhoto) miniCircleImg.src = savedPhoto;
});

// ✅ Ouvrir / fermer le menu
editBtn.addEventListener("click", () => {
  editMenu.style.display = "flex";
});
window.addEventListener("click", e => {
  if (e.target === editMenu) editMenu.style.display = "none";
});

// ✅ Choisir depuis photothèque
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

// ✅ Prendre une photo
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

// ✅ Drag du mini cercle
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
