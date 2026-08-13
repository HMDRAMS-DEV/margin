import { createHmac, timingSafeEqual } from "node:crypto";

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export async function createSessionValue(userId: string, secret: string) {
  const payload = encodeURIComponent(userId);
  return `${payload}.${signature(payload, secret)}`;
}

export async function readSessionValue(value: string, secret: string) {
  const separator = value.lastIndexOf(".");
  if (separator < 1) return null;

  const payload = value.slice(0, separator);
  const supplied = Buffer.from(value.slice(separator + 1));
  const expected = Buffer.from(signature(payload, secret));
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    return decodeURIComponent(payload);
  } catch {
    return null;
  }
}
