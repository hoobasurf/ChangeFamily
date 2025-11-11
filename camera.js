import { auth, storage, db } from "./firebase.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

const cam = document.getElementById("cam");
const flipBtn = document.getElementById("flipCam");
const takeBtn = document.getElementById("takePhoto");

let useFront = true;
let stream;

async function startCam() {
  stream?.getTracks().forEach(t => t.stop());
  stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: useFront ? "user" : "environment" }
  });
  cam.srcObject = stream;
  cam.style.transform = useFront ? "scaleX(-1)" : "scaleX(1)";
}

flipBtn.onclick = () => {
  useFront = !useFront;
  startCam();
};

takeBtn.onclick = async () => {
  const user = auth.currentUser;
  if (!user) {
    alert("Tu dois être connecté !");
    return;
  }

  const c = document.createElement("canvas");
  c.width = cam.videoWidth;
  c.height = cam.videoHeight;
  const ctx = c.getContext("2d");

  if (useFront) {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(cam, 0, 0);

  // ✅ Convertir en image
  c.toBlob(async blob => {
    const file = new File([blob], "camera-avatar.jpg", { type: "image/jpeg" });

    // ✅ Upload vers Firebase Storage
    const path = `avatar/${user.uid}.jpg`;
    const fileRef = ref(storage, path);
    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    // ✅ Sauvegarde dans Auth + Firestore
    await updateProfile(user, { photoURL: url });
    await setDoc(doc(db, "users", user.uid), { photoURL: url }, { merge: true });

    // ✅ Stop caméra
    stream.getTracks().forEach(t => t.stop());

    // ✅ Redirection vers profil
    window.location.href = "profile.html";
  }, "image/jpeg");
};

startCam();
