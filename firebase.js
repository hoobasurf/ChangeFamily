// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// 🔑 Remplace les valeurs ci-dessous par celles de ton projet Firebase
const firebaseConfig = {
  apiKey: "TA_CLE_API_ICI",
  authDomain: "TON_PROJECT.firebaseapp.com",
  projectId: "TON_PROJECT",
  storageBucket: "TON_PROJECT.appspot.com",
  messagingSenderId: "TON_ID",
  appId: "TON_APP_ID"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("🔥 Firebase OK");

export { app, auth, db, storage };
