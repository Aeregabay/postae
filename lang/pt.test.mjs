import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
const code = 'pt';
const P = await loadPack(code);
const stores = [
  { id: 1, name: 'Continente' }, { id: 2, name: 'Pingo Doce' }, { id: 3, name: 'Lidl' },
  { id: 4, name: 'Auchan' }, { id: 5, name: 'Worten' }, { id: 6, name: 'Leroy Merlin' },
];
const t = (txt, items, storeId = null) => {
  const r = P.parse(txt, stores);
  assert.deepEqual(r.items, items, txt);
  assert.equal(r.store?.id ?? null, storeId, `store: ${txt}`);
};
assert.ok(P.keywords >= 900, `keywords ${P.keywords}`);

// ---- parser ----
t('preciso de pés de borracha para os postes de alumínio e depois também precisamos de uniões para os tubos',
  [{ name: 'Pés de borracha', spec: 'para postes de alumínio' }, { name: 'Uniões', spec: 'para tubos' }]);
t('já não temos leite e tenho de comprar dois litros de sumo de laranja no Continente',
  [{ name: 'Leite', spec: null }, { name: 'Sumo de laranja', spec: '2 l' }], 1);
t('adiciona 500 gramas de carne picada e tomates', [{ name: 'Carne picada', spec: '500 g' }, { name: 'Tomates', spec: null }]);
t('não te esqueças do rolo de cozinha', [{ name: 'Rolo de cozinha', spec: null }]);
t('meio litro de leite no Pingo Doce', [{ name: 'Leite', spec: '0,5 l' }], 2);
t('uma dúzia de ovos', [{ name: 'Ovos', spec: '1 dúzia' }]);
t('preciso de 1,5 kg de batatas', [{ name: 'Batatas', spec: '1,5 kg' }]);
t('quero duas latas de atum no Lidl', [{ name: 'Atum', spec: '2 latas' }], 3);
t('compra uma lata de tomate pelado', [{ name: 'Tomate pelado', spec: '1 lata' }]);
t('tenho que comprar três garrafas de água na Auchan', [{ name: 'Água', spec: '3 garrafas' }], 4);
t('precisamos de um pacote de arroz, massa e azeite', [{ name: 'Arroz', spec: '1 pacote' }, { name: 'Massa', spec: null }, { name: 'Azeite', spec: null }]);
t('põe na lista bananas e maçãs', [{ name: 'Bananas', spec: null }, { name: 'Maçãs', spec: null }]);
t('lembra-te de comprar pilhas no Worten', [{ name: 'Pilhas', spec: null }], 5);
t('por favor traz um pouco de manteiga', [{ name: 'Manteiga', spec: null }]);
t('temos de comprar uns tomates e umas cebolas', [{ name: 'Tomates', spec: null }, { name: 'Cebolas', spec: null }]);
t('acabou o café e também precisamos de dois rolos de papel higiénico', [{ name: 'Café', spec: null }, { name: 'Papel higiénico', spec: '2 rolos' }]);
t('preciso de buchas para a parede na Leroy Merlin', [{ name: 'Buchas', spec: 'para parede' }], 6);
t('apanha 250 ml de natas, queijo ralado', [{ name: 'Natas', spec: '250 ml' }, { name: 'Queijo ralado', spec: null }]);
t('vou precisar de um molho de coentros do Pingo Doce', [{ name: 'Coentros', spec: '1 molho' }], 2);
t('preciso de dois metros de corda para o toldo', [{ name: 'Corda', spec: '2 m · para toldo' }]);
t('já não temos pão nem leite', [{ name: 'Pão nem leite', spec: null }]);
t('traz uma caixa de ovos à Lidl', [{ name: 'Ovos', spec: '1 caixa' }], 3);
t('adiciona abraçadeiras para os cabos da televisão e uma tampa para a frigideira', [{ name: 'Abraçadeiras', spec: 'para cabos da televisão' }, { name: 'Tampa', spec: 'para frigideira' }]);
t('', []);

