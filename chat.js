// ===============================
// 💬 CHAT FUTURISTE INTERACTIF
// ===============================

const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');

// Envoi du message utilisateur
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (text === '') return;

  const msg = document.createElement('div');
  msg.classList.add('message', 'user');
  msg.textContent = text;
  chatBox.appendChild(msg);

  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  setTimeout(() => botReply(), 700);
}

// Réponse automatique du bot
function botReply() {
  const replies = [
    "💜 Trop stylé !",
    "✨ Dis-m’en plus.",
    "🤖 Je te comprends.",
    "🌌 Wow, intéressant !",
    "⚡ Tu brilles aujourd’hui !"
  ];
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');
  msg.textContent = replies[Math.floor(Math.random() * replies.length)];
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// ✨ PAILLETTES NÉON
// ===============================
function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');
  sparkle.style.left = `${Math.random() * 100}vw`;
  sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
  document.body.appendChild(sparkle);
  setTimeout(() => sparkle.remove(), 4000);
}
setInterval(createSparkle, 200);
