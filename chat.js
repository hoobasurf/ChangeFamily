const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  const msg = document.createElement("div");
  msg.className = "message me"; // ✔ cohérent avec CSS
  msg.innerText = text;

  chatBox.appendChild(msg);
  messageInput.value = "";

  // Scroll auto
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 50);
}

sendBtn.onclick = sendMessage;

// ENTRÉE POUR ENVOYER
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

// Scroll au chargement
window.addEventListener("load", () => {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
});
