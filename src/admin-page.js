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
      <button id="signout" class="link small up" type="button" style="margin-top:40px">Sign out on this phone</button>
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
    get() { try { return localStorage.getItem("rugs-admin-key"); } catch { return null; } },
    set(v) { try { localStorage.setItem("rugs-admin-key", v); } catch {} },
    clear() { try { localStorage.removeItem("rugs-admin-key"); } catch {} },
  };

  async function api(method, path, body, raw) {
    const headers = { authorization: "Bearer " + key };
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
    key = $("pw").value;
    try { await load(); store.set(key); $("pw").value = ""; screen("home"); }
    catch (err) { lock(err.status === 401 ? "That password isn't right." : err.message); }
  });
  $("signout").addEventListener("click", () => lock(""));

  // ---------- tabs
  document.querySelectorAll(".tabs button").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".tabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== b.dataset.tab));
  }));

  // ---------- rug list
  async function load() {
    const r = await api("GET", "/admin-api/rugs");
    state.rugs = r.rugs; state.settings = r.settings; state.nextNum = r.nextNum;
    renderList(); fillShop();
  }

  function renderList() {
    $("shop-title").textContent = state.settings.shopName || "Edit rugs";
    const c = { available: 0, hold: 0, sold: 0, hidden: 0 };
    state.rugs.forEach((r) => c[r.status]++);
    $("counts").textContent = state.rugs.length ? c.available + " available · " + c.hold + " on hold · " + c.sold + " sold" + (c.hidden ? " · " + c.hidden + " hidden" : "") : "No rugs yet. Add your first one.";
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
      el("span", { className: "small muted", textContent: sizeLabel(r.widthIn, r.lengthIn) + " · " + price + (r.status === "hidden" ? " · Hidden" : "") }),
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
  function fillShop() { for (const k of SHOP) $("s-" + k).value = state.settings[k] || ""; }
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

  // ---------- start
  key = store.get();
  if (!key) { screen("lock"); return; }
  load().then(() => screen("home")).catch((e) => lock(e.status === 401 ? "" : e.message));
})();
</script>
</body>
</html>`;
