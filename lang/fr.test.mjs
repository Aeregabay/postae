import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';

const code = 'fr';
const P = await loadPack(code);
assert.ok(P.keywords >= 900, `keywords: ${P.keywords}`);

const stores = [
  { id: 1, name: 'Migros', aliases: ['migro'] }, { id: 2, name: 'Coop' }, { id: 3, name: 'Carrefour' },
  { id: 4, name: 'Leclerc', aliases: ['e.leclerc'] }, { id: 5, name: 'Delhaize' },
];
const f = t => { const r = P.parse(t, stores); return { i: r.items.map(x => (x.spec ? `${x.name}|${x.spec}` : x.name)), s: r.store?.name ?? null }; };
const eq = (t, i, s = null) => assert.deepEqual(f(t), { i, s }, t);

// ---- parser
eq("j'ai besoin de patins en caoutchouc pour les poteaux en alu et ensuite il nous faut aussi des raccords pour les tuyaux",
  ["Patins en caoutchouc|pour poteaux en alu", "Raccords|pour tuyaux"]);
eq("on n'a plus de lait et je dois encore prendre deux litres de jus d'orange à la Migros", ["Lait", "Jus d'orange|2 l"], "Migros");
eq("ajoute 500 grammes de viande hachée et des tomates", ["Viande hachée|500 g", "Tomates"]);
eq("n'oublie pas le papier ménage", ["Papier ménage"]);
eq("il faut acheter du pain chez Coop", ["Pain"], "Coop");
eq("mets du beurre sur la liste", ["Beurre"]);
eq("ajoute des pommes à la liste de courses", ["Pommes"]);
eq("pense à acheter de la farine", ["Farine"]);
eq("on a besoin d'huile d'olive", ["Huile d'olive"]);
eq("j'ai besoin de deux bouteilles de vin au Carrefour", ["Vin|2 bouteilles"], "Carrefour");
eq("une bouteille de lait, un paquet de pâtes et quelques tomates", ["Lait|1 bouteille", "Pâtes|1 paquet", "Tomates"]);
eq("un kilo de pommes de terre", ["Pommes de terre|1 kg"]);
eq("il me faut un demi-litre de crème et 1,5 kg de farine", ["Crème|0,5 l", "Farine|1,5 kg"]);
eq("du lait 2 litres, des oeufs 10", ["Lait|2 l", "Oeufs|10"]);
eq("il ne reste plus de café, il faudrait aussi du sucre", ["Café", "Sucre"]);
eq("le papier toilette est fini, s'il te plaît", ["Papier toilette"]);
eq("je voudrais trois boîtes de thon chez Leclerc", ["Thon|3 boîtes"], "Leclerc");
eq("achète du fromage à la Delhaize et du jambon", ["Fromage", "Jambon"], "Delhaize");
eq("il faut des vis pour l'étagère", ["Vis|pour étagère"]);
eq("une boîte à outils", ["Boîte à outils"]);
eq("rappelle-moi d'acheter 6 oeufs", ["Oeufs|6"]);
eq("deux douzaines d'oeufs", ["Oeufs|2 douzaines"]);
eq("des colliers de serrage pour les câbles, s'il vous plaît", ["Colliers de serrage|pour câbles"]);
eq("il faut acheter 3 rouleaux de papier ménage et du liquide vaisselle", ["Papier ménage|3 rouleaux", "Liquide vaisselle"]);
eq("pommes, bananes et ensuite des carottes à l'Coop", ["Pommes", "Bananes", "Carottes"], "Coop");
eq("500 g de beurre", ["Beurre|500 g"]);
eq("de l'huile et du sel", ["Huile", "Sel"]);
assert.equal(P.parse("hello", stores).store, null);

