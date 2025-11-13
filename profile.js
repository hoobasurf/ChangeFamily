// profile.js — gestion menu + Photothèque + Prendre photo + Ready Player Me
document.addEventListener("DOMContentLoaded", () => {
  const RPM_IFRAME_URL = "https://iframe.readyplayer.me/avatar?frameApi"; // <-- mets ton URL RPM complète ici

  const editBtn = document.getElementById("editProfile");
  const editMenu = document.getElementById("editMenu");
  const photoLibBtn = document.getElementById("photoLib");
  const takePhotoBtn = document.getElementById("takePhoto");
  const createAvatarBtn = document.getElementById("createAvatar");
  const rpmModal = document.getElementById("rpmModal");
  const rpmFrame = document.getElementById("rpmFrame");
  const avatar3D = document.getElementById("avatar3D");
  const pseudoDisplay = document.getElementById("pseudoDisplay");

  if (!editBtn || !editMenu) {
    console.error("profile.js: éléments #editProfile et/ou #editMenu introuvables.");
    return;
  }

  // --- UTILITAIRES MENU ---
  function showEditMenu(show) {
    editMenu.classList.toggle("show", !!show);
    editBtn.setAttribute("aria-expanded", String(!!show));
  }
  function closeEditMenu() { showEditMenu(false); }

  function openInlineInputFile({ accept = "image/*", capture = null, multiple = false, onFile } = {}) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    if (capture) input.setAttribute("capture", capture);
    input.multiple = !!multiple;
    input.style.display = "none";

    input.addEventListener("change", (ev) => {
      const files = ev.target.files;
      if (!files || files.length === 0) { input.remove(); return; }
      const file = files[0];
      if (typeof onFile === "function") onFile(file);
      setTimeout(() => input.remove(), 300);
    });

    document.body.appendChild(input);
    input.click();

    setTimeout(() => { if (document.body.contains(input)) input.remove(); }, 60000);
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // --- PHOTOTHÈQUE ---
  async function handlePhotoLibrary() {
    openInlineInputFile({
      accept: "image/*",
      multiple: false,
      onFile: async (file) => {
        try {
          const dataUrl = await fileToDataURL(file);
          console.log("Image choisie depuis la photothèque:", file);
          applyImageAsAvatarPreview(dataUrl);
        } catch (err) {
          console.error("Erreur lecture fichier:", err);
        }
      },
    });
  }

  // --- PRENDRE PHOTO ---
  async function handleTakePhoto() {
    openInlineInputFile({
      accept: "image/*",
      capture: "environment",
      multiple: false,
      onFile: async (file) => {
        try {
          const dataUrl = await fileToDataURL(file);
          console.log("Photo capturée:", file);
          applyImageAsAvatarPreview(dataUrl);
        } catch (err) {
          console.error("Erreur lecture photo:", err);
        }
      },
    });
  }

  // --- READY PLAYER ME ---
  function openReadyPlayerMe() {
    if (!rpmModal || !rpmFrame) {
      alert("Erreur : modal Ready Player Me introuvable.");
      return;
    }
    if (!rpmFrame.src || rpmFrame.src === "") rpmFrame.src = RPM_IFRAME_URL;
    rpmModal.style.display = "flex";
    try { rpmFrame.focus(); } catch (e) {}
  }

  function closeRpmModal() { if (rpmModal) rpmModal.style.display = "none"; }

  rpmFrame.onload = () => console.log("RPM iframe loaded");
  rpmFrame.onerror = () => console.error("RPM iframe failed to load");

  window.addEventListener("message", (event) => {
    const data = event.data;
    console.log("Message reçu depuis iframe RPM :", data);

    if (data?.eventName === "v1.avatar.exported" && data?.url) {
      onReadyPlayerMeAvatar(data.url); closeRpmModal(); return;
    }
    if (data?.name === "avatar-exported" && data?.data?.url) {
      onReadyPlayerMeAvatar(data.data.url); closeRpmModal(); return;
    }
    if (data === "rmp-close" || data?.eventName === "v1.avatar.closed") {
      closeRpmModal(); return;
    }
  });

  function onReadyPlayerMeAvatar(avatarUrl) {
    console.log("URL avatar RPM reçue :", avatarUrl);
    if (avatar3D && avatar3D.tagName.toLowerCase() === "model-viewer") {
      avatar3D.src = avatarUrl;
      try { avatar3D.removeAttribute("reveal"); } catch (e) {}
      alert("Avatar Ready Player Me appliqué.");
    } else {
      window.open(avatarUrl, "_blank");
      alert("Avatar prêt (ouvert dans un nouvel onglet).");
    }
  }

  // --- APPLIQUER IMAGE PREVIEW ---
  function applyImageAsAvatarPreview(dataUrl) {
    // Crée un img invisible pour stocker la preview
    let preview = document.getElementById("avatarPreview");
    if (!preview) {
      preview = document.createElement("img");
      preview.id = "avatarPreview";
      preview.style.display = "none";
      document.body.appendChild(preview);
    }
    preview.src = dataUrl;

    // debug : ouvrir la photo dans un nouvel onglet pour vérifier
    window.open(dataUrl, "_blank");
  }

  // --- MENU ---
  editBtn.setAttribute("aria-haspopup", "true");
  editBtn.setAttribute("aria-expanded", "false");

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showEditMenu(!editMenu.classList.contains("show"));
  });

  editMenu.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => { if (editMenu.classList.contains("show")) showEditMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (editMenu.classList.contains("show")) showEditMenu(false); if (rpmModal && rpmModal.style.display === "flex") closeRpmModal(); }
  });
  if (rpmModal) rpmModal.addEventListener("click", (e) => { if (e.target === rpmModal) closeRpmModal(); });

  if (photoLibBtn) photoLibBtn.addEventListener("click", (e) => { e.stopPropagation(); closeEditMenu(); handlePhotoLibrary(); });
  if (takePhotoBtn) takePhotoBtn.addEventListener("click", (e) => { e.stopPropagation(); closeEditMenu(); handleTakePhoto(); });
  if (createAvatarBtn) createAvatarBtn.addEventListener("click", (e) => { e.stopPropagation(); closeEditMenu(); openReadyPlayerMe(); });

  if (pseudoDisplay && pseudoDisplay.textContent.trim() === "") { }
});
