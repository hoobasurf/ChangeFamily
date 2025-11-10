import { auth } from './firebase.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

const loginInput = document.getElementById("loginInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");

function convertLoginToEmail(login) {
  if (login.includes("@")) {
    return login; // déjà un email
  }
  return `${login.toLowerCase()}@user-pseudo.app`; // pseudo → faux email Firebase
}

loginBtn.addEventListener("click", async () => {
  const login = loginInput.value.trim();
  const password = passwordInput.value.trim();
  if (!login || !password) return alert("Remplis les champs");

  const email = convertLoginToEmail(login);

  try {
    // Tentative connexion
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "home.html";
  } catch {
    // Si échec → création du compte
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = "home.html";
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  }
});

async function logout() {
  await signOut(auth);
  window.location.href = "index.html";
}

export { logout, auth, onAuthStateChanged };
