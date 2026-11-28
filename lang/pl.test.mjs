import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
import { parseUtterance } from '../parser.js';
import { resolveIcon, guessCategory, suggestionKeywords } from '../icons.js';
const code = 'pl';
const pack = await loadPack(code);
assert.ok(pack.keywords >= 900, `keywords ${pack.keywords}`);

const stores = [
  { id: 1, name: 'Biedronka', aliases: ['biedronki', 'biedronce', 'biedronkę'] },
  { id: 2, name: 'Lidl', aliases: ['lidla', 'lidlu', 'lidlem'] },
  { id: 3, name: 'Żabka', aliases: ['żabki', 'żabce', 'żabkę'] },
  { id: 4, name: 'Rossmann', aliases: ['rossmanna', 'rossmannie'] },
  { id: 5, name: 'Kaufland', aliases: ['kauflanda', 'kauflandzie'] },
  { id: 6, name: 'Allegro', aliases: [] },
];
const P = (t, s = stores) => parseUtterance(t, s, code);
const items = (t, s) => P(t, s).items;
const one = (t, name, spec = null, storeId) => {
  const r = P(t);
  assert.deepEqual(r.items, [{ name, spec }], t);
  if (storeId !== undefined) assert.equal(r.store?.id ?? null, storeId, t + ' store');
};

// --- the long spoken sentences
assert.deepEqual(items('potrzebuję gumowych nóżek do aluminiowych słupków, a potem potrzebujemy jeszcze złączek do rur'),
  [{ name: 'Gumowe nóżki', spec: 'do aluminiowych słupków' }, { name: 'Złączki', spec: 'do rur' }]);
let r = P('nie mamy już mleka i muszę jeszcze kupić dwa litry soku pomarańczowego w Biedronce');
assert.deepEqual(r.items, [{ name: 'Mleko', spec: null }, { name: 'Sok pomarańczowy', spec: '2 l' }]);
assert.equal(r.store.id, 1);
assert.deepEqual(items('dodaj pół kilo mięsa mielonego i pomidory'), [{ name: 'Mięso mielone', spec: '0,5 kg' }, { name: 'Pomidory', spec: null }]);
one('nie zapomnij o ręczniku papierowym', 'Ręcznik papierowy');

// --- units, decimals, number words, half
one('kup 1,5 litra mleka', 'Mleko', '1,5 l');
one('potrzebuję 3 kg ziemniaków', 'Ziemniaki', '3 kg');
one('dwie puszki kukurydzy', 'Kukurydza', '2 puszki');
one('jedna butelka wody', 'Woda', '1 butelka');
one('półtora kilo jabłek', 'Jabłka', '1,5 kg');
one('trzy bułki', 'Bułki', '3');
one('20 dag szynki', 'Szynka', '20 dag');
one('pół litra śmietany', 'Śmietana', '0,5 l');
one('500 g mąki', 'Mąka', '500 g');
one('dwanaście jajek', 'Jajka', '12');
one('3 m rury', 'Rury', '3 m');
one('proszę o dwie rolki papieru toaletowego', 'Papier toaletowy', '2 rolki');
one('wpisz na listę pomidory', 'Pomidory');
one('dodaj masło do listy zakupów', 'Masło');

// --- purpose -> spec
one('kołki do ściany', 'Kołki', 'do ściany');
one('musimy kupić rurki na barierkę', 'Rurki', 'na barierkę');
one('karma dla kota', 'Karma', 'dla kota');

// --- several items, conjunctions
assert.deepEqual(items('chleb, masło i ser'), [{ name: 'Chleb', spec: null }, { name: 'Masło', spec: null }, { name: 'Ser', spec: null }]);
assert.deepEqual(items('brakuje nam cebuli oraz marchewki'), [{ name: 'Cebula', spec: null }, { name: 'Marchewka', spec: null }]);
one('pamiętaj o gumowych nóżkach', 'Gumowe nóżki');
assert.equal(items('szampon i mydło').length, 2);
assert.deepEqual(items('mleko i mleko'), [{ name: 'Mleko', spec: null }]); // dedupe

