import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
const code = 'nl';
const P = await loadPack(code);
const stores = [
  { id: 1, name: 'Albert Heijn', aliases: ['ah'] }, { id: 2, name: 'Jumbo' }, { id: 3, name: 'Lidl' },
  { id: 4, name: 'Delhaize' }, { id: 5, name: 'Colruyt' }, { id: 6, name: 'Kruidvat' },
];
const t = (text, items, storeId = null) => {
  const r = P.parse(text, stores);
  assert.deepEqual(r.items, items, text);
  assert.equal(r.store?.id ?? null, storeId, `store: ${text}`);
};

// ---- parser ----
t('ik heb rubberen voetjes nodig voor de aluminium palen en dan hebben we ook koppelstukken voor de buizen nodig',
  [{ name: 'Rubberen voetjes', spec: 'voor aluminium palen' }, { name: 'Koppelstukken', spec: 'voor buizen' }]);
t('we hebben geen melk meer en ik moet nog twee liter sinaasappelsap halen bij de Albert Heijn',
  [{ name: 'Melk', spec: null }, { name: 'Sinaasappelsap', spec: '2 l' }], 1);
t('voeg 500 gram gehakt en tomaten toe', [{ name: 'Gehakt', spec: '500 g' }, { name: 'Tomaten', spec: null }]);
t('vergeet de keukenrol niet', [{ name: 'Keukenrol', spec: null }]);
t('nog een brood en confituur halen bij de Delhaize', [{ name: 'Brood', spec: null }, { name: 'Confituur', spec: null }], 4);
t('ik moet nog een halve liter room kopen', [{ name: 'Room', spec: '0,5 l' }]);
t('halve kilo kaas alsjeblieft', [{ name: 'Kaas', spec: '0,5 kg' }]);
t('1,5 liter cola bij Jumbo', [{ name: 'Cola', spec: '1,5 l' }], 2);
t('drie blikken tomaten', [{ name: 'Tomaten', spec: '3 blikken' }]);
t('een blik tomaten', [{ name: 'Tomaten', spec: '1 blik' }]);
t('een pak spaghetti van de Lidl', [{ name: 'Spaghetti', spec: '1 pak' }], 3);
t('twee bossen peterselie', [{ name: 'Peterselie', spec: '2 bossen' }]);
t('zet kaas en eieren op de lijst', [{ name: 'Kaas', spec: null }, { name: 'Eieren', spec: null }]);
t('denk aan wc-papier', [{ name: 'Wc-papier', spec: null }]);
t('ik moet nog een rol keukenpapier meenemen van de Kruidvat', [{ name: 'Keukenpapier', spec: '1 rol' }], 6);
t('koffie en suiker bij Colruyt', [{ name: 'Koffie', spec: null }, { name: 'Suiker', spec: null }], 5);
t('de melk is op', [{ name: 'Melk', spec: null }]);
t('ik wil graag een kilo bananen', [{ name: 'Bananen', spec: '1 kg' }]);
t('twaalf eieren', [{ name: 'Eieren', spec: '12' }]);
t('2,5 kg aardappelen voor de stamppot', [{ name: 'Aardappelen', spec: '2,5 kg · voor stamppot' }]);
t('wat melk en een paar appels halen bij de ah', [{ name: 'Melk', spec: null }, { name: 'Appels', spec: null }], 1);
t('we moeten ook nog 3 flessen water kopen in de Jumbo', [{ name: 'Water', spec: '3 flessen' }], 2);
t('ik heb kabelbinders nodig voor de kabels, en dan ook een zak potgrond', [{ name: 'Kabelbinders', spec: 'voor kabels' }, { name: 'Potgrond', spec: '1 zak' }]);
t('', []);

// ---- icons ----
assert.ok(P.keywords >= 900, `keywords ${P.keywords}`);
const ic = (name, icon, cat) => {
  const r = P.resolveIcon(name, null);
  assert.equal(r.icon, icon, `${name} -> ${r.icon}`);
  assert.equal(r.matched, true, name);
  if (cat) assert.equal(r.category, cat, `${name} category ${r.category}`);
};
ic('pannendeksel', 'lid', 'Küche & Haushaltswaren');
ic('kattennet', 'net', 'Tierbedarf');
ic('kabelgoot', 'duct');
ic('kabelbinders', 'cable-tie');
ic('snelbinders', 'bungee');
ic('gordijnroede', 'rod');
ic('deksels', 'lid');
ic('spatschermen', 'splash');
ic('netten', 'net');
ic('koppelstukken', 'connector');
ic('buizen', 'rod');
ic('aluminium palen', 'rod');
ic('pluggen', 'dowel');
ic('rubberen voetjes', 'bumper');
ic('spanbanden', 'bungee');
ic('kabelgoten', 'duct');
ic('melk', 'milk', 'Milch & Käse');
ic('brood', 'bread', 'Brot & Gebäck');
ic('kaas', 'cheese');
ic('appels', 'apple', 'Früchte & Gemüse');
ic('tomaten', 'tomato');
ic('gehakt', 'meat', 'Fleisch & Fisch');
ic('kip', 'chicken');
ic('sinaasappelsap', 'juice', 'Getränke');
ic('koffie', 'coffee');
ic('bier', 'beer');
ic('wijn', 'wine');
ic('spaghetti', 'pasta', 'Vorräte');
ic('rijst', 'rice');
ic('confituur', 'strawberry', 'Vorräte');
ic('frigo', 'ice');
ic('GSM', 'phone', 'Elektro & Technik');
ic('keukenrol', 'toilet-paper', 'Haushalt');
ic('wasmiddel', 'laundry');
ic('tandpasta', 'toothbrush', 'Körperpflege');
ic('pleisters', 'bandage', 'Apotheke');
ic('hondenvoer', 'dog', 'Tierbedarf');
ic('kattenbakvulling', 'cat', 'Tierbedarf');
ic('kabels', 'plug');
ic('batterijen', 'battery');
ic('stopcontact', 'outlet');
ic('schroeven', 'screw', 'Werkzeug & Baumarkt');
ic('hamer', 'hammer');
ic('tuinslang', 'water');
ic('bloempot', 'vase');
ic('kussen', 'pillow', 'Wohnen & Deko');
ic('sokken', 'socks', 'Kleidung & Textil');
ic('luiers', 'baby-bottle', 'Baby & Kind');
ic('fietsband', 'bike', 'Auto & Velo');
ic('kopieerpapier', 'paper', 'Papeterie & Büro');
ic('bakpapier', 'paper');
ic('palen', 'rod');
ic('worteltjes', 'carrot');
ic('eieren', 'egg');
ic('citroenen', 'lemon');
ic('kattenvoer', 'cat');
ic('knoflook', 'garlic');
ic('wortels', 'carrot');
// category via store kind and unknown words
assert.equal(P.guessCategory('xyzzy', 'beenhouwer'), 'Fleisch & Fisch');
assert.equal(P.guessCategory('xyzzy', 'bouwmarkt'), 'Werkzeug & Baumarkt');
assert.equal(P.guessCategory('kabelgoot', ''), 'Elektro & Technik');
assert.equal(P.resolveIcon('xyzzyplonk', 'Haushalt').matched, false);
console.log('all passed', P.keywords, 'keywords');
