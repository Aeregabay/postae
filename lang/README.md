# Language packs

German is built into `parser.js` and `icons.js`. Every other language is one file `lang/<code>.js` (`<code>` = lowercase ISO 639-1, e.g. `fr`, `en`, `it`, `pl`) with a default export:

```js
export default { parser: { /* rules for parseUtterance */ }, icons: { /* pack for resolveIcon */ } };
```

Register it by importing it in `lang/index.js` (`PACKS = { fr }`); the app calls `registerAll()`. Unknown language codes fall back to German. `fr-CH` resolves to `fr` if only `fr` is registered.

## 1. `parser` (passed to `registerParser(code, rules)`)

`parseUtterance(text, stores, code)` -> `{ items: [{name, spec}], store }`. Pipeline: protect decimals, strip store (`PRE` + name/alias) -> split into clauses on `CONJ` -> per clause: remove `PHRASES`, `TOKENS`, trailing `TRAIL` -> extract purpose (`PURPOSE`) -> extract quantity/unit (`HALF`, numerals, `UNIT_MAP`, `ONE_UNIT`) -> strip leading `LEAD` articles -> strip `TRAIL2` -> drop if only `STOP` words remain -> capitalise (`CAP`).

All regex fields may be a `RegExp` (used as-is, flags `giu` assumed; no look-behind needed) or a source string. For fields marked *alternation*, give a string like `"a|b|c"` and the engine wraps it with Unicode word boundaries (`(?<![\p{L}\p{N}])(?:...)(?![\p{L}\p{N}])`). Matching is case-insensitive. Write all lists lowercase. Longer alternatives first.

| Field | Type | Meaning | German reference |
|---|---|---|---|
| `UNIT_MAP` | `{word: [singular, plural?]}` | spoken unit -> output unit. Plural form is used when n != 1. Keys lowercase, incl. plurals and abbreviations. | `kilo: ["kg"], dose: ["Dose","Dosen"], "stück": ["Stk"], liter: ["l"]` |
| `U` | string, optional | alternation of unit words; default = keys of `UNIT_MAP` sorted longest first | derived |
| `NW` | `{word: number}` | number words -> value (also articles that mean one) | `eins:1, ein:1, zwei:2 ... zwölf:12` |
| `NUMW` | string, optional | alternation of number words that count as a quantity on their own; default = `NW` keys minus `ONE_UNIT` words | `eins\|zwei\|drei...` |
| `PHRASES` | array of alternation strings/RegExp | multi-word filler/intent phrases removed first | `"nicht\s+vergessen"`, `"(?:auf\|in)\s+(?:der\s+)?liste"` |
| `TOKENS` | alternation | single filler words removed anywhere (pronouns, modal/intent verbs, politeness, hesitations) | `ich\|wir\|brauche\|möchte\|bitte\|ähm...` |
| `STOP` | Set/array | words that alone do not make an item; clause with only these is dropped | `ein eine der die das und oder mit für ...` |
| `LEAD` | alternation | leading articles/determiners/partitives stripped from the item name (applied repeatedly, after quantity) | `ein\s+paar\|ein\|eine\|der\|die\|das\|von\s+(?:der\|dem)...` |
| `CONJ` | alternation | clause separators in addition to `, ; . ! ?` | `und\s+dann\|und\|dann\|sowie\|ausserdem\|plus` |
| `PURPOSE` | regex | introduces a purpose ("for the shelf"); the following noun (skipping an article/prepositions) becomes `spec` | `(?:für\|fürs\|zum\|zur)\s+(?:(?:auf\|in)\s+)?(?:(?:die\|den\|das\|dem\|der)\s+)?` |
| `FOR` | string | prefix put before the purpose noun in `spec` (with trailing space) | `"für "` |
| `PRE` | regex source (may be `""`) | optional preposition(s) swallowed in front of a store name | `(?:(?:beim\|bei\s+der\|bei\|im\|in\s+der\|vom\|von\|aus\|für)\s+)?` |
| `HALF` | string or null | alternation for "half (a)" before a unit -> 0.5 | `(?:ein\s+)?halb(?:e\|es\|en)?` |
| `ONE_UNIT` | alternation string or null | "one" forms that count as quantity 1 only when directly followed by a unit (so "eine Packung" -> 1 Pack but "eine Gurke" stays) | `ein\|eine\|einen\|einem` |
| `TRAIL` | alternation or null | stray trailing particle after fillers removed (separable verb prefixes etc.) | `auf\|ein\|mit\|an` |
| `TRAIL2` | alternation or null | stray trailing words after quantity/articles removed | `mehr\|dazu` |
| `DEC` | string | decimal separator in output spec | `","` (English: `"."`) |
| `CAP` | boolean, default `true` | capitalise first letter of item name (`false` for languages that write common nouns lowercase, e.g. French, Italian, Polish, English if desired) | `true` |

