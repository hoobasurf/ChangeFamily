// ===================================
// 🔐 auth.js
// ===================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

// 🔧 Configuration Firebase (à remplacer par tes infos)
const firebaseConfig = {
  apiKey: "TON_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_MESSAGING_SENDER_ID",
  appId: "TON_APP_ID"
};

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, onAuthStateChanged };

/**
 * Login ou création de compte automatique.
 * @param {string} identifier - Pseudo ou email
 * @param {string} password - Mot de passe
 * @returns {"login"|"signup"}
 */
export async function loginOrSignup(identifier, password) {
  // Si l'utilisateur n'a pas mis @, on le transforme en pseudo@user.app
  let email = identifier.includes("@") ? identifier : identifier + "@user.app";

  try {
    // Essaye de se connecter
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Connexion réussie !");
    return "login";
  } catch (err) {
    console.log("Utilisateur non trouvé, création en cours...");
    // Si échec, crée un nouveau compte
    await createUserWithEmailAndPassword(auth, email, password);

    // Met à jour le displayName avec le pseudo
    await updateProfile(auth.currentUser, { displayName: identifier });
    console.log("Compte créé avec succès !");
    return "signup";
  }
}
