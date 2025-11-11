import { auth, storage } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const db = getFirestore();
const video = document.getElementById("cameraPreview");
const capturePhoto = document.getElementById("capturePhoto");
const captureVideo = document.getElementById("captureVideo");
const flipBtn = document.getElementById("flipCamera");
const chooseMedia = document.getElementById("chooseMedia");
const chooseFile = document.getElementById("chooseFile");
const preview = document.getElementById("preview");
const publishBtn = document.getElementById("publishBtn");

let facingMode = "user";
let mediaRecorder, recordedChunks = [];
let fileToUpload = null;

// ✅ Démarrer caméra
async function startCam() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
  video.srcObject = stream;
}
startCam();

// ✅ Flip caméra
flipBtn.addEventListener("click", () => {
  facingMode = facingMode === "user" ? "environment" : "user";
  startCam();
});

// ✅ Capture photo
capturePhoto.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  canvas.toBlob(blob => {
    fileToUpload = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
    preview.innerHTML = `<img src="${URL.createObjectURL(fileToUpload)}">`;
  });
});

// ✅ Capture vidéo
captureVideo.addEventListener("click", () => {
  const stream = video.srcObject;
  mediaRecorder = new MediaRecorder(stream);
  recordedChunks = [];

  mediaRecorder.ondataavailable = e => recordedChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/mp4" });
    fileToUpload = new File([blob], `video_${Date.now()}.mp4`);
    preview.innerHTML = `<video controls src="${URL.createObjectURL(fileToUpload)}"></video>`;
  };

  mediaRecorder.start();
  setTimeout(() => mediaRecorder.stop(), 3000);
});

// ✅ Choisir média
chooseMedia.addEventListener("click", () => chooseFile.click());
chooseFile.addEventListener("change", e => {
  fileToUpload = e.target.files[0];
  preview.innerHTML = fileToUpload.type.startsWith("video")
    ? `<video controls src="${URL.createObjectURL(fileToUpload)}"></video>`
    : `<img src="${URL.createObjectURL(fileToUpload)}">`;
});

// ✅ Publier
publishBtn.addEventListener("click", async () => {
  if (!auth.currentUser || !fileToUpload) return alert("Rien à publier");

  const path = `posts/${auth.currentUser.uid}/${Date.now()}_${fileToUpload.name}`;
  const url = await uploadBytes(ref(storage, path), fileToUpload).then(() => getDownloadURL(ref(storage, path)));

  await addDoc(collection(db, "posts"), {
    uid: auth.currentUser.uid,
    pseudo: auth.currentUser.displayName || "Anonyme",
    url,
    type: fileToUpload.type.includes("video") ? "video" : "image",
    createdAt: serverTimestamp(),
    visibility: "friends"
  });

  location.href = "home.html";
});
