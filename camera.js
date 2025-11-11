const video = document.getElementById("cameraPreview");
const takePhoto = document.getElementById("takePhoto");
const switchCam = document.getElementById("switchCam");

let facing = "user";
let stream;

async function startCam() {
  stream?.getTracks().forEach(t => t.stop());
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } });
  video.srcObject = stream;
}

switchCam.onclick = () => {
  facing = facing === "user" ? "environment" : "user";
  startCam();
};

takePhoto.onclick = () => {
  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  const img = canvas.toDataURL("image/jpeg");
  localStorage.setItem("lastPhoto", img);
  window.location.href = "profile.html";
};

startCam();
