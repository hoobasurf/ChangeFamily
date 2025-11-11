import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";

export { auth, onAuthStateChanged };

export async function loginOrSignup(identifier, password) {
  let email = identifier.includes("@") ? identifier : identifier + "@user.app";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    return "login";
  } catch {
    await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(auth.currentUser, { displayName: identifier });
    return "signup";
  }
}
