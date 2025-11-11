import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

// 🔥 Config Firebase (OK)
const firebaseConfig = {
  apiKey: "AIzaSyCVl5ktUmuiVeMtYUHtxORytkeu71_XBF0",
  authDomain: "changefamilysnap.firebaseapp.com",
  projectId: "changefamilysnap",
  storageBucket: "changefamilysnap.firebasestorage.app",
  messagingSenderId: "335835110495",
  appId: "1:335835110495:web:13194c4bd4579d4f434fea",
  measurementId: "G-8D5PC0EZ74"
};

// 🚀 Initialisation
const app = initializeApp(firebaseConfig);

// 🔐 Services Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// 🧠 Connexion automatique anonyme si personne n’est connecté
signInAnonymously(auth)
  .then(() => console.log("✅ Connecté en anonyme"))
  .catch(err => console.error("Erreur Auth :", err));

// 🔄 Pour écouter les changements d’état utilisateur (login/logout)
export { onAuthStateChanged };
