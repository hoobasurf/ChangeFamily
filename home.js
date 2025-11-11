import { db } from "./firebase.js";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const feed = document.getElementById("feed");

// Simule un utilisateur (à remplacer par ton vrai identifiant)
const userId = "demoUser";

// ✅ Empêche le saut de scroll
let lastScroll = 0;
feed.addEventListener("scroll", () => {
  lastScroll = feed.scrollTop;
});

// ✅ Requête des posts
const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

// ✅ Écoute en temps réel
onSnapshot(q, snapshot => {
  feed.innerHTML = "";

  snapshot.forEach(docSnap => {
    const post = docSnap.data();
    const postId = docSnap.id;

    const likeCount = post.likes?.length || 0;
    const alreadyLiked = post.likes?.includes(userId);
    const comments = post.comments || [];

    const card = document.createElement("div");
    card.className = "post-card";

    card.innerHTML = `
      <div class="post-header">
        <img src="${post.avatar || "avatar-default.png"}" class="avatar">
        <b>${post.pseudo || "Anonyme"}</b>
      </div>

      <div class="post-media">
        ${
          post.type === "video"
            ? `<video src="${post.url}" autoplay muted loop playsinline></video>`
            : `<img src="${post.url}" alt="post">`
        }
      </div>

      <div class="post-actions">
        <span class="like-btn ${alreadyLiked ? "liked" : ""}" data-id="${postId}">
          ❤️ ${likeCount}
        </span>
        <span class="comment-btn" data-id="${postId}">💬 ${comments.length}</span>
      </div>

      <div class="comments" id="comments-${postId}">
        ${comments
          .map(c => `<p><b>${c.user}</b> : ${c.text}</p>`)
          .join("")}
      </div>

      <div class="comment-input" id="comment-input-${postId}" style="display:none;">
        <input type="text" placeholder="Écrire un commentaire..." />
        <button>Envoyer</button>
      </div>
    `;

    feed.appendChild(card);
  });

  // ✅ Restaure le scroll
  feed.scrollTop = lastScroll;

  // ============================
  // ❤️ GESTION DES LIKES
  // ============================
  document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const postId = btn.dataset.id;
      const postRef = doc(db, "posts", postId);

      // Récupère le post depuis le snapshot actuel
      const post = snapshot.docs.find(d => d.id === postId).data();
      const alreadyLiked = post.likes?.includes(userId);

      try {
        if (alreadyLiked) {
          await updateDoc(postRef, { likes: arrayRemove(userId) });
        } else {
          await updateDoc(postRef, { likes: arrayUnion(userId) });
        }
      } catch (e) {
        console.error("Erreur like :", e);
      }
    });
  });

  // ============================
  // 💬 GESTION DES COMMENTAIRES
  // ============================
  document.querySelectorAll(".comment-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const postId = btn.dataset.id;
      const inputDiv = document.getElementById(`comment-input-${postId}`);
      inputDiv.style.display = inputDiv.style.display === "none" ? "flex" : "none";
    });
  });

  document.querySelectorAll(".comment-input button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const postId = btn.parentElement.id.replace("comment-input-", "");
      const input = btn.parentElement.querySelector("input");
      const text = input.value.trim();
      if (!text) return;

      const postRef = doc(db, "posts", postId);

      try {
        await updateDoc(postRef, {
          comments: arrayUnion({
            user: userId,
            text,
            createdAt: Date.now()
          })
        });
        input.value = "";
      } catch (e) {
        console.error("Erreur commentaire :", e);
      }
    });
  });
});
