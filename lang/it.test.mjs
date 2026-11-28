import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
const { parse, resolveIcon, guessCategory, keywords } = await loadPack('it');
assert.ok(keywords >= 900, `keywords ${keywords}`);
const stores = [{ id: 1, name: 'Coop' }, { id: 2, name: 'Esselunga' }, { id: 3, name: 'Conad' }, { id: 4, name: 'Migros', aliases: ['migro'] }, { id: 5, name: 'Lidl' }];
const P = (t, items, store = null) => { const r = parse(t, stores); assert.deepEqual(r.items, items, t); assert.equal(r.store?.id ?? null, store, t); };
const I = (n, spec = null) => ({ name: n, spec });

// parser: spoken sentences
P('mi servono piedini in gomma per i pali di alluminio e poi ci servono anche raccordi per i tubi', [I('Piedini in gomma', 'per pali di alluminio'), I('Raccordi', 'per tubi')]);
P("non abbiamo più latte e devo prendere due litri di succo d'arancia alla Coop", [I('Latte'), I("Succo d'arancia", '2 l')], 1);
P('aggiungi 500 grammi di carne macinata e pomodori', [I('Carne macinata', '500 g'), I('Pomodori')]);
P('non dimenticare la carta da cucina', [I('Carta da cucina')]);
// units, plural, decimals, half, number words
P('ho bisogno di 2,5 kg di patate', [I('Patate', '2,5 kg')]);
P('mezzo chilo di farina', [I('Farina', '0,5 kg')]);
P('mezza dozzina di uova', [I('Uova', '0,5 dozzine')]);
P('una bottiglia di olio d\'oliva e tre rotoli di carta igienica', [I("Olio d'oliva", '1 bottiglia'), I('Carta igienica', '3 rotoli')]);
P('dobbiamo comprare quattro lattine di birra', [I('Birra', '4 lattine')]);
P('prendere un mazzo di prezzemolo', [I('Prezzemolo', '1 mazzo')]);
P('6 pz di uova', [I('Uova', '6 pz')]);
P('3 conf di yogurt', [I('Yogurt', '3 conf.')]);
P('2 l di latte', [I('Latte', '2 l')]);
P('dieci metri di corda', [I('Corda', '10 m')]);
P('vorrei 250 ml di panna', [I('Panna', '250 ml')]);
// articles / partitives / fillers
P('ci serve un po\' di zucchero', [I('Zucchero')]);
P('devo prendere del pane e dei pomodori', [I('Pane'), I('Pomodori')]);
P("ricordati di comprare dell'aceto per favore", [I('Aceto')]);
P('metti in lista uova e burro', [I('Uova'), I('Burro')]);
P('il latte è finito, ci servono anche le banane', [I('Latte'), I('Banane')]);
P('mi serve ancora del sapone e poi anche lo shampoo', [I('Sapone'), I('Shampoo')]);
// purpose
P('abbiamo bisogno di tasselli per il muro', [I('Tasselli', 'per muro')]);
P("ci servono viti per l'armadio", [I('Viti', 'per armadio')]);
// stores
P('compra due litri di latte alla Coop', [I('Latte', '2 l')], 1);
P("devo prendere il pane all'Esselunga", [I('Pane')], 2);
P('aggiungi pasta e riso da Conad', [I('Pasta'), I('Riso')], 3);
P('prendere un chilo di mele dalla Migros', [I('Mele', '1 kg')], 4);
P('dal Lidl servono due confezioni di biscotti', [I('Biscotti', '2 conf.')], 5);
P('mi servono carote in Coop', [I('Carote')], 1);
P('devo prendere il caffè', [I('Caffè')]);

