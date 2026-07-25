import CryptoJS from "crypto-js";

const KEY = process.env.DATA_ENCRYPTION_KEY || "0".repeat(64);

/**
 * Encrypts a plaintext string with AES-256 before it is persisted to MongoDB.
 * This protects chat messages and file metadata "at rest" even if the
 * database is ever compromised. Transport itself is protected separately by
 * TLS (https/wss) and WebRTC's mandatory DTLS-SRTP for media.
 */
export function encryptText(plainText) {
  if (plainText === undefined || plainText === null) return plainText;
  return CryptoJS.AES.encrypt(String(plainText), KEY).toString();
}

export function decryptText(cipherText) {
  if (!cipherText) return cipherText;
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "[unable to decrypt]";
  }
}
