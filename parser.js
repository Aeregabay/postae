// Rule-based German (incl. Swiss-German-ish) shopping utterance parser. No dependencies, no LLM.
// parseUtterance(text, stores) -> { items: [{name, spec}], store: {id,name}|null }
const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const re = (src, f = "giu") => new RegExp(src, f);
const D = "\u0001"; // protected decimal separator

const UNIT_MAP = {
  kilogramm: ["kg"], kilo: ["kg"], kg: ["kg"], gramm: ["g"], g: ["g"], liter: ["l"], l: ["l"], dl: ["dl"], cl: ["cl"], ml: ["ml"],
  "stück": ["Stk"], stk: ["Stk"], pack: ["Pack"], packung: ["Pack"], packungen: ["Pack"], "päckchen": ["Pack"],
  dose: ["Dose", "Dosen"], dosen: ["Dose", "Dosen"], flasche: ["Flasche", "Flaschen"], flaschen: ["Flasche", "Flaschen"],
  bund: ["Bund"], rolle: ["Rolle", "Rollen"], rollen: ["Rolle", "Rollen"], meter: ["m"], m: ["m"],
};
const U = Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length).join("|");
const NW = { eins: 1, ein: 1, eine: 1, einen: 1, einem: 1, zwei: 2, drei: 3, vier: 4, "fünf": 5, sechs: 6, sieben: 7, acht: 8, neun: 9, zehn: 10, elf: 11, "zwölf": 12 };
const NUMW = "eins|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|elf|zwölf";
const NUMD = `\\d+(?:${D}\\d+)?`;

const fmtN = n => String(n).replace(".", ",");
const toNum = s => (/^\d/.test(s) ? parseFloat(s.replace(D, ".")) : NW[s.toLowerCase()]);
const unitSpec = (n, u) => {
  if (!u) return fmtN(n);
  const m = UNIT_MAP[u.toLowerCase()];
  return `${fmtN(n)} ${m[1] && n !== 1 ? m[1] : m[0]}`;
};

// ---- filler / intent removal ----
const PHRASES = [
  "(?:auf|in|zu|zur)\\s+(?:der\\s+|die\\s+|meine\\s+|unsere\\s+)?(?:einkaufs\\s*)?liste",
  "denk(?:e)?\\s+(?:bitte\\s+)?(?:daran|an)", "vergiss(?:\\s+bitte)?(?:\\s+nicht)?", "nicht\\s+vergessen",
  "(?:es\\s+)?(?:fehlt|fehlen)(?:\\s+(?:uns|mir))?",
  "(?:ist|sind)\\s+(?:fast\\s+)?(?:alle|leer|aus|ausgegangen|fertig|aufgebraucht)",
  "zu\\s+(?:kaufen|holen|besorgen|bestellen|brauchen)",
  "(?:ein\\s+)?(?:bisschen|bitzeli)",
].map(p => re(`${B}(?:${p})${E}`));
const TOKENS = re(`${B}(?:ich|wir|du|ihr|man|uns|mir|dir|es|` +
  `brauche|brauchen|brauchst|braucht|brauch|bräuchte|bräuchten|benötige|benötigen|benötigt|möchte|möchten|will|wollen|wolltest|` +
  `hätte|hätten|muss|müssen|musst|sollte|sollten|sollen|soll|kann|kannst|können|könnte|könnten|könntest|darf|dürfen|` +
  `kauf|kaufe|kaufen|hol|hole|holen|besorg|besorge|besorgen|bestell|bestelle|bestellen|nimm|nehme|nehmen|bring|bringe|bringen|` +
  `mitnehmen|mitbringen|einkaufen|haben|hab|habe|hast|hat|gern|gerne|` +
  `noch|auch|mal|bitte|dann|eben|halt|schnell|unbedingt|wieder|so|ähm|äh|ehm|also|ja|okay|ok|hey|hallo|` +
  `hinzufügen|hinzu|füge|füg|fügen|notieren|notier|notiere|setz|setze|schreib|schreibe|trag|trage|eintragen|dazu|draufschreiben|` +
  `mehr)${E}`);
const STOP = new Set(("ein eine einen einem einer der die das den dem des etwas paar einige neue neuen neues neuer frische frischen frisches frischer " +
  "kein keine keinen keinem keiner von vom mit und oder an auf für zu zum zur ist sind nicht was dass noch auch nur").split(" "));
