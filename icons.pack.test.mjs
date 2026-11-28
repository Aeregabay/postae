import assert from "node:assert/strict";
import { registerIcons, resolveIcon, guessCategory, suggestionKeywords } from "./icons.js";
const K = "Küche & Haushaltswaren", W = "Werkzeug & Baumarkt", T = "Tierbedarf", F = "Früchte & Gemüse", C = "Körperpflege";
registerIcons("xe", { HEAD: "last", SPLIT: /^(for|with|of|and)$/i, MODS: [[/^(cat|dog)/, T]], STORE: { hardware: W },
  DATA: [[K, ":lid lid :pan pan"], [W, ":screw screw :net net"], [F, ":apple apple apples :banana banana"], [C, ":toothbrush brush"]], forms: w => (w.endsWith("s") ? [w.slice(0, -1)] : []) });
assert.equal(resolveIcon("pan lid", null, "xe").icon, "lid");
assert.equal(resolveIcon("toothbrush", null, "xe").icon, "toothbrush");
assert.equal(resolveIcon("Bananas", null, "xe").icon, "banana");
const cn = resolveIcon("cat net", null, "xe"); assert.equal(cn.icon, "net"); assert.equal(cn.category, T);
assert.equal(guessCategory("zzz", "Hardware", "xe"), W);
assert.ok(suggestionKeywords("xe").length >= 8);
registerIcons("xf", { HEAD: "first", SPLIT: /^(de|du|des|pour|avec|d)$/i, DATA: [[K, ":lid couvercle :pan casserole"], [F, ":apple pomme"]] });
assert.equal(resolveIcon("couvercle de casserole", null, "xf").icon, "lid");
assert.equal(resolveIcon("pomme", null, "xf").icon, "apple");
assert.equal(resolveIcon("Pfannendeckel", null, "xf").matched, false); // own pack, no fallback to de when pack exists
assert.equal(resolveIcon("Pfannendeckel", null, "zz").icon, "lid");   // no pack -> de
assert.throws(() => registerIcons("xg", { HEAD: "last", SPLIT: /x/, DATA: [[K, ":nope foo"]] }), /unknown icon key "nope"/);
assert.throws(() => registerIcons("xg", { HEAD: "last", SPLIT: /x/, DATA: [["Nope", ":lid foo"]] }), /unknown category "Nope"/);
assert.throws(() => registerIcons("xg", { HEAD: "mid", SPLIT: /x/, DATA: [[K, ":lid foo"]] }), /HEAD/);
console.log("all passed");
