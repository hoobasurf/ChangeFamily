// === Variables principales ===
const avatarImg = document.getElementById("avatarImg");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const pseudoInput = document.getElementById("pseudoInput");

const savePseudo = document.getElementById("savePseudo");
const chooseAvatar = document.getElementById("chooseAvatar");
const chooseGallery = document.getElementById("chooseGallery");
const openCameraAvatar = document.getElementById("openCameraAvatar");
const galleryFile = document.getElementById("galleryFile");

// === Modaux ===
const avatarSelectorModal = document.getElementById("avatarSelectorModal");
const closeSelector = document.getElementById("closeSelector");
const useSelected = document.getElementById("useSelected");
const generateDice = document.getElementById("generateDice");
const openRPM = document.getElementById("openRPM");

// === Prévisualisation avatar ===
const avatarPreview = document.getElementById("avatarPreview");
const diceStyle = document.getElementById("diceStyle");
const diceSeed = document.getElementById("diceSeed");

// === Chargement des données sauvegardées ===
window.addEventListener("load", () => {
  const savedPseudo = localStorage.getItem("userPseudo");
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedPseudo) pseudoDisplay.textContent = savedPseudo;
  if (savedAvatar) avatarImg.src = savedAvatar;
});

// === Enregistrer pseudo ===
savePseudo.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (pseudo) {
    pseudoDisplay.textContent = pseudo;
    localStorage.setItem("userPseudo", pseudo);
    alert("✅ Pseudo enregistré !");
  }
});

// === Ouvrir sélecteur d’avatar ===
chooseAvatar.addEventListener("click", () => {
  avatarSelectorModal.classList.remove("hidden");
});

// === Fermer sélecteur ===
closeSelector.addEventListener("click", () => {
  avatarSelectorModal.classList.add("hidden");
});

// === Générer avatar DiceBear ===
generateDice.addEventListener("click", () => {
  const style = diceStyle.value;
  const seed = diceSeed.value.trim() || "random" + Math.floor(Math.random() * 9999);
  const url = `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
  avatarPreview.src = url;
});

// === Utiliser avatar sélectionné ===
useSelected.addEventListener("click", () => {
  avatarImg.src = avatarPreview.src;
  localStorage.setItem("userAvatar", avatarPreview.src);
  avatarSelectorModal.classList.add("hidden");
  alert("✅ Avatar enregistré !");
});

// === Ouvrir Ready Player Me ===
openRPM.addEventListener("click", () => {
  window.open("https://readyplayer.me/fr/avatar", "_blank");
});

// === Galerie / Selfie ===
chooseGallery.addEventListener("click", () => galleryFile.click());

galleryFile.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    avatarImg.src = evt.target.result;
    localStorage.setItem("userAvatar", evt.target.result);
  };
  reader.readAsDataURL(file);
});

// === Selfie ===
openCameraAvatar.addEventListener("click", () => {
  galleryFile.setAttribute("capture", "user");
  galleryFile.click();
});

// === Effet particules néon ===
const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.querySelector(".screen").offsetHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];
  for (let i = 0; i < 25; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.6,
      r: Math.random() * 3 + 1,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: `hsl(${Math.random() * 60 + 280}, 100%, 70%)`
    });
  }
}
createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 15;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;

    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();
