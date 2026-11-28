import assert from 'node:assert/strict';
import { loadPack } from './testkit.mjs';
const code = 'es';
const P = await loadPack(code);
assert.ok(P.keywords >= 900, `keywords: ${P.keywords}`);
const stores = [
  { id: 1, name: 'Mercadona' }, { id: 2, name: 'Carrefour' }, { id: 3, name: 'Lidl' },
  { id: 4, name: 'El Corte Inglés', aliases: ['corte inglés', 'corte ingles'] }, { id: 5, name: 'Dia' },
];
const t = (text, items, storeId = null) => {
  const r = P.parse(text, stores);
  assert.deepEqual(r.items, items, text);
  assert.equal(r.store?.id ?? null, storeId, text + ' (store)');
};
// parser
t('necesito tacos de goma para los postes de aluminio y luego también necesitamos empalmes para las tuberías',
  [{ name: 'Tacos de goma', spec: 'para postes de aluminio' }, { name: 'Empalmes', spec: 'para tuberías' }]);
t('no nos queda leche y tengo que comprar dos litros de zumo de naranja en Mercadona',
  [{ name: 'Leche', spec: null }, { name: 'Zumo de naranja', spec: '2 l' }], 1);
t('añade 500 gramos de carne picada y tomates', [{ name: 'Carne picada', spec: '500 g' }, { name: 'Tomates', spec: null }]);
t('no te olvides del papel de cocina', [{ name: 'Papel de cocina', spec: null }]);
t('hace falta pan en el Dia', [{ name: 'Pan', spec: null }], 5);
t('tengo que coger medio kilo de patatas en Carrefour', [{ name: 'Patatas', spec: '0,5 kg' }], 2);
t('apunta una lata de atún y un melón', [{ name: 'Atún', spec: '1 lata' }, { name: 'Melón', spec: null }]);
t('hay que comprar tres botellas de agua en Lidl', [{ name: 'Agua', spec: '3 botellas' }], 3);
t('acuérdate de los huevos, por favor', [{ name: 'Huevos', spec: null }]);
t('pon en la lista un poco de queso rallado', [{ name: 'Queso rallado', spec: null }]);
t('necesitamos 1,5 litros de leche en El Corte Inglés', [{ name: 'Leche', spec: '1,5 l' }], 4);
t('quiero dos paquetes de espaguetis y también un manojo de perejil', [{ name: 'Espaguetis', spec: '2 paquetes' }, { name: 'Perejil', spec: '1 manojo' }]);
t('necesito un rollo de cinta aislante', [{ name: 'Cinta aislante', spec: '1 rollo' }]);
t('compra unas manzanas y unos plátanos', [{ name: 'Manzanas', spec: null }, { name: 'Plátanos', spec: null }]);
t('añade 2 kilos de naranjas del Mercadona', [{ name: 'Naranjas', spec: '2 kg' }], 1);
t('se nos ha acabado el detergente', [{ name: 'Detergente', spec: null }]);
t('necesito bridas para los cables', [{ name: 'Bridas', spec: 'para cables' }]);
t('apunta doce huevos y 250 ml de nata', [{ name: 'Huevos', spec: '12' }, { name: 'Nata', spec: '250 ml' }]);
t('no te olvides de comprar pilas en el Corte Inglés', [{ name: 'Pilas', spec: null }], 4);
t('nos faltan servilletas, tenemos que comprar jabón de manos', [{ name: 'Servilletas', spec: null }, { name: 'Jabón de manos', spec: null }]);
t('tengo que comprar cinco tomates para la ensalada', [{ name: 'Tomates', spec: '5 · para ensalada' }]);
t('', []);
// icons
const ic = (n, icon, cat) => {
  const r = P.resolveIcon(n, null);
  assert.equal(r.icon, icon, `${n} -> ${r.icon}`);
  if (cat) assert.equal(r.category, cat, `${n} category`);
};
ic('tapa de sartén', 'lid'); ic('red para gatos', 'net', 'Tierbedarf'); ic('canaleta para cables', 'duct', 'Elektro & Technik');
ic('bridas', 'cable-tie'); ic('pulpos elásticos', 'bungee'); ic('barra de cortina', 'rod'); ic('tacos de goma', 'bumper'); ic('empalmes', 'connector');
ic('tacos de pared', 'dowel'); ic('protector antisalpicaduras', 'splash'); ic('red', 'net'); ic('tubos de aluminio', 'rod');
ic('leche', 'milk', 'Milch & Käse'); ic('plátanos', 'banana'); ic('manzanas', 'apple'); ic('zumo de naranja', 'juice', 'Getränke');
ic('papel de cocina', 'toilet-paper', 'Haushalt'); ic('papel higiénico', 'toilet-paper'); ic('pasta de dientes', 'toothbrush', 'Körperpflege');
ic('aceite de oliva', 'olive'); ic('cerveza', 'beer'); ic('carne picada', 'meat', 'Fleisch & Fisch'); ic('pechuga de pollo', 'chicken');
ic('jamón', 'ham'); ic('atún', 'fish'); ic('arroz', 'rice'); ic('espaguetis', 'pasta'); ic('huevos', 'egg'); ic('queso', 'cheese');
ic('yogures', 'yogurt'); ic('detergente', 'laundry'); ic('esponja', 'sponge'); ic('champú', 'bottle'); ic('ibuprofeno', 'pill', 'Apotheke');
ic('tiritas', 'bandage'); ic('cuchillo', 'knife'); ic('martillo', 'hammer', 'Werkzeug & Baumarkt'); ic('destornillador', 'screwdriver');
ic('pilas', 'battery'); ic('bombillas', 'bulb'); ic('cuaderno', 'notebook'); ic('bolígrafo', 'pen'); ic('calcetines', 'socks');
ic('pañales', 'baby-bottle'); ic('pienso para perros', 'dog', 'Tierbedarf'); ic('pienso para gatos', 'cat'); ic('bicicleta', 'bike');
ic('neumáticos', 'tire'); ic('jabón', 'soap'); ic('maceta', 'vase'); ic('tierra para plantas', 'herbs'); ic('cinta aislante', 'tape');
ic('cinta métrica', 'tape-measure'); ic('papel de aluminio', 'foil'); ic('tornillos', 'screw'); ic('alfombra', 'rug'); ic('helado', 'icecream');
assert.equal(P.guessCategory('cosa rara xyz', 'ferretería'), 'Werkzeug & Baumarkt');
assert.equal(P.resolveIcon('cosa rara xyz', null).matched, false);
console.log('all passed');
