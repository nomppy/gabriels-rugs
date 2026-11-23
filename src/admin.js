// /admin and /admin-api/*: Gabriel edits rugs and contact details here.
// Unlocked with the ADMIN_KEY secret (same scheme as sunken.fyi/admin).
import {
  listRugs, getRug, createRug, updateRug, deleteRug, nextNum, validateRug, getSettings, saveSettings, validateSettings,
} from "./db.js";
import { storePhoto, deletePhotos } from "./photos.js";
import { ADMIN_PAGE } from "./admin-page.js";

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

async function body(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function authorized(request, env) {
  if (!env.ADMIN_KEY) return false;
  const header = request.headers.get("authorization") || "";
  const given = header.startsWith("Bearer ") ? header.slice(7) : "";
  const enc = new TextEncoder();
  const a = enc.encode(given);
  const b = enc.encode(env.ADMIN_KEY);
  if (a.byteLength !== b.byteLength) return false;
  return crypto.subtle.timingSafeEqual(a, b);
}

const duplicate = (e) => /UNIQUE/i.test(String(e?.message || e));

export async function handleAdmin(request, env) {
  const { pathname } = new URL(request.url);

  if (pathname === "/admin" || pathname === "/admin/") {
    return new Response(ADMIN_PAGE, {
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "x-robots-tag": "noindex",
        "content-security-policy":
          "default-src 'self'; img-src 'self' blob: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'",
      },
    });
  }
  if (!pathname.startsWith("/admin-api/")) return null;
  if (!(await authorized(request, env))) {
    await new Promise((r) => setTimeout(r, 600)); // slows down password guessing
    return json({ error: "That password isn't right." }, 401);
  }
  const route = `${request.method} ${pathname.replace(/\/$/, "")}`;

  if (route === "GET /admin-api/rugs") {
    const [rugs, settings, n] = await Promise.all([listRugs(env, { includeHidden: true }), getSettings(env), nextNum(env)]);
    return json({ rugs, settings, nextNum: n });
  }

  if (route === "POST /admin-api/rugs") {
    const v = validateRug(await body(request));
    if (!v.ok) return json({ error: v.error }, 400);
    try {
      return json({ rug: await createRug(env, v.value) }, 201);
    } catch (e) {
      if (duplicate(e)) return json({ error: `There's already a rug No. ${v.value.num}. Pick another number.` }, 409);
      throw e;
    }
  }

  const one = route.match(/^(PATCH|DELETE) \/admin-api\/rugs\/([0-9a-f-]{36})$/);
  if (one) {
    const before = await getRug(env, one[2]);
    if (!before) return json({ error: "That rug was already deleted. Reload the page." }, 404);
    if (one[1] === "DELETE") {
      await deleteRug(env, before.id);
      await deletePhotos(env, before.photos.map((p) => p.id));
      return json({ deleted: before.id });
    }
    const v = validateRug(await body(request), { partial: true });
    if (!v.ok) return json({ error: v.error }, 400);
    try {
      const rug = await updateRug(env, before.id, v.value, before);
      if (v.value.photos) {
        const kept = new Set(v.value.photos.map((p) => p.id));
        await deletePhotos(env, before.photos.filter((p) => !kept.has(p.id)).map((p) => p.id));
      }
      return json({ rug });
    } catch (e) {
      if (duplicate(e)) return json({ error: `There's already a rug No. ${v.value.num}. Pick another number.` }, 409);
      throw e;
    }
  }

  // Large copy first (returns the photo id), then the small copy under the same id.
  if (route === "POST /admin-api/photos") {
    const r = await storePhoto(env, new Uint8Array(await request.arrayBuffer()));
    return r.error ? json({ error: r.error }, r.status) : json(r, 201);
  }
  const small = route.match(/^PUT \/admin-api\/photos\/([0-9a-f-]{36})\/small$/);
  if (small) {
    const r = await storePhoto(env, new Uint8Array(await request.arrayBuffer()), { id: small[1], small: true });
    return r.error ? json({ error: r.error }, r.status) : json(r);
  }
  // Photos picked for a rug that was never saved.
  const drop = route.match(/^DELETE \/admin-api\/photos\/([0-9a-f-]{36})$/);
  if (drop) {
    const inUse = (await listRugs(env, { includeHidden: true })).some((r) => r.photos.some((p) => p.id === drop[1]));
    if (!inUse) await deletePhotos(env, [drop[1]]);
    return json({ deleted: !inUse });
  }

  if (route === "PUT /admin-api/settings") {
    const v = validateSettings(await body(request));
    if (!v.ok) return json({ error: v.error }, 400);
    return json({ settings: await saveSettings(env, v.value) });
  }

  return json({ error: "Not found." }, 404);
}
