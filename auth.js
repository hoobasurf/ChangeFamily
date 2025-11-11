// auth.js — fonctions d'authentification (email ou pseudo)
import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

export { auth, onAuthStateChanged };

/**
 * loginOrSignup(identifier, password)
 * - identifier : email ou pseudo (si pseudo, on transforme en pseudo@domain)
 * - renvoie "login" ou "signup"
 */
export async function loginOrSignup(identifier, password) {
  if (!identifier || !password) throw new Error("identifier and password required");

  let email = identifier;
  if (!identifier.includes("@")) {
    // conversion pseudo -> email interne
    email = `${identifier.toLowerCase()}@user-pseudo.app`;
  }

  try {
    // tenter login
    await signInWithEmailAndPassword(auth, email, password);
    return "login";
  } catch (err) {
    // si échec de login => crée le compte
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // définir displayName sur le pseudo (si pseudo fourni)
    if (!identifier.includes("@")) {
      await updateProfile(auth.currentUser, { displayName: identifier });
    }
    return "signup";
  }
}