const LEAD = re(`^(?:ein\\s+paar|paar|ein|eine|einen|einem|einer|der|die|das|den|dem|des|etwas|einige|neue|neuen|neues|neuer|frische|frischen|frisches|frischer|kein|keine|keinen|keinem|keiner|von\\s+(?:der|dem|den|die)|von|vom)${E}\\s*`);
const CONJ = re(`[,;.!?]+|${B}(?:und\\s+dann|und\\s+noch|auch\\s+noch|und|dann|sowie|ausserdem|außerdem|zudem|plus)${E}`);
const PURPOSE = re(`${B}(?:für|fürs|zum|zur)\\s+(?:(?:auf|in)\\s+)?(?:(?:die|den|das|dem|der)\\s+)?`, "iu");

const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const clean = s => s.replace(/\s+/g, " ").replace(/^[\s,.;:!?\-–]+|[\s,.;:!?\-–]+$/g, "");

function takeQty(s) {
  let m = s.match(re(`^(?:ein\\s+)?halb(?:e|es|en)?\\s+(${U})${E}\\s*(.*)$`, "iu"));
  if (m) return { n: 0.5, u: m[1], rest: m[2] };
  m = s.match(re(`^(${NUMD})\\s*(?:(${U})${E}\\s*)?(.*)$`, "iu"));
  if (m && (m[2] || m[3])) return { n: toNum(m[1]), u: m[2], rest: m[3] };
  m = s.match(re(`^(${NUMW})${E}\\s*(?:(${U})${E}\\s*)?(.*)$`, "iu"));
  if (m && m[3]) return { n: toNum(m[1]), u: m[2], rest: m[3] };
  m = s.match(re(`^(ein|eine|einen|einem)\\s+(${U})${E}\\s*(.*)$`, "iu"));
  if (m && m[3]) return { n: 1, u: m[2], rest: m[3] };
  m = s.match(re(`^(.+?)\\s+(${NUMD}|${NUMW})\\s*(?:(${U})${E})?$`, "iu"));
  if (m) return { n: toNum(m[2]), u: m[3], rest: m[1] };
  return null;
}

function parseClause(c) {
  let s = c;
  for (const p of PHRASES) s = s.replace(p, " ");
  s = s.replace(TOKENS, " ");
  s = clean(s).replace(re(`\\s+(?:auf|ein|mit|an)$`, "iu"), "");
  s = clean(s);
  let purpose = null;
  const pm = PURPOSE.exec(s);
  if (pm) {
    const after = s.slice(pm.index + pm[0].length);
    const before = clean(s.slice(0, pm.index));
    let noun = clean(before ? after : after.split(/\s+/)[0] || "");
    let tail = before ? "" : clean(after.slice(noun.length));
    if (noun) { purpose = "für " + noun; s = clean(before + " " + tail); }
  }
  let spec = null;
  const q = takeQty(s);
  if (q) { spec = unitSpec(q.n, q.u); s = clean(q.rest); }
  let prev;
  do { prev = s; s = clean(s.replace(LEAD, "")); } while (s !== prev);
  s = s.replace(re(`\\s+(?:mehr|dazu)$`, "iu"), "");
  s = clean(s).replace(new RegExp(D, "g"), ",");
  if (!s) return null;
  if (s.toLowerCase().split(/\s+/).every(w => STOP.has(w))) return null;
  const parts = [spec, purpose].filter(Boolean);
  return { name: cap(s), spec: parts.length ? parts.join(" · ").replace(new RegExp(D, "g"), ",") : null };
}

export function parseUtterance(text, stores = []) {
  let t = String(text ?? "").replace(/(\d)[.,](\d)/g, `$1${D}$2`).replace(/\s+/g, " ").trim();
  let store = null;
  const PRE = "(?:(?:beim|bei\\s+der|bei\\s+dem|bei|im|in\\s+der|in\\s+dem|in|vom|von\\s+der|von\\s+dem|von|aus\\s+dem|aus\\s+der|aus|für\\s+den|für\\s+die|für)\\s+)?";
  for (const s of [...(stores || [])].sort((a, b) => b.name.length - a.name.length)) {
    const r = re(`${B}${PRE}${esc(s.name)}${E}`);
    if (r.test(t)) { store ??= s; t = t.replace(r, " "); }
  }
  const items = [], seen = new Map();
  for (const c of t.split(CONJ)) {
    if (!c || !c.trim()) continue;
    const it = parseClause(c);
    if (!it) continue;
    const k = it.name.toLowerCase();
    if (seen.has(k)) { const o = seen.get(k); if (!o.spec && it.spec) o.spec = it.spec; continue; }
    seen.set(k, it); items.push(it);
  }
  return { items, store };
}
export default parseUtterance;
