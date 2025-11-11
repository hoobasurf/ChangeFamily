// profile.js
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";
import { uploadAvatarDataUrl, generateAvatarDataUrl } from './avatar.js';

const profilePic = document.getElementById("profilePic") || document.getElementById("avatar");
const fileInput = document.getElementById("newPhoto") || document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';

const displayName = document.getElementById("displayName") || document.getElementById("username");
const bioInput = document.getElementById("bioInput") || document.getElementById("bio");
const saveBtn = document.getElementById("saveProfile");

auth.onAuthStateChanged(async user => {
  if (!user) return (window.location.href = "index.html");

  // ensure user doc exists
  const uRef = doc(db, 'users', user.uid);
  const snap = await getDoc(uRef);
  if (!snap.exists()) {
    await setDoc(uRef, {
      uid: user.uid,
      pseudo: user.displayName || (user.email ? user.email.split('@')[0] : 'user'),
      bio: '',
      photoURL: null,
      createdAt: new Date()
    });
  }

  const data = (await getDoc(uRef)).data();
  displayName.textContent = data.pseudo || user.displayName || 'Utilisateur';
  if (bioInput) bioInput.value = data.bio || '';
  if (profilePic) profilePic.src = data.photoURL || 'avatar-default.png';
});

// upload photo chosen by file input
fileInput.addEventListener('change', async e => {
  const f = e.target.files[0];
  if (!f) return;
  // convert to dataURL then upload or upload bytes directly (simple approach)
  const reader = new FileReader();
  reader.onload = async () => {
    const dataUrl = reader.result; // base64
    // upload as avatar
    const url = await uploadAvatarDataUrl(auth.currentUser.uid, dataUrl);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
    profilePic.src = url;
  };
  reader.readAsDataURL(f);
});

// generate avatar button (you need to add a button with id="genAvatarBtn")
const genBtn = document.getElementById('genAvatarBtn');
if (genBtn) {
  genBtn.addEventListener('click', async () => {
    const name = displayName.textContent || 'U';
    const dataUrl = generateAvatarDataUrl({ name, color: '#ffd17a', color2: '#ff8fb2' });
    const url = await uploadAvatarDataUrl(auth.currentUser.uid, dataUrl);
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { photoURL: url });
    profilePic.src = url;
  });
}

// save bio button
if (saveBtn) {
  saveBtn.addEventListener('click', async () => {
    await updateDoc(doc(db, 'users', auth.currentUser.uid), { bio: bioInput.value || '' });
    alert('Profil mis à jour ✅');
  });
}
