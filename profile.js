// profile.js (complet)
// ===============================
// Gestion profil : pseudo, avatar, galerie, générateur, particules
// ===============================

(() => {
  // --- DOM éléments existants / attendus ---
  const avatarImg = document.getElementById("avatarImg");
  const pseudoDisplay = document.getElementById("pseudoDisplay");
  const pseudoInput = document.getElementById("pseudoInput");
  const avatarFile = document.getElementById("avatarFile");
  const savePseudo = document.getElementById("savePseudo");
  const chooseAvatar = document.getElementById("chooseAvatar");

  // Elements pour le sélecteur d'avatar (optionnel)
  const avatarSelectorModal = document.getElementById('avatarSelectorModal');
  const generateDiceBtn = document.getElementById('generateDice');
  const openRPMBtn = document.getElementById('openRPM');
  const useSelectedBtn = document.getElementById('useSelected');
  const closeSelectorBtn = document.getElementById('closeSelector');
  const avatarPreview = document.getElementById('avatarPreview');
  const diceStyleInput = document.getElementById('diceStyle');
  const diceSeedInput = document.getElementById('diceSeed');
  const avatarCropSelect = document.getElementById('avatarCrop');

  // Canvas particules
  const canvas = document.getElementById("particleCanvas");
  const ctx = canvas ? canvas.getContext("2d") : null;
  let particles = [];

  // Helper safe-get
  function $(id) { return document.getElementById(id); }

  // ===============================
  // === Charger données stockées ===
  // ===============================
  window.addEventListener("load", () => {
    try {
      const savedPseudo = localStorage.getItem("userPseudo");
      const savedAvatar = localStorage.getItem("userAvatar");
      if (savedPseudo && pseudoDisplay) pseudoDisplay.textContent = savedPseudo;
      if (savedAvatar && avatarImg) avatarImg.src = savedAvatar;

      // If there is a preview image element, set it too
      if (avatarPreview && savedAvatar) {
        avatarPreview.src = savedAvatar;
        avatarPreview.dataset.generated = savedAvatar;
      }
    } catch (e) {
      console.warn('Erreur load localStorage', e);
    }
  });

  // ===============================
  // === Changer pseudo ============
  // ===============================
  if (savePseudo && pseudoInput) {
    savePseudo.addEventListener("click", () => {
      const pseudo = pseudoInput.value.trim();
      if (pseudo) {
        if (pseudoDisplay) pseudoDisplay.textContent = pseudo;
        localStorage.setItem("userPseudo", pseudo);
        alert("✅ Pseudo enregistré !");
      }
    });
  }

  // ===============================
  // === Changer avatar depuis galerie ===
  // ===============================
  if (chooseAvatar && avatarFile) {
    chooseAvatar.addEventListener("click", () => avatarFile.click());
  }

  if (avatarFile) {
    avatarFile.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        if (avatarImg) avatarImg.src = evt.target.result;
        localStorage.setItem("userAvatar", evt.target.result);
        // keep preview in selector if present
        if (avatarPreview) {
          avatarPreview.src = evt.target.result;
          avatarPreview.dataset.generated = evt.target.result;
        }
      };
      reader.readAsDataURL(file);
    });
  }

  // ===============================
  // === Avatar Selector (DiceBear + Ready Player Me) ===
  // ===============================
  function openAvatarSelector() {
    if (avatarSelectorModal) avatarSelectorModal.classList.remove('hidden');
    else alert('Sélecteur non disponible (élément manquant).');
  }
  function closeAvatarSelector() {
    if (avatarSelectorModal) avatarSelectorModal.classList.add('hidden');
  }

  // Bind chooseAvatar UI to open selector if selector exists
  // (If you want both behaviors: chooseAvatar opens OS file picker and also selector,
  //  keep original behavior; here we only open the selector if the modal exists)
  if (document.getElementById('openAvatarSelector')) {
    document.getElementById('openAvatarSelector').addEventListener('click', openAvatarSelector);
  }
  // If "chooseAvatar" button should open selector modal instead of file dialog:
  // you can swap the listener. For now we keep chooseAvatar -> file input and add a separate control in modal.

  // Open selector from the edit modal button if present
  if (document.getElementById('chooseAvatarModalBtn')) {
    document.getElementById('chooseAvatarModalBtn').addEventListener('click', openAvatarSelector);
  }

  // close selector
  if (closeSelectorBtn) closeSelectorBtn.addEventListener('click', closeAvatarSelector);

  // DiceBear generator
  function buildDiceBearUrl(style, seed, options = {}) {
    const size = 512;
    const background = options.background ? `&background=${encodeURIComponent(options.background)}` : '';
    return `https://api.dicebear.com/8.x/${style}/png?seed=${encodeURIComponent(seed)}&size=${size}${background}`;
  }
  if (generateDiceBtn && diceStyleInput && diceSeedInput && avatarPreview) {
    generateDiceBtn.addEventListener('click', () => {
      let style = diceStyleInput.value || 'avataaars';
      let seed = diceSeedInput.value.trim() || `user_${Math.floor(Math.random()*10000)}`;
      const url = buildDiceBearUrl(style, seed);
      avatarPreview.src = url;
      avatarPreview.dataset.generated = url;
    });
  }

  // Ready Player Me popup flow
  let rpmWindow = null;
  if (openRPMBtn) {
    openRPMBtn.addEventListener('click', () => {
      const rpmUrl = 'https://create.readyplayer.me/avatar?frameApi';
      rpmWindow = window.open(rpmUrl, 'RPM', 'width=900,height=700');
    });
  }

  // Listen for messages from Ready Player Me
  window.addEventListener('message', (event) => {
    try {
      const data = event.data;
      if (!data) return;
      if (data.source === 'readyplayerme' && data.eventName === 'avatarExported') {
        const avatarUrl = data.url;
        // If RPM provides a direct snapshot PNG, set preview.
        if (avatarPreview) {
          avatarPreview.src = avatarUrl;
          avatarPreview.dataset.generated = avatarUrl;
        }
        rpmWindow?.close();
      }
    } catch (e) {
      // ignore
    }
  });

  // Use selected avatar from preview
  if (useSelectedBtn && avatarPreview) {
    useSelectedBtn.addEventListener('click', () => {
      const generated = avatarPreview.dataset.generated || avatarPreview.src;
      if (!generated) { alert('Aucun avatar sélectionné'); return; }
      if (avatarImg) avatarImg.src = generated;
      localStorage.setItem('userAvatar', generated);
      closeAvatarSelector();
      alert('Avatar appliqué ✅');
    });
  }

  // If modal not present but we have a chooseAvatar button, add open selector to it
  // (comment/uncomment as needed)
  // document.getElementById('chooseAvatar')?.addEventListener('click', openAvatarSelector);

  // ===============================
  // === Effet particules ==========
  // ===============================
  if (canvas && ctx) {
    function resizeCanvas() {
      canvas.width = window.innerWidth;
      // height: use .screen offsetHeight if exists else window.innerHeight * 0.6
      const screenEl = document.querySelector(".screen");
      canvas.height = screenEl ? screenEl.offsetHeight : Math.floor(window.innerHeight * 0.6);
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    function createParticles() {
      particles = [];
      for (let i = 0; i < 25; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.6,
          r: Math.random() * 3 + 1,
          dx: (Math.random() - 0.5) * 0.3,
          dy: (Math.random() - 0.5) * 0.3,
          color: `hsl(${Math.random() * 60 + 280}, 100%, 70%)`
        });
      }
    }
    createParticles();

    function drawParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 15;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  } else {
    // Canvas missing — no particle effect (graceful fallback)
    // console.info('particleCanvas not present — skipping particles.');
  }

  // Expose small API for opening selector from HTML if needed
  window.openAvatarSelector = openAvatarSelector;
  window.closeAvatarSelector = closeAvatarSelector;

})();
