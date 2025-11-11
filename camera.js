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

takeBtn.onclick = () => {
  const c = document.createElement("canvas");
  c.width = cam.videoWidth;
  c.height = cam.videoHeight;
  const ctx = c.getContext("2d");

  if (useFront) {
    ctx.translate(c.width, 0);
    ctx.scale(-1, 1);
  }

  ctx.drawImage(cam, 0, 0);
  c.toBlob(b => alert("📸 Photo prise ! (ensuite on l’uploadera)"));
};

startCam();
