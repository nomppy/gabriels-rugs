// Public pages: the rug list (/) and one page per rug (/rug/<number>).
// Design "C" from the canvas: light, Helvetica, tiny uppercase captions,
// a pastel tag per size, edge-to-edge photo grid.
import { CATEGORIES, category, feet, sizeLabel } from "./sizes.js";
import { photoUrl } from "./photos.js";

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const TAG_COLORS = { runner: "#A8E6C4", small: "#C9CBF5", medium: "#F5C6E4", large: "#F5D7BF" };
const CAT_LABEL = { runner: "Runner", small: "Small", medium: "Medium", large: "Large" };

export const pad = (n) => String(n).padStart(2, "0");
const priceText = (r) => (r.status === "sold" ? "Sold" : r.status === "hold" ? "On hold" : r.price != null ? `$${r.price.toLocaleString("en-US")}` : "Ask");

// Where the "Text me" button goes. iMessage and Android both read `?&body=`.
export function contactLink(s, rug) {
  const digits = (s.phone || "").replace(/[^0-9+]/g, "");
  if (digits) {
    const body = rug
      ? rug.status === "sold"
        ? `Hi! I saw rug No. ${pad(rug.num)} sold. Do you have anything similar?`
        : `Hi! Is rug No. ${pad(rug.num)} still available?`
      : "Hi! I'm interested in one of your rugs.";
    return `sms:${digits}?&body=${encodeURIComponent(body)}`;
  }
  if (s.instagram) return `https://ig.me/m/${encodeURIComponent(s.instagram)}`;
  return null;
}

