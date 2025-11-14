/* chat.js - Chat privé temps-réel using Firebase Realtime DB
   ATTENTION: firebase.js doit initialiser Firebase (auth + database).
*/

const usersList = document.getElementById("usersList");
const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const activeName = document.getElementById("activeName");
const activeAvatar = document.getElementById("activeAvatar");

let currentUser = null;      // uid
let currentUserMeta = {};    // displayName, avatarURL
let currentChatUser = null;  // uid of selected contact
let privateChatsRef = null;
let activeListener = null;

// ---------- Auth ----------
firebase.auth().onAuthStateChanged(async (user) => {
  if (!user) {
    // pas connecté -> redirection
    window.location.href = "index.html";
    return;
  }

  currentUser = user.uid;

  // lecture meta utilisateur (nom/avatar) depuis /users/{uid}
  const userSnap = await firebase.database().ref("users/" + currentUser).once("value");
  currentUserMeta = userSnap.exists() ? userSnap.val() : {};
  // ensuite charger la liste des utilisateurs
  loadUsersList();
});

// ---------- Load users list ----------
function loadUsersList() {
  const ref = firebase.database().ref("users");
  ref.on("value", (snap) => {
    usersList.innerHTML = "";
    snap.forEach(child => {
      const uid = child.key;
      const u = child.val();

      // n'affiche pas soi-même
      if (uid === currentUser) return;

      const entry = document.createElement("div");
      entry.className = "user-entry";
      entry.dataset.uid = uid;

      const avatarWrap = document.createElement("div");
      avatarWrap.className = "user-avatar";
      const img = document.createElement("img");
      img.src = u.avatarURL || "loov.jpg";
      img.alt = u.displayName || "Utilisateur";
      avatarWrap.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "user-meta";
      const name = document.createElement("div");
      name.className = "user-name";
      name.innerText = u.displayName || ("User " + uid.substring(0,6));
      const last = document.createElement("div");
      last.className = "user-last";
      last.innerText = u.status || "";

      meta.appendChild(name);
      meta.appendChild(last);

      entry.appendChild(avatarWrap);
      entry.appendChild(meta);

      entry.addEventListener("click", () => {
        // mettre en surbrillance simple
        document.querySelectorAll(".user-entry").forEach(e => e.classList.remove("active-entry"));
        entry.classList.add("active-entry");

        // ouvrir conversation
        openConversationWith(uid, u);
      });

      usersList.appendChild(entry);
    });
  });
}

// ---------- Ouvrir / charger conversation ----------
function openConversationWith(otherUid, otherMeta) {
  currentChatUser = otherUid;
  activeName.innerText = otherMeta.displayName || "Contact";
  const avatarImg = activeAvatar.querySelector("img");
  if (avatarImg) avatarImg.src = otherMeta.avatarURL || "loov.jpg";

  // detach ancien listener si existant
  if (activeListener && privateChatsRef) {
    privateChatsRef.off("child_added", activeListener);
  }

  // reference aux messages privés
  privateChatsRef = firebase.database().ref("privateChats");

  // écoute uniquement les nouveaux messages (child_added) et filtre localement
  activeListener = privateChatsRef.on("child_added", (snap) => {
    const m = snap.val();
    if (!m) return;
    // afficher uniquement si entre currentUser et currentChatUser
    const between = (m.from === currentUser && m.to === currentChatUser) || (m.from === currentChatUser && m.to === currentUser);
    if (between) displayMessage(m);
  });

  // nettoyage affichage + charger l'historique existant une fois
  chatBox.innerHTML = "";
  // charge snapshot complet trié par timestamp
  privateChatsRef.orderByChild("timestamp").once("value", (snap) => {
    chatBox.innerHTML = ""; // ré-init
    snap.forEach(child => {
      const m = child.val();
      const between = (m.from === currentUser && m.to === currentChatUser) || (m.from === currentChatUser && m.to === currentUser);
      if (between) displayMessage(m);
    });
    scrollChatToBottom();
  });
}

// ---------- envoyer message privé ----------
function sendMessage() {
  if (!currentUser) return alert("Utilisateur non authentifié.");
  if (!currentChatUser) {
    // si pas de conversation sélectionnée, on peut alerter
    // ou créer comportement: envoyer en broadcast — ici on exige sélection
    return alert("Sélectionne d'abord un contact à gauche.");
  }

  const text = messageInput.value.trim();
  if (!text) return;

  const msgObj = {
    text: text,
    from: currentUser,
    to: currentChatUser,
    timestamp: Date.now()
  };

  firebase.database().ref("privateChats").push(msgObj)
    .then(() => {
      messageInput.value = "";
      scrollChatToBottom();
    })
    .catch(err => {
      console.error("Erreur envoi:", err);
      alert("Erreur lors de l'envoi.");
    });
}

// ---------- afficher message dans la UI ----------
function displayMessage(m) {
  const bubble = document.createElement("div");
  const amIMe = m.from === currentUser;
  bubble.className = "message " + (amIMe ? "me" : "other");
  bubble.innerText = m.text || "";

  chatBox.appendChild(bubble);
  scrollChatToBottom();
}

// ---------- utilitaires ----------
function scrollChatToBottom(){
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 60);
}

// ---------- événements UI ----------
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// scroll load
window.addEventListener("load", () => { setTimeout(scrollChatToBottom, 100); });
