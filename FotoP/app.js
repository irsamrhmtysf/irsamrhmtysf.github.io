/**
 * FotoRingan — Premium Offline Photo Compressor
 * Pure client-side • No server • PWA ready
 */

(function () {
  "use strict";

  // ========== State ==========
  let images = [];
  let currentIndex = 0;
  let currentPreset = "custom";
  let quality = 80;
  let compressedBlob = null;

  // ========== DOM ==========
  const homeView = document.getElementById("home-view");
  const compressView = document.getElementById("compress-view");
  const fileInput = document.getElementById("file-input");
  const btnCamera = document.getElementById("btn-camera");
  const btnBack = document.getElementById("btn-back");
  const btnCompress = document.getElementById("btn-compress");
  const btnDownload = document.getElementById("btn-download");
  const previewImage = document.getElementById("preview-image");
  const qualitySlider = document.getElementById("quality-slider");
  const qualityValue = document.getElementById("quality-value");
  const qualityGroup = document.getElementById("quality-group");
  const resultInfo = document.getElementById("result-info");
  const originalSizeEl = document.getElementById("original-size");
  const compressedSizeEl = document.getElementById("compressed-size");
  const savedPercentEl = document.getElementById("saved-percent");
  const imageCounter = document.getElementById("image-counter");
  const presetsContainer = document.getElementById("presets");
  const processingOverlay = document.getElementById("processing-overlay");
  const btnLabel = btnCompress.querySelector(".btn-label");

  // ========== Presets ==========
  const PRESETS = {
    custom:             { quality: null, maxWidth: null },
    whatsapp_standard:  { quality: 72, maxWidth: 1600 },
    whatsapp_hd:        { quality: 85, maxWidth: 2560 },
    instagram_feed:     { quality: 85, maxWidth: 1080 },
    instagram_story:    { quality: 85, maxWidth: 1080, maxHeight: 1920 },
  };

  // ========== Helpers ==========
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function showView(view) {
    homeView.classList.remove("active");
    compressView.classList.remove("active");
    view.classList.add("active");
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * High-quality client-side compression via Canvas
   */
  function compressImage(file, options = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        let { width, height } = img;
        const maxW = options.maxWidth || null;
        const maxH = options.maxHeight || null;
        const q = (options.quality != null ? options.quality : quality) / 100;

        // Maintain aspect ratio while respecting limits
        if (maxW && width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        if (maxH && height > maxH) {
          width = Math.round((width * maxH) / height);
          height = maxH;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Gagal membuat hasil kompresi"));
            resolve({ blob, width, height, size: blob.size });
          },
          "image/jpeg",
          q
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Gagal memuat gambar"));
      };

      img.src = url;
    });
  }

  // ========== UI ==========
  function updatePreview() {
    if (!images.length) return;
    previewImage.src = images[currentIndex].dataUrl;
    imageCounter.textContent =
      images.length > 1 ? `${currentIndex + 1} / ${images.length}` : "";
  }

  function resetResult() {
    compressedBlob = null;
    resultInfo.hidden = true;
    btnDownload.hidden = true;
    btnLabel.textContent = "Kompres Sekarang";
    btnCompress.disabled = false;
    processingOverlay.hidden = true;
  }

  function updatePresetUI() {
    document.querySelectorAll(".preset").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.preset === currentPreset);
    });
    qualityGroup.style.display = currentPreset === "custom" ? "flex" : "none";
  }

  // ========== Handlers ==========
  async function handleFiles(fileList) {
    if (!fileList || !fileList.length) return;

    images = [];
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl = await readFileAsDataURL(file);
      images.push({ file, dataUrl, originalSize: file.size });
    }

    if (!images.length) {
      alert("Tidak ada gambar valid yang dipilih.");
      return;
    }

    currentIndex = 0;
    currentPreset = "custom";
    quality = 80;
    qualitySlider.value = 80;
    qualityValue.textContent = "80%";
    updatePresetUI();
    resetResult();
    updatePreview();
    showView(compressView);
  }

  // File picker
  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files);
    fileInput.value = "";
  });

  // Camera
  btnCamera.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = (e) => handleFiles(e.target.files);
    input.click();
  });

  // Back
  btnBack.addEventListener("click", () => {
    showView(homeView);
    images = [];
    resetResult();
  });

  // Presets
  presetsContainer.addEventListener("click", (e) => {
    const btn = e.target.closest(".preset");
    if (!btn) return;
    currentPreset = btn.dataset.preset;
    updatePresetUI();
    resetResult();
  });

  // Quality slider
  qualitySlider.addEventListener("input", (e) => {
    quality = parseInt(e.target.value, 10);
    qualityValue.textContent = quality + "%";
    resetResult();
  });

  // Compress
  btnCompress.addEventListener("click", async () => {
    if (!images.length) return;

    btnCompress.disabled = true;
    btnLabel.textContent = "Memproses…";
    processingOverlay.hidden = false;

    try {
      const item = images[currentIndex];
      const preset = PRESETS[currentPreset] || PRESETS.custom;

      const options = {
        quality: preset.quality != null ? preset.quality : quality,
        maxWidth: preset.maxWidth,
        maxHeight: preset.maxHeight,
      };

      const result = await compressImage(item.file, options);
      compressedBlob = result.blob;

      const url = URL.createObjectURL(result.blob);
      previewImage.src = url;

      originalSizeEl.textContent = formatBytes(item.originalSize);
      compressedSizeEl.textContent = formatBytes(result.size);
      const saved = ((item.originalSize - result.size) / item.originalSize) * 100;
      savedPercentEl.textContent = Math.max(0, saved).toFixed(0) + "%";

      resultInfo.hidden = false;
      btnDownload.hidden = false;
      btnLabel.textContent = "Kompres Lagi";
    } catch (err) {
      alert("Gagal mengompres: " + err.message);
      btnLabel.textContent = "Kompres Sekarang";
    } finally {
      btnCompress.disabled = false;
      processingOverlay.hidden = true;
    }
  });

  // Download
  btnDownload.addEventListener("click", () => {
    if (!compressedBlob) return;
    const a = document.createElement("a");
    const url = URL.createObjectURL(compressedBlob);
    a.href = url;
    a.download = `FotoRingan-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  console.log("%cFotoRingan ready", "color:#818CF8;font-weight:bold");
})();