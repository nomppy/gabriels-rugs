// Routes:
//   /                      rug list (?size=runner|small|medium|large)
//   /rug/<number>          one rug
//   /img/<id>.jpg          photos (…-s.jpg is the small copy)
//   /admin, /admin-api/*   editing page (admin.js)
import { getSettings, listRugs, getRugByNum } from "./db.js";
import { listPage, rugPage, notFoundPage } from "./render.js";
import { servePhoto } from "./photos.js";
import { handleAdmin } from "./admin.js";

const PAGE_HEADERS = {
  "content-type": "text/html; charset=utf-8",
  // Short, so a rug marked sold disappears within a minute.
  "cache-control": "public, max-age=30",
  "content-security-policy":
    "default-src 'self'; img-src 'self' data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
};

const SIZES = new Set(["runner", "small", "medium", "large"]);

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const handled = (await servePhoto(request, env)) || (await handleAdmin(request, env));
    if (handled) return handled;
    if (request.method !== "GET" && request.method !== "HEAD") return new Response("Method not allowed", { status: 405 });

    const settings = await getSettings(env);
    if (url.pathname === "/") {
      const size = SIZES.has(url.searchParams.get("size")) ? url.searchParams.get("size") : "";
      return new Response(listPage(settings, await listRugs(env), { origin: url.origin, size }), { headers: PAGE_HEADERS });
    }
    const m = url.pathname.match(/^\/rug\/0*(\d{1,5})\/?$/);
    if (m) {
      const rug = await getRugByNum(env, Number(m[1]));
      if (rug && rug.status !== "hidden") return new Response(rugPage(settings, rug, { origin: url.origin }), { headers: PAGE_HEADERS });
    }
    if (url.pathname === "/favicon.ico") return new Response(null, { status: 204, headers: { "cache-control": "public, max-age=86400" } });
    if (url.pathname === "/robots.txt") return new Response("User-agent: *\nDisallow: /admin\n", { headers: { "content-type": "text/plain" } });
    return new Response(notFoundPage(settings), { status: 404, headers: { ...PAGE_HEADERS, "cache-control": "no-store" } });
  },
};
