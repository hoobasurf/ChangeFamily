import { auth } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

async function signup(email, password) {
  return await createUserWithEmailAndPassword(auth, email, password);
}

async function login(email, password) {
  return await signInWithEmailAndPassword(auth, email, password);
}

async function logout() {
  return await signOut(auth);
}

export { signup, login, logout, auth, onAuthStateChanged };
