// profile.js — gestion menu + Photothèque + Prendre photo + Ready Player Me
document.addEventListener("DOMContentLoaded", () => {
  // ---- CONFIG ----
  // Remplace par ton URL Ready Player Me fournie par RPM (avec frameApi ou partner param si nécessaire).
  // Exemple habituel : "https://iframe.readyplayer.me/avatar?frameApi"
  const RPM_IFRAME_URL = "https://iframe.readyplayer.me/avatar?frameApi"; // <-- METS TON URL ICI

  // ---- ÉLÉMENTS ----
  const editBtn = document.getElementById("editProfile");
  const editMenu = document.getElementById("editMenu");
  const photoLibBtn = document.getElementById("photoLib");
  const takePhotoBtn = document.getElementById("takePhoto");
  const createAvatarBtn = document.getElementById("createAvatar");
  const rpmModal = document.getElementById("rpmModal");
  const rpmFrame = document.getElementById("rpmFrame");
  const avatar3D = document.getElementById("avatar3D"); // ton <model-viewer>
  const pseudoDisplay = document.getElementById("pseudoDisplay");

  // ---- SÉCURITÉ ----
  if (!editBtn || !editMenu) {
    console.error("profile.js: éléments #editProfile et/ou #editMenu introuvables.");
    return;
  }

  // ---- UTILITAIRES ----
  function showEditMenu(show) {
    editMenu.classList.toggle("show", !!show);
    editBtn.setAttribute("aria-expanded", String(!!show));
  }
  function closeEditMenu() {
    showEditMenu(false);
  }

  function openInlineInputFile({ accept = "image/*", capture = null, multiple = false, onFile } = {}) {
    // Crée un input temporaire et le clique (doit être déclenché par un event user)
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.multiple = !!multiple;
    if (capture) input.setAttribute("capture", capture);
    input.style.display = "none";

    input.addEventListener("change", (ev) => {
      const files = ev.target.files;
      if (!files || files.length === 0) {
        input.remove();
        return;
      }
      // On prend le premier fichier (utilisateur choisit 1 seule image)
      const file = files[0];
      if (typeof onFile === "function") onFile(file);
      // nettoyage léger (délais pour éviter crash sur certains navigateurs)
      setTimeout(() => input.remove(), 300);
    });

    document.body.appendChild(input);
    input.click();

    // fallback cleanup
    setTimeout(() => {
      if (document.body.contains(input)) input.remove();
    }, 60000);
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ---- PHOTOTHÈQUE ----
  async function handlePhotoLibrary() {
    openInlineInputFile({
      accept: "image/*",
      multiple: false,
      onFile: async (file) => {
        try {
          const dataUrl = await fileToDataURL(file);
          console.log("Image choisie depuis la photothèque:", file);
          applyImageAsAvatarPreview(dataUrl);
          // TODO: uploader coté serveur si besoin
        } catch (err) {
          console.error("Erreur lecture fichier:", err);
        }
      },
    });
  }

  // ---- PRENDRE UNE PHOTO (mobile) ----
  async function handleTakePhoto() {
    // Hint "environment" pour ouvrir la caméra arrière sur la plupart des mobiles
    openInlineInputFile({
      accept: "image/*",
      capture: "environment",
      multiple: false,
      onFile: async (file) => {
        try {
          const dataUrl = await fileToDataURL(file);
          console.log("Photo capturée:", file);
          applyImageAsAvatarPreview(dataUrl);
          // TODO: uploader coté serveur si besoin
        } catch (err) {
          console.error("Erreur lecture photo:", err);
        }
      },
    });
  }

  // ---- READY PLAYER ME ----
  function openReadyPlayerMe() {
    if (!rpmModal || !rpmFrame) {
      console.warn("RPM modal ou rpmFrame introuvable dans le DOM.");
      alert("Erreur : modal Ready Player Me introuvable.");
      return;
    }
    // Définit la source seulement si nécessaire pour éviter reloads inutiles
    if (!rpmFrame.src || rpmFrame.src === "") {
      // Important : RPM a besoin en général de frameApi dans l'URL pour poster messages
      rpmFrame.src = RPM_IFRAME_URL;
    }
    rpmModal.style.display = "flex";
    // Accessibilité : focus sur l'iframe
    try { rpmFrame.focus(); } catch (e) { /* ignore */ }
  }

  function closeRpmModal() {
    if (rpmModal) rpmModal.style.display = "none";
    // si tu veux vider le src pour forcer un nouvel avatar la prochaine fois, décommente :
    // rpmFrame.src = "";
  }

  // Gestion des messages postMessage de Ready Player Me
  window.addEventListener("message", (event) => {
    // Optionnel : filtrer event.origin si tu veux plus de sécurité
    // if (event.origin !== "https://iframe.readyplayer.me") return;

    const data = event.data;
    console.log("Message reçu depuis iframe RPM :", data);

    // Pattern courant v1
    if (data?.eventName === "v1.avatar.exported" && data?.url) {
      onReadyPlayerMeAvatar(data.url);
      closeRpmModal();
      return;
    }
    // Autre pattern courant
    if (data?.name === "avatar-exported" && data?.data?.url) {
      onReadyPlayerMeAvatar(data.data.url);
      closeRpmModal();
      return;
    }
    // Fermeture
    if (data === "rmp-close" || data?.eventName === "v1.avatar.closed") {
      closeRpmModal();
      return;
    }
  });

  // ---- APPLIQUER L'AVATAR ----
  // Si RPM renvoie une URL .glb/.gltf on l'applique au <model-viewer>
  function onReadyPlayerMeAvatar(avatarUrl) {
    console.log("URL avatar RPM reçue :", avatarUrl);
    if (avatar3D && avatar3D.tagName && avatar3D.tagName.toLowerCase() === "model-viewer") {
      // Appliquer le modèle 3D reçu
      avatar3D.src = avatarUrl;
      // Petit hack pour forcer reload si nécessaire
      try {
        avatar3D.removeAttribute("reveal");
      } catch (e) { /* ignore */ }
      alert("Avatar Ready Player Me appliqué.");
    } else {
      // Si pas de model-viewer, on ouvre dans un nouvel onglet
      window.open(avatarUrl, "_blank");
      alert("Avatar prêt (ouvert dans un nouvel onglet).");
    }
    // Ici tu peux sauvegarder avatarUrl en BDD via fetch POST si besoin
  }

  // ---- APPLIQUER IMAGE (photothèque / camera) EN PREVIEW ----
  function applyImageAsAvatarPreview(dataUrl) {
    // Si tu veux appliquer une image de preview, ajoute un <img id="avatarPreview"> dans ton HTML.
    // Pour l'instant on log et on affiche une alerte courte (ne change pas ton visuel).
    console.log("Preview image ready - longueur dataURL:", dataUrl.length);
    // Si tu as un élément pour preview (ex: #avatarPreview), on l'utilise :
    const preview = document.getElementById("avatarPreview");
    if (preview && preview.tagName.toLowerCase() === "img") {
      preview.src = dataUrl;
    } else {
      // Sinon on garde juste le log — pas de modification visuelle
    }
  }

  // ---- UI : ouverture / fermeture menu & modal RPM ----
  editBtn.setAttribute("aria-haspopup", "true");
  editBtn.setAttribute("aria-expanded", "false");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const next = !editMenu.classList.contains("show");
    showEditMenu(next);
  });

  // éviter que cliquer DANS le menu ferme tout de suite
  editMenu.addEventListener("click", (e) => e.stopPropagation());

  // fermer si clique hors
  document.addEventListener("click", () => {
    if (editMenu.classList.contains("show")) showEditMenu(false);
  });

  // ESC -> fermer menu & modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (editMenu.classList.contains("show")) showEditMenu(false);
      if (rpmModal && rpmModal.style.display === "flex") closeRpmModal();
    }
  });

  // fermeture modal RPM si clic dehors
  if (rpmModal) {
    rpmModal.addEventListener("click", (e) => {
      if (e.target === rpmModal) closeRpmModal();
    });
  }

  // ---- BIND des boutons ----
  if (photoLibBtn) {
    photoLibBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeEditMenu();
      handlePhotoLibrary();
    });
  }
  if (takePhotoBtn) {
    takePhotoBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeEditMenu();
      handleTakePhoto();
    });
  }
  if (createAvatarBtn) {
    createAvatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeEditMenu();
      openReadyPlayerMe();
    });
  }

  // Optionnel : mettre un pseudo test si vide (ne modifie pas ton visuel existant)
  if (pseudoDisplay && pseudoDisplay.textContent.trim() === "") {
    // garde "Sans pseudo" si tu veux; sinon tu peux préremplir :
    // pseudoDisplay.textContent = "TonPseudo";
  }
});
