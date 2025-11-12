const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  const msg = document.createElement("div");
  msg.className = "msg me";
  msg.innerText = text;
  chatBox.appendChild(msg);

  chatInput.value = "";

  // ✅ Scroll auto en bas stable
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
}

sendBtn.onclick = sendMessage;

chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// ✅ Si tu veux forcer aussi au chargement de la page :
window.addEventListener("load", () => {
  setTimeout(() => {
    chatBox.scrollTop = chatBox.scrollHeight;
  }, 100);
});
