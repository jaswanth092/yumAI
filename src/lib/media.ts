/** Photo helpers: shrink before sending so uploads stay fast on a phone. */

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("That photo could not be read."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That photo could not be opened."));
    img.src = src;
  });
}

function draw(img: HTMLImageElement, max: number, quality: number): string {
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return img.src;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

/** ~1024px JPEG — the version sent to the AI. */
export async function preparePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please pick a photo (JPG, PNG or HEIC image).");
  }
  const raw = await fileToDataUrl(file);
  try {
    const img = await loadImage(raw);
    return draw(img, 1024, 0.82);
  } catch {
    return raw; // fall back to the original if the canvas is unavailable
  }
}

/** Small thumbnail kept in the local history list. */
export async function makeThumb(dataUrl: string): Promise<string> {
  try {
    const img = await loadImage(dataUrl);
    return draw(img, 320, 0.6);
  } catch {
    return dataUrl;
  }
}

/** Short celebratory chime for a finished scan. */
export function playYummyChime() {
  try {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const start = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = start + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.22, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.42);
    });
    window.setTimeout(() => void ctx.close(), 1600);
  } catch {
    /* sound is a nice-to-have */
  }
}
