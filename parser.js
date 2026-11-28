// Rule-based German (incl. Swiss-German-ish) shopping utterance parser. No dependencies, no LLM.
// parseUtterance(text, stores, lang = "de") -> { items: [{name, spec}], store: {id,name}|null }
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

const toNum = (s, R) => (/^\d/.test(s) ? parseFloat(s.replace(D, ".")) : R.NW[s.toLowerCase()]);
const unitSpec = (n, u, R) => {
  const fmtN = x => String(x).replace(".", R.DEC);
  if (!u) return fmtN(n);
  const m = R.UNIT_MAP[u.toLowerCase()];
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

// Per-language rule tables. German is registered below; other languages via registerParser(lang, rules) (see lang/README.md).
const RULES = {};
const SRC = x => (x instanceof RegExp ? x.source : String(x));
const asRe = (x, mk, f = "giu") => (x instanceof RegExp ? x : re(mk(x), f));
export function registerParser(lang, rules) {
  const need = (k, ok, what) => { if (!ok(rules?.[k])) throw new Error(`registerParser("${lang}"): rules.${k} must be ${what}`); };
  const isStr = v => typeof v === "string", isRe = v => v instanceof RegExp, strOrRe = v => isStr(v) || isRe(v);
  if (!lang || typeof lang !== "string") throw new Error("registerParser: lang must be a non-empty string");
  need("UNIT_MAP", v => v && typeof v === "object" && Object.values(v).every(a => Array.isArray(a) && a.length >= 1 && a.length <= 2 && a.every(isStr)), "an object {lowercaseWord: [singular, plural?]}");
  need("NW", v => v && typeof v === "object" && Object.values(v).every(Number.isFinite), "an object {lowercaseWord: number}");
  need("PHRASES", v => Array.isArray(v) && v.every(strOrRe), "an array of regex source strings or RegExp");
  need("TOKENS", strOrRe, "a regex source string (alternation) or RegExp");
  need("STOP", v => v instanceof Set || Array.isArray(v), "a Set or array of lowercase words");
  need("LEAD", strOrRe, "a regex source string (alternation) or RegExp");
  need("CONJ", strOrRe, "a regex source string (alternation) or RegExp");
  need("PURPOSE", strOrRe, "a regex source string or RegExp");
  need("FOR", isStr, "a string (purpose prefix, e.g. 'for ')");
  need("PRE", isStr, "a regex source string (may be empty)");
  if (rules.CAP != null && typeof rules.CAP !== "boolean") throw new Error(`registerParser("${lang}"): rules.CAP must be a boolean`);
  for (const k of ["HALF", "ONE_UNIT", "TRAIL", "TRAIL2", "NUMW", "U", "DEC"]) if (rules[k] != null && !isStr(rules[k])) throw new Error(`registerParser("${lang}"): rules.${k} must be a string`);
  const UNIT_MAP = Object.fromEntries(Object.entries(rules.UNIT_MAP).map(([k, v]) => [k.toLowerCase(), v]));
  const NW = Object.fromEntries(Object.entries(rules.NW).map(([k, v]) => [k.toLowerCase(), v]));
  const oneWords = rules.ONE_UNIT ? new Set(rules.ONE_UNIT.split("|")) : new Set();
  RULES[lang] = {
    UNIT_MAP, NW,
    U: rules.U ?? Object.keys(UNIT_MAP).sort((a, b) => b.length - a.length).map(esc).join("|"),
    NUMW: rules.NUMW ?? Object.keys(NW).filter(k => !oneWords.has(k)).map(esc).join("|"),
    PHRASES: rules.PHRASES.map(x => asRe(x, s => `${B}(?:${s})${E}`)),
    TOKENS: asRe(rules.TOKENS, s => `${B}(?:${s})${E}`),
    STOP: new Set(rules.STOP),
    LEAD: asRe(rules.LEAD, s => `^(?:${s})${E}\\s*`),
    CONJ: asRe(rules.CONJ, s => `[,;.!?]+|${B}(?:${s})${E}`),
    PURPOSE: asRe(rules.PURPOSE, s => s, "iu"),
    FOR: rules.FOR, PRE: rules.PRE,
    HALF: rules.HALF || null, ONE_UNIT: rules.ONE_UNIT || null,
    TRAIL: rules.TRAIL ? re(`\\s+(?:${rules.TRAIL})$`, "iu") : null,
    TRAIL2: rules.TRAIL2 ? re(`\\s+(?:${rules.TRAIL2})$`, "iu") : null,
    DEC: rules.DEC ?? ",", CAP: rules.CAP ?? true,
  };
}
registerParser("de", { UNIT_MAP, U, NW, NUMW, PHRASES, TOKENS, STOP, LEAD, CONJ, PURPOSE, FOR: "für ",
  PRE: "(?:(?:beim|bei\\s+der|bei\\s+dem|bei|im|in\\s+der|in\\s+dem|in|vom|von\\s+der|von\\s+dem|von|aus\\s+dem|aus\\s+der|aus|für\\s+den|für\\s+die|für)\\s+)?",
  HALF: "(?:ein\\s+)?halb(?:e|es|en)?", ONE_UNIT: "ein|eine|einen|einem", TRAIL: "auf|ein|mit|an", TRAIL2: "mehr|dazu", DEC: ",", CAP: true });
const rulesFor = lang => RULES[lang] || RULES[String(lang).split("-")[0]] || RULES.de;

const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : s);
const clean = s => s.replace(/\s+/g, " ").replace(/^[\s,.;:!?\-–]+|[\s,.;:!?\-–]+$/g, "");

