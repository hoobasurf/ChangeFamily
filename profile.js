// Affiche / cache panneau édition
const editBtn = document.getElementById("editBtn");
const editPanel = document.getElementById("editPanel");
const saveBtn = document.getElementById("saveBtn");
const profilePseudo = document.getElementById("profilePseudo");
const profileAvatar = document.getElementById("profileAvatar");

editBtn.addEventListener("click", () => {
  editPanel.classList.toggle("hidden");
});

// Enregistrer pseudo et avatar
saveBtn.addEventListener("click", () => {
  const newPseudo = document.getElementById("newPseudo").value.trim();
  const newAvatarFile = document.getElementById("newAvatar").files[0];

  if(newPseudo) profilePseudo.textContent = newPseudo;

  if(newAvatarFile){
    const reader = new FileReader();
    reader.onload = () => {
      profileAvatar.src = reader.result;
    }
    reader.readAsDataURL(newAvatarFile);
  }

  editPanel.classList.add("hidden");
});
