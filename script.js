/* =========================
   ELEMENT REFERENCES
========================= */
const qrBox = document.getElementById("qrBox");
const qrText = document.getElementById("qrText");
const enableLogo = document.getElementById("enableLogo");
const logoSelect = document.getElementById("logoSelect");
const customLogo = document.getElementById("customLogo");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");

const startScanBtn = document.getElementById("startScan");
const stopScanBtn = document.getElementById("stopScan");
const scanResult = document.getElementById("scanResult");

const qrImageInput = document.getElementById("qrImageInput");
const uploadScanResult = document.getElementById("uploadScanResult");

/* =========================
   GLOBAL STATE
========================= */
let qrCode = null;
let html5QrCode = null;

/* =========================
   LOGO MAP
========================= */
const logoMap = {
  instagram: "logos/instagram.png",
  whatsapp: "logos/whatsapp.png",
  phone: "logos/phone.png",
  mail: "logos/mail.png",
  linkedin: "logos/linkedin.png",
  x: "logos/X.jpg",
  youtube: "logos/youtube.png"
};

/* =========================
   IMAGE → BASE64 (IMPORTANT)
========================= */
async function imageToBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

/* =========================
   LOGO UI LOGIC
========================= */
enableLogo.addEventListener("change", () => {
  logoSelect.disabled = !enableLogo.checked;
  customLogo.disabled = true;
  logoSelect.value = "";
});

logoSelect.addEventListener("change", () => {
  customLogo.disabled = logoSelect.value !== "other";
});

/* =========================
   GENERATE QR
========================= */
generateBtn.addEventListener("click", async () => {
  const data = qrText.value.trim();
  if (!data) {
    alert("Enter text or URL");
    return;
  }

  qrBox.innerHTML = "";
  downloadBtn.disabled = true;

  qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    data,
    dotsOptions: {
      type: "rounded",
      color: "#000000"
    },
    backgroundOptions: {
      color: "#ffffff"
    },
    imageOptions: {
      margin: 12
    }
  });

  /* ===== LOGO HANDLING ===== */
  if (enableLogo.checked) {

    // Custom uploaded logo
    if (logoSelect.value === "other" && customLogo.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        qrCode.update({ image: reader.result });
        qrCode.append(qrBox);
        downloadBtn.disabled = false;
      };
      reader.readAsDataURL(customLogo.files[0]);
      return;
    }

    // Predefined logo (Base64 required)
    if (logoMap[logoSelect.value]) {
      const base64Logo = await imageToBase64(logoMap[logoSelect.value]);
      qrCode.update({ image: base64Logo });
    }
  }

  qrCode.append(qrBox);
  downloadBtn.disabled = false;
});

/* =========================
   DOWNLOAD QR
========================= */
downloadBtn.addEventListener("click", () => {
  qrCode.download({
    name: "qrify",
    extension: "png"
  });
});

/* =========================
   CAMERA QR SCAN
========================= */
startScanBtn.addEventListener("click", async () => {
  if (!html5QrCode) {
    html5QrCode = new Html5Qrcode("reader");
  }

  const cameras = await Html5Qrcode.getCameras();
  if (!cameras.length) {
    alert("No camera found");
    return;
  }

  await html5QrCode.start(
    cameras[0].id,
    { fps: 10, qrbox: 250 },
    (decodedText) => {
      scanResult.value = decodedText;
      html5QrCode.stop();
      startScanBtn.disabled = false;
      stopScanBtn.disabled = true;
    }
  );

  startScanBtn.disabled = true;
  stopScanBtn.disabled = false;
});

/* =========================
   STOP CAMERA
========================= */
stopScanBtn.addEventListener("click", async () => {
  if (html5QrCode && html5QrCode.isScanning) {
    await html5QrCode.stop();
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
  }
});

/* =========================
   UPLOAD QR IMAGE SCAN
========================= */
qrImageInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    if (!html5QrCode) {
      html5QrCode = new Html5Qrcode("reader");
    }

    // 🔥 CRITICAL FIX
    if (html5QrCode.isScanning) {
      await html5QrCode.stop();
    }

    const result = await html5QrCode.scanFile(file, true);
    uploadScanResult.innerText = "Result: " + result;

  } catch (err) {
    uploadScanResult.innerText = "QR not detected in image";
  }
});
