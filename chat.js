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

  chatBox.scrollTop = chatBox.scrollHeight; // ✅ scroll qui reste en bas
}

sendBtn.onclick = sendMessage;
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});