// icons
const want = {
  'coperchio della padella': ['lid'], 'rete per gatti': ['net'], 'canalina passacavi': ['duct'], 'fascette': ['cable-tie'],
  'elastici con ganci': ['rope', 'bungee'], 'bastone per tende': ['rod'], 'paraschizzi': ['splash'], 'raccordi': ['connector'], 'piedini in gomma': ['bumper'], 'tasselli': ['dowel'],
  'mele': ['apple'], 'banane': ['banana'], 'arance': ['orange'], 'pesche': ['peach'], 'pomodori': ['tomato'], 'carote': ['carrot'], 'patate': ['potato'], 'limoni': ['lemon'], 'funghi': ['mushroom'], 'cipolle': ['onion'],
  'latte': ['milk'], 'burro': ['butter'], 'formaggio': ['cheese'], 'uova': ['egg'], 'yogurt': ['yogurt'], 'pane': ['bread'], 'cornetto': ['croissant'],
  'pollo': ['chicken'], 'carne macinata': ['meat'], 'prosciutto': ['ham'], 'salmone': ['fish'], 'gamberi': ['shrimp'],
  'spaghetti': ['pasta'], 'riso': ['rice'], 'olio extravergine': ['olive'], 'sale': ['salt'], 'miele': ['honey'], 'noci': ['nuts'], 'lenticchie': ['legumes'],
  'acqua': ['water'], "succo d'arancia": ['juice'], 'caffè': ['coffee'], 'birra': ['beer'], 'vino rosso': ['wine'], 'cioccolato': ['chocolate'], 'caramelle': ['candy'], 'pizza': ['pizza'], 'gelato': ['icecream'],
  'carta igienica': ['toilet-paper'], 'spugna': ['sponge'], 'detersivo': ['bottle', 'laundry'], 'sacchi della spazzatura': ['trash'], 'scopa': ['broom'], 'pellicola': ['foil'],
  'spazzolino': ['toothbrush'], 'shampoo': ['bottle'], 'rasoio': ['razor'], 'cerotti': ['bandage'], 'termometro': ['thermometer'],
  'padella': ['pan'], 'pentola': ['pot'], 'coltello': ['knife'], 'forchetta': ['cutlery'], 'cucchiaino': ['spoon'], 'frullatore': ['blender'],
  'viti': ['screw'], 'chiodi': ['nail'], 'martello': ['hammer'], 'cacciavite': ['screwdriver'], 'trapano': ['drill'], 'nastro adesivo': ['tape'], 'metro': ['tape-measure'], 'scala': ['ladder'], 'corda': ['rope'],
  'batterie': ['battery'], 'lampadina': ['bulb'], 'caricabatterie': ['charger'], 'cuffie': ['headphones'], 'prolunga': ['plug'],
  'penna': ['pen'], 'quaderno': ['notebook'], 'forbici': ['scissors'], 'graffette': ['paperclip'],
  'divano': ['sofa'], 'cuscino': ['pillow'], 'tenda': ['window'], 'tappeto': ['rug'], 'vaso': ['vase'], 'candela': ['candle'],
  'terriccio': ['herbs'], 'pala': ['shovel'], 'annaffiatoio': ['water'], 'rose': ['rose'],
  'cibo per gatti': ['cat'], 'guinzaglio': ['dog'], 'maglietta': ['shirt'], 'calzini': ['socks'], 'scarpe': ['shoe'], 'giacca': ['jacket'], 'zaino': ['backpack'],
  'pannolini': ['baby'], 'biberon': ['baby-bottle'], 'peluche': ['teddy'], 'pallone': ['soccer'], 'tenda da campeggio': ['tent'], 'bicicletta': ['bike'], 'pneumatici': ['tire'], 'monopattino': ['scooter'],
};
let n = 0;
for (const [name, keys] of Object.entries(want)) { const r = resolveIcon(name); n++; assert.ok(r.matched && keys.includes(r.icon), `${name} -> ${r.icon}, want ${keys}`); }
assert.ok(n >= 40);
const cat = x => resolveIcon(x).category;
assert.equal(cat('coperchio della padella'), 'Küche & Haushaltswaren');
assert.equal(cat('canalina passacavi'), 'Elektro & Technik');
assert.equal(cat('fascette'), 'Werkzeug & Baumarkt');
assert.equal(cat('cibo per gatti'), 'Tierbedarf');
assert.equal(cat('latte'), 'Milch & Käse');
assert.equal(cat('cerotti'), 'Apotheke');
assert.equal(guessCategory('xyzqw', 'ferramenta'), 'Werkzeug & Baumarkt');
assert.equal(guessCategory('xyzqw', 'farmacia'), 'Apotheke');
assert.equal(resolveIcon('xyzqwv').matched, false);
console.log('all passed');
