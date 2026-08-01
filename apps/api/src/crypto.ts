// AES-256-GCM によるシークレット暗号化（WebCrypto ベース: Worker / Node 両対応）

function toBase64(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromBase64(value: string): Uint8Array {
  const bin = atob(value);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", material, "AES-GCM", false, ["encrypt", "decrypt"]);
}

export async function encryptSecret(value: string, secret: string): Promise<string> {
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value));
  return JSON.stringify({
    alg: "aes-256-gcm",
    iv: toBase64(iv),
    data: toBase64(new Uint8Array(ciphertext))
  });
}

export async function decryptSecret(payload: string, secret: string): Promise<string | null> {
  try {
    const parsed = JSON.parse(payload) as { iv?: string; data?: string };
    if (!parsed.iv || !parsed.data) return null;
    const key = await deriveKey(secret);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(parsed.iv) },
      key,
      fromBase64(parsed.data)
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}
