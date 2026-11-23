// Rug photos in R2. The admin page resizes each photo on the phone and sends
// two JPEGs: a large one for the rug page and a small one for the grid.
// Location data is stripped here too (scrubJpeg from sunken.fyi).
import { jpegSize, scrubJpeg, displaySize } from "./jpeg.js";

const MAX_BYTES = 15 * 1024 * 1024;
const ID = /^[0-9a-f-]{36}$/;

export const photoKey = (id, small = false) => `rugs/${id}${small ? "-s" : ""}.jpg`;
export const photoUrl = (id, small = false) => `/img/${id}${small ? "-s" : ""}.jpg`;

export async function servePhoto(request, env) {
  const m = new URL(request.url).pathname.match(/^\/img\/([0-9a-f-]{36})(-s)?\.jpg$/);
  if (!m || request.method !== "GET") return null;
  let obj = await env.PHOTOS.get(photoKey(m[1], !!m[2]));
  // A missing small copy falls back to the large one.
  if (!obj && m[2]) obj = await env.PHOTOS.get(photoKey(m[1]));
  if (!obj) return new Response("Not found", { status: 404 });
  return new Response(obj.body, {
    headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=31536000, immutable", etag: obj.httpEtag },
  });
}

// Stores one JPEG. `id` is given for the small copy of a photo already sent.
export async function storePhoto(env, raw, { id = null, small = false } = {}) {
  if (!raw.byteLength) return { error: "That photo was empty.", status: 400 };
  if (raw.byteLength > MAX_BYTES) return { error: "That photo is too large (15 MB max).", status: 413 };
  const { bytes, orientation } = scrubJpeg(raw);
  const size = displaySize(jpegSize(bytes), orientation);
  if (!size) return { error: "Send a JPEG photo.", status: 415 };
  if (id !== null && !ID.test(id)) return { error: "Bad photo id.", status: 400 };
  const pid = id || crypto.randomUUID();
  await env.PHOTOS.put(photoKey(pid, small), bytes, { httpMetadata: { contentType: "image/jpeg" } });
  return { id: pid, w: size.width, h: size.height };
}

export async function deletePhotos(env, ids) {
  const keys = ids.filter((id) => ID.test(id)).flatMap((id) => [photoKey(id), photoKey(id, true)]);
  if (keys.length) await env.PHOTOS.delete(keys);
}
