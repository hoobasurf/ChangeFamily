// ===== PROFIL.JS COMPLET =====

// Elements principaux
const avatarImg = document.getElementById("avatarImg"); // fallback si pas 3D
const avatar3D = document.getElementById("avatar3D");  // viewer 3D
const pseudoDisplay = document.getElementById("pseudoDisplay");
const pseudoInput = document.getElementById("pseudoInput");
const savePseudo = document.getElementById("savePseudo");
const chooseAvatar = document.getElementById("chooseAvatar");
const chooseGallery = document.getElementById("chooseGallery");
const openCameraAvatar = document.getElementById("openCameraAvatar");
const galleryFile = document.getElementById("galleryFile");
const resetProfile = document.getElementById("resetProfile");

// Ready Player Me
const rpmContainer = document.getElementById("rpmContainer");
const rpmFrame = document.getElementById("rpmFrame");
const openRPMbtn = document.getElementById("openRPM");

// Toast message custom
function toast(msg) {
  const t = document.createElement("div");
  t.innerText = msg;
  t.style.position = "fixed";
  t.style.bottom = "120px";
  t.style.left = "50%";
  t.style.transform = "translateX(-50%)";
  t.style.background = "linear-gradient(90deg, #ff00ff, #6a00ff)";
  t.style.color = "#fff";
  t.style.padding = "12px 22px";
  t.style.borderRadius = "30px";
  t.style.boxShadow = "0 0 12px #ff00ffaa";
  t.style.fontSize = "14px";
  t.style.zIndex = "99999";
  t.style.animation = "fadein 0.3s, fadeout 0.3s 2.2s";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

// Charge pseudo + avatar au démarrage
window.addEventListener("load", () => {
  const savedPseudo = localStorage.getItem("userPseudo");
  const savedAvatar = localStorage.getItem("userAvatar");

  if (savedPseudo) pseudoDisplay.textContent = savedPseudo;

  if (savedAvatar) {
    if (savedAvatar.includes(".glb") || savedAvatar.includes(".vrm")) {
      avatar3D.src = savedAvatar;
    } else {
      avatarImg.src = savedAvatar;
    }
  }
});

// Enregistrer pseudo
savePseudo.addEventListener("click", () => {
  const pseudo = pseudoInput.value.trim();
  if (!pseudo) return;
  pseudoDisplay.textContent = pseudo;
  localStorage.setItem("userPseudo", pseudo);
  toast("✅ Pseudo enregistré");
});

// Ouvre Ready Player Me
openRPMbtn.addEventListener("click", () => {
  rpmFrame.src = "https://readyplayer.me/avatar?frameApi&lang=fr";
  rpmContainer.classList.add("active");
});

// Retour avatar Ready Player Me
window.addEventListener("message", (event) => {
  if (!event.data) return;
  let data;
  try {
    data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
  } catch {
    return;
  }

  if (data.source === "readyplayerme" && data.eventName === "v1.avatar.exported") {
    let avatarURL = data.data.url;
    console.log("Avatar reçu :", avatarURL);

    // Forcer format 3D GLB (Ready Player Me l’autorise en ajoutant ?format=glb)
    const avatar3Durl = avatarURL.includes("?") ? avatarURL + "&format=glb" : avatarURL + "?format=glb";

    // Charge 3D
    avatar3D.src = avatar3Durl;

    // Backup 2D (fallback)
    avatarImg.src = avatarURL + "?quality=medium";

    // Save
    localStorage.setItem("userAvatar", avatar3Durl);

    // Ferme modal
    rpmContainer.classList.remove("active");
    setTimeout(() => (rpmFrame.src = ""), 500);

    toast("✨ Avatar 3D importé !");
  }
});

// Galerie
chooseGallery.addEventListener("click", () => galleryFile.click());
galleryFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    avatarImg.src = evt.target.result;
    localStorage.setItem("userAvatar", evt.target.result);
    toast("🖼️ Photo ajoutée !");
  };
  reader.readAsDataURL(file);
});

// Selfie
openCameraAvatar.addEventListener("click", () => {
  galleryFile.setAttribute("capture", "user");
  galleryFile.click();
});

// Réinitialiser profil
resetProfile.addEventListener("click", () => {
  if (!confirm("⚠️ Tout réinitialiser ?")) return;

  localStorage.removeItem("userPseudo");
  localStorage.removeItem("userAvatar");

  pseudoDisplay.textContent = "Sans pseudo";

  avatarImg.src = "avatar-default.png";
  avatar3D.src = "";

  pseudoInput.value = "";
  toast("♻️ Profil réinitialisé");
});

// Effet néon sur hover avatar 3D
avatar3D.addEventListener("mouseover", () => {
  avatar3D.style.boxShadow = "0 0 25px #ff00ff, 0 0 50px #a000ff";
});
avatar3D.addEventListener("mouseleave", () => {
  avatar3D.style.boxShadow = "0 0 15px #ff00ff88";
});
