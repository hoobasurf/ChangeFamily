// profile.js — remplace le contenu existant par ceci

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editProfile");
  const editMenu = document.getElementById("editMenu");
  const photoLib = document.getElementById("photoLib");
  const takePhoto = document.getElementById("takePhoto");
  const createAvatar = document.getElementById("createAvatar");

  // sécurité : vérifier que les éléments existent
  if (!editBtn || !editMenu) {
    console.error("profile.js: Impossible de trouver #editProfile et/ou #editMenu");
    return;
  }

  // initialise aria
  editBtn.setAttribute("aria-haspopup", "true");
  editBtn.setAttribute("aria-expanded", "false");

  // ouvre/ferme le menu — stoppe la propagation pour éviter que le document
  // n'entende le même clic et referme le menu immédiatement
  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isShown = editMenu.classList.toggle("show");
    editBtn.setAttribute("aria-expanded", String(isShown));
  });

  // éviter que cliquer DANS le menu le ferme (par propagation)
  editMenu.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // clic ailleurs -> fermer
  document.addEventListener("click", () => {
    if (editMenu.classList.contains("show")) {
      editMenu.classList.remove("show");
      editBtn.setAttribute("aria-expanded", "false");
    }
  });

  // touche ESC -> fermer
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && editMenu.classList.contains("show")) {
      editMenu.classList.remove("show");
      editBtn.setAttribute("aria-expanded", "false");
      editBtn.focus();
    }
  });

  // actions des boutons internes (remplace les alerts par ta logique)
  if (photoLib) {
    photoLib.addEventListener("click", (e) => {
      e.stopPropagation();
      editMenu.classList.remove("show");
      editBtn.setAttribute("aria-expanded", "false");
      // TODO: ouvrir la photothèque — remplacer par ta fonction
      console.log("📷 Ouvrir la photothèque (à implémenter)");
      alert("📷 Ouvrir la photothèque (à implémenter)");
    });
  }

  if (takePhoto) {
    takePhoto.addEventListener("click", (e) => {
      e.stopPropagation();
      editMenu.classList.remove("show");
      editBtn.setAttribute("aria-expanded", "false");
      // TODO: lancer la caméra
      console.log("🤳 Prendre une photo (à implémenter)");
      alert("🤳 Prendre une photo (à implémenter)");
    });
  }

  if (createAvatar) {
    createAvatar.addEventListener("click", (e) => {
      e.stopPropagation();
      editMenu.classList.remove("show");
      editBtn.setAttribute("aria-expanded", "false");
      // TODO: ouvrir modal Ready Player Me / iframe
      console.log("✨ Créer avatar (à implémenter)");
      alert("✨ Créer avatar (à implémenter)");
    });
  }
});
