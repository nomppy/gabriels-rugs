// The rug list and site settings, kept in D1.
import { toInches } from "./sizes.js";

export const STATUSES = ["available", "hold", "sold", "hidden"];

let ready = false;
export async function ensureSchema(env) {
  if (ready) return;
  await env.DB.batch([
    env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS rugs (
        id TEXT PRIMARY KEY,
        num INTEGER NOT NULL UNIQUE,
        name TEXT NOT NULL DEFAULT '',
        width_in INTEGER,
        length_in INTEGER,
        pile TEXT NOT NULL DEFAULT '',
        material TEXT NOT NULL DEFAULT '',
        condition TEXT NOT NULL DEFAULT '',
        price INTEGER,
        description TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'available',
        photos TEXT NOT NULL DEFAULT '[]',
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        sold_at INTEGER
      )`,
    ),
    env.DB.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)"),
  ]);
  ready = true;
}

export const DEFAULT_SETTINGS = {
  shopName: "Gabriel's Rugs",
  tagline: "Vintage & used",
  area: "",
  phone: "",
  instagram: "",
  payment: "Cash or Venmo",
  banner: "",
  intro: "Tap a rug for more photos. Text me the number and come see it in person.",
};

const LIMITS = { shopName: 60, tagline: 60, area: 80, phone: 30, instagram: 40, payment: 80, banner: 80, intro: 400 };

export async function getSettings(env) {
  await ensureSchema(env);
  const { results } = await env.DB.prepare("SELECT key, value FROM settings").all();
  const out = { ...DEFAULT_SETTINGS };
  for (const r of results) if (r.key in DEFAULT_SETTINGS) out[r.key] = r.value;
  return out;
}

export function validateSettings(input) {
  if (!input || typeof input !== "object") return { ok: false, error: "Couldn't read those settings." };
  const value = {};
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    if (!(key in input)) continue;
    let v = String(input[key] ?? "").trim().slice(0, LIMITS[key]);
    if (key === "instagram") v = v.replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//i, "").replace(/\/.*$/, "");
    if (key === "instagram" && v && !/^[A-Za-z0-9._]{1,30}$/.test(v)) return { ok: false, error: "That Instagram name doesn't look right." };
    if (key === "phone" && v && !/^\+?[0-9 ().-]{7,20}$/.test(v)) return { ok: false, error: "That phone number doesn't look right." };
    if (key === "shopName" && !v) return { ok: false, error: "The shop needs a name." };
    value[key] = v;
  }
  return { ok: true, value };
}

export async function saveSettings(env, values) {
  await ensureSchema(env);
  await env.DB.batch(
    Object.entries(values).map(([k, v]) =>
      env.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(k, v),
    ),
  );
  return getSettings(env);
}

export function rowToRug(r) {
  let photos = [];
  try {
    photos = JSON.parse(r.photos || "[]");
  } catch {
    photos = [];
  }
  return {
    id: r.id,
    num: r.num,
    name: r.name,
    widthIn: r.width_in,
    lengthIn: r.length_in,
    pile: r.pile,
    material: r.material,
    condition: r.condition,
    price: r.price,
    description: r.description,
    status: r.status,
    photos: Array.isArray(photos) ? photos : [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    soldAt: r.sold_at,
  };
}

export async function listRugs(env, { includeHidden = false } = {}) {
  await ensureSchema(env);
  const { results } = await env.DB.prepare(
    `SELECT * FROM rugs ${includeHidden ? "" : "WHERE status != 'hidden'"}
     ORDER BY CASE status WHEN 'sold' THEN 1 WHEN 'hidden' THEN 2 ELSE 0 END, COALESCE(sold_at, 0) DESC, num DESC`,
  ).all();
  return results.map(rowToRug);
}

export async function getRugByNum(env, num) {
  await ensureSchema(env);
  const r = await env.DB.prepare("SELECT * FROM rugs WHERE num = ?").bind(num).first();
  return r ? rowToRug(r) : null;
}

export async function getRug(env, id) {
  await ensureSchema(env);
  const r = await env.DB.prepare("SELECT * FROM rugs WHERE id = ?").bind(id).first();
  return r ? rowToRug(r) : null;
}

export async function nextNum(env) {
  await ensureSchema(env);
  const r = await env.DB.prepare("SELECT COALESCE(MAX(num), 0) + 1 AS n FROM rugs").first();
  return r.n;
}

const PHOTO_ID = /^[0-9a-f-]{36}$/;

// Checks a rug sent from the admin page. `partial` allows sending only some fields.
export function validateRug(input, { partial = false } = {}) {
  if (!input || typeof input !== "object") return { ok: false, error: "Couldn't read that rug." };
  const v = {};
  const has = (k) => k in input;
  if (has("num") || !partial) {
    const n = Number(input.num);
    if (!Number.isInteger(n) || n < 1 || n > 99999) return { ok: false, error: "The rug number must be a whole number." };
    v.num = n;
  }
  for (const [k, max] of [["name", 80], ["pile", 40], ["material", 60], ["condition", 120], ["description", 2000]]) {
    if (has(k)) v[k] = String(input[k] ?? "").trim().slice(0, max);
  }
  if (!partial && !v.name) return { ok: false, error: "Give the rug a short name, like “Red medallion”." };
  for (const side of ["width", "length"]) {
    if (has(side) || !partial) {
      const s = input[side] || {};
      const inches = toInches(s.ft, s.in);
      if (inches === null) return { ok: false, error: `Check the ${side}: feet, then inches under 12.` };
      v[side + "In"] = inches;
    }
  }
  if (has("price")) {
    const p = input.price === "" || input.price === null ? null : Number(String(input.price).replace(/[$,\s]/g, ""));
    if (p !== null && (!Number.isInteger(p) || p < 0 || p > 1000000)) return { ok: false, error: "The price must be a whole number of dollars, or blank." };
    v.price = p;
  }
  if (has("status") || !partial) {
    const s = input.status ?? "available";
    if (!STATUSES.includes(s)) return { ok: false, error: "Unknown status." };
    v.status = s;
  }
  if (has("photos")) {
    if (!Array.isArray(input.photos) || input.photos.length > 12) return { ok: false, error: "Up to 12 photos per rug." };
    const photos = [];
    for (const p of input.photos) {
      if (!p || !PHOTO_ID.test(p.id)) return { ok: false, error: "One of the photos didn't upload. Remove it and try again." };
      photos.push({ id: p.id, w: Number(p.w) || null, h: Number(p.h) || null });
    }
    v.photos = photos;
  }
  return { ok: true, value: v };
}

const COLUMNS = {
  num: "num", name: "name", widthIn: "width_in", lengthIn: "length_in", pile: "pile", material: "material",
  condition: "condition", price: "price", description: "description", status: "status",
};

export async function createRug(env, v) {
  await ensureSchema(env);
  const id = crypto.randomUUID();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO rugs (id, num, name, width_in, length_in, pile, material, condition, price, description, status, photos, created_at, updated_at, sold_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id, v.num, v.name, v.widthIn, v.lengthIn, v.pile ?? "", v.material ?? "", v.condition ?? "", v.price ?? null,
      v.description ?? "", v.status, JSON.stringify(v.photos ?? []), now, now, v.status === "sold" ? now : null,
    )
    .run();
  return getRug(env, id);
}

export async function updateRug(env, id, v, before) {
  const sets = [];
  const binds = [];
  for (const [k, col] of Object.entries(COLUMNS)) {
    if (k in v) {
      sets.push(`${col} = ?`);
      binds.push(v[k]);
    }
  }
  if ("photos" in v) {
    sets.push("photos = ?");
    binds.push(JSON.stringify(v.photos));
  }
  if ("status" in v && v.status !== before.status) {
    sets.push("sold_at = ?");
    binds.push(v.status === "sold" ? Date.now() : null);
  }
  sets.push("updated_at = ?");
  binds.push(Date.now());
  await env.DB.prepare(`UPDATE rugs SET ${sets.join(", ")} WHERE id = ?`).bind(...binds, id).run();
  return getRug(env, id);
}

export async function deleteRug(env, id) {
  await env.DB.prepare("DELETE FROM rugs WHERE id = ?").bind(id).run();
}
