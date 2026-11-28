import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
const P = await loadPack('en');
assert.ok(P.keywords >= 900, `keywords: ${P.keywords}`);
const stores = [
  { id: 1, name: 'Tesco', aliases: ['tesco express'] }, { id: 2, name: "Sainsbury's", aliases: ['sainsburys'] },
  { id: 3, name: 'Walmart' }, { id: 4, name: 'Target' },
];
let n = 0;
const T = (text, items, storeId = null) => {
  const r = P.parse(text, stores);
  assert.deepEqual(r.items, items, text); assert.equal(r.store?.id ?? null, storeId, `store: ${text}`); n++;
};
T('I need rubber feet for the aluminium posts and then we also need connectors for the pipes',
  [{ name: 'Rubber feet', spec: 'for aluminium posts' }, { name: 'Connectors', spec: 'for pipes' }]);
T("we're out of milk and I have to grab two litres of orange juice at Tesco",
  [{ name: 'Milk', spec: null }, { name: 'Orange juice', spec: '2 l' }], 1);
T('add 500 grams of minced beef and tomatoes', [{ name: 'Minced beef', spec: '500 g' }, { name: 'Tomatoes', spec: null }]);
T("don't forget kitchen roll", [{ name: 'Kitchen roll', spec: null }]);
T('milk, eggs and bread', [{ name: 'Milk', spec: null }, { name: 'Eggs', spec: null }, { name: 'Bread', spec: null }]);
T('please get a couple of avocados', [{ name: 'Avocados', spec: null }]);
T('buy some bananas', [{ name: 'Bananas', spec: null }]);
T('1.5 litres of milk', [{ name: 'Milk', spec: '1.5 l' }]);
T('half a litre of cream', [{ name: 'Cream', spec: '0.5 l' }]);
T('half a kilo of cheddar', [{ name: 'Cheddar', spec: '0.5 kg' }]);
T('a can of tuna', [{ name: 'Tuna', spec: '1 can' }]);
T('three cans of chopped tomatoes', [{ name: 'Chopped tomatoes', spec: '3 cans' }]);
T('two bottles of red wine', [{ name: 'Red wine', spec: '2 bottles' }]);
T('a bunch of bananas', [{ name: 'Bananas', spec: '1 bunch' }]);
T('2 rolls of tape', [{ name: 'Tape', spec: '2 rolls' }]);
T('3 m of rope', [{ name: 'Rope', spec: '3 m' }]);
T('one avocado', [{ name: 'Avocado', spec: null }]);
T('put cat food on the list', [{ name: 'Cat food', spec: null }]);
T('remember to pick up toothpaste from Sainsbury\'s', [{ name: 'Toothpaste', spec: null }], 2);
T('grab batteries at Walmart', [{ name: 'Batteries', spec: null }], 3);
T('I need dishwasher tablets and bin bags at Target', [{ name: 'Dishwasher tablets', spec: null }, { name: 'Bin bags', spec: null }], 4);
T('could you please add 6 eggs', [{ name: 'Eggs', spec: '6' }]);
T('we need cable ties for the shed, and also a curtain rod', [{ name: 'Cable ties', spec: 'for shed' }, { name: 'Curtain rod', spec: null }]);
T('um, okay, we are out of butter', [{ name: 'Butter', spec: null }]);
T('I need a lid for the pan and rubber gloves', [{ name: 'Lid', spec: 'for pan' }, { name: 'Rubber gloves', spec: null }]);
T('', []);
T('please', []);

const I = (name, icon, cat) => {
  const r = P.resolveIcon(name, null);
  assert.equal(r.icon, icon, `${name} -> ${r.icon}`); assert.equal(r.matched, true, name);
  if (cat) assert.equal(r.category, cat, `${name} category`);
  n++;
};
I('pan lid', 'lid', 'Küche & Haushaltswaren'); I('cat net', 'net', 'Tierbedarf'); I('cable trunking', 'duct'); I('cable ties', 'cable-tie');
I('bungee cords', 'bungee'); I('curtain rods', 'rod'); I('splash guard', 'splash'); I('wall plugs', 'dowel'); I('rubber feet', 'bumper');
I('connectors', 'connector'); I('pipes', 'rod'); I('netting', 'net'); I('black cable trunking', 'duct'); I('glass lid', 'lid');
I('milk', 'milk', 'Milch & Käse'); I('eggs', 'egg'); I('tomatoes', 'tomato'); I('minced beef', 'meat', 'Fleisch & Fisch');
I('orange juice', 'juice'); I('kitchen roll', 'toilet-paper', 'Haushalt'); I('toilet paper', 'toilet-paper'); I('paper towels', 'toilet-paper');
I('aubergine', 'eggplant'); I('eggplant', 'eggplant'); I('courgette', 'cucumber'); I('zucchini', 'cucumber');
I('bananas', 'banana'); I('butter', 'butter'); I('cheddar cheese', 'cheese'); I('bread', 'bread'); I('spaghetti', 'pasta');
I('olive oil', 'olive'); I('chicken breast', 'chicken'); I('salmon fillet', 'fish'); I('toothpaste', 'toothbrush');
I('dishwasher tablets', 'sponge'); I('washing powder', 'laundry'); I('bin bags', 'trash'); I('batteries', 'battery', 'Elektro & Technik');
I('light bulbs', 'bulb'); I('ice cream', 'icecream'); I('frozen pizza', 'pizza'); I('red wine', 'wine'); I('coffee beans', 'coffee');
I('tea bags', 'teapot'); I('cat food', 'cat', 'Tierbedarf'); I('potato crisps', 'popcorn'); I('nappies', 'baby-bottle', 'Baby & Kind');
I('yoghurt', 'yogurt'); I('apples', 'apple'); I('onions', 'onion'); I('garlic', 'garlic'); I('paracetamol', 'pill', 'Apotheke');
I('screwdriver', 'screwdriver'); I('sandpaper', 'tools'); I('printer paper', 'paper'); I('garden hose', 'water', 'Garten & Pflanzen');
I('dog lead', 'dog', 'Tierbedarf'); I('bike lock', 'bike', 'Auto & Velo'); I('baby wipes', 'baby-bottle', 'Baby & Kind'); I('hairbrush', 'comb');
assert.equal(P.guessCategory('unknown thing xyz', 'hardware'), 'Werkzeug & Baumarkt'); n++;
assert.equal(P.resolveIcon('xyzzy', 'Haushalt').matched, false); n++;
console.log(`all passed (${n} assertions, ${P.keywords} keywords)`);