// ---- icons: head-initial rule and required cases
const ic = (n, icon, cat) => { const r = P.resolveIcon(n, null); assert.equal(r.matched, true, n); assert.equal(r.icon, icon, n); if (cat) assert.equal(r.category, cat, n); };
ic('couvercle de poêle', 'lid');
ic('couvercle de casserole', 'lid');
ic('couvercle anti-éclaboussures', 'splash');
ic('filet pour chat', 'net');
ic('goulotte électrique', 'duct', 'Elektro & Technik');
ic('colliers de serrage', 'cable-tie');
ic('tendeurs', 'bungee');
ic('sandows', 'bungee');
ic('tringle à rideau', 'rod');
ic('patins en caoutchouc', 'bumper');
ic('raccords', 'connector');
ic('chevilles', 'dowel');
ic('tuyaux', 'duct');
ic('pommes de terre', 'potato');
ic('lait', 'milk', 'Milch & Käse');
ic('jus d\'orange', 'juice');
ic('viande hachée', 'meat');
ic('tomates', 'tomato');
ic('papier toilette', 'toilet-paper');
ic('papier de toilette', 'toilet-paper');
ic('papier ménage', 'toilet-paper');
ic('sopalin', 'toilet-paper');
ic('brosse à dents', 'toothbrush');
ic('sacs poubelle', 'trash');
ic('cornet', 'bag');
ic('panosse', 'broom');
ic('serpillière', 'broom');
ic('linge de bain', 'bath');
ic('oeufs', 'egg');
ic('œufs', 'egg');
ic('baguette', 'baguette');
ic('croissants', 'croissant');
ic('fromage râpé', 'cheese');
ic('yaourt nature', 'yogurt');
ic('poulet', 'chicken');
ic('saumon', 'fish');
ic('spaghetti', 'pasta');
ic('riz basmati', 'rice');
ic('huile d\'olive', 'olive');
ic('eau minérale', 'water');
ic('café', 'coffee');
ic('vin rouge', 'wine');
ic('chocolat', 'chocolate');
ic('dentifrice', 'toothbrush', 'Körperpflege');
ic('shampooing', 'bottle', 'Körperpflege');
ic('ibuprofène', 'pill', 'Apotheke');
ic('pansements', 'bandage', 'Apotheke');
ic('poêle', 'pan');
ic('casserole', 'pot');
ic('tournevis', 'screwdriver', 'Werkzeug & Baumarkt');
ic('marteau', 'hammer');
ic('piles AA', 'battery');
ic('ampoule', 'bulb');
ic('multiprise', 'outlet');
ic('rallonge', 'plug');
ic('cahier', 'notebook', 'Papeterie & Büro');
ic('stylos', 'pen');
ic('croquettes pour chat', 'paw', 'Tierbedarf');
ic('litière', 'cat', 'Tierbedarf');
ic('terreau', 'herbs', 'Garten & Pflanzen');
ic('chaussettes', 'socks', 'Kleidung & Textil');
ic('couches', 'baby-bottle', 'Baby & Kind');
ic('ballon de foot', 'soccer');
ic('chambre à air', 'bike', 'Auto & Velo');
ic('lessive', 'laundry', 'Haushalt');
ic('boîte à outils', 'toolbox');
ic('boîte de conserve', 'can');
ic('lampe de poche', 'flashlight');
ic('pot de fleurs', 'vase');
ic('filet de poulet', 'chicken');
ic('liquide vaisselle', 'bottle');

// category override by modifier + head-initial multiword
assert.equal(P.resolveIcon('filet chat', null).category, 'Tierbedarf');
assert.equal(P.resolveIcon('filet chat', null).icon, 'net');
assert.equal(P.guessCategory('pneu vélo', null), 'Auto & Velo');
assert.equal(P.guessCategory('zzzz', 'quincaillerie'), 'Werkzeug & Baumarkt');
assert.equal(P.resolveIcon('truc inconnu', 'Haushalt').matched, false);
assert.ok(P.suggestionKeywords().length >= 900);
console.log('all passed');
