// ✅ auth.js

import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

export { auth, onAuthStateChanged };

// ✅ Fonction Login / SignUp avec email OU pseudo
export async function loginOrSignup(identifier, password) {

    let email = identifier;

    // Si l'utilisateur met un pseudo → convertir en email interne
    if (!identifier.includes("@")) {
        email = identifier + "@changeFamily.app"; 
    }

    try {
        // 🔹 Tente de se connecter
        await signInWithEmailAndPassword(auth, email, password);
        return "login";
    } catch (e) {
        // 🔹 Sinon crée un compte
        await createUserWithEmailAndPassword(auth, email, password);

        // 🔹 Enregistre le pseudo
        await updateProfile(auth.currentUser, {
            displayName: identifier
        });

        return "signup";
    }
}
