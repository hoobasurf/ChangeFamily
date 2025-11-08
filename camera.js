// camera.js
import { auth } from './auth.js';
import { uploadImage, loadGlobalGallery } from './storage.js';

const cameraInput = document.getElementById('cameraInput');
const captureBtn = document.getElementById('capture');

captureBtn.onclick = () => cameraInput.click();

cameraInput.onchange = async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  if(!auth.currentUser) { alert('Connecte-toi d’abord'); return; }

  const url = await uploadImage(file, auth.currentUser.uid);
  alert('Photo prise et uploadée !');
  loadGlobalGallery();
};