Quantity forms recognised: `HALF unit rest`, `12 [unit] rest`, `numberword [unit] rest`, `ONE_UNIT unit rest`, `rest 12 [unit]` / `rest numberword [unit]` (trailing).
Stores: `stores = [{id, name, aliases?: ["lowercase", ...]}]`. Names and aliases are matched exactly (with `PRE` prefix) and then fuzzily (Damerau-Levenshtein <= 1 for >= 5 chars, <= 2 for >= 9 chars). Nothing to configure in the pack.

Example skeleton (English, abbreviated):
```js
parser: { UNIT_MAP: { kilo: ['kg'], kilos: ['kg'], litre: ['l'], litres: ['l'], can: ['can','cans'] }, NW: { one:1, a:1, an:1, two:2, three:3 },
  PHRASES: ['(?:on|to)\\s+(?:the\\s+)?(?:shopping\\s+)?list', "don't\\s+forget(?:\\s+to)?"], TOKENS: 'i|we|need|want|please|get|buy|some|also|just',
  STOP: ['a','an','the','of','and','or','some'], LEAD: 'a|an|the|some|of', CONJ: 'and\\s+then|and|then|plus|also',
  PURPOSE: '\\b(?:for)\\s+(?:the\\s+)?', FOR: 'for ', PRE: '(?:(?:at|from|in)\\s+)?', HALF: 'half(?:\\s+an?)?', ONE_UNIT: 'a|an|one', DEC: '.', CAP: true }
```

## 2. `icons` (passed to `registerIcons(code, pack)`; returns number of keywords)

```js
icons: {
  DATA:  [[categoryId, ":iconKey word word :iconKey2 word ..."], ...],  // required
  HEAD:  'suffix' | 'last' | 'first',                                   // default 'suffix'
  SPLIT: /^(for|with|of|and|&)$/i,                                      // required: function words splitting multi-word names
  MODS:  [[/^(cat|dog)/, 'Tierbedarf'], ...],                           // optional: modifier -> category override
  STORE: { hardware: 'Werkzeug & Baumarkt', ... },                      // optional: store kind (lowercase) -> category
  forms: word => [singular/stem variants],                              // optional; defaults per HEAD
  normalize: s => s                                                     // optional; default: lowercase, strip diacritics, keep letters/digits only
}
```

- `DATA` string format = German `DATA` in `icons.js`: a `:key` token sets the icon for all following words until the next `:key`; words are lowercase single tokens (no spaces; use `-` or a compound). Icon defaults to the category icon before the first `:key`. First definition of a word wins, so put specific entries (`pan lid`-type heads) before general ones. List singular AND the important plural/irregular forms; `forms` handles regular endings.
- `HEAD`: `'suffix'` German/Dutch-style compounds: whole word, then longest keyword suffix inside a word (`Pfannendeckel` -> deckel), then prefix/infix; words left to right; words after a `SPLIT` word are ignored. `'last'` English head-final: the last word decides (`pan lid` -> lid), words tried right to left, suffix matching inside single words (`toothbrush` -> brush); the words after a `SPLIT` word are a last resort. `'first'` Romance/Polish head-initial: first content word before a `SPLIT` word wins (`couvercle de casserole` -> couvercle), then the other words, then words after the split.
- With `'last'`/`'first'`, a `MODS` match on a non-head word (`cat net`) overrides the category but not the icon.
- `forms`: return stems to try in addition to the word itself (e.g. English `s`/`es`/`ies`, French `s`/`x`/`aux`). Receives the normalised word.
- `normalize`: applied to both keywords and input; use for language-specific folding (e.g. Polish `ł`->`l`, which the default already does).
- Validation on register throws `registerIcons("<code>"): ...` for unknown category, unknown icon key, bad `HEAD`, non-RegExp `SPLIT`/`MODS`.
- Lookups with a code that has a pack never fall back to German; only codes without a pack do.

### Valid category ids (exact strings; also the German display names)
- `Früchte & Gemüse`
- `Brot & Gebäck`
- `Milch & Käse`
- `Fleisch & Fisch`
- `Vorräte`
- `Tiefkühl`
- `Getränke`
- `Snacks & Süsses`
- `Haushalt`
- `Körperpflege`
- `Apotheke`
- `Küche & Haushaltswaren`
- `Werkzeug & Baumarkt`
- `Elektro & Technik`
- `Papeterie & Büro`
- `Wohnen & Deko`
- `Garten & Pflanzen`
- `Tierbedarf`
- `Kleidung & Textil`
- `Baby & Kind`
- `Sport & Freizeit`
- `Auto & Velo`
- `Sonstiges`

