// ===============================
// 💬 CHAT FUTURISTE INTERACTIF
// ===============================

// Sélecteurs
const sendBtn = document.getElementById('sendBtn');
const input = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');

// Envoi de message utilisateur
sendBtn.addEventListener('click', sendMessage);
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
  const text = input.value.trim();
  if (text === '') return;

  // Crée le message utilisateur
  const msg = document.createElement('div');
  msg.classList.add('message', 'user');
  msg.textContent = text;
  chatBox.appendChild(msg);

  input.value = '';
  chatBox.scrollTop = chatBox.scrollHeight;

  // Réponse du bot après 700ms
  setTimeout(() => {
    botReply(text);
  }, 700);
}

// Réponse automatique simple
function botReply(userText) {
  const msg = document.createElement('div');
  msg.classList.add('message', 'bot');

  const responses = [
    "✨ Intéressant...",
    "💜 Dis-m’en plus !",
    "🌌 Trop stylé.",
    "🤖 Je te comprends.",
    "⚡ Tu brilles aujourd’hui !"
  ];

  msg.textContent = responses[Math.floor(Math.random() * responses.length)];
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===============================
// ✨ PAILLETTES NÉON ANIMÉES
// ===============================

function createSparkle() {
  const sparkle = document.createElement('div');
  sparkle.classList.add('sparkle');
  sparkle.style.left = `${Math.random() * 100}vw`;
  sparkle.style.animationDuration = `${2 + Math.random() * 2}s`;
  document.body.appendChild(sparkle);

  setTimeout(() => sparkle.remove(), 4000);
}

// Génère des paillettes toutes les 200ms
setInterval(createSparkle, 200);
