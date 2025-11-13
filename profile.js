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

// ✅ Créer avatar (Ready Player Me)
createAvatar.addEventListener("click", () => {
  rpmModal.style.display = "flex";
  // NOTE: on utilise l'iframe officiel (frameApi) — c'est la source recommandée.
  rpmFrame.src = "https://iframe.readyplayer.me/avatar?frameApi";
  editMenu.style.display = "none";
});

// ===================
// ✅ Écoute les messages du frame Ready Player Me
// ===================
// REMARQUE : on n'applique plus la condition stricte `event.data.source === "readyplayerme"`
// car Ready Player Me peut envoyer différents formats. On supporte les formats courants.
window.addEventListener("message", (event) => {
  const raw = event.data;
  if (!raw) return;

  // debug console (tu peux retirer après test)
  console.log("[profile] message reçu depuis iframe RPM :", raw);

  // Normaliser le message : si c'est une string JSON -> parser
  let data = raw;
  if (typeof raw === "string") {
    try {
      data = JSON.parse(raw);
    } catch (e) {
      // reste sous forme de string si ce n'est pas JSON
    }
  }

  // 1) Cas courant : eventName === "v1.avatar.exported"
  if (data && data.eventName === "v1.avatar.exported") {
    // l'URL peut être dans data.url ou data.data.url selon la version
    const avatarURL = data.url || data.data?.url || (data?.data && data.data.url);
    if (avatarURL) {
      avatar3D.src = avatarURL;
      try { localStorage.setItem("avatarURL", avatarURL); } catch (err) { /* ignore */ }
      rpmModal.style.display = "none";
      console.log("[profile] avatar appliqué depuis RPM :", avatarURL);
      return;
    }
  }

  // 2) Autre pattern : { name: "avatar-exported", data: { url: "..." } }
  if (data && data.name === "avatar-exported" && data.data && data.data.url) {
    const avatarURL = data.data.url;
    avatar3D.src = avatarURL;
    try { localStorage.setItem("avatarURL", avatarURL); } catch (err) { /* ignore */ }
    rpmModal.style.display = "none";
    console.log("[profile] avatar appliqué depuis RPM (alt pattern) :", avatarURL);
    return;
  }

  // 3) Parfois l'objet est plus imbriqué : data.data.url
  if (data && data.data && data.data.url) {
    const avatarURL = data.data.url;
    avatar3D.src = avatarURL;
    try { localStorage.setItem("avatarURL", avatarURL); } catch (err) { /* ignore */ }
    rpmModal.style.display = "none";
    console.log("[profile] avatar appliqué depuis RPM (data.data.url) :", avatarURL);
    return;
  }

  // 4) si le frame indique qu'il est prêt, on envoie le subscribe (stringifié comme dans ton code)
  const isFrameReady =
    (data && data.eventName === "v1.frame.ready") ||
    (data && data.name === "frame-ready") ||
    (typeof raw === "string" && raw.includes("v1.frame.ready"));
  if (isFrameReady && rpmFrame && rpmFrame.contentWindow) {
    try {
      rpmFrame.contentWindow.postMessage(
        JSON.stringify({
          target: "readyplayerme",
          type: "subscribe",
          eventName: "v1.avatar.exported"
        }),
        "*"
      );
      console.log("[profile] subscribe envoyé au frame RPM");
    } catch (err) {
      console.warn("[profile] impossible d'envoyer subscribe :", err);
    }
  }
});

// Fermer Ready Player Me au clic extérieur
rpmModal.addEventListener("click", (e) => {
  if (e.target === rpmModal) rpmModal.style.display = "none";
});
