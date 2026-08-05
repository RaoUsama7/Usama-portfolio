async function generateAESKey(password: string): Promise<CryptoKey> {
  const passwordBuffer = new TextEncoder().encode(password);
  const hashedPassword = await crypto.subtle.digest("SHA-256", passwordBuffer);
  return crypto.subtle.importKey(
    "raw",
    hashedPassword.slice(0, 32),
    { name: "AES-CBC" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Reads the response body chunk by chunk so download progress can be reported
 * against Content-Length. Falls back to a plain arrayBuffer() read when the
 * stream or the length header isn't available.
 */
async function readWithProgress(
  response: Response,
  onProgress?: (fraction: number) => void
): Promise<ArrayBuffer> {
  const total = Number(response.headers.get("Content-Length")) || 0;

  if (!response.body || !total || !onProgress) {
    const buffer = await response.arrayBuffer();
    onProgress?.(1);
    return buffer;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    // Clamp: a compressed transfer reports fewer bytes than it yields.
    onProgress(Math.min(received / total, 1));
  }

  const merged = new Uint8Array(received);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged.buffer;
}

export const decryptFile = async (
  url: string,
  password: string,
  onProgress?: (fraction: number) => void
): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url} (${response.status})`);
  }

  const encryptedData = await readWithProgress(response, onProgress);
  const iv = new Uint8Array(encryptedData.slice(0, 16));
  const data = encryptedData.slice(16);
  const key = await generateAESKey(password);
  return crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data);
};