const CSS = `
:root { --ink: #111; --muted: #5E5E5E; --line: #E5E5E5; --greige: #E7DFD8; --sold: #A8322B; }
* { box-sizing: border-box; }
body { margin: 0; background: #fff; color: var(--ink); font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
a { color: inherit; }
img { display: block; }
.up { text-transform: uppercase; letter-spacing: .02em; }
.top { height: 72px; padding: 0 14px; display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr); align-items: center; gap: 12px; }
.top a.side { font-size: 12px; text-decoration: none; padding: 12px 0; white-space: nowrap; }
.top .end { justify-self: end; }
.mark { display: flex; flex-direction: column; align-items: center; gap: 2px; text-decoration: none; white-space: nowrap; }
.mark b { font-weight: 300; font-size: 19px; letter-spacing: .06em; text-transform: uppercase; }
.mark small { font-size: 10px; letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.hero { position: relative; height: 300px; overflow: hidden; background: #15130F; }
.hero img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero::after { content: ""; position: absolute; inset: 0; background: radial-gradient(ellipse at 50% 45%, rgba(21,19,15,.05) 0%, rgba(21,19,15,.75) 85%); }
.hero a { position: absolute; z-index: 1; left: 14px; right: 14px; bottom: 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 0; color: #fff; font-size: 13px; font-weight: 500; text-decoration: none; }
.filters { padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 0 16px; align-items: center; }
.filters a { min-height: 44px; display: inline-flex; align-items: center; font-size: 12px; text-decoration: none; text-underline-offset: 6px; }
.filters a[aria-current="true"] { text-decoration: underline; }
.filters .count { margin-left: auto; font-size: 12px; color: var(--muted); }
.grid { list-style: none; margin: 0; padding: 0 8px; display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 18px 8px; }
.tile { display: flex; flex-direction: column; gap: 8px; text-decoration: none; }
.ph { display: block; position: relative; aspect-ratio: 1 / 1.1; background: var(--greige); overflow: hidden; }
.ph img { width: 100%; height: 100%; object-fit: cover; }
.ph .none { position: absolute; inset: 0; display: grid; place-items: center; font-size: 11px; color: var(--muted); }
.sold .ph img { opacity: .5; }
.tag { position: absolute; left: 8px; top: 8px; padding: 3px 8px; font-size: 11px; font-weight: 500; border-radius: 999px; color: #111; text-transform: uppercase; }
.cap { display: flex; justify-content: space-between; gap: 8px; font-size: 12px; text-transform: uppercase; }
.cap .p { white-space: nowrap; }
.sold .cap .p, .hold .cap .p { color: var(--sold); }
.empty { padding: 48px 14px; font-size: 14px; color: var(--muted); }
.how { margin: 40px 14px 0; padding: 20px 0 32px; border-top: 1px solid var(--line); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; font-size: 12px; line-height: 1.6; }
.how h2 { margin: 0 0 6px; font-size: 12px; font-weight: 400; color: var(--muted); text-transform: uppercase; }
.how p { margin: 0; }
body { padding-bottom: 92px; }
.cta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; padding: 12px 14px calc(20px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid var(--line); }
.cta a { min-height: 48px; display: flex; align-items: center; justify-content: center; background: #111; color: #fff; font-size: 13px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; text-decoration: none; }
/* rug page */
.rug { display: grid; gap: 0; }
.stage { position: relative; aspect-ratio: 1 / 1.1; background: var(--greige); }
.stage img { width: 100%; height: 100%; object-fit: contain; }
.stage .n { position: absolute; right: 12px; bottom: 12px; padding: 4px 10px; font-size: 11px; background: #fff; }
.thumbs { padding: 8px; display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 8px; }
.thumbs button { padding: 0; border: 0; background: var(--greige); aspect-ratio: 1; cursor: pointer; outline-offset: 2px; }
.thumbs button[aria-pressed="true"] { outline: 2px solid #111; }
.thumbs img { width: 100%; height: 100%; object-fit: cover; }
.info { padding: 16px 14px 32px; display: flex; flex-direction: column; gap: 14px; }
.info .tag { position: static; align-self: flex-start; }
.info .title { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.info h1 { margin: 0; font-size: 22px; font-weight: 400; }
.info .price { font-size: 18px; white-space: nowrap; }
.info .price.off { color: var(--sold); }
dl { margin: 0; border-top: 1px solid var(--line); font-size: 12px; text-transform: uppercase; }
dl div { padding: 12px 0; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; gap: 12px; }
dt { color: var(--muted); } dd { margin: 0; text-align: right; }
.desc { margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-line; }
.note { margin: 0; font-size: 12px; line-height: 1.6; color: var(--muted); }
@media (min-width: 900px) {
  .top { height: 96px; padding: 0 24px; }
  .mark b { font-size: 28px; }
  .top a.side, .filters a, .cap { font-size: 13px; }
  .hero { height: 560px; }
  .hero a { left: 24px; right: auto; font-size: 15px; gap: 14px; }
  .filters { padding: 18px 14px; }
  .grid { padding: 0 14px; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 32px 14px; }
  .rug { grid-template-columns: minmax(0, 3fr) minmax(320px, 2fr); gap: 32px; padding: 0 24px 48px; align-items: start; }
  .thumbs { padding: 8px 0; grid-template-columns: repeat(6, minmax(0,1fr)); }
  .info { padding: 0; position: sticky; top: 24px; }
  .info h1 { font-size: 28px; }
  body { padding-bottom: 0; }
  .cta { position: static; border: 0; padding: 0; }
  .list-cta { display: none; }
}
`;

