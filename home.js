import { db, auth, onAuthStateChanged } from "./firebase.js";
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
let currentUser = null;

// 🧠 Récupère l'utilisateur connecté
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user;
    console.log("Connecté en tant que :", user.uid);
    chargerFeed();
  } else {
    console.log("Aucun utilisateur connecté");
  }
});

// ===============================
// 🔄 Fonction principale
// ===============================
function chargerFeed() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  let lastScroll = 0;
  feed.addEventListener("scroll", () => (lastScroll = feed.scrollTop));

  onSnapshot(q, snapshot => {
    feed.innerHTML = "";

    snapshot.forEach(docSnap => {
      const post = docSnap.data();
      const postId = docSnap.id;

      const likeCount = post.likes?.length || 0;
      const alreadyLiked = post.likes?.includes(currentUser?.uid);
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
            .map(c => `<p><b>${c.userPseudo || "Anonyme"}</b> : ${c.text}</p>`)
            .join("")}
        </div>

        <div class="comment-input" id="comment-input-${postId}" style="display:none;">
          <input type="text" placeholder="Écrire un commentaire..." />
          <button>Envoyer</button>
        </div>
      `;

      feed.appendChild(card);
    });

    feed.scrollTop = lastScroll;

    // ❤️ Like
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!currentUser) return alert("Connecte-toi pour liker !");
        const postId = btn.dataset.id;
        const postRef = doc(db, "posts", postId);
        const post = snapshot.docs.find(d => d.id === postId).data();
        const alreadyLiked = post.likes?.includes(currentUser.uid);

        try {
          await updateDoc(postRef, {
            likes: alreadyLiked
              ? arrayRemove(currentUser.uid)
              : arrayUnion(currentUser.uid)
          });
        } catch (e) {
          console.error("Erreur like :", e);
        }
      });
    });

    // 💬 Commentaire
    document.querySelectorAll(".comment-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const postId = btn.dataset.id;
        const inputDiv = document.getElementById(`comment-input-${postId}`);
        inputDiv.style.display =
          inputDiv.style.display === "none" ? "flex" : "none";
      });
    });

    document.querySelectorAll(".comment-input button").forEach(btn => {
      btn.addEventListener("click", async () => {
        if (!currentUser) return alert("Connecte-toi pour commenter !");
        const postId = btn.parentElement.id.replace("comment-input-", "");
        const input = btn.parentElement.querySelector("input");
        const text = input.value.trim();
        if (!text) return;

        const postRef = doc(db, "posts", postId);

        try {
          // Récupère le pseudo du user (en anonyme, on en crée un simple)
const pseudo =
  currentUser.displayName ||
  (currentUser.isAnonymous
    ? "Anonyme_" + currentUser.uid.slice(0, 4)
    : "Utilisateur");

await updateDoc(postRef, {
  comments: arrayUnion({
    userId: currentUser.uid,
    userPseudo: pseudo,
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
}
