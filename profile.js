// profile.js — intégration Ready Player Me automatique + photothèque + prise photo
// Aucun changement visuel — tout est en JS

const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// URL iframe officielle (ne pas la vider après ouverture pour garder la communication)
const RPM_IFRAME_SRC = "https://iframe.readyplayer.me/avatar?frameApi"; // garde exactement comme ça

// Charger pseudo + avatar sauvegardés
window.addEventListener("DOMContentLoaded", () => {
  const pseudo = localStorage.getItem("pseudo");
  if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;

  const avatarURL = localStorage.getItem("avatarURL");
  if (avatarURL && avatar3D) {
    avatar3D.src = avatarURL;
  }
});

// Ouvre / ferme menu
if (editBtn && editMenu) {
  editBtn.addEventListener("click", () => {
    editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
  });
}

// Photothèque (fichier local -> applique directement)
if (photoLib) {
  photoLib.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file && avatar3D) {
        const url = URL.createObjectURL(file);
        avatar3D.src = url;
        try { localStorage.setItem("avatarURL", url); } catch (e) {}
      }
    };
    input.click();
    // ferme menu
    if (editMenu) editMenu.style.display = "none";
  });
}

// Prendre photo (camera) -> applique directement
if (takePhoto) {
  takePhoto.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "camera";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file && avatar3D) {
        const url = URL.createObjectURL(file);
        avatar3D.src = url;
        try { localStorage.setItem("avatarURL", url); } catch (e) {}
      }
    };
    input.click();
    if (editMenu) editMenu.style.display = "none";
  });
}

// ---------- READY PLAYER ME ----------
// Ouvrir modal RPM ou (option) coller URL si tu veux : ici on ouvre modal et on écoute l'export
if (createAvatar) {
  createAvatar.addEventListener("click", () => {
    // Ouvre la modal
    if (!rpmModal || !rpmFrame) {
      alert("Erreur : modal Ready Player Me introuvable.");
      return;
    }

    // Assure que le src est positionné une seule fois pour garder la communication
    if (!rpmFrame.src || rpmFrame.src === "") {
      rpmFrame.src = RPM_IFRAME_SRC;
    }

    rpmModal.style.display = "flex";

    // focus pour accessibilité
    try { rpmFrame.focus(); } catch (e) {}
    if (editMenu) editMenu.style.display = "none";
  });
}

// Debug load/error pour l'iframe
if (rpmFrame) {
  rpmFrame.onload = () => console.log("[RPM] iframe loaded");
  rpmFrame.onerror = () => console.error("[RPM] iframe failed to load");
}

// Helper pour valider origine : autorise domaines readyplayer.me (iframe peut venir de subdomain)
function isTrustedOrigin(origin) {
  try {
    if (!origin || typeof origin !== "string") return false;
    const u = new URL(origin);
    return u.hostname.includes("readyplayer.me");
  } catch (e) {
    // certains navigateurs peuvent fournir origin comme "null" ou autre
    return false;
  }
}

// Fonction centrale pour appliquer l'avatar reçu
function applyAvatarUrl(url) {
  if (!url) return;
  // applique sur model-viewer ou ouvre dans nouvel onglet s'il n'existe pas
  if (avatar3D) {
    avatar3D.src = url;
    try { localStorage.setItem("avatarURL", url); } catch (e) { /* ignore */ }
    console.log("[RPM] Avatar appliqué :", url);
    // fermer modal
    if (rpmModal) rpmModal.style.display = "none";
  } else {
    window.open(url, "_blank");
  }
}

// Écoute postMessage depuis l'iframe RPM
window.addEventListener("message", (event) => {
  // sécurité : autoriser seulement les origines contenant readyplayer.me
  // certains environnements (localhost dev) peuvent envoyer "*" ou différents; si tu veux debug local, tu peux commenter la vérif.
  if (!isTrustedOrigin(event.origin)) {
    // On ignore les messages ne venant pas de readyplayer.me
    // Pour debug en local, commente la ligne suivante.
    // console.warn("[RPM] message ignoré origine non trustée:", event.origin);
    // return;
  }

  const data = event.data;
  if (!data) return;

  console.log("[RPM] message reçu brut :", data);

  // Plusieurs formats possibles : objet direct, objet.data, string JSON...
  // 1) objet avec eventName 'v1.avatar.exported' et url / data.url
  try {
    // cas : data is object { eventName: "v1.avatar.exported", url: "..." }
    if (data?.eventName === "v1.avatar.exported") {
      const url = data.url || data?.data?.url || (data?.data && data.data.url);
      if (url) {
        applyAvatarUrl(url);
        return;
      }
    }

    // cas : data is object { name: "avatar-exported", data: { url: "..." } }
    if (data?.name === "avatar-exported" && data?.data?.url) {
      applyAvatarUrl(data.data.url);
      return;
    }

    // cas : parfois l'objet est stringified JSON
    if (typeof data === "string") {
      let parsed = null;
      try { parsed = JSON.parse(data); } catch (e) { parsed = null; }
      if (parsed) {
        if (parsed.eventName === "v1.avatar.exported") {
          const url = parsed.url || parsed?.data?.url;
          if (url) { applyAvatarUrl(url); return; }
        }
        if (parsed.name === "avatar-exported" && parsed?.data?.url) {
          applyAvatarUrl(parsed.data.url); return;
        }
      }
    }
  } catch (err) {
    console.error("[RPM] erreur traitement message :", err);
  }

  // cas : Ready Player Me peut envoyer 'v1.frame.ready' pour indiquer qu'il est prêt
  // On s'abonne alors aux events (certaines intégrations l'attendent)
  try {
    if (data?.eventName === "v1.frame.ready" || data?.name === "frame-ready" || (typeof data === "string" && data.includes("v1.frame.ready"))) {
      // Envoie un message au frame pour s'abonner aux events avatar exportés
      try {
        const subscribeMsg = {
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.avatar.exported"
        };
        // postMessage vers iframe (si contentWindow disponible)
        if (rpmFrame && rpmFrame.contentWindow) {
          rpmFrame.contentWindow.postMessage(subscribeMsg, "*");
          console.log("[RPM] postMessage subscribe envoyé :", subscribeMsg);
        }
      } catch (e) {
        console.warn("[RPM] impossible d'envoyer subscribe au frame :", e);
      }
    }
  } catch (e) { /* ignore */ }
});

// Fermer modal RPM au clic en dehors
if (rpmModal) {
  rpmModal.addEventListener("click", (e) => {
    if (e.target === rpmModal) rpmModal.style.display = "none";
  });
}