function page({ title, desc = "", image = "", url = "", body, script = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ""}
${url ? `<meta property="og:url" content="${esc(url)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<style>${CSS}</style>
</head>
<body>
${body}
${script ? `<script>${script}</script>` : ""}
</body>
</html>`;
}

const arrow = `<svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M0 6h16M11 1l5 5-5 5"/></svg>`;
const back = `<svg aria-hidden="true" width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.4" style="vertical-align:-1px;margin-right:8px"><path d="M18 6H2M7 1L2 6l5 5"/></svg>`;

function header(s, { left, right }) {
  return `<header class="top">
  ${left}
  <a class="mark" href="/"><b>${esc(s.shopName)}</b>${s.tagline ? `<small>${esc(s.tagline)}</small>` : ""}</a>
  ${right}
</header>`;
}

function tagHtml(cat) {
  return `<span class="tag" style="background:${TAG_COLORS[cat]}">${CAT_LABEL[cat]}</span>`;
}

function ctaHtml(s, rug) {
  const href = contactLink(s, rug);
  if (!href) return "";
  const viaIg = !(s.phone || "").replace(/[^0-9]/g, "");
  const label = rug
    ? rug.status === "sold"
      ? "Sold. Ask me for something similar"
      : `${viaIg ? "Message me" : "Text me"} about No. ${pad(rug.num)}`
    : `${viaIg ? "Message me" : "Text me"} about a rug`;
  return `<div class="cta"><a href="${esc(href)}">${esc(label)}</a></div>`;
}

function howHtml(s) {
  const contact = [
    s.phone ? `Text <a href="${esc(contactLink(s, null))}">${esc(s.phone)}</a>` : "",
    s.instagram ? `Instagram <a href="https://instagram.com/${esc(s.instagram)}">@${esc(s.instagram)}</a>` : "",
  ].filter(Boolean).join("<br>");
  return `<section class="how">
  <div><h2>How it works</h2><p>${esc(s.intro)}${s.payment ? ` ${esc(s.payment)}.` : ""} Pickup only, no shipping.</p></div>
  ${s.area ? `<div><h2>Pickup</h2><p>${esc(s.area)}</p></div>` : ""}
  ${contact ? `<div><h2>Contact</h2><p>${contact}</p></div>` : ""}
</section>`;
}

export function listPage(s, rugs, { origin, size = "" }) {
  const withCat = rugs.map((r) => ({ ...r, cat: category(r.widthIn, r.lengthIn) }));
  const shown = size ? withCat.filter((r) => r.cat === size) : withCat;
  const heroRug = withCat.find((r) => r.status !== "sold" && r.photos.length) || withCat.find((r) => r.photos.length);
  const filters = [{ key: "", label: "All" }, ...CATEGORIES]
    .map((c) => `<a class="up" href="${c.key ? `/?size=${c.key}` : "/"}" aria-current="${size === c.key}">${esc(c.label)}</a>`)
    .join("");
  const tiles = shown
    .map((r) => {
      const ph = r.photos[0];
      return `<li class="${r.status}"><a class="tile" href="/rug/${r.num}" aria-label="${esc(`No. ${pad(r.num)}, ${r.name}, ${sizeLabel(r.widthIn, r.lengthIn)}, ${priceText(r)}`)}">
  <span class="ph">${ph ? `<img src="${photoUrl(ph.id, true)}" alt="" loading="lazy" width="${ph.w || ""}" height="${ph.h || ""}">` : `<span class="none up">No photo yet</span>`}${tagHtml(r.cat)}</span>
  <span class="cap"><span>No. ${pad(r.num)} · ${esc(sizeLabel(r.widthIn, r.lengthIn))}</span><span class="p">${esc(priceText(r))}</span></span>
</a></li>`;
    })
    .join("\n");
  const available = withCat.filter((r) => r.status === "available").length;
  const igOrText = contactLink(s, null);
  const body = `${header(s, {
    left: `<a class="side up" href="#rugs">Sizes</a>`,
    right: igOrText ? `<a class="side up end" href="${esc(igOrText)}">${s.phone ? "Text" : "Message"}</a>` : "<span></span>",
  })}
${heroRug ? `<section class="hero"><img src="${photoUrl(heroRug.photos[0].id)}" alt="">${s.banner ? `<a class="up" href="#rugs">${esc(s.banner)} ${arrow}</a>` : ""}</section>` : ""}
<main id="rugs">
<nav class="filters" aria-label="Filter by size">${filters}<span class="count up">${available} available</span></nav>
${shown.length ? `<ul class="grid">${tiles}</ul>` : `<p class="empty">${rugs.length ? "Nothing in this size right now." : "No rugs up right now. Check back soon."}</p>`}
</main>
${howHtml(s)}
<div class="list-cta">${ctaHtml(s, null)}</div>`;
  return page({
    title: s.shopName,
    desc: [s.tagline, s.area].filter(Boolean).join(" · ") || "Rugs for sale",
    image: heroRug ? origin + photoUrl(heroRug.photos[0].id) : "",
    url: origin + "/",
    body,
  });
}

export function rugPage(s, r, { origin }) {
  const cat = category(r.widthIn, r.lengthIn);
  const [shorter, longer] = [r.widthIn, r.lengthIn].sort((a, b) => a - b);
  const photos = r.photos;
  const main = photos[0];
  const rows = [
    ["Size", `${feet(shorter)} wide × ${feet(longer)} long`],
    ["Pile", r.pile],
    ["Material", r.material],
    ["Condition", r.condition],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`)
    .join("");
  const thumbs =
    photos.length > 1
      ? `<div class="thumbs" role="group" aria-label="Photos">${photos
          .map(
            (p, i) =>
              `<button type="button" data-src="${photoUrl(p.id)}" aria-pressed="${i === 0}" aria-label="Photo ${i + 1} of ${photos.length}"><img src="${photoUrl(p.id, true)}" alt="" loading="lazy"></button>`,
          )
          .join("")}</div>`
      : "";
  const price = priceText(r);
  const body = `${header(s, {
    left: `<a class="side up" href="/">${back}Rugs</a>`,
    right: `<span class="side up end" style="font-size:12px">No. ${pad(r.num)}</span>`,
  })}
<main class="rug">
  <div>
    <div class="stage">${main ? `<img id="main" src="${photoUrl(main.id)}" alt="Rug No. ${pad(r.num)}, ${esc(r.name)}">` : `<span class="none up" style="position:absolute;inset:0;display:grid;place-items:center;font-size:11px;color:#5E5E5E">No photo yet</span>`}
    ${photos.length > 1 ? `<span class="n up" id="count">1 / ${photos.length}</span>` : ""}</div>
    ${thumbs}
  </div>
  <section class="info">
    ${tagHtml(cat)}
    <div class="title"><h1>${esc(r.name)}</h1><span class="price up${r.status === "available" ? "" : " off"}">${esc(price)}</span></div>
    <dl>${rows}</dl>
    ${r.description ? `<p class="desc">${esc(r.description)}</p>` : ""}
    <p class="note">Measured edge to edge, fringe not included.${s.area ? ` Pickup only in ${esc(s.area)}.` : " Pickup only."}</p>
    ${ctaHtml(s, r)}
  </section>
</main>`;
  const script = photos.length > 1
    ? `(()=>{const m=document.getElementById("main"),c=document.getElementById("count"),b=[...document.querySelectorAll(".thumbs button")];b.forEach((x,i)=>x.addEventListener("click",()=>{m.src=x.dataset.src;c.textContent=(i+1)+" / "+b.length;b.forEach(y=>y.setAttribute("aria-pressed",String(y===x)));}));})();`
    : "";
  return page({
    title: `No. ${pad(r.num)} · ${r.name} · ${sizeLabel(r.widthIn, r.lengthIn)} | ${s.shopName}`,
    desc: `${price}. ${[r.pile && r.pile + " pile", r.material, r.condition].filter(Boolean).join(", ")}`.trim(),
    image: main ? origin + photoUrl(main.id) : "",
    url: `${origin}/rug/${r.num}`,
    body,
    script,
  });
}

export function notFoundPage(s) {
  return page({
    title: `Not found | ${s.shopName}`,
    body: `${header(s, { left: `<a class="side up" href="/">${back}All rugs</a>`, right: "<span></span>" })}<p class="empty">That rug isn't here anymore. <a href="/">See the rugs that are.</a></p>`,
  });
}