// ---- icons ----
const ic = (n, icon, cat) => {
  const r = P.resolveIcon(n);
  assert.equal(r.icon, icon, `${n} -> ${r.icon}`);
  if (cat) assert.equal(r.category, cat, `${n} category -> ${r.category}`);
};
// HEAD 'first' compounds / non-food
ic('tampa da frigideira', 'lid', 'Küche & Haushaltswaren');
ic('tampa de panela', 'lid');
ic('rede para gatos', 'net');
ic('rede para gatos', 'net', 'Tierbedarf');
ic('calha para cabos', 'duct');
ic('calhas para cabos', 'duct', 'Elektro & Technik');
ic('abraçadeiras', 'cable-tie', 'Werkzeug & Baumarkt');
ic('aranhas elásticas', 'bungee');
ic('varão de cortinado', 'rod');
ic('pés de borracha', 'bumper');
ic('buchas', 'dowel');
ic('uniões', 'connector');
ic('tubos', 'duct');
ic('protetor anti-salpicos', 'splash');
ic('papel de alumínio', 'foil');
ic('pasta de dentes', 'toothbrush', 'Körperpflege');
ic('batatas fritas', 'popcorn');
ic('batata doce', 'sweet-potato');
// groceries
ic('leite', 'milk', 'Milch & Käse');
ic('sumo de laranja', 'juice', 'Getränke');
ic('carne picada', 'meat', 'Fleisch & Fisch');
ic('queijo ralado', 'cheese');
ic('tomates', 'tomato', 'Früchte & Gemüse');
ic('maçãs', 'apple');
ic('cebolas', 'onion');
ic('limões', 'lemon');
ic('pão', 'bread', 'Brot & Gebäck');
ic('pães', 'bread');
ic('manteiga', 'butter');
ic('ovos', 'egg');
ic('iogurtes', 'yogurt');
ic('arroz', 'rice', 'Vorräte');
ic('azeite', 'olive');
ic('esparguete', 'pasta');
ic('cerveja', 'beer', 'Getränke');
ic('vinho tinto', 'wine');
ic('café', 'coffee');
ic('salmão', 'fish');
ic('frango', 'chicken');
ic('fiambre', 'ham');
ic('chocolate', 'chocolate', 'Snacks & Süsses');
// household and others
ic('rolo de cozinha', 'toilet-paper', 'Haushalt');
ic('papel higiénico', 'toilet-paper');
ic('esponja', 'sponge');
ic('lixívia', 'bottle');
ic('sacos do lixo', 'trash');
ic('vassoura', 'broom');
ic('champô', 'bottle', 'Körperpflege');
ic('escova de dentes', 'toothbrush');
ic('paracetamol', 'pill', 'Apotheke');
ic('penso rápido', 'bandage');
ic('frigideira', 'pan', 'Küche & Haushaltswaren');
ic('panela de pressão', 'pot');
ic('martelo', 'hammer');
ic('parafusos', 'screw');
ic('pilhas', 'battery', 'Elektro & Technik');
ic('lâmpada', 'bulb');
ic('caneta', 'pen', 'Papeterie & Büro');
ic('cortinas', 'window', 'Wohnen & Deko');
ic('ração para gatos', 'cat', 'Tierbedarf');
ic('fraldas', 'baby-bottle', 'Baby & Kind');
ic('meias', 'socks', 'Kleidung & Textil');
ic('pneu de bicicleta', 'tire');
ic('capacete de bicicleta', 'bike', 'Auto & Velo');
ic('mangueira', 'garden-house', 'Garten & Pflanzen');
// non-matching falls back to category
assert.equal(P.resolveIcon('xyzzy', null).matched, false);
assert.equal(P.guessCategory('xyzzy', 'farmácia'), 'Apotheke');
assert.ok(P.suggestionKeywords().length >= 900);
console.log('all passed');
