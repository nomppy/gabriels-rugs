import { test } from "node:test";
import assert from "node:assert/strict";
import { feet, sizeLabel, category, toInches } from "../src/sizes.js";
import { validateRug, validateSettings } from "../src/db.js";
import { esc, contactLink, listPage, rugPage } from "../src/render.js";

test("feet and inches", () => {
  assert.equal(feet(91), `7'7"`);
  assert.equal(feet(96), `8'`);
  assert.equal(feet(30), `2'6"`);
  assert.equal(feet(10), `10"`);
  assert.equal(feet(0), "");
  assert.equal(sizeLabel(120, 96), `8' × 10'`);
});

test("size categories", () => {
  assert.equal(category(30, 120), "runner"); // 2'6" x 10'
  assert.equal(category(24, 96), "runner");
  assert.equal(category(36, 60), "small"); // 3x5
  assert.equal(category(60, 96), "medium"); // 5x8 = 40 sq ft
  assert.equal(category(84, 108), "medium"); // 7x9
  assert.equal(category(84, 120), "medium"); // 7x10 = 70
  assert.equal(category(96, 120), "large"); // 8x10
  assert.equal(category(91, 108), "medium"); // 7x7 x 9 = 68 sq ft
});

test("toInches", () => {
  assert.equal(toInches("7", "7"), 91);
  assert.equal(toInches("8", ""), 96);
  assert.equal(toInches("", ""), null);
  assert.equal(toInches("7", "12"), null);
  assert.equal(toInches("-1", "0"), null);
});

test("validateRug", () => {
  const ok = validateRug({ num: 4, name: "Faded rust", width: { ft: 7, in: 0 }, length: { ft: 9, in: 0 }, price: "$1,200", status: "available", photos: [] });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.price, 1200);
  assert.equal(ok.value.widthIn, 84);
  assert.equal(validateRug({ num: 4, name: "", width: { ft: 7 }, length: { ft: 9 } }).ok, false);
  assert.equal(validateRug({ num: 4, name: "x", width: { ft: 7 }, length: { ft: 9 }, price: "12.5" }).ok, false);
  assert.equal(validateRug({ status: "sold" }, { partial: true }).value.status, "sold");
  assert.equal(validateRug({ status: "gone" }, { partial: true }).ok, false);
  assert.equal(validateRug({ photos: [{ id: "../etc" }] }, { partial: true }).ok, false);
});

test("validateSettings", () => {
  const v = validateSettings({ instagram: "@gabe.rugs", phone: "(555) 123-4567" });
  assert.equal(v.value.instagram, "gabe.rugs");
  assert.equal(validateSettings({ instagram: "https://instagram.com/gabe_rugs/" }).value.instagram, "gabe_rugs");
  assert.equal(validateSettings({ phone: "call me" }).ok, false);
  assert.equal(validateSettings({ shopName: "" }).ok, false);
});

test("escaping and links", () => {
  assert.equal(esc(`<img onerror="x">&'`), "&lt;img onerror=&quot;x&quot;&gt;&amp;&#39;");
  const s = { phone: "(555) 123-4567", instagram: "" };
  assert.match(contactLink(s, { num: 4, status: "available" }), /^sms:5551234567\?&body=Hi!%20Is%20rug%20No\.%2004/);
  assert.match(contactLink({ phone: "", instagram: "gabe" }, null), /^https:\/\/ig\.me\/m\/gabe$/);
  assert.equal(contactLink({ phone: "", instagram: "" }, null), null);
});

test("pages escape user text", () => {
  const s = { shopName: "<b>Shop</b>", tagline: "", area: "", phone: "", instagram: "", payment: "", banner: "", intro: "" };
  const rug = { id: "x", num: 1, name: `"><script>alert(1)</script>`, widthIn: 60, lengthIn: 96, pile: "", material: "", condition: "", price: 100, description: "<i>", status: "available", photos: [] };
  const list = listPage(s, [rug], { origin: "https://x" });
  const one = rugPage(s, rug, { origin: "https://x" });
  for (const html of [list, one]) {
    assert.ok(!html.includes("<script>alert"));
    assert.ok(!html.includes("<b>Shop</b>"));
  }
});
