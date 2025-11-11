// avatar.js
import { storage } from './firebase.js';
import { ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";

/**
 * Génère un avatar en base64 (canvas) avec initiale + accessoire optionnel.
 * options = { name: "Huntrix", color: "#e24fa8", accessoryUrl: "assets/accessories/glasses.png" }
 */
export function generateAvatarDataUrl(options = {}) {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // background gradient
  const g = ctx.createLinearGradient(0,0,size,size);
  g.addColorStop(0, options.color || '#7b1fff');
  g.addColorStop(1, options.color2 || '#eb42a7');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,size,size);

  // circle mask
  ctx.globalCompositeOperation = 'destination-in';
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2, 0, Math.PI*2);
  ctx.fill();

  ctx.globalCompositeOperation = 'source-over';
  // initials
  const initials = (options.name || 'U').trim().slice(0,2).toUpperCase();
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.font = 'bold 180px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, size/2, size/2 + 20);

  // accessory if provided (drawImage async not allowed here) - we will return dataURL and overlay client-side when available
  return canvas.toDataURL('image/png');
}

/**
 * Upload dataUrl (base64) to storage path and return download URL
 */
export async function uploadAvatarDataUrl(userId, dataUrl) {
  const path = `avatars/${userId}.png`;
  const stRef = ref(storage, path);
  // uploadString supports dataUrl
  await uploadString(stRef, dataUrl, 'data_url');
  return await getDownloadURL(stRef);
}
