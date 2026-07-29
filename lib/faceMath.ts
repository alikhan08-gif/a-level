// Plain-JS distance helper so the server can compare face descriptors
// without importing face-api.js (which pulls in tfjs/browser APIs that
// aren't available in the Node.js route handler runtime).
export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export const FACE_MATCH_THRESHOLD = 0.6;
export const FACE_MAX_FAILED_ATTEMPTS = 3;
