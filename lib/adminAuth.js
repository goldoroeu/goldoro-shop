// Session token за админ панела, подписан с HMAC-SHA256 през Web Crypto —
// работи еднакво и в Edge middleware, и в обикновените Node route handlers.

export const ADMIN_COOKIE = "goldoro_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 дни

const enc = new TextEncoder();

function secret() {
  return (
    process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "dev-secret"
  );
}

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionValue() {
  const expires = Date.now() + ADMIN_COOKIE_MAX_AGE * 1000;
  const payload = String(expires);
  const key = await getKey();
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return `${payload}.${toHex(sig)}`;
}

export async function isValidSession(value) {
  if (!value) return false;
  const [payload, sig] = value.split(".");
  if (!payload || !sig) return false;
  if (Date.now() > Number(payload)) return false;

  const key = await getKey();
  const expectedBuf = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const expected = toHex(expectedBuf);

  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}