function takeQty(s, R) {
  const { U, NUMW } = R;
  let m = R.HALF && s.match(re(`^${R.HALF}\\s+(${U})${E}\\s*(.*)$`, "iu"));
  if (m) return { n: 0.5, u: m[1], rest: m[2] };
  m = s.match(re(`^(${NUMD})\\s*(?:(${U})${E}\\s*)?(.*)$`, "iu"));
  if (m && (m[2] || m[3])) return { n: toNum(m[1], R), u: m[2], rest: m[3] };
  m = s.match(re(`^(${NUMW})${E}\\s*(?:(${U})${E}\\s*)?(.*)$`, "iu"));
  if (m && m[3]) return { n: toNum(m[1], R), u: m[2], rest: m[3] };
  m = R.ONE_UNIT && s.match(re(`^(${R.ONE_UNIT})\\s+(${U})${E}\\s*(.*)$`, "iu"));
  if (m && m[3]) return { n: 1, u: m[2], rest: m[3] };
  m = s.match(re(`^(.+?)\\s+(${NUMD}|${NUMW})\\s*(?:(${U})${E})?$`, "iu"));
  if (m) return { n: toNum(m[2], R), u: m[3], rest: m[1] };
  return null;
}

function parseClause(c, R) {
  const { PHRASES, TOKENS, PURPOSE, LEAD, STOP } = R;
  let s = c;
  for (const p of PHRASES) s = s.replace(p, " ");
  s = s.replace(TOKENS, " ");
  s = R.TRAIL ? clean(s).replace(R.TRAIL, "") : clean(s);
  s = clean(s);
  let purpose = null;
  const pm = PURPOSE.exec(s);
  if (pm) {
    const after = s.slice(pm.index + pm[0].length);
    const before = clean(s.slice(0, pm.index));
    let noun = clean(before ? after : after.split(/\s+/)[0] || "");
    let tail = before ? "" : clean(after.slice(noun.length));
    if (noun) { purpose = R.FOR + noun; s = clean(before + " " + tail); }
  }
  let spec = null;
  const q = takeQty(s, R);
  if (q) { spec = unitSpec(q.n, q.u, R); s = clean(q.rest); }
  let prev;
  do { prev = s; s = clean(s.replace(LEAD, "")); } while (s !== prev);
  if (R.TRAIL2) s = s.replace(R.TRAIL2, "");
  s = clean(s).replace(new RegExp(D, "g"), R.DEC);
  if (!s) return null;
  if (s.toLowerCase().split(/\s+/).every(w => STOP.has(w))) return null;
  const parts = [spec, purpose].filter(Boolean);
  return { name: R.CAP ? cap(s) : s, spec: parts.length ? parts.join(" · ").replace(new RegExp(D, "g"), R.DEC) : null };
}

// Damerau-Levenshtein (optimal string alignment) distance, early-exit above max.
function dl(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let p2 = null, p1 = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const c = [i]; let min = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(p1[j] + 1, c[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v; if (v < min) min = v;
    }
    if (min > max) return max + 1;
    p2 = p1; p1 = c;
  }
  return p1[b.length];
}
const fuzzMax = n => (n.length >= 9 ? 2 : n.length >= 5 ? 1 : 0);
// Find a span of consecutive words in t that is within edit distance of name n (speech-recognition tolerance); returns {index, length} or null.
function fuzzyFind(t, n) {
  const max = fuzzMax(n); if (!max) return null;
  const key = n.toLowerCase(), k = key.split(/\s+/).length;
  const toks = [...t.matchAll(/[\p{L}\p{N}][\p{L}\p{N}'’.-]*/gu)];
  for (let i = 0; i + k <= toks.length; i++) {
    const a = toks[i], z = toks[i + k - 1], w = t.slice(a.index, z.index + z[0].length);
    if (dl(w.toLowerCase(), key, max) <= max) return { index: a.index, length: w.length };
  }
  return null;
}

export function parseUtterance(text, stores = [], lang = "de") {
  const R = rulesFor(lang), { PRE, CONJ } = R;
  let t = String(text ?? "").replace(/(\d)[.,](\d)/g, `$1${D}$2`).replace(/\s+/g, " ").trim();
  let store = null;
  const names = (stores || []).flatMap(s => [s.name, ...(Array.isArray(s.aliases) ? s.aliases : [])].filter(n => typeof n === "string" && n).map(n => ({ n, s })));
  for (const { n, s } of names.sort((a, b) => b.n.length - a.n.length)) {
    const r = re(`${B}${PRE}${esc(n)}${E}`);
    if (r.test(t)) { store ??= s; t = t.replace(r, " "); }
    else {
      const f = fuzzyFind(t, n);
      if (f) {
        let from = f.index;
        const pm = new RegExp(`${B}${PRE}$`, "iu").exec(t.slice(0, from));
        if (PRE && pm && pm[0]) from = pm.index;
        store ??= s; t = t.slice(0, from) + " " + t.slice(f.index + f.length);
      }
    }
  }
  const items = [], seen = new Map();
  for (const c of t.split(CONJ)) {
    if (!c || !c.trim()) continue;
    const it = parseClause(c, R);
    if (!it) continue;
    const k = it.name.toLowerCase();
    if (seen.has(k)) { const o = seen.get(k); if (!o.spec && it.spec) o.spec = it.spec; continue; }
    seen.set(k, it); items.push(it);
  }
  return { items, store };
}
export default parseUtterance;
