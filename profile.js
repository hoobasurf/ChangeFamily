// profile.js — intégration Ready Player Me sans boucle de chargement
// => Ne modifie pas le visuel. Corrige la boucle de reload en utilisant des flags.

const avatar3D = document.getElementById("avatar3D");
const pseudoDisplay = document.getElementById("pseudoDisplay");
const editBtn = document.getElementById("editProfile");
const editMenu = document.getElementById("editMenu");
const photoLib = document.getElementById("photoLib");
const takePhoto = document.getElementById("takePhoto");
const createAvatar = document.getElementById("createAvatar");
const rpmModal = document.getElementById("rpmModal");
const rpmFrame = document.getElementById("rpmFrame");

// URL iframe officielle (remplace si tu as une URL partner)
const RPM_IFRAME_SRC = "https://iframe.readyplayer.me/avatar?frameApi";

// Flags pour éviter répétitions / boucles
let rpmSrcSet = false;
let rpmSubscribed = false;
let rpmLoadCount = 0;
const RPM_MAX_LOADS = 6; // sécurité : stoppe si l'iframe se recharge trop souvent

// Charger pseudo + avatar sauvegardés
window.addEventListener("DOMContentLoaded", () => {
  try {
    const pseudo = localStorage.getItem("pseudo");
    if (pseudo && pseudoDisplay) pseudoDisplay.textContent = pseudo;

    const avatarURL = localStorage.getItem("avatarURL");
    if (avatarURL && avatar3D) avatar3D.src = avatarURL;
  } catch (e) {
    console.warn("[profile] erreur au chargement initial :", e);
  }
});

// Ouvre / ferme menu modifier
if (editBtn && editMenu) {
  editBtn.addEventListener("click", () => {
    editMenu.style.display = editMenu.style.display === "flex" ? "none" : "flex";
  });
}

// Photothèque : applique directement l'image (pas de changement visuel)
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
    if (editMenu) editMenu.style.display = "none";
  });
}

// Prendre photo (camera)
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

// ---------- READY PLAYER ME : ouverture + prévention boucle ----------
if (createAvatar) {
  createAvatar.addEventListener("click", () => {
    if (!rpmModal || !rpmFrame) {
      alert("Erreur : modal Ready Player Me introuvable.");
      return;
    }

    // Désactive tentative si iframe a rechargé trop souvent
    if (rpmLoadCount >= RPM_MAX_LOADS) {
      console.error("[RPM] trop de reloads détectés — ouverture bloquée.");
      alert("Impossible d'ouvrir Ready Player Me : problème de chargement. Vérifie la console.");
      return;
    }

    // Positionne SRC une seule fois (évite réaffectations qui causent des reloads)
    if (!rpmSrcSet) {
      rpmFrame.src = RPM_IFRAME_SRC;
      rpmSrcSet = true;
      console.log("[RPM] src défini pour la première fois :", RPM_IFRAME_SRC);
    } else {
      console.log("[RPM] src déjà défini — on ne le redéfinit pas.");
    }

    // Affiche la modal (mais on ne touche pas au src après)
    rpmModal.style.display = "flex";
    try { rpmFrame.focus(); } catch (e) {}
    if (editMenu) editMenu.style.display = "none";
  });
}

// Sécurité/diagnostic : compter les chargements pour détecter boucles
if (rpmFrame) {
  rpmFrame.addEventListener("load", () => {
    rpmLoadCount += 1;
    console.log(`[RPM] iframe loaded (count=${rpmLoadCount})`);
    if (rpmLoadCount >= RPM_MAX_LOADS) {
      console.error("[RPM] nombre max de reloads atteint — on n'enverra plus de messages au frame.");
      // On évite d'envoyer autre chose si load trop souvent
    }
  });

  rpmFrame.addEventListener("error", () => {
    console.error("[RPM] erreur de chargement iframe");
  });
}

// Helper : autoriser origines qui contiennent readyplayer.me (tolérant pour sous-domaines)
function isTrustedOrigin(origin) {
  try {
    if (!origin || typeof origin !== "string") return false;
    const u = new URL(origin);
    return u.hostname.includes("readyplayer.me");
  } catch (e) {
    return false;
  }
}

// Applique l'URL d'avatar reçue
function applyAvatarUrl(url) {
  if (!url) return;
  if (avatar3D) {
    avatar3D.src = url;
    try { localStorage.setItem("avatarURL", url); } catch (e) {}
    console.log("[RPM] Avatar appliqué :", url);
  } else {
    window.open(url, "_blank");
  }
  // ferme modal si ouverte
  if (rpmModal) rpmModal.style.display = "none";
}

// Écoute postMessage depuis l'iframe RPM
window.addEventListener("message", (event) => {
  // Si tu veux, active la vérif. Pour debug local, tu peux commenter la vérif.
  if (!isTrustedOrigin(event.origin)) {
    // ignore messages d'origines non readyplayer.me
    // console.warn("[RPM] Ignoré origine non trustée:", event.origin);
    // return;
  }

  const data = event.data;
  if (!data) return;
  console.log("[RPM] message reçu :", data);

  // Si too many reloads, on n'essaye pas d'interagir davantage
  if (rpmLoadCount >= RPM_MAX_LOADS) {
    console.warn("[RPM] Ignoré message car trop de reloads détectés.");
    return;
  }

  try {
    // Cas courant : objet avec eventName
    if (data?.eventName === "v1.avatar.exported") {
      // certaines versions mettent l'url dans data.url ou data.data.url
      const url = data.url || data?.data?.url || (data?.data && data.data.url);
      if (url) {
        applyAvatarUrl(url);
        return;
      }
    }

    // Autre pattern : name: "avatar-exported"
    if (data?.name === "avatar-exported" && data?.data?.url) {
      applyAvatarUrl(data.data.url);
      return;
    }

    // Parfois le message est stringifié JSON
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

    // Si frame indique qu'il est prêt, on s'abonne **une seule fois** (subscribe)
    if ((data?.eventName === "v1.frame.ready" || data?.name === "frame-ready" || (typeof data === "string" && data.includes("v1.frame.ready"))) && rpmFrame && rpmFrame.contentWindow && !rpmSubscribed) {
      try {
        const subscribeMsg = {
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.avatar.exported"
        };
        rpmFrame.contentWindow.postMessage(subscribeMsg, "*");
        rpmSubscribed = true;
        console.log("[RPM] subscribe envoyé au frame :", subscribeMsg);
      } catch (e) {
        console.warn("[RPM] impossible d'envoyer subscribe :", e);
      }
    }
  } catch (err) {
    console.error("[RPM] erreur traitement message :", err);
  }
});

// Fermer modal si clic en dehors
if (rpmModal) {
  rpmModal.addEventListener("click", (e) => {
    if (e.target === rpmModal) rpmModal.style.display = "none";
  });
}
