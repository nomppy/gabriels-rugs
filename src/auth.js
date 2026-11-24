// Sign-in for /admin.
// - Gabriel's password is set at /admin and stored hashed (PBKDF2) in D1.
// - The ADMIN_KEY secret always works too: it's the recovery password, kept
//   by whoever runs the Cloudflare account, for when the password is forgotten.
// - Signing in returns a random session token; the phone keeps the token, not
//   the password. Changing the password signs out every other device.

const ITERATIONS = 20000;
const SESSION_DAYS = 180;
const MAX_FAILS = 8;
const FAIL_WINDOW_MS = 15 * 60 * 1000;

let ready = false;
async function ensureTables(env) {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare("CREATE TABLE IF NOT EXISTS auth (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)"),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS login_fails (ip TEXT PRIMARY KEY, count INTEGER NOT NULL, first_at INTEGER NOT NULL)"),
  ]);
  ready = true;
}

const enc = new TextEncoder();
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
const unhex = (s) => new Uint8Array(s.match(/../g).map((h) => parseInt(h, 16)));

function same(a, b) {
  const x = enc.encode(a);
  const y = enc.encode(b);
  if (x.byteLength !== y.byteLength) return false;
  return crypto.subtle.timingSafeEqual(x, y);
}

export async function hashPassword(password, saltHex = hex(crypto.getRandomValues(new Uint8Array(16))), iterations = ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: unhex(saltHex), iterations }, key, 256);
  return `pbkdf2$${iterations}$${saltHex}$${hex(bits)}`;
}

async function checkStored(password, stored) {
  const [kind, iters, salt, want] = String(stored).split("$");
  if (kind !== "pbkdf2" || !want) return false;
  const got = await hashPassword(password, salt, Number(iters));
  return same(got, stored);
}

const tokenHash = async (token) => hex(await crypto.subtle.digest("SHA-256", enc.encode(token)));

// True if `password` is Gabriel's current password or the recovery key.
export async function passwordOk(env, password) {
  await ensureTables(env);
  if (typeof password !== "string" || !password) return false;
  if (env.ADMIN_KEY && same(password, env.ADMIN_KEY)) return true;
  const row = await env.DB.prepare("SELECT value FROM auth WHERE key = 'password'").first();
  return row ? checkStored(password, row.value) : false;
}

export async function hasOwnPassword(env) {
  await ensureTables(env);
  return !!(await env.DB.prepare("SELECT 1 FROM auth WHERE key = 'password'").first());
}

// Too many wrong passwords from one address locks it out for 15 minutes.
export async function tooManyFails(env, ip) {
  await ensureTables(env);
  const r = await env.DB.prepare("SELECT count, first_at FROM login_fails WHERE ip = ?").bind(ip).first();
  return !!r && Date.now() - r.first_at < FAIL_WINDOW_MS && r.count >= MAX_FAILS;
}

export async function recordFail(env, ip) {
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO login_fails (ip, count, first_at) VALUES (?, 1, ?)
     ON CONFLICT(ip) DO UPDATE SET
       count = CASE WHEN ? - first_at > ? THEN 1 ELSE count + 1 END,
       first_at = CASE WHEN ? - first_at > ? THEN ? ELSE first_at END`,
  )
    .bind(ip, now, now, FAIL_WINDOW_MS, now, FAIL_WINDOW_MS, now)
    .run();
}

export async function clearFails(env, ip) {
  await env.DB.prepare("DELETE FROM login_fails WHERE ip = ?").bind(ip).run();
}

export async function newSession(env) {
  await ensureTables(env);
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(now),
    env.DB.prepare("INSERT INTO sessions (token_hash, created_at, expires_at) VALUES (?, ?, ?)").bind(await tokenHash(token), now, now + SESSION_DAYS * 864e5),
  ]);
  return token;
}

function bearer(request) {
  const h = request.headers.get("authorization") || "";
  return h.startsWith("Bearer ") ? h.slice(7) : "";
}

// A request is signed in if it carries a live session token.
export async function sessionOk(env, request) {
  await ensureTables(env);
  const token = bearer(request);
  if (!token) return false;
  const row = await env.DB.prepare("SELECT expires_at FROM sessions WHERE token_hash = ?").bind(await tokenHash(token)).first();
  return !!row && row.expires_at > Date.now();
}

export async function endSession(env, request) {
  const token = bearer(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await tokenHash(token)).run();
}

// Sets Gabriel's password and signs out every other device.
export async function setPassword(env, request, password) {
  await ensureTables(env);
  const keep = await tokenHash(bearer(request));
  await env.DB.batch([
    env.DB.prepare("INSERT INTO auth (key, value) VALUES ('password', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(await hashPassword(password)),
    env.DB.prepare("DELETE FROM sessions WHERE token_hash != ?").bind(keep),
  ]);
}

export function validateNewPassword(pw, env) {
  if (typeof pw !== "string" || pw.length < 10) return "Use at least 10 characters. A short phrase is easiest to remember.";
  if (pw.length > 200) return "That's too long.";
  if (env.ADMIN_KEY && pw === env.ADMIN_KEY) return "Pick a password different from the recovery key.";
  return null;
}
