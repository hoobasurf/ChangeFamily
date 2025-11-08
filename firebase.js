// firebase.js
// Import Firebase depuis le CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

// 🔑 Remplace les valeurs par celles de ton projet Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCVl5ktUmuiVeMtYUHtxORytkeu71_XBF0",
  authDomain: "changefamilysnap.firebaseapp.com",
  projectId: "changefamilysnap",
  storageBucket: "changefamilysnap.firebasestorage.app",
  messagingSenderId: "335835110495",
  appId: "1:335835110495:web:13194c4bd4579d4f434fea",
  measurementId: "G-8D5PC0EZ74"
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

console.log("🔥 Firebase OK");

export { app, analytics, auth, db, storage };
