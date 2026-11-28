import assert from "node:assert/strict";
import { parseUtterance as p } from "./parser.js";
const stores = [{ id: 1, name: "Migros" }, { id: 2, name: "Coop" }, { id: 3, name: "Jumbo" }, { id: 4, name: "Coop Pronto" }];
const f = (t) => { const r = p(t, stores); return { i: r.items.map(x => x.spec ? `${x.name}|${x.spec}` : x.name), s: r.store?.name ?? null }; };
const eq = (t, i, s = null) => assert.deepEqual(f(t), { i, s }, t);

eq("Ich brauche Gumminoppen für auf die Alupfosten, und dann brauche ich noch Verbindungsstücke für die Rohre",
  ["Gumminoppen|für Alupfosten", "Verbindungsstücke|für Rohre"]);
eq("Wir haben keine Milch mehr und ich muss noch zwei Liter Orangensaft beim Coop holen", ["Milch", "Orangensaft|2 l"], "Coop");
eq("Denk an Weichspüler", ["Weichspüler"]);
eq("füge bitte 500 Gramm Hackfleisch und Tomaten hinzu", ["Hackfleisch|500 g", "Tomaten"]);
eq("Brauchen wir noch Schrauben für das Regal bei Jumbo", ["Schrauben|für Regal"], "Jumbo");
eq("Milch, Brot und 3 Äpfel bei Migros", ["Milch", "Brot", "Äpfel|3"], "Migros");
eq("milch", ["Milch"]);
eq("2 Stk Rohre für Garten", ["Rohre|2 Stk · für Garten"]);
eq("Ich möchte gerne ein Kilo Äpfel und eine Packung Butter", ["Äpfel|1 kg", "Butter|1 Pack"]);
eq("Wir müssen noch Eier kaufen", ["Eier"]);
eq("Es fehlt Salz", ["Salz"]);
eq("Vergiss nicht, Brot zu kaufen", ["Brot"]);
eq("Setz Käse auf die Einkaufsliste", ["Käse"]);
eq("Ich hätte gern 1,5 Liter Milch", ["Milch|1,5 l"]);
eq("Milch 2 Liter; Eier 10", ["Milch|2 l", "Eier|10"]);
eq("brauche ich noch ein paar frische Tomaten", ["Tomaten"]);
eq("Zahnpasta sowie Shampoo, ausserdem Seife", ["Zahnpasta", "Shampoo", "Seife"]);
eq("Bitte Klopapier und dann noch Küchenrollen im Coop Pronto", ["Klopapier", "Küchenrollen"], "Coop Pronto");
eq("ähm, ja, ich will 3 Dosen Mais", ["Mais|3 Dosen"]);
eq("Milch und Milch und Brot", ["Milch", "Brot"]);
eq("Hol bitte 250g Mozzarella vom Migros mit", ["Mozzarella|250 g"], "Migros");
eq("Ich brauche Klebeband fürs Büro", ["Klebeband|für Büro"]);
eq("noch bitte", []);
eq("Ich brauche zwei Rollen Geschenkpapier zum Einpacken", ["Geschenkpapier|2 Rollen · für Einpacken"]);
assert.equal(p("Milch", stores).store, null);
assert.equal(p("x bei migros", stores).store.id, 1);
// store aliases + speech-recognition tolerance
const st2 = [{ id: 1, name: "Migros", aliases: ["migi"] }, { id: 2, name: "Coop", aliases: ["konsum"] }, { id: 5, name: "Landi Genossenschaft" }];
assert.equal(p("Milch bei Migro", st2).store.id, 1);
assert.deepEqual(p("Milch bei Migro", st2).items.map(x => x.name), ["Milch"]);
assert.equal(p("Butter im Migros", st2).store.id, 1);
assert.equal(p("Brot bei Migi", st2).store.id, 1);
assert.deepEqual(p("Brot beim Konsum", st2).items.map(x => x.name), ["Brot"]);
assert.equal(p("Brot beim Konsum", st2).store.id, 2);
assert.equal(p("Eier Migors", st2).store.id, 1);
assert.equal(p("Eier Migors", st2).items[0].name, "Eier");
assert.equal(p("Eier bei Landi Genosenschaft", st2).store.id, 5);
assert.equal(p("Milch", st2).store, null);
assert.equal(p("Milch Cop", st2).store, null); // <5 chars: exact only
console.log("all passed");
