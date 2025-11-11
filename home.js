// home.js
import { auth, db } from './firebase.js';
import {
  collection, query, where, orderBy, onSnapshot, getDocs
} from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const feed = document.getElementById('feed') || document.getElementById('globalGallery');

async function isFriend(viewerUid, ownerUid) {
  if (viewerUid === ownerUid) return true;
  // friends/{viewerUid}/list documents with field friendUid
  const fRef = collection(db, 'friends', viewerUid, 'list');
  const q = query(fRef);
  const snap = await getDocs(q);
  let ok = false;
  snap.forEach(d => {
    if (d.data().friendUid === ownerUid) ok = true;
  });
  return ok;
}

auth.onAuthStateChanged(async user => {
  if (!user) return window.location.href = 'index.html';

  // realtime listener for posts ordered by timestamp desc
  const postsCol = collection(db, 'posts');
  const q = query(postsCol, orderBy('timestamp', 'desc'));

  onSnapshot(q, async snapshot => {
    feed.innerHTML = '';
    for (const docChange of snapshot.docs) {
      const p = docChange.data();
      const canSee = (p.visibility === 'public') || await isFriend(user.uid, p.uid) || (p.uid === user.uid);
      if (!canSee) continue;

      const card = document.createElement('div');
      card.className = 'post';

      const header = document.createElement('div');
      header.className = 'post-header';
      header.innerHTML = `<img src="${p.ownerAvatar || 'avatar-default.png'}" class="avatar"> <strong>${p.pseudo}</strong>`;
      card.appendChild(header);

      const img = document.createElement('img');
      img.src = p.photoURL;
      img.className = 'post-img';
      card.appendChild(img);

      const footer = document.createElement('div');
      footer.className = 'post-footer';
      footer.innerHTML = `<div>${p.caption || ''}</div>
                          <div class="post-actions">
                            <button class="likeBtn" data-id="${docChange.id}">❤️ ${p.likesCount || 0}</button>
                            <button class="commentBtn">💬</button>
                          </div>`;
      card.appendChild(footer);

      feed.appendChild(card);
    }

    // attach like handlers after DOM created
    document.querySelectorAll('.likeBtn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const postId = e.currentTarget.dataset.id;
        // simple increment (no transaction shown here — ideal: use transaction)
        const postRef = doc(db, 'posts', postId);
        await updateDoc(postRef, { likesCount: ( (await getDoc(postRef)).data().likesCount || 0) + 1 });
        // UI will update from onSnapshot realtime
      });
    });
  });
});
