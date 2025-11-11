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
let unsubscribeFeed = null;
let scrollListenerAdded = false;
let lastScroll = 0;

// 🧠 Vérifie l'utilisateur connecté
onAuthStateChanged(auth, user => {
  currentUser = user || null;
  if (user) {
    console.log("Connecté en tant que :", user.uid);
  } else {
    console.log("Aucun utilisateur connecté");
  }
  chargerFeed(); // recharge le feed dès que l'état auth change
});

// ===============================
// 🔄 Fonction principale
// ===============================
function chargerFeed() {
  if (unsubscribeFeed) {
    unsubscribeFeed();
    unsubscribeFeed = null;
  }

  if (!scrollListenerAdded) {
    feed.addEventListener("scroll", () => {
      lastScroll = feed.scrollTop;
    });
    scrollListenerAdded = true;
  }

  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));

  unsubscribeFeed = onSnapshot(q, snapshot => {
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
          <img src="${post.avatar || "avatar-default.png"}" class="avatar" />
          <b class="poster-name">${post.pseudo || "Anonyme"}</b>
        </div>

        <div class="post-media">
          ${
            post.type === "video"
              ? `<video src="${post.url}" autoplay muted loop playsinline></video>`
              : `<img src="${post.url}" alt="post" />`
          }
        </div>

        <div class="post-actions">
          <span class="like-btn ${alreadyLiked ? "liked" : ""}" data-id="${postId}">
            ❤️ <span class="like-count">${likeCount}</span>
          </span>
          <span class="comment-btn" data-id="${postId}">💬 <span class="comment-count">${comments.length}</span></span>
        </div>

        <div class="comments" id="comments-${postId}">
          ${comments
            .map(c => `<p><b class="pseudo">${escapeHtml(c.userPseudo || "Anonyme")}</b> : ${escapeHtml(c.text)}</p>`)
            .join("")}
        </div>

        <div class="comment-input" id="comment-input-${postId}" style="display:none;">
          <input type="text" placeholder="Écrire un commentaire..." />
          <button>Envoyer</button>
        </div>
      `;

      feed.appendChild(card);
    });

    // Restaurer scroll
    requestAnimationFrame(() => {
      const maxScroll = Math.max(0, feed.scrollHeight - feed.clientHeight);
      feed.scrollTop = Math.min(lastScroll, maxScroll);
    });

    // ----------- Listeners après rendu -----------

    // Like
    document.querySelectorAll(".like-btn").forEach(btn => {
      btn.onclick = async () => {
        if (!currentUser) return alert("Connecte-toi pour liker !");
        const postId = btn.dataset.id;
        const postRef = doc(db, "posts", postId);
        const snap = snapshot.docs.find(d => d.id === postId);
        const postData = snap?.data() || {};
        const alreadyLiked = postData.likes?.includes(currentUser.uid);

        try {
          await updateDoc(postRef, {
            likes: alreadyLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
          });
        } catch (e) {
          console.error("Erreur like :", e);
        }
      };
    });

    // Toggle champ commentaire
    document.querySelectorAll(".comment-btn").forEach(btn => {
      btn.onclick = () => {
        const postId = btn.dataset.id;
        const inputDiv = document.getElementById(`comment-input-${postId}`);
        if (!inputDiv) return;
        inputDiv.style.display = inputDiv.style.display === "none" ? "flex" : "none";
        if (inputDiv.style.display !== "none") {
          const input = inputDiv.querySelector("input");
          setTimeout(() => input?.focus(), 50);
        }
      };
    });

    // Envoi commentaire
    document.querySelectorAll(".comment-input button").forEach(btn => {
      btn.onclick = async () => {
        if (!currentUser) return alert("Connecte-toi pour commenter !");
        const postId = btn.parentElement.id.replace("comment-input-", "");
        const input = btn.parentElement.querySelector("input");
        const text = input.value.trim();
        if (!text) return;

        const postRef = doc(db, "posts", postId);

        try {
          const pseudo =
            currentUser.displayName ||
            (currentUser.isAnonymous ? "Anonyme_" + currentUser.uid.slice(0, 4) : "Utilisateur");

          await updateDoc(postRef, {
            comments: arrayUnion({
              userId: currentUser.uid,
              userPseudo: pseudo,
              text,
              createdAt: Date.now()
            })
          });

          input.value = "";
          launchSparkles();
        } catch (e) {
          console.error("Erreur commentaire :", e);
        }
      };
    });
  }, err => {
    console.error("Erreur snapshot feed :", err);
  });
}

// Échapper HTML pour sécurité
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ===============================
// ✨ Paillettes futuristes
// ===============================
function launchSparkles() {
  const sparkleCount = 40;
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "sparkle";
    sparkle.style.left = Math.random() * 100 + "vw";
    sparkle.style.width = (4 + Math.random() * 8) + "px";
    sparkle.style.height = sparkle.style.width;
    sparkle.style.animationDuration = 1.5 + Math.random() * 2 + "s";
    sparkle.style.opacity = 0.6 + Math.random() * 0.4;
    sparkle.style.transform = `scale(${0.6 + Math.random() * 1.4})`;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 4000);
  }
}
