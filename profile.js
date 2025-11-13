// profile.js — version minimalement modifiée pour intégrer RPM automatiquement
const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// ✅ Charger pseudo + avatar sauvegardés
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL) avatar3D.src = avatarURL;
});

// ✅ Bouton Modifier -> ouvre le menu
editBtn.addEventListener("click", () => {
  editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
});

// ✅ Photothèque
photoLib.addEventListener("click", () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      avatar3D.src = url;
      try { localStorage.setItem("avatarURL", url); } catch (err) { /* ignore */ }
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
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      avatar3D.src = url;
      try { localStorage.setItem("avatarURL", url); } catch (err) { /* ignore */ }
    }
  };
  input.click();
});

// ---------- READY PLAYER ME : intégration automatique (modifs minimes) ----------

// utilise l'iframe officielle avec frameApi
const RPM_IFRAME_URL = "https://iframe.readyplayer.me/avatar?frameApi";

// flags pour éviter re-assignations / double subscribe
let rpmSrcSet = false;
let rpmSubscribed = false;

createAvatar.addEventListener("click", () => {
  if (!rpmModal || !rpmFrame) {
    alert("Erreur : modal Ready Player Me introuvable.");
    return;
  }

  // ne définir le src qu'une seule fois (évite reloads en boucle)
  if (!rpmSrcSet) {
    rpmFrame.src = RPM_IFRAME_URL;
    rpmSrcSet = true;
    console.log("[profile] RPM iframe src défini :", RPM_IFRAME_URL);
  } else {
    console.log("[profile] RPM iframe déjà initialisé.");
  }

  rpmModal.style.display = "flex";
  editMenu.style.display = "none";
});

// logs utiles (facultatif mais pratique pour debug)
if (rpmFrame) {
  rpmFrame.addEventListener("load", () => console.log("[profile] RPM iframe loaded"));
  rpmFrame.addEventListener("error", () => console.error("[profile] RPM iframe error"));
}

// helper : applique et sauvegarde l'avatar URL
function applyAvatarUrl(url) {
  if (!url) return;
  avatar3D.src = url;
  try { localStorage.setItem("avatarURL", url); } catch (e) { /* ignore */ }
  if (rpmModal) rpmModal.style.display = "none";
  console.log("[profile] Avatar appliqué :", url);
}

// Écoute les messages postMessage depuis RPM — accepte plusieurs formats
window.addEventListener("message", (event) => {
  // NOTE: ne filtre pas strictement sur event.data.source (ton code original le faisait et rejetait certains messages)
  const raw = event.data;
  if (!raw) return;

  // debug
  console.log("[profile] message reçu depuis iframe :", raw);

  // supporte 3 cas : objet direct, objet.data, ou string JSON
  let data = raw;
  if (typeof raw === "string") {
    try { data = JSON.parse(raw); } catch (e) { /* reste string si non JSON */ }
  }

  // 1) pattern v1.avatar.exported (plusieurs formes possibles)
  if (data && (data.eventName === "v1.avatar.exported" || (data.name === "avatar-exported"))) {
    // récupérer l'URL où qu'elle soit
    const avatarURL = data.url || data.data?.url || data?.data || null;
    if (avatarURL) {
      applyAvatarUrl(avatarURL);
      return;
    }
  }

  // 2) s'il y a un champ data.data.url (autre pattern)
  if (data && data.data && data.data.url) {
    applyAvatarUrl(data.data.url);
    return;
  }

  // 3) si frame ready, envoyer subscribe (une seule fois)
  const isFrameReady = (data.eventName === "v1.frame.ready") || (data.name === "frame-ready") || (typeof raw === "string" && raw.includes("v1.frame.ready"));
  if (isFrameReady && rpmFrame && rpmFrame.contentWindow && !rpmSubscribed) {
    try {
      // Envoie un objet (Ready Player Me accepte aussi stringified JSON, mais objet est ok)
      const subscribeMsg = {
        target: "readyplayerme",
        type: "subscribe",
        eventName: "v1.avatar.exported"
      };
      rpmFrame.contentWindow.postMessage(subscribeMsg, "*");
      rpmSubscribed = true;
      console.log("[profile] subscribe envoyé au frame RPM :", subscribeMsg);
    } catch (err) {
      console.warn("[profile] impossible d'envoyer subscribe :", err);
    }
  }
});

// Fermer Ready Player Me au clic extérieur
if (rpmModal) {
  rpmModal.addEventListener("click", (e) => {
    if (e.target === rpmModal) rpmModal.style.display = "none";
  });
}
