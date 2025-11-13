// profile.js (modifié légèrement — même structure que le tien)
// But : quand tu cliques "Suivant" dans Ready Player Me, l'avatar apparaît automatiquement dans l'app.
// Aucun changement visuel — uniquement JS.

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
  if (avatarURL) {
    // applique l'URL sauvegardée (image ou .glb)
    avatar3D.src = avatarURL;
  }
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

// ---------- READY PLAYER ME : intégration automatique ----------

// iframe source officielle (utilise frameApi pour postMessage)
const RPM_IFRAME_URL = "https://iframe.readyplayer.me/avatar?frameApi";

// Flags pour éviter réaffectation répétée du src et double-subscribe
let rpmSrcSet = false;
let rpmSubscribed = false;

createAvatar.addEventListener("click", () => {
  // Si l'élément modal/iframe introuvable -> erreur
  if (!rpmModal || !rpmFrame) {
    alert("Erreur : modal Ready Player Me introuvable.");
    return;
  }

  // Définit la src une seule fois pour éviter boucles
  if (!rpmSrcSet) {
    rpmFrame.src = RPM_IFRAME_URL;
    rpmSrcSet = true;
    // debug léger
    console.log("[profile] RPM iframe src défini :", RPM_IFRAME_URL);
  } else {
    console.log("[profile] RPM iframe src déjà défini (pas de reload).");
  }

  // Affiche la modal
  rpmModal.style.display = "flex";
  editMenu.style.display = "none";
});

// Optionnel : logs de chargement (utile si tu debugues)
if (rpmFrame) {
  rpmFrame.addEventListener("load", () => console.log("[profile] RPM iframe loaded"));
  rpmFrame.addEventListener("error", () => console.error("[profile] RPM iframe error"));
}

// Helper — applique l'URL reçue et sauvegarde
function applyAvatarUrl(avatarURL) {
  if (!avatarURL) return;
  avatar3D.src = avatarURL;
  try { localStorage.setItem("avatarURL", avatarURL); } catch (e) { /* ignore */ }
  // fermer modal RPM si ouvert
  if (rpmModal) rpmModal.style.display = "none";
  console.log("[profile] Avatar appliqué automatiquement :", avatarURL);
}

// Écoute les messages postMessage depuis l'iframe Ready Player Me
window.addEventListener("message", (event) => {
  // NOTE: event.origin peut être vérifié si tu veux restreindre, mais en dev local ça peut bloquer.
  const data = event.data;
  if (!data) return;

  // Pour debug, affiche le message (supprime si tu veux)
  console.log("[profile] message reçu depuis iframe RPM :", data);

  // Cas courant 1 : objet avec eventName 'v1.avatar.exported'
  if (data?.eventName === "v1.avatar.exported") {
    // certaines versions envoient url directement, d'autres dans data.data.url
    const avatarURL = data.url || data?.data?.url || (data?.data && data.data.url);
    if (avatarURL) {
      applyAvatarUrl(avatarURL);
      return;
    }
  }

  // Cas courant 2 : { name: "avatar-exported", data: { url: "..." } }
  if (data?.name === "avatar-exported" && data?.data?.url) {
    applyAvatarUrl(data.data.url);
    return;
  }

  // Parfois le message est stringifié JSON
  if (typeof data === "string") {
    let parsed = null;
    try { parsed = JSON.parse(data); } catch (e) { parsed = null; }
    if (parsed) {
      if (parsed?.eventName === "v1.avatar.exported") {
        const avatarURL = parsed.url || parsed?.data?.url;
        if (avatarURL) { applyAvatarUrl(avatarURL); return; }
      }
      if (parsed?.name === "avatar-exported" && parsed?.data?.url) {
        applyAvatarUrl(parsed.data.url); return;
      }
    }
  }

  // Si le frame indique qu'il est prêt, on s'abonne (subscribe) une seule fois
  if ((data?.eventName === "v1.frame.ready" || data?.name === "frame-ready" || (typeof data === "string" && data.includes("v1.frame.ready"))) && rpmFrame && rpmFrame.contentWindow && !rpmSubscribed) {
    try {
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

// Fermer Ready Player Me au clic extérieur (ton code)
if (rpmModal) {
  rpmModal.addEventListener("click", (e) => {
    if (e.target === rpmModal) rpmModal.style.display = "none";
  });
}