### Valid icon keys (257)
`apple` `avocado` `baby` `baby-bottle` `backpack` `bacon` `bag` `bagel` `baguette` `balloon` `banana` `bandage` `barbell` `bath` `battery` `beans` `bed` `beer` `berries` `bike` `bird` `blender` `books` `bottle` `bowl` `bread` `bricks` `broccoli` `broom` `bubble-tea` `bucket` `bug` `bulb` `bumper` `bungee` `butter` `cable-tie` `cake` `calendar` `camera` `can` `candle` `candy` `cap` `car` `carrot` `cart` `casserole` `cat` `chain` `chair` `charger` `cheese` `cherry` `chicken` `chili` `chocolate` `clock` `cocktail` `coffee` `comb` `connector` `cookie` `corn` `cracker` `crayon` `croissant` `cucumber` `cupcake` `cutlery` `dice` `dog` `donut` `dowel` `dress` `drill` `duct` `dumpling` `egg` `eggplant` `fan` `faucet` `fir` `fish` `fishing` `flame` `flashlight` `flatbread` `flower` `foil` `folder` `frame` `fries` `funnel` `garden-house` `garlic` `gift` `ginger` `gloves` `grain` `grapes` `guitar` `ham` `hammer` `headphones` `herbs` `hiking` `honey` `hook` `ice` `icecream` `id` `jacket` `jar` `juice` `kid` `kiwi` `knife` `label` `ladder` `lantern` `laptop` `laundry` `legumes` `lemon` `lettuce` `lid` `lipstick` `lock` `lollipop` `magnet` `mail` `mango` `mask` `meat` `melon` `milk` `mosquito` `mountain` `mouse` `mousetrap` `mushroom` `nail` `nail-polish` `needle` `net` `news` `notebook` `nuts` `olive` `onion` `orange` `outlet` `oyster` `package` `palette` `pan` `pancakes` `paper` `paperclip` `parking` `pasta` `paw` `peach` `pear` `pen` `pepper` `phone` `pie` `pill` `pillow` `pineapple` `pizza` `plate` `plug` `popcorn` `pot` `potato` `pretzel` `printer` `pudding` `razor` `rice` `rod` `rodent` `rope` `rose` `router` `rug` `ruler` `run` `salt` `sandwich` `sausage` `saw` `scissors` `scooter` `screw` `screwdriver` `shirt` `shoe` `shovel` `shrimp` `ski` `snail` `soap` `soccer` `socks` `soda` `sofa` `sparkling` `speaker` `splash` `sponge` `spoon` `spirits` `sprout` `stapler` `strawberry` `sunflower` `sunglasses` `sweet-potato` `swim` `swimwear` `tape` `tape-measure` `tea` `teapot` `teddy` `tennis` `tent` `test-tube` `thermometer` `thread` `tire` `tissue` `toilet-paper` `tomato` `toolbox` `tools` `toothbrush` `trash` `tree` `trousers` `tv` `underwear` `vase` `volleyball` `watch` `water` `watermelon` `window` `wine` `wood` `wrench` `xmas-tree` `yogurt`

(The full set is `Object.keys(ICON_SVGS)` from `icon-svgs.js`; `EMOJI_OF` in `icons.js` adds emoji-only keys that render without an SVG, avoid them.)

## 3. Testing

Create `lang/<code>.test.mjs` and run `node lang/<code>.test.mjs`:

```js
import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
import { parseUtterance } from '../parser.js';
import { resolveIcon } from '../icons.js';
const code = 'fr';
await loadPack(code);   // imports ./fr.js, registerParser + registerIcons (throws on invalid pack)
const stores = [{ id: 1, name: 'Migros', aliases: ['migro'] }];
const r = parseUtterance('il me faut deux litres de lait chez Migros', stores, code);
assert.deepEqual(r.items, [{ name: 'lait', spec: '2 l' }]); assert.equal(r.store.id, 1);
assert.equal(resolveIcon('couvercle de casserole', null, code).icon, 'lid');
console.log('all passed');
```

`loadPack` also returns bound helpers (`parse`, `resolveIcon`, `matchKeyword`, `guessCategory`, `suggestionKeywords`). Cover per language: units incl. plural/decimal, number words, half, article stripping, purpose phrase, multiple items with conjunctions, store with and without preposition, 30+ real item names across all categories, one compound/multi-word name per `HEAD` rule. Existing German tests (`node parser.test.mjs; node icons.test.mjs; node icons.pack.test.mjs`) must stay green.
