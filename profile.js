// === Variables ===
const avatarImg = document.getElementById("avatarImg");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const pseudoInput = document.getElementById("pseudoInput");
const avatarFile = document.getElementById("avatarFile");
const savePseudo = document.getElementById("savePseudo");
const chooseAvatar = document.getElementById("chooseAvatar");

// === Charger données stockées ===
window.addEventListener("load", () => {
  const savedPseudo = localStorage.getItem("userPseudo");
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedPseudo) pseudoDisplay.textContent = savedPseudo;
  if (savedAvatar) avatarImg.src = savedAvatar;
});

// === Changer pseudo ===
savePseudo.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (pseudo) {
    pseudoDisplay.textContent = pseudo;
    localStorage.setItem("userPseudo", pseudo);
    alert("✅ Pseudo enregistré !");
  }
});

// === Changer avatar depuis galerie ===
chooseAvatar.addEventListener("click", () => avatarFile.click());

avatarFile.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    avatarImg.src = evt.target.result;
    localStorage.setItem("userAvatar", evt.target.result);
  };
  reader.readAsDataURL(file);
});

// === Effet particules ===
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
