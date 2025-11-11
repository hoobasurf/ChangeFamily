const editBtn = document.getElementById("editProfileBtn");
const editPanel = document.getElementById("editPanel");
const saveBtn = document.getElementById("saveProfileBtn");
const profilePseudo = document.getElementById("profilePseudo");
const newPseudoInput = document.getElementById("newPseudo");
const newAvatarInput = document.getElementById("newAvatar");
const profileAvatar = document.querySelector(".profile-avatar");

// Ouvre/ferme le panneau édition
editBtn.addEventListener("click", () => {
  editPanel.classList.toggle("hidden");
});

// Enregistre les modifications
saveBtn.addEventListener("click", () => {
  // Changer pseudo
  const newPseudo = newPseudoInput.value.trim();
  if(newPseudo) profilePseudo.textContent = newPseudo;

  // Changer avatar
  const file = newAvatarInput.files[0];
  if(file){
    const reader = new FileReader();
    reader.onload = e => profileAvatar.src = e.target.result;
    reader.readAsDataURL(file);
  }

  // Fermer le panneau
  editPanel.classList.add("hidden");
});
