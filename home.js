import { db } from "./firebase.js";
import { collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const feed = document.getElementById("feed");

// Charger les posts en temps réel, les plus récents en premier
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

onSnapshot(q, snapshot => {
  feed.innerHTML = "";

  snapshot.forEach(doc => {
    const post = doc.data();

    const card = document.createElement("div");
    card.style.background = "rgba(255,255,255,0.12)";
    card.style.backdropFilter = "blur(12px)";
    card.style.padding = "10px";
    card.style.borderRadius = "15px";
    card.style.marginBottom = "15px";
    card.style.boxShadow = "0 0 10px rgba(255,0,255,0.3)";

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <img src="${post.avatar || "avatar-default.png"}" 
             style="width:40px;height:40px;border-radius:50%;object-fit:cover;">
        <b>${post.pseudo || "Anonyme"}</b>
      </div>

      <div style="width:100%;">
        ${
          post.type === "video"
          ? `<video src="${post.url}" style="width:100%;border-radius:12px;" autoplay muted loop playsinline></video>`
          : `<img src="${post.url}" style="width:100%;border-radius:12px;">`
        }
      </div>

      <div style="margin-top:8px;font-size:18px;display:flex;gap:15px;">
        <span>❤️</span>
        <span>💬</span>
      </div>
    `;

    feed.appendChild(card);
  });
});
