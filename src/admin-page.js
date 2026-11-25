// The /admin page: one self-contained HTML document, built for a phone.
// Same pattern as sunken.fyi/admin: password kept on the device, every
// change saved straight to the site.
export const ADMIN_PAGE = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>Edit rugs</title>
<style>
  :root { --ink: #111; --muted: #5E5E5E; --line: #E5E5E5; --greige: #E7DFD8; --danger: #A8322B; --ok: #2F6B3F; color-scheme: light; }
  * { box-sizing: border-box; }
  [hidden] { display: none !important; }
  body { margin: 0; background: #fff; color: var(--ink); font: 16px/1.45 "Helvetica Neue", Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
  main { max-width: 40rem; margin: 0 auto; padding: 0 14px 120px; }
  .up { text-transform: uppercase; letter-spacing: .02em; }
  header.bar { height: 64px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--line); margin: 0 -14px 16px; padding: 0 14px; position: sticky; top: 0; background: #fff; z-index: 2; }
  header.bar h1 { margin: 0; font-size: 15px; font-weight: 300; letter-spacing: .06em; text-transform: uppercase; }
  a { color: var(--ink); }
  .small { font-size: 12px; }
  .muted { color: var(--muted); }
  label { display: block; font-size: 12px; text-transform: uppercase; letter-spacing: .02em; color: var(--muted); margin-bottom: 6px; }
  input, textarea, select { font: inherit; font-size: 16px; color: var(--ink); background: #fff; border: 1px solid #BDBDBD; border-radius: 0; padding: 10px 12px; width: 100%; min-height: 44px; }
  textarea { min-height: 110px; resize: vertical; }
  input:focus-visible, textarea:focus-visible, select:focus-visible, button:focus-visible, a:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .field { margin-bottom: 16px; }
  .hint { font-size: 13px; color: var(--muted); margin: 6px 0 0; }
  .row2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ftin { display: grid; grid-template-columns: minmax(0,1fr) auto minmax(0,1fr) auto; gap: 6px; align-items: center; }
  .ftin span { font-size: 14px; color: var(--muted); }
  button, .btn { font: inherit; font-size: 13px; font-weight: 500; letter-spacing: .04em; text-transform: uppercase; cursor: pointer; min-height: 44px; padding: 0 16px; border: 1px solid var(--ink); background: #fff; color: var(--ink); display: inline-flex; align-items: center; justify-content: center; gap: 8px; text-decoration: none; }
  button.primary, .btn.primary { background: var(--ink); color: #fff; }
  button.wide { width: 100%; }
  button.link { border: 0; padding: 0; min-height: 44px; background: none; text-decoration: underline; text-underline-offset: 4px; }
  button.danger { border-color: var(--danger); color: var(--danger); }
  button:disabled { opacity: .45; cursor: default; }
  .status { min-height: 22px; font-size: 14px; margin: 8px 0; }
  .status.error { color: var(--danger); } .status.ok { color: var(--ok); }
  .tabs { display: flex; gap: 20px; margin-bottom: 12px; }
  .tabs button { border: 0; padding: 0; background: none; text-underline-offset: 6px; }
  .tabs button[aria-selected="true"] { text-decoration: underline; }
  ul.rugs { list-style: none; margin: 0; padding: 0; }
  ul.rugs li { padding: 14px 0; border-bottom: 1px solid var(--line); display: grid; grid-template-columns: 72px minmax(0,1fr); gap: 12px; }
  .thumb { width: 72px; height: 80px; background: var(--greige); object-fit: cover; display: block; }
  .meta { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
  .meta b { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .seg { display: flex; margin-top: 6px; }
  .seg button { flex: 1 1 0; min-width: 0; padding: 0 6px; font-size: 11px; border-right-width: 0; }
  .seg button:last-child { border-right-width: 1px; }
  .seg button[aria-pressed="true"] { background: var(--ink); color: #fff; }
  .seg button.sold[aria-pressed="true"] { background: var(--danger); border-color: var(--danger); color: #fff; }
  .photos { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 8px; margin-bottom: 8px; }
  .photo { position: relative; background: var(--greige); aspect-ratio: 1 / 1.1; }
  .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .photo .cover { position: absolute; left: 6px; top: 6px; background: #fff; font-size: 10px; padding: 2px 6px; }
  .photo .tools { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: space-between; background: rgba(255,255,255,.9); }
  .photo .tools button { min-height: 36px; min-width: 36px; padding: 0; border: 0; background: none; font-size: 16px; text-transform: none; letter-spacing: 0; }
  .photo.busy { display: grid; place-items: center; font-size: 12px; color: var(--muted); }
  .addphotos { position: relative; overflow: hidden; }
  .addphotos input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  .savebar { position: fixed; left: 0; right: 0; bottom: 0; padding: 12px 14px calc(16px + env(safe-area-inset-bottom)); background: #fff; border-top: 1px solid var(--line); z-index: 3; }
  .savebar > div { max-width: 40rem; margin: 0 auto; display: flex; gap: 8px; }
  .savebar button { flex: 1 1 0; }
  .lock { min-height: 80vh; display: flex; flex-direction: column; justify-content: center; gap: 16px; }
  .lock h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: .06em; text-transform: uppercase; }
</style>
</head>
<body>
<main>
  <section id="lock" class="lock" hidden>
    <h1>Edit rugs</h1>
    <form id="lock-form">
      <div class="field"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required></div>
      <button class="primary wide" type="submit">Open</button>
      <p class="status error" id="lock-status" role="alert"></p>
    </form>
  </section>

  <section id="home" hidden>
    <header class="bar"><h1 id="shop-title">Edit rugs</h1><a class="small up" href="/" target="_blank" rel="noopener">View site ↗</a></header>
    <nav class="tabs" role="tablist">
      <button type="button" role="tab" class="up small" data-tab="rugs" aria-selected="true">Rugs</button>
      <button type="button" role="tab" class="up small" data-tab="shop" aria-selected="false">Contact &amp; shop info</button>
    </nav>

    <div data-panel="rugs">
      <button class="primary wide" type="button" id="add">+ Add a rug</button>
      <div id="samples-bar" class="small" style="margin-top:12px;padding:12px;background:#F5F1EB;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:8px">
        <span id="samples-text" class="muted">Want to see how the site looks first? Add a few sample rugs.</span>
        <button type="button" id="samples-add">Add sample rugs</button>
        <button type="button" id="samples-remove" class="danger" hidden>Remove samples</button>
      </div>
      <p class="status" id="list-status" role="status"></p>
      <p class="small muted" id="counts"></p>
      <ul class="rugs" id="rugs"></ul>
    </div>

    <form data-panel="shop" id="shop" hidden>
      <div class="field"><label for="s-phone">Phone number for texts</label><input id="s-phone" type="tel" autocomplete="tel" placeholder="555 123 4567"><p class="hint">The “Text me” buttons open a text to this number with the rug number filled in.</p></div>
      <div class="field"><label for="s-instagram">Instagram (optional)</label><input id="s-instagram" autocapitalize="off" placeholder="yourname"></div>
      <div class="field"><label for="s-area">Pickup area</label><input id="s-area" placeholder="East Austin"><p class="hint">Neighborhood only. Don't put your street address here.</p></div>
      <div class="field"><label for="s-payment">How people pay</label><input id="s-payment" placeholder="Cash or Venmo"></div>
      <div class="field"><label for="s-banner">Line over the top photo (optional)</label><input id="s-banner" placeholder="New rugs up every Saturday"></div>
      <div class="field"><label for="s-intro">How it works</label><textarea id="s-intro"></textarea></div>
      <div class="row2">
        <div class="field"><label for="s-shopName">Shop name</label><input id="s-shopName" required></div>
        <div class="field"><label for="s-tagline">Under the name</label><input id="s-tagline"></div>
      </div>
      <button class="primary wide" type="submit">Save shop info</button>
      <p class="status" id="shop-status" role="status"></p>
    </form>

    <form data-panel="shop" id="pwform" hidden style="margin-top:40px;padding-top:24px;border-top:1px solid var(--line)">
      <h2 class="up small" style="font-weight:500;margin:0 0 6px">Change password</h2>
      <p class="hint" id="pw-hint" style="margin:0 0 16px">Changing it signs out every other phone or computer.</p>
      <input type="text" autocomplete="username" value="admin" hidden aria-hidden="true" tabindex="-1">
      <div class="field"><label for="pw-current">Current password</label><input id="pw-current" type="password" autocomplete="current-password" required></div>
      <div class="field"><label for="pw-new">New password</label><input id="pw-new" type="password" autocomplete="new-password" minlength="10" required><p class="hint">At least 10 characters. A short phrase is easiest to remember.</p></div>
      <div class="field"><label for="pw-again">New password again</label><input id="pw-again" type="password" autocomplete="new-password" required></div>
      <button class="primary wide" type="submit">Change password</button>
      <p class="status" id="pw-status" role="status"></p>
      <button id="signout" class="link small up" type="button" style="margin-top:24px">Sign out on this device</button>
    </form>
  </section>

  <form id="editor" hidden novalidate>
    <header class="bar"><button type="button" class="link small up" id="back">← All rugs</button><h1 id="ed-title">New rug</h1><a id="ed-view" class="small up" href="/" target="_blank" rel="noopener">View ↗</a></header>

    <div class="field">
      <label>Photos <span class="muted">(first one is the cover)</span></label>
      <div class="photos" id="ed-photos"></div>
      <span class="btn addphotos wide" style="width:100%">+ Add photos<input id="ed-files" type="file" accept="image/*" multiple aria-label="Add photos"></span>
      <p class="hint">Good set: the whole rug from above, a close-up, the back, and one in a room.</p>
    </div>

    <div class="row2">
      <div class="field"><label for="ed-num">Rug number</label><input id="ed-num" type="number" inputmode="numeric" min="1" required></div>
      <div class="field"><label for="ed-price">Price ($)</label><input id="ed-price" inputmode="numeric" placeholder="Blank = “Ask”"></div>
    </div>
    <div class="field"><label for="ed-name">Short name</label><input id="ed-name" placeholder="Red medallion" required></div>
    <div class="field">
      <label for="ed-wft">Width</label>
      <div class="ftin"><input id="ed-wft" inputmode="numeric" aria-label="Width feet"><span>ft</span><input id="ed-win" inputmode="numeric" aria-label="Width inches"><span>in</span></div>
    </div>
    <div class="field">
      <label for="ed-lft">Length</label>
      <div class="ftin"><input id="ed-lft" inputmode="numeric" aria-label="Length feet"><span>ft</span><input id="ed-lin" inputmode="numeric" aria-label="Length inches"><span>in</span></div>
      <p class="hint">Measure edge to edge, not counting fringe. The site sorts it into Runner / Small / Medium / Large for you.</p>
    </div>
    <div class="row2">
      <div class="field"><label for="ed-pile">Pile</label><input id="ed-pile" list="piles" placeholder="Low"></div>
      <div class="field"><label for="ed-material">Material</label><input id="ed-material" list="materials" placeholder="Wool"></div>
    </div>
    <datalist id="piles"><option value="Flatweave"><option value="Low"><option value="Medium"><option value="High"><option value="Shag"></datalist>
    <datalist id="materials"><option value="Wool"><option value="Cotton"><option value="Wool blend"><option value="Jute"><option value="Silk"><option value="Synthetic"></datalist>
    <div class="field"><label for="ed-condition">Condition</label><input id="ed-condition" placeholder="Good, light wear on one corner"></div>
    <div class="field"><label for="ed-desc">A few words about it</label><textarea id="ed-desc" placeholder="Where it came from, how it feels, any flaws worth knowing."></textarea></div>
    <div class="field"><label for="ed-status">Status</label>
      <select id="ed-status"><option value="available">Available</option><option value="hold">On hold</option><option value="sold">Sold</option><option value="hidden">Hidden (not on the site)</option></select>
    </div>
    <p class="status" id="ed-status-msg" role="status"></p>
    <button type="button" class="danger wide" id="ed-delete" hidden>Delete this rug</button>
    <div class="savebar"><div><button type="button" id="ed-cancel">Cancel</button><button class="primary" type="submit" id="ed-save">Save</button></div></div>
  </form>
</main>
<script>
(() => {
  const $ = (id) => document.getElementById(id);
  const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
  const pad = (n) => String(n).padStart(2, "0");
  const feet = (i) => { if (!i) return ""; const f = Math.floor(i / 12), n = i % 12; return f ? (n ? f + "'" + n + '"' : f + "'") : n + '"'; };
  const sizeLabel = (w, l) => { const [a, b] = [w, l].sort((x, y) => x - y); return a && b ? feet(a) + " × " + feet(b) : ""; };
  const STATUS = { available: "Available", hold: "On hold", sold: "Sold", hidden: "Hidden" };
  let key = null;
  const state = { rugs: [], settings: {}, nextNum: 1, editing: null, photos: [], uploaded: [], uploading: 0 };

  const store = {
    get() { try { return localStorage.getItem("rugs-admin-token"); } catch { return null; } },
    set(v) { try { localStorage.setItem("rugs-admin-token", v); } catch {} },
    clear() { try { localStorage.removeItem("rugs-admin-token"); } catch {} },
  };

  async function api(method, path, body, raw) {
    const headers = key ? { authorization: "Bearer " + key } : {};
    if (body !== undefined && !raw) headers["content-type"] = "application/json";
    let res;
    try { res = await fetch(path, { method, headers, body: raw ? body : body === undefined ? undefined : JSON.stringify(body) }); }
    catch { throw new Error("No connection. Check your signal and try again."); }
    const out = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(out.error || "Something went wrong (" + res.status + ")."); e.status = res.status; throw e; }
    return out;
  }
  function status(id, msg, kind) { const n = $(id); n.textContent = msg || ""; n.className = "status " + (kind || ""); }

  function screen(name) {
    $("lock").hidden = name !== "lock";
    $("home").hidden = name !== "home";
    $("editor").hidden = name !== "editor";
    window.scrollTo(0, 0);
  }
  function lock(msg) { key = null; store.clear(); screen("lock"); status("lock-status", msg || "", "error"); }

  // ---------- sign in
  $("lock-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    key = null;
    try {
      const r = await api("POST", "/admin-api/login", { password: $("pw").value });
      key = r.token; store.set(key); $("pw").value = "";
      await load(); screen("home");
    } catch (err) { lock(err.message); }
  });
  $("signout").addEventListener("click", async () => { await api("POST", "/admin-api/logout").catch(() => {}); lock(""); });

  // ---------- password
  $("pwform").addEventListener("submit", async (e) => {
    e.preventDefault();
    if ($("pw-new").value !== $("pw-again").value) { status("pw-status", "The two new passwords don't match.", "error"); return; }
    status("pw-status", "Saving…");
    try {
      await api("PUT", "/admin-api/password", { current: $("pw-current").value, password: $("pw-new").value });
      for (const id of ["pw-current", "pw-new", "pw-again"]) $(id).value = "";
      state.ownPassword = true; fillShop();
      status("pw-status", "Password changed. Use the new one next time you sign in.", "ok");
    } catch (err) { status("pw-status", err.message, "error"); if (err.status === 401) lock(); }
  });

  // ---------- tabs
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
  }));

  // ---------- rug list
  async function load() {
    const r = await api("GET", "/admin-api/rugs");
    state.rugs = r.rugs; state.settings = r.settings; state.nextNum = r.nextNum; state.ownPassword = r.ownPassword;
    renderList(); fillShop();
  }

  function renderList() {
    $("shop-title").textContent = state.settings.shopName || "Edit rugs";
    const c = { available: 0, hold: 0, sold: 0, hidden: 0 };
    state.rugs.forEach((r) => c[r.status]++);
    $("counts").textContent = state.rugs.length ? c.available + " available · " + c.hold + " on hold · " + c.sold + " sold" + (c.hidden ? " · " + c.hidden + " hidden" : "") : "No rugs yet. Add your first one.";
    const samples = state.rugs.filter((r) => r.sample).length;
    $("samples-add").hidden = samples > 0;
    $("samples-remove").hidden = samples === 0;
    $("samples-bar").hidden = samples === 0 && state.rugs.length > 0;
    $("samples-text").textContent = samples
      ? samples + " sample rug" + (samples === 1 ? " is" : "s are") + " on the site. Remove them before the real ones go up."
      : "Want to see how the site looks first? Add a few sample rugs.";
    const ul = $("rugs"); ul.replaceChildren();
    for (const r of state.rugs) ul.append(rugRow(r));
  }

  function rugRow(r) {
    const img = r.photos[0] ? el("img", { className: "thumb", src: "/img/" + r.photos[0].id + "-s.jpg", alt: "" }) : el("div", { className: "thumb" });
    const seg = el("div", { className: "seg", role: "group" });
    seg.setAttribute("aria-label", "Status of No. " + pad(r.num));
    for (const s of ["available", "hold", "sold"]) {
      const b = el("button", { type: "button", textContent: STATUS[s], className: s });
      b.setAttribute("aria-pressed", String(r.status === s));
      b.addEventListener("click", () => setStatus(r, s));
      seg.append(b);
    }
    const edit = el("button", { type: "button", className: "link small up", textContent: "Edit" });
    edit.addEventListener("click", () => openEditor(r));
    const price = r.price != null ? "$" + r.price.toLocaleString("en-US") : "Ask";
    const meta = el("div", { className: "meta" },
      el("b", { textContent: "No. " + pad(r.num) + " · " + r.name }),
      el("span", { className: "small muted", textContent: sizeLabel(r.widthIn, r.lengthIn) + " · " + price + (r.status === "hidden" ? " · Hidden" : "") + (r.sample ? " · Sample" : "") }),
      seg,
      el("div", {}, edit),
    );
    return el("li", {}, img, meta);
  }

  async function setStatus(r, s) {
    if (r.status === s) return;
    status("list-status", "Saving…");
    try {
      const out = await api("PATCH", "/admin-api/rugs/" + r.id, { status: s });
      Object.assign(r, out.rug);
      renderList();
      status("list-status", "No. " + pad(r.num) + " is now " + STATUS[s].toLowerCase() + " on the site.", "ok");
    } catch (e) { status("list-status", e.message, "error"); if (e.status === 401) lock(); }
  }

  // ---------- shop info
  const SHOP = ["shopName", "tagline", "area", "phone", "instagram", "payment", "banner", "intro"];
  function fillShop() {
    for (const k of SHOP) $("s-" + k).value = state.settings[k] || "";
    $("pw-hint").textContent = state.ownPassword
      ? "Changing it signs out every other phone or computer."
      : "No password of your own yet: you're using the recovery key. Set your own here; the recovery key keeps working as a backup.";
  }
  $("shop").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = {}; for (const k of SHOP) body[k] = $("s-" + k).value;
    status("shop-status", "Saving…");
    try { const r = await api("PUT", "/admin-api/settings", body); state.settings = r.settings; fillShop(); renderList(); status("shop-status", "Saved. It's on the site now.", "ok"); }
    catch (err) { status("shop-status", err.message, "error"); if (err.status === 401) lock(); }
  });

  // ---------- editor
  function splitIn(i) { return i ? [Math.floor(i / 12), i % 12] : ["", ""]; }
  function openEditor(r) {
    state.editing = r || null;
    state.photos = r ? r.photos.map((p) => ({ ...p })) : [];
    state.uploaded = [];
    $("ed-title").textContent = r ? "Edit No. " + pad(r.num) : "New rug";
    $("ed-view").hidden = !r;
    if (r) $("ed-view").href = "/rug/" + r.num;
    $("ed-delete").hidden = !r;
    $("ed-num").value = r ? r.num : state.nextNum;
    $("ed-price").value = r && r.price != null ? r.price : "";
    $("ed-name").value = r ? r.name : "";
    const [wf, wi] = splitIn(r && r.widthIn), [lf, li] = splitIn(r && r.lengthIn);
    $("ed-wft").value = wf; $("ed-win").value = wi; $("ed-lft").value = lf; $("ed-lin").value = li;
    $("ed-pile").value = r ? r.pile : ""; $("ed-material").value = r ? r.material : "";
    $("ed-condition").value = r ? r.condition : ""; $("ed-desc").value = r ? r.description : "";
    $("ed-status").value = r ? r.status : "available";
    status("ed-status-msg", "");
    renderPhotos();
    screen("editor");
  }

  function renderPhotos() {
    const box = $("ed-photos"); box.replaceChildren();
    state.photos.forEach((p, i) => {
      const tools = el("div", { className: "tools" });
      const mk = (label, text, fn, disabled) => { const b = el("button", { type: "button", textContent: text, disabled }); b.setAttribute("aria-label", label); b.addEventListener("click", fn); tools.append(b); };
      mk("Move photo " + (i + 1) + " earlier", "←", () => move(i, -1), i === 0);
      mk("Remove photo " + (i + 1), "✕", () => { state.photos.splice(i, 1); renderPhotos(); });
      mk("Move photo " + (i + 1) + " later", "→", () => move(i, 1), i === state.photos.length - 1);
      const tile = el("div", { className: "photo" }, el("img", { src: "/img/" + p.id + "-s.jpg", alt: "Photo " + (i + 1) }), tools);
      if (i === 0) tile.append(el("span", { className: "cover up", textContent: "Cover" }));
      box.append(tile);
    });
    for (let i = 0; i < state.uploading; i++) box.append(el("div", { className: "photo busy up", textContent: "Uploading…" }));
    $("ed-save").disabled = state.uploading > 0;
  }
  function move(i, d) { const [p] = state.photos.splice(i, 1); state.photos.splice(i + d, 0, p); renderPhotos(); }

  // Resizes on the phone (and turns HEIC into JPEG), so uploads are quick.
  async function resized(bmp, max, quality) {
    const s = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = Object.assign(document.createElement("canvas"), { width: Math.round(bmp.width * s), height: Math.round(bmp.height * s) });
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise((ok, no) => c.toBlob((b) => (b ? ok(b) : no(new Error("Couldn't read that photo."))), "image/jpeg", quality));
  }

  $("ed-files").addEventListener("change", async (e) => {
    const files = [...e.target.files]; e.target.value = "";
    const room = 12 - state.photos.length - state.uploading;
    if (files.length > room) status("ed-status-msg", "Up to 12 photos per rug. Added the first " + Math.max(room, 0) + ".", "error");
    const todo = files.slice(0, Math.max(room, 0));
    state.uploading += todo.length; renderPhotos();
    for (const f of todo) {
      try {
        let bmp;
        try { bmp = await createImageBitmap(f); } catch { throw new Error("Couldn't open " + f.name + ". Try a different photo."); }
        const big = await resized(bmp, 2000, 0.85), small = await resized(bmp, 700, 0.8);
        const p = await api("POST", "/admin-api/photos", big, true);
        await api("PUT", "/admin-api/photos/" + p.id + "/small", small, true);
        state.photos.push({ id: p.id, w: p.w, h: p.h }); state.uploaded.push(p.id);
      } catch (err) { status("ed-status-msg", err.message, "error"); if (err.status === 401) { lock(); return; } }
      state.uploading--; renderPhotos();
    }
  });

  function formRug() {
    return {
      num: Number($("ed-num").value),
      name: $("ed-name").value,
      width: { ft: $("ed-wft").value, in: $("ed-win").value },
      length: { ft: $("ed-lft").value, in: $("ed-lin").value },
      price: $("ed-price").value.trim(),
      pile: $("ed-pile").value, material: $("ed-material").value, condition: $("ed-condition").value,
      description: $("ed-desc").value, status: $("ed-status").value,
      photos: state.photos,
    };
  }

  $("editor").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.uploading) return;
    status("ed-status-msg", "Saving…");
    $("ed-save").disabled = true;
    try {
      const r = state.editing
        ? await api("PATCH", "/admin-api/rugs/" + state.editing.id, formRug())
        : await api("POST", "/admin-api/rugs", formRug());
      state.uploaded = [];
      await load();
      screen("home");
      status("list-status", "Saved No. " + pad(r.rug.num) + ". It's on the site now.", "ok");
    } catch (err) { status("ed-status-msg", err.message, "error"); if (err.status === 401) lock(); }
    $("ed-save").disabled = false;
  });

  async function leave() {
    // Photos added but never saved are removed again.
    for (const id of state.uploaded) api("DELETE", "/admin-api/photos/" + id).catch(() => {});
    state.uploaded = [];
    screen("home");
  }
  $("back").addEventListener("click", leave);
  $("ed-cancel").addEventListener("click", leave);
  $("ed-delete").addEventListener("click", async () => {
    const r = state.editing;
    if (!r || !confirm("Delete No. " + pad(r.num) + " and its photos? This can't be undone. (To just take it off the site, set it to Sold or Hidden.)")) return;
    try { await api("DELETE", "/admin-api/rugs/" + r.id); await load(); screen("home"); status("list-status", "Deleted No. " + pad(r.num) + ".", "ok"); }
    catch (err) { status("ed-status-msg", err.message, "error"); }
  });
  $("add").addEventListener("click", () => openEditor(null));

  // ---------- sample rugs (for trying the site out; removable in one tap)
  const SAMPLES = [
    { name: "Red medallion", w: [8, 0], l: [10, 0], price: 280, pile: "Low", material: "Wool", condition: "Good, light wear on one corner", status: "available", look: "medallion", c: ["#8E2F24", "#E2C9A6", "#22345E", "#B6553F"] },
    { name: "Blue and ivory runner", w: [2, 6], l: [10, 0], price: 90, pile: "Flatweave", material: "Cotton", condition: "Very good", status: "available", look: "stripes", c: ["#22345E", "#E9E1CF", "#4A6391", "#A8322B"] },
    { name: "Green geometric", w: [7, 7], l: [9, 0], price: null, pile: "Low", material: "Wool blend", condition: "Good", status: "available", look: "diamonds", c: ["#2F5141", "#D9CFB2", "#5F7F61", "#8E2F24"] },
    { name: "Mustard kilim", w: [4, 0], l: [6, 0], price: 60, pile: "Flatweave", material: "Wool", condition: "Very good", status: "sold", look: "kilim", c: ["#C99A2E", "#5B4423", "#E7CF8A", "#8E2F24"] },
    { name: "Cream shag", w: [5, 0], l: [8, 0], price: 150, pile: "High", material: "Synthetic", condition: "Good, freshly cleaned", status: "available", look: "shag", c: ["#E8DFCC", "#D6CAB1", "#C9BC9F", "#F3ECDD"] },
    { name: "Navy oriental", w: [9, 0], l: [12, 0], price: 420, pile: "Medium", material: "Wool", condition: "Good, small repair on one edge", status: "available", look: "medallion", c: ["#1E2A4A", "#D9C9A3", "#8E2F24", "#2E4170"] },
    { name: "Faded rust vintage", w: [6, 0], l: [9, 0], price: 180, pile: "Low", material: "Wool", condition: "Sun-faded, no stains", status: "hold", look: "diamonds", c: ["#A2522F", "#E2C9A6", "#6E3A28", "#C27A54"] },
    { name: "Small entry kilim", w: [3, 0], l: [5, 0], price: 45, pile: "Flatweave", material: "Wool", condition: "Very good", status: "available", look: "kilim", c: ["#2F3D5C", "#E9E1CF", "#8E2F24", "#C9A24A"] },
  ];

  function drawRug(ctx, x, y, w, h, s, rnd) {
    const [a, b, c, d] = s.c;
    const unit = Math.min(w, h);
    ctx.save();
    // fringe on the short ends
    ctx.strokeStyle = "#EFE8DA"; ctx.lineWidth = Math.max(2, unit * 0.006);
    for (let i = x + 4; i < x + w - 4; i += unit * 0.018) {
      ctx.beginPath(); ctx.moveTo(i, y); ctx.lineTo(i + rnd() * 4 - 2, y - unit * 0.05); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i, y + h); ctx.lineTo(i + rnd() * 4 - 2, y + h + unit * 0.05); ctx.stroke();
    }
    ctx.shadowColor = "rgba(40,30,20,0.28)"; ctx.shadowBlur = unit * 0.06; ctx.shadowOffsetY = unit * 0.02;
    ctx.fillStyle = a; ctx.fillRect(x, y, w, h);
    ctx.shadowColor = "transparent";
    ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    if (s.look === "stripes") {
      const band = unit * 0.07, cols = [a, b, c, b];
      for (let i = 0, yy = y; yy < y + h; i++, yy += band) { ctx.fillStyle = cols[i % 4]; ctx.fillRect(x, yy, w, band * (i % 4 === 1 ? 0.5 : 1)); }
      ctx.fillStyle = d; ctx.fillRect(x + w * 0.42, y, w * 0.16, h);
    } else if (s.look === "kilim") {
      const t = unit * 0.16, cols = [b, c, d];
      for (let r = 0, yy = y; yy < y + h; r++, yy += t) {
        for (let xx = x - t; xx < x + w + t; xx += t) {
          ctx.fillStyle = cols[(r + Math.round((xx - x) / t)) % 3];
          ctx.beginPath(); ctx.moveTo(xx, yy + t); ctx.lineTo(xx + t / 2, yy + t * 0.15); ctx.lineTo(xx + t, yy + t); ctx.fill();
        }
      }
    } else if (s.look === "shag") {
      for (let i = 0; i < 9000; i++) {
        const px = x + rnd() * w, py = y + rnd() * h, ang = rnd() * Math.PI * 2, len = unit * (0.01 + rnd() * 0.02);
        ctx.strokeStyle = s.c[1 + Math.floor(rnd() * 3)]; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(ang) * len, py + Math.sin(ang) * len); ctx.stroke();
      }
    } else {
      // border bands
      const bw = unit * 0.09;
      ctx.fillStyle = c; ctx.fillRect(x, y, w, h);
      ctx.fillStyle = b; ctx.fillRect(x + bw * 0.35, y + bw * 0.35, w - bw * 0.7, h - bw * 0.7);
      ctx.fillStyle = d; ctx.fillRect(x + bw * 0.6, y + bw * 0.6, w - bw * 1.2, h - bw * 1.2);
      ctx.fillStyle = a; ctx.fillRect(x + bw, y + bw, w - bw * 2, h - bw * 2);
      const cx = x + w / 2, cy = y + h / 2;
      if (s.look === "medallion") {
        const rings = [b, c, d, b, a, c];
        for (let i = 0; i < rings.length; i++) {
          const k = 1 - i * 0.15;
          ctx.fillStyle = rings[i];
          ctx.beginPath(); ctx.moveTo(cx, cy - h * 0.3 * k); ctx.lineTo(cx + w * 0.3 * k, cy); ctx.lineTo(cx, cy + h * 0.3 * k); ctx.lineTo(cx - w * 0.3 * k, cy); ctx.fill();
        }
        for (const [qx, qy] of [[x + bw, y + bw], [x + w - bw, y + bw], [x + bw, y + h - bw], [x + w - bw, y + h - bw]]) {
          ctx.fillStyle = d; ctx.beginPath(); ctx.arc(qx, qy, unit * 0.16, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = b; ctx.beginPath(); ctx.arc(qx, qy, unit * 0.1, 0, Math.PI * 2); ctx.fill();
        }
      } else {
        const step = unit * 0.14;
        ctx.strokeStyle = b; ctx.lineWidth = unit * 0.018;
        for (let yy = y + bw; yy < y + h - bw + step; yy += step) for (let xx = x + bw; xx < x + w - bw + step; xx += step) {
          ctx.beginPath(); ctx.moveTo(xx, yy - step / 2); ctx.lineTo(xx + step / 2, yy); ctx.lineTo(xx, yy + step / 2); ctx.lineTo(xx - step / 2, yy); ctx.closePath(); ctx.stroke();
          ctx.fillStyle = c; ctx.fillRect(xx - unit * 0.012, yy - unit * 0.012, unit * 0.024, unit * 0.024);
        }
      }
    }
    // worn, woven texture
    for (let i = 0; i < 14000; i++) {
      ctx.fillStyle = rnd() < 0.5 ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
      ctx.fillRect(x + rnd() * w, y + rnd() * h, 2, 2);
    }
    ctx.restore();
  }

  // Photo 1: the whole rug from above. Photo 2: a close-up of one corner.
  function samplePhoto(s, which, seed) {
    let n = seed;
    const rnd = () => ((n = (n * 1103515245 + 12345) % 2147483648) / 2147483648);
    const W = 1200, H = 1320;
    const cv = Object.assign(document.createElement("canvas"), { width: W, height: H });
    const ctx = cv.getContext("2d");
    const short = s.w[0] * 12 + s.w[1], long = s.l[0] * 12 + s.l[1];
    if (which === 0) {
      ctx.fillStyle = "#E7DFD8"; ctx.fillRect(0, 0, W, H);
      const scale = Math.min((W * 0.78) / short, (H * 0.78) / long);
      const rw = short * scale, rh = long * scale;
      drawRug(ctx, (W - rw) / 2, (H - rh) / 2, rw, rh, s, rnd);
    } else {
      const rw = W * 2.6, rh = rw * (long / short);
      drawRug(ctx, -W * 0.25, -H * 0.2, rw, rh, s, rnd);
    }
    return cv;
  }

  async function uploadCanvas(cv) {
    const bmp = await createImageBitmap(cv);
    const big = await resized(bmp, 2000, 0.85), small = await resized(bmp, 700, 0.8);
    const p = await api("POST", "/admin-api/photos", big, true);
    await api("PUT", "/admin-api/photos/" + p.id + "/small", small, true);
    return { id: p.id, w: p.w, h: p.h };
  }

  $("samples-add").addEventListener("click", async () => {
    $("samples-add").disabled = true;
    let num = state.nextNum;
    try {
      for (let i = 0; i < SAMPLES.length; i++) {
        const s = SAMPLES[i];
        status("list-status", "Adding sample rug " + (i + 1) + " of " + SAMPLES.length + "…");
        const photos = [await uploadCanvas(samplePhoto(s, 0, i + 7)), await uploadCanvas(samplePhoto(s, 1, i + 7))];
        await api("POST", "/admin-api/rugs", {
          num: num++, name: s.name, width: { ft: s.w[0], in: s.w[1] }, length: { ft: s.l[0], in: s.l[1] },
          price: s.price === null ? "" : String(s.price), pile: s.pile, material: s.material, condition: s.condition,
          description: "Sample listing to try out the site. Not a real rug.", status: s.status, photos, sample: true,
        });
      }
      await load();
      status("list-status", "Added " + SAMPLES.length + " sample rugs. Remove them before the real ones go up.", "ok");
    } catch (err) { await load().catch(() => {}); status("list-status", err.message, "error"); if (err.status === 401) lock(); }
    $("samples-add").disabled = false;
  });

  $("samples-remove").addEventListener("click", async () => {
    if (!confirm("Remove all sample rugs and their photos? Your real rugs stay.")) return;
    try { const r = await api("DELETE", "/admin-api/samples"); await load(); status("list-status", "Removed " + r.deleted + " sample rugs.", "ok"); }
    catch (err) { status("list-status", err.message, "error"); if (err.status === 401) lock(); }
  });


  // ---------- start
  key = store.get();
  if (!key) { screen("lock"); return; }
  load().then(() => screen("home")).catch((e) => lock(e.status === 401 ? "" : e.message));
})();
</script>
</body>
</html>`;
