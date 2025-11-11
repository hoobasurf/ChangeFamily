import { db } from "./firebase.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const feed = document.getElementById("feed");

// ✅ Empêche le rafraîchissement du scroll quand on scrolle
let lastScroll = 0;
feed.addEventListener("scroll", () => {
  lastScroll = feed.scrollTop;
});

// Charger les posts en temps réel
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  feed.innerHTML = "";

  snapshot.forEach(doc => {
    const post = doc.data();
    const card = document.createElement("div");

    card.className = "post-card";

    card.innerHTML = `
      <div class="post-header">
        <img src="${post.avatar || "avatar-default.png"}">
        <b>${post.pseudo || "Anonyme"}</b>
      </div>

      <div class="post-media">
        ${
          post.type === "video"
          ? `<video src="${post.url}" autoplay muted loop playsinline></video>`
          : `<img src="${post.url}">`
        }
      </div>

      <div class="post-actions">
        <span>❤️</span>
        <span>💬</span>
      </div>
    `;

    feed.appendChild(card);
  });

  // ✅ Restore la position du scroll
  feed.scrollTop = lastScroll;
});
