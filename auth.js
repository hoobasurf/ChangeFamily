// auth.js
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } 
  from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { app } from './firebase.js';

const auth = getAuth(app);

// Création utilisateur
export function signup(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// Connexion utilisateur
export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

// Déconnexion
export function logout() {
  return signOut(auth);
}

// Observer l'état de connexion
export function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

export { auth };
