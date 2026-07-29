import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

let loadPromise: Promise<void> | null = null;

export function loadFaceModels(): Promise<void> {
  if (!loadPromise) {
    loadPromise = Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]).then(() => undefined);
  }
  return loadPromise;
}

// Cheap pre-check so a solid-black feed (camera covered, OS-level camera
// privacy block, or another app holding the device) fails fast with a
// specific hint instead of burning the full detection timeout.
export function isFrameBlank(video: HTMLVideoElement): boolean {
  if (video.videoWidth === 0 || video.videoHeight === 0) return true;
  const sampleSize = 32;
  const canvas = document.createElement("canvas");
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  ctx.drawImage(video, 0, 0, sampleSize, sampleSize);
  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize);
  let total = 0;
  for (let i = 0; i < data.length; i += 4) {
    total += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }
  const avgBrightness = total / (data.length / 4);
  return avgBrightness < 10;
}

const DETECTION_TIMEOUT_MS = 12000;

export async function detectFaceDescriptor(
  input: HTMLVideoElement
): Promise<number[] | null> {
  const detectionPromise = faceapi
    .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
    .withFaceLandmarks()
    .withFaceDescriptor();

  // face-api.js can stall indefinitely on some devices/backends instead of
  // resolving to undefined when no face is found — never let the caller's
  // button stay stuck on "Tekshirilmoqda..." forever.
  const timeoutPromise = new Promise<"timeout">((resolve) =>
    setTimeout(() => resolve("timeout"), DETECTION_TIMEOUT_MS)
  );

  const result = await Promise.race([detectionPromise, timeoutPromise]);
  if (result === "timeout") {
    throw new Error("Yuz aniqlash vaqti tugadi");
  }
  return result ? Array.from(result.descriptor) : null;
}