// --- stores (exact alias, inflected alias, prefix variants, fuzzy)
one('mleko w Biedronce', 'Mleko', null, 1);
one('chleb z Biedronki', 'Chleb', null, 1);
one('kup mleko w Lidlu', 'Mleko', null, 2);
one('kup mleko we Lidlu', 'Mleko', null, 2);
one('chleb w Żabce', 'Chleb', null, 3);
one('chleb z Żabki', 'Chleb', null, 3);
one('szampon w Rossmannie', 'Szampon', null, 4);
one('papier toaletowy do Rossmanna', 'Papier toaletowy', null, 4);
one('masło w Kauflandzie', 'Masło', null, 5);
one('kable na Allegro', 'Kable', null, 6);
one('śruby z Allegro', 'Śruby', null, 6);
one('mleko Kaufland', 'Mleko', null, 5);
one('mleko', 'Mleko', null, null);
assert.equal(P('mleko w Biedronce', [{ id: 9, name: 'Biedronka' }]).store.id, 9); // fuzzy match without alias
assert.equal(P('mleko w Biedronce', [{ id: 9, name: 'Biedronka' }]).items[0].name, 'Mleko');

// --- icons: the long-tail DIY cases
const ic = n => resolveIcon(n, null, code);
const is = (n, ...icons) => assert.ok(icons.includes(ic(n).icon), `${n} -> ${ic(n).icon}, want ${icons}`);
is('pokrywka do patelni', 'lid');
is('siatka dla kota', 'net');
is('korytko kablowe', 'duct');
is('korytka kablowe', 'duct');
is('opaski zaciskowe', 'cable-tie');
is('linki elastyczne', 'rope', 'bungee');
is('gumy elastyczne', 'bungee');
is('drążek do zasłon', 'rod');
is('rury aluminiowe', 'rod');
is('złączki do rur', 'connector');
is('kołki rozporowe', 'dowel');
is('nóżki gumowe', 'bumper');
is('osłona przeciwbryzgowa', 'splash');
is('wiertarka', 'drill');
is('taśma klejąca', 'tape');
is('młotek', 'hammer');
is('śruby', 'screw');
// --- groceries, incl. inflected forms (forms() strips case endings, fleeting e)
is('mleka', 'milk'); is('pomidorów', 'tomato'); is('bananów', 'banana'); is('ogórków', 'cucumber'); is('jabłek', 'apple');
is('masła', 'butter'); is('sera żółtego', 'cheese'); is('chleb', 'bread'); is('jajek', 'egg'); is('papryki', 'pepper'); is('cebulami', 'onion');
is('ryżu', 'rice'); is('makaron', 'pasta'); is('szynki', 'ham'); is('kiełbasy', 'sausage'); is('mięso mielone', 'meat'); is('sok pomarańczowy', 'juice');
is('woda mineralna', 'water'); is('kawa', 'coffee'); is('piwo', 'beer'); is('czekolada', 'chocolate'); is('mąki', 'grain');
// --- household / non-food
is('papier toaletowy', 'toilet-paper'); is('ręcznik papierowy', 'toilet-paper'); is('proszek do prania', 'laundry'); is('worki na śmieci', 'trash');
is('szczoteczka do zębów', 'toothbrush'); is('żarówki LED', 'bulb'); is('baterie AA', 'battery'); is('karma dla kota', 'paw'); is('żwirek dla kota', 'cat');
is('zeszyt', 'notebook'); is('poduszka', 'pillow'); is('skarpetki', 'socks'); is('pieluchy', 'baby-bottle'); is('opony', 'tire');
is('gąbki do mycia', 'sponge'); is('nożyczek', 'scissors'); is('talerzy', 'plate');
// --- categories, fallback, store kinds, suggestions
assert.equal(ic('korytko kablowe').category, 'Werkzeug & Baumarkt');
assert.equal(ic('mleka').category, 'Milch & Käse');
assert.equal(ic('karma dla kota').category, 'Tierbedarf');
assert.equal(ic('Xyzqwv').matched, false);
assert.equal(guessCategory('Xyzqwv', 'sklep budowlany', code), 'Werkzeug & Baumarkt');
assert.equal(guessCategory('Xyzqwv', 'Drogeria', code), 'Körperpflege');
assert.ok(suggestionKeywords(code).length >= 900);
console.log('all passed');
