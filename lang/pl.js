// Polish language pack: { parser, icons }. See lang/README.md.
// Parser: Polish inflection is handled by a small normaliser (genitive/locative/accusative -> nominative) that runs as the last PHRASES entry
// (a RegExp subclass with a custom [Symbol.replace], because the engine has no item-normalisation hook). It stops at the purpose ("do/na/dla ...").

const fold = s => s.toLowerCase().replace(/ł/g, 'l').normalize('NFD').replace(/\p{M}/gu, '');

// ---------------------------------------------------------------- parser
const UNIT_MAP = {};
const U = (keys, v) => { for (const k of keys.split(/\s+/)) UNIT_MAP[k] = v; };
U('kg kilo kilogram kilogramy kilogramów kilograma kilogramu', ['kg']);
U('dag deko dekagram dekagramy dekagramów dekagramu', ['dag']);
U('g gram gramy gramów gramu', ['g']);
U('l litr litry litrów litra litrze', ['l']);
U('ml mililitr mililitry mililitrów', ['ml']);
U('dl decylitr decylitry decylitrów', ['dl']);
U('cl centylitr centylitry centylitrów', ['cl']);
U('szt sztuka sztuki sztuk sztukę', ['szt.']);
U('opak opakowanie opakowania opakowań', ['opak.']);
U('puszka puszki puszek puszkę', ['puszka', 'puszki']);
U('butelka butelki butelek butelkę', ['butelka', 'butelki']);
U('pęczek pęczki pęczków', ['pęczek', 'pęczki']);
U('rolka rolki rolek rolkę', ['rolka', 'rolki']);
U('słoik słoiki słoików', ['słoik', 'słoiki']);
U('paczka paczki paczek paczkę', ['paczka', 'paczki']);
U('torebka torebki torebek torebkę', ['torebka', 'torebki']);
U('pudełko pudełka pudełek', ['pudełko', 'pudełka']);
U('worek worki worków', ['worek', 'worki']);
U('m metr metry metrów metra', ['m']);
U('cm centymetr centymetry centymetrów', ['cm']);

const NW = { jeden: 1, jedna: 1, jedno: 1, jedną: 1, jednego: 1, dwa: 2, dwie: 2, dwóch: 2, dwoje: 2, trzy: 3, trzech: 3, cztery: 4, czterech: 4,
  pięć: 5, sześć: 6, siedem: 7, osiem: 8, dziewięć: 9, dziesięć: 10, jedenaście: 11, dwanaście: 12, półtora: 1.5, pół: 0.5 };
const ONE_UNIT = 'jeden|jedna|jedno|jedną|jednego';

const TOK = [
  'ja|my|mi|mnie|nam|nas|się|sie|już|juz|jeszcze|też|tez|także|takze|również|rowniez|proszę|prosze|poproszę|poprosze|poprosimy',
  'potem|później|pozniej|następnie|nastepnie|teraz|tylko|może|moze|chciałbym|chcialbym|chciałabym|chcialabym|chcę|chce|chcemy|chcesz',
  'potrzebuję|potrzebuje|potrzebujemy|potrzebujesz|potrzebujecie|potrzebują|potrzebna|potrzebne|potrzebny|potrzeba|trzeba',
  'muszę|musze|musimy|musisz|musi|powinienem|powinnam|powinniśmy|kupić|kupic|kup|kupię|kupie|kupimy|kupuję|kupuje|kupujemy|kupujmy|kupisz|kupcie',
  'wziąć|wziac|weź|wez|wezmę|wezme|weźmy|wezmy|bierzemy|biorę|biore|dodaj|dodać|dodac|dodajmy|dodaję|dodaje|dopisz|dopisać|dopisac',
  'wpisz|wpisać|wpisac|zapisz|zapisać|zapisac|zamów|zamow|zamówić|zamowic|zamawiam|zamawiamy|przynieś|przynies|przynieść|przyniesc|zakup|zakupić|zakupic',
  'dobra|dobrze|okej|ok|no|hej|cześć|czesc|słuchaj|sluchaj|aha|yyy|eee|eh|ehm|hmm|mmm|hm|więc|wiec|czyli',
  'będziemy|bedziemy|będę|bede|będzie|bedzie|nie|ma|mamy|mam|mają|maja|jest|są|sa|bym|byśmy|bysmy|żeby|zeby|aby|że',
  'kilka|kilku|parę|pare|paru|trochę|troche|troszkę|troszke|nieco|sporo|jakieś|jakies|jakiś|jakis|jakąś|jakas|coś|cos',
  'tego|ten|ta|to|te|tę|nasze|nasz|naszą|moje|mój|moja|moją|nowe|nowy|nową|zrób|zrob|zrobić|zrobic',
].join('|');
const TOK_RE = new RegExp(`^(?:${TOK})$`, 'iu');

const STOP = ['i', 'a', 'w', 'we', 'z', 'ze', 'na', 'do', 'o', 'u', 'po', 'dla', 'od', 'za', 'przez', 'to', 'ten', 'ta', 'te', 'nie', 'już', 'oraz', 'lub', 'albo', 'ale', 'że'];

// ---- genitive/locative/accusative -> nominative
const IRREG = {};
for (const e of (
  'mleka:mleko:n masła:masło:n mięsa:mięso:n sera:ser:m chleba:chleb:m cukru:cukier:m octu:ocet:m soli:sól:f proszku:proszek:m boczku:boczek:m ' +
  'ogórka:ogórek:m kubka:kubek:m worka:worek:m wody:woda:f kawy:kawa:f herbaty:herbata:f mąki:mąka:f śmietany:śmietana:f śmietanki:śmietanka:f ' +
  'kiełbasy:kiełbasa:f szynki:szynka:f margaryny:margaryna:f papryki:papryka:f cebuli:cebula:f marchewki:marchewka:f marchwi:marchew:f sałaty:sałata:f ' +
  'bułki:bułka:f pasty:pasta:f czekolady:czekolada:f fasoli:fasola:f kukurydzy:kukurydza:f pietruszki:pietruszka:f kapusty:kapusta:f wędliny:wędlina:f ' +
  'pizzy:pizza:f kaszy:kasza:f oliwy:oliwa:f piwa:piwo:n wina:wino:n mydła:mydło:n ręcznika:ręcznik:m twarogu:twaróg:m młotka:młotek:m pędzla:pędzel:m kabla:kabel:m ' +
  '' +
  'bułek:bułki:p jabłek:jabłka:p jajek:jajka:p jaj:jajka:p owoców:owoce:p warzyw:warzywa:p cytryn:cytryny:p pomarańczy:pomarańcze:p pomarańcz:pomarańcze:p ' +
  'ryb:ryby:p listew:listwy:p drożdży:drożdże:p przypraw:przyprawy:p śrub:śruby:p kabli:kable:p rur:rury:p gwoździ:gwoździe:p winogron:winogrona:p ' +
  'malin:maliny:p jagód:jagody:p brzoskwiń:brzoskwinie:p baterii:baterie:p kiwi:kiwi:p'
).split(/\s+/)) { const [a, b, g] = e.split(':'); IRREG[fold(a)] = [b, g]; }
const PROTECT_EK = new Set(('ogórek kubek pasek worek kołek wałek bochenek kawałek czosnek pączek pęczek drążek słupek sznurek krążek kotek piesek olejek płatek ' +
  'jasiek wianek pierścionek zeszycik koszyczek sweterek').split(' ').map(fold));
const PROTECT_U = new Set('tofu menu emu kakadu'.split(' '));
const ADJ_NOM = /(?:owy|owa|owe|ski|ska|skie|cki|cka|ckie|czny|czna|czne|ony|ona|one|ący|ąca|ące|iony|iona|ione|any|ane)$/;
const ADJ_OBL = /^(.{3,}?)(iego|ego|iej|ej|ymi|imi|ych|ich|ym|im|ą)$/;
const SOFT = { iego: 1, iej: 1, imi: 1, ich: 1, im: 1 };

function adjNom(stem, end, g) {
  const soft = SOFT[end] || /[kg]$/.test(stem);
  if (end === 'ą' || end === 'ej' || end === 'iej') return stem + (soft && end !== 'ą' ? 'ia' : 'a');
  if (end === 'ych' || end === 'ymi' || end === 'ich' || end === 'imi') return stem + (soft ? 'ie' : 'e');
  // ego / iego / ym / im: gender decides
  if (g === 'f') return stem + (soft ? 'ia' : 'a');
  if (g === 'n' || g === 'p') return stem + (soft ? 'ie' : 'e');
  return stem + (soft ? 'i' : 'y');
}

function normalise(s, ctx) {
  const toks = [...s.matchAll(/[\p{L}\p{M}\p{N}\u0001-]+/gu)];
  let lim = toks.findIndex(m => /^(?:do|na|dla|z|ze|bez|w|we|od|po|przy|pod|nad)$/iu.test(m[0]));
  if (lim < 0) lim = toks.length;
  const info = toks.map((m, i) => {
    const w = m[0].toLowerCase(), f = fold(w);
    if (i >= lim || /[\d\u0001]/.test(w) || w.length < 4 || ctx.skip.has(w) || ctx.skip.has(f) || TOK_RE.test(w) || TOK_RE.test(f)) return { k: 'skip' };
    if (IRREG[f]) {
      const pv = i > 0 ? fold(toks[i - 1][0]) : '';
      // after dwa/dwie/trzy/cztery (or 2-4) a feminine -y/-i form is already nominative plural
      if (IRREG[f][1] === 'f' && /[yi]$/.test(f) && /^(?:dwa|dwie|trzy|cztery|[234])$/.test(pv)) return { k: 'noun', nom: w, g: 'p' };
      return { k: 'noun', nom: IRREG[f][0], g: IRREG[f][1] };
    }
    if (ADJ_NOM.test(w)) return { k: 'adjn' };
    const am = w.length >= 6 && w.match(ADJ_OBL);
    if (am) return { k: 'adj', stem: am[1], end: am[2] };
    let nom = w, g;
    if (/ków$/.test(w) && w.length > 5) { nom = w.slice(0, -3) + 'ki'; g = 'p'; }
    else if (/(?:ów|ow)$/.test(w) && w.length >= 6) { nom = w.slice(0, -2) + 'y'; g = 'p'; }
    else if (/k(?:ach|ami)$/.test(w) && w.length > 6) { nom = w.replace(/k(?:ach|ami)$/, 'ki'); g = 'p'; }
    else if (/(?:ach|ami)$/.test(w) && w.length > 6) { nom = w.replace(/(?:ach|ami)$/, 'y'); g = 'p'; }
    else if (/ek$/.test(w) && w.length > 4 && !PROTECT_EK.has(f)) { nom = w.slice(0, -2) + 'ki'; g = 'p'; }
    else if (/ę$/.test(w) && w.length > 4) { nom = w.slice(0, -1) + 'a'; g = 'f'; }
    else if (/u$/.test(w) && w.length >= 4 && !PROTECT_U.has(w)) { nom = w.slice(0, -1); g = 'm'; }
    else g = /a$/.test(w) ? 'f' : /[oe]$/.test(w) ? 'n' : /[yi]$/.test(w) ? 'p' : 'm';
    return { k: 'noun', nom, g };
  });
  const out = toks.map((m, i) => {
    const t = info[i];
    if (t.k === 'noun') return t.nom;
    if (t.k === 'adj') {
      let j = i - 1; while (j >= 0 && info[j].k !== 'noun') j--;
      if (j < 0) { j = i + 1; while (j < info.length && info[j].k !== 'noun') j++; }
      return adjNom(t.stem, t.end, info[j]?.g);
    }
    return m[0];
  });
  let res = '', pos = 0;
  toks.forEach((m, i) => { res += s.slice(pos, m.index) + out[i]; pos = m.index + m[0].length; });
  return res + s.slice(pos);
}

const B = '(?<![\\p{L}\\p{N}])', E = '(?![\\p{L}\\p{N}])';
const SKIP = new Set([...Object.keys(UNIT_MAP), ...Object.keys(NW), 'pol', 'połowa', 'połowę', 'puszkę'].flatMap(k => [k, fold(k)]));
class Normaliser extends RegExp {
  [Symbol.replace](str) { return normalise(String(str), { skip: SKIP }); }
}

const PHRASES = [
  '(?:na|do)\\s+(?:mojej\\s+|naszej\\s+|tej\\s+|wspólnej\\s+|wspolnej\\s+)?(?:listy|listę|liste|liście|liscie|listą)(?:\\s+zakupów|\\s+zakupow|\\s+zakupowej)?',
  '(?:po)?pros(?:zę|ze|imy)\\s+o', 'nie\\s+zapomnij(?:my|cie)?(?:\\s+o)?', 'pamiętaj(?:my|cie)?(?:\\s+(?:o|żeby|aby))?', 'pamietaj(?:my|cie)?(?:\\s+(?:o|zeby|aby))?',
  'zapomnia[łl](?:em|am|iśmy|ismy)?(?:\\s+o)?',
  'nie\\s+(?:mamy|mam|ma|mają|maja)(?:\\s+już|\\s+juz)?',
  '(?:skończył[aoy]?|skonczyl[aoy]?|skończyło|skonczylo)(?:\\s+(?:się|sie|nam|mi))*', 'zabrakło(?:\\s+(?:nam|mi))?', 'brakuje(?:\\s+(?:nam|mi))?',
  'kończ[ya]\\s+się(?:\\s+(?:nam|mi))?',
  'po\\s+drodze', 'przy\\s+okazji', 'w\\s+sklepie', 'na\\s+zakupy',
  '(?:jak|gdy|kiedy)\\s+(?:będziesz|będziemy|będę)\\s+(?:w\\s+sklepie|na\\s+zakupach)',
  new Normaliser('(?!)', 'giu'),
];

const parser = {
  UNIT_MAP, NW, ONE_UNIT,
  HALF: '(?:pół|pol|połowę|połowa)',
  PHRASES,
  TOKENS: TOK,
  STOP,
  LEAD: 'ten|ta|to|te|tę|tego|tą|tych|taki|takie|moje|moich|nasze|naszych|jakiś|jakieś|jakąś|nieco|kilka|kilku|parę|paru|o|od|ze|z|w|we|u|oraz|i',
  CONJ: 'a\\s+potem|a\\s+jeszcze|a\\s+także|a\\s+takze|i\\s+jeszcze|i\\s+też|oraz|a\\s+więc|potem|następnie|później|plus|oprócz\\s+tego|poza\\s+tym|a|i',
  // zero-width: the purpose keeps its own preposition ("do aluminiowych słupków", "na grilla", "dla kota") as spec
  PURPOSE: '(?<=[\\p{L}\\p{N}]\\s+)(?=(?:do|na|dla)\\s+\\p{L})',
  FOR: '',
  PRE: '(?:(?:ze\\s+sklepu|w\\s+sklepie|we|ze|w|z|do|na|u|od)\\s+)?',
  TRAIL: 'w|we|z|ze|do|na|dla|o|u|od|po',
  TRAIL2: 'więcej|jeszcze|też|także|razem',
  DEC: ',',
  CAP: true,
};

// ---------------------------------------------------------------- icons
const SPEC = [
  ['Küche & Haushaltswaren', `:lid pokrywka pokrywki pokrywek pokrywkę pokrywa pokrywy pokryw przykrywka przykrywki przykrywek deklu
    :splash przeciwbryzgowa przeciwbryzgowe przeciwbryzgowy przeciwbryzgowych przeciwbryzgowej`],
  ['Tierbedarf', `:net siatka`],
  ['Werkzeug & Baumarkt', `:net siatki siatkę siatek siatkowa siatkowe moskitiera moskitiery moskitier
    :cable-tie opaska opaski opasek opaskę opaskami zaciskowa zaciskowe zaciskowy zaciskowych zaciskowej trytytka trytytki trytytek
    :rod pręt pręta pręty prętów prętem drążek drążki drążka drążków drążkiem rura rury rur rurę rurze rurami rurka rurki rurek rurkę słupek słupki słupka słupków słupkiem tyczka tyczki tyczek
      karnisz karnisze karnisza karniszy karniszów listwa listwy listew listwę belka belki belek kątownik kątowniki kątownika teownik ceownik płaskownik profil profile profili szyna szyny szyn tuleja tuleje
    :dowel kołek kołki kołka kołków kołkiem kołkach kołkowanie
    :bumper nóżka nóżki nóżek nóżkę nóżkami nóżkach stopka stopki stopek
    :connector złączka złączki złączek złączkę złącze złącza łącznik łączniki łącznika łączników kolanko kolanka kolanek mufa mufy trójnik trójniki trójnika kupler redukcja redukcje redukcji przejściówka przejściówki rozdzielacz rozdzielacze
    :bungee guma gumy gum gumę gumami ekspander ekspandery napinacz napinacze elastyczna elastyczne elastyczny elastycznych elastycznej
    :rope linka linki linek linkę linkami lina liny lin linę sznurek sznurki sznurka sznurków sznur sznury sznura
    :duct korytko korytka korytek korytkiem koryto kabelkanał`],
  ['Elektro & Technik', `:duct kablowe kablowa kablowych kablowy`],
];

const DATA = [
  ['Früchte & Gemüse', `
    :apple jabłko jabłka jabłek jabłkiem jabłkami owoce owoców owoc
    :carrot warzywa warzyw warzywo marchew marchewka marchewki marchewek marchwi
    :banana banan banany bananów banana bananem
    :orange pomarańcza pomarańcze pomarańczy pomarańcz mandarynka mandarynki mandarynek klementynka klementynki grejpfrut grejpfruty grejpfrutów pomelo
    :lemon cytryna cytryny cytryn cytrynę limonka limonki limonek
    :grapes winogrono winogrona winogron
    :strawberry truskawka truskawki truskawek truskawkę
    :berries jagoda jagody jagód borówka borówki borówek malina maliny malin jeżyna jeżyny porzeczka porzeczki porzeczek agrest agrestu
    :pear gruszka gruszki gruszek gruszkę
    :peach brzoskwinia brzoskwinie brzoskwiń nektarynka nektarynki morela morele moreli śliwka śliwki śliwek śliwa śliwy
    :cherry wiśnia wiśnie wiśni czereśnia czereśnie czereśni
    :melon melon melony melonów
    :watermelon arbuz arbuzy arbuzów arbuza
    :mango mango papaja
    :pineapple ananas ananasy ananasów
    :kiwi kiwi
    :avocado awokado
    :tomato pomidor pomidory pomidorów pomidora pomidorki pomidorków pomidorek pomidorze
    :cucumber ogórek ogórki ogórków ogórka ogórkiem cukinia cukinie cukinii
    :potato ziemniak ziemniaki ziemniaków ziemniaka kartofel kartofle kartofli dynia dynie dyni rzodkiewka rzodkiewki rzodkiewek rzepa rzepy burak buraki buraków kalarepa kalarepy seler selery selera
    :sweet-potato batat bataty batatów
    :onion cebula cebule cebuli cebulę szalotka szalotki szczypiorek por pory szczypior
    :garlic czosnek czosnku czosnkiem
    :lettuce sałata sałaty sałatę sałat rukola rukoli szpinak szpinaku kapusta kapusty kapustę kapust jarmuż jarmużu fenkuł
    :broccoli brokuł brokuły brokułów kalafior kalafiory kalafiorów brukselka brukselki
    :pepper papryka papryki papryk paprykę
    :chili chilli
    :eggplant bakłażan bakłażany bakłażanów
    :mushroom pieczarka pieczarki pieczarek grzyb grzyby grzybów borowik borowiki kurka kurki
    :corn kukurydza kukurydzy kukurydzę
    :ginger imbir imbiru
    :herbs bazylia bazylii pietruszka pietruszki natka koperek kopru koper kolendra kolendry mięta mięty rozmaryn tymianek szałwia oregano majeranek lubczyk zioła ziół
    :beans groszek groszku fasolka fasolki szparagi szparagów`],
  ['Brot & Gebäck', `
    :bread chleb chleba chleby chlebów chlebek bochenek bochenka bochenki tost tosty tostów pieczywo pieczywa chlebowy
    :baguette bagietka bagietki bagietek bułka bułki bułek bułkę bułce
    :croissant rogal rogale rogali rogalik rogaliki rogalików croissant croissanty
    :pretzel precel precle precli
    :bagel bajgiel bajgle
    :flatbread tortilla tortille pita placek
    :pancakes naleśnik naleśniki naleśników naleśnika pankejk pankejki racuch racuchy
    :cake ciasto ciasta ciast tort torty tortów sernik sernika makowiec piernik pierniki drożdżówka drożdżówki
    :cupcake muffin muffinki muffinów babeczka babeczki babeczek
    :donut pączek pączki pączków
    :cookie ciastko ciastka ciastek ciasteczko ciasteczka ciasteczek herbatnik herbatniki herbatników
    :pie szarlotka szarlotki tarta tarty
    :bread`],
  ['Milch & Käse', `
    :milk mleko mleka mleczko śmietana śmietany śmietanę śmietanka śmietanki maślanka maślanki serwatka
    :butter masło masła masłem margaryna margaryny
    :cheese ser sery serów sera serem mozzarella parmezan feta camembert brie gouda edam ementaler oscypek oscypki halloumi ricotta mascarpone gorgonzola serek serki serka serków twaróg twarogu
    :egg jajko jajka jajek jajo jaja jaj jajeczko
    :yogurt jogurt jogurty jogurtów jogurtu kefir kefiry kefiru skyr
    :pudding budyń budynie budyniów galaretka galaretki deser desery deserów`],
  ['Fleisch & Fisch', `
    :chicken kurczak kurczaka kurczaki kurczaków pierś piersi udko udka udek skrzydełko skrzydełka skrzydełek indyk indyka indyki kaczka kaczki drób drobiu nuggetsy nuggets
    :meat mięso mięsa mięso wołowina wołowiny wieprzowina wieprzowiny cielęcina cielęciny baranina baraniny schab schabu schaby karkówka karkówki polędwica polędwicy kotlet kotlety kotletów kotleta
      gulasz gulaszu żeberka żeberek stek steki steków wątróbka wątróbki pieczeń pieczeni
    :bacon boczek boczku boczki boczków
    :sausage kiełbasa kiełbasy kiełbas kiełbasę kiełbaski kiełbasek parówka parówki parówek kabanos kabanosy kabanosów hotdog
    :ham szynka szynki szynek szynkę wędlina wędliny wędlin salami
    :fish ryba ryby ryb rybę rybki rybek łosoś łososia łososie dorsz dorsza dorsze śledź śledzie śledzi tuńczyk tuńczyka tuńczyki pstrąg pstrąga karp karpia makrela makreli makrele halibut mintaj miruna
    :fish paluszkirybne paluszkirybnych paluszkówrybnych
    :shrimp krewetka krewetki krewetek kalmary kalmarów
    :oyster małże omułki`],
  ['Vorräte', `
    :pasta makaron makarony makaronu makaronów spaghetti spagetti penne tagliatelle kluski klusek lasagne lazania lazanie nitki ravioli
    :rice ryż ryżu ryże kasza kasze kaszy kuskus bulgur komosa
    :can konserwa konserwy konserw ketchup ketchupu musztarda musztardy majonez majonezu sos sosy sosów sosu bulion bulionu koncentrat koncentratu passata przecier przecieru zupa zupy zup zupka sardynki sardynek chrzan chrzanu
    :salt sól soli przyprawa przyprawy przypraw przyprawę gałka
    :chili pieprz pieprzu papryczka curry cynamon cynamonu kmin kminek kminku liść liście
    :olive oliwa oliwy oliwę oliwka oliwki oliwek olej oleju oleje olejów
    :bowl płatki płatków musli granola otręby otrębów
    :grain mąka mąki mąkę mąką skrobia skrobi semolina mak maku ziarno ziarna ziaren chia siemię
    :candy cukier cukru cukry słodzik słodziki ksylitol
    :honey miód miodu syrop syropu syropy
    :strawberry dżem dżemu dżemy konfitura konfitury marmolada marmolady powidła powideł
    :nuts orzechy orzech orzechów orzeszki orzeszków migdały migdałów pistacje pistacji nerkowce nerkowców rodzynki rodzynek pestki pestek sezam bakalie bakalii
    :chocolate nutella
    :legumes fasola fasoli fasole soczewica soczewicy ciecierzyca ciecierzycy hummus humus groch grochu
    :cupcake drożdże drożdży soda sody aromat aromatu wiórki wiórków
    :pudding żelatyna żelatyny
    :nuts`],
  ['Tiefkühl', `
    :pizza pizza pizze pizzy
    :fries frytki frytek
    :icecream lody lodów loda lodzik
    :ice lód lodu mrożonki mrożonka mrożonek mrożone
    :dumpling pierogi pierogów pieróg uszka uszek kopytka kopytek pyzy knedle knedli`],
  ['Getränke', `
    :water woda wody wodę wód
    :soda cola fanta sprite pepsi lemoniada lemoniady napój napoje napojów izotonik energetyk
    :juice sok soku soki soków nektar nektary nektaru smoothie
    :tea herbata herbaty herbatę herbat herbatka herbatki
    :coffee kawa kawy kawę espresso cappuccino latte kakao
    :beer piwo piwa piw piwko piwka cydr
    :wine wino wina win
    :sparkling szampan szampana prosecco
    :spirits wódka wódki whisky whiskey gin rum koniak likier likieru nalewka
    :cocktail drink drinki drinka`],
  ['Snacks & Süsses', `
    :chocolate czekolada czekolady czekolad czekoladę czekoladki baton batony batonów pralina praliny tabliczka tabliczki
    :popcorn chipsy chipsów chips popcorn chrupki
    :candy cukierek cukierki cukierków żelki żelków dropsy chałwa lukrecja toffi
    :lollipop lizak lizaki lizaków pianka pianki pianek
    :pretzel paluszki paluszków precelki
    :cracker krakers krakersy krakersów
    :cookie wafel wafle wafelek wafelki wafelków`],
  ['Haushalt', `
    :toilet-paper papiertoaletowy papieratoaletowego papierutoaletowego papiertoaletowe papierytoaletowe papieremtoaletowym papiertoaletowego
      recznikpapierowy recznikipapierowe recznikapapierowego recznikupapierowym recznikowpapierowych recznikiempapierowym recznikkuchenny recznikikuchenne recznikakuchennego recznikukuchennym
      serwetka serwetki serwetek
    :tissue chusteczka chusteczki chusteczek chusteczkami higieniczne
    :sponge gąbka gąbki gąbek zmywak zmywaki zmywaków ścierka ścierki ścierek ściereczka ściereczki szmata szmaty szmat mikrofibra mikrofibry
    :bottle płyn płynu płyny płynów detergent detergenty odświeżacz odświeżacza środek środka środki środków mleczko
    :laundry proszek proszku proszki proszków pranie prania wybielacz wybielacza odplamiacz odplamiacza krochmal pralka pralki pralkę
    :soap odkamieniacz odkamieniacza udrażniacz cif domestos ludwik czyścik czyściki
    :trash worek worki worków śmieci śmieć
    :broom miotła miotły miotłę zmiotka szufelka szufelki odkurzacz odkurzacze odkurzacza mop mopa mopy szczotka szczotki szczotkę
    :bucket wiadro wiadra wiader wiaderko kubeł
    :flame zapałki zapałek zapałka zapalniczka zapalniczki zapalniczek podpałka rozpałka
    :gloves rękawiczki rękawiczek rękawiczka rękawica rękawice rękawic
    :bug owady owadów mole moli
    :candle świeca świece świec świeczka świeczki świeczek świecznik świeczniki znicz znicze zniczy wosk wosku
    :mosquito komar komary komarów`],
  ['Körperpflege', `
    :toothbrush szczoteczka szczoteczki szczoteczek szczoteczkę pasta past wykałaczki wykałaczka
    :bottle szampon szamponu szampony szamponów żel żelu żele żeli odżywka odżywki odżywek dezodorant dezodoranty antyperspirant balsam balsamy balsamu krem kremy kremu kremów lotion
      perfumy perfum tonik tonika
    :soap mydło mydła mydeł mydełko mydełka
    :razor maszynka maszynki maszynek golarka golarki
    :toilet-paper wata waty wacik waciki wacików patyczek patyczki patyczków podpaska podpaski podpasek tampon tampony tamponów wkładki wkładek
    :nail-polish lakier lakiery lakieru lakierów zmywacz zmywacza
    :lipstick szminka szminki szminek pomadka pomadki makijaż makijażu kosmetyk kosmetyki kosmetyków puder pudru maskara mascara
    :comb grzebień grzebienie grzebieni frotka frotki frotek spinka spinki spinek wsuwka wsuwki wsuwek lokówka lokówki
    :fan suszarka suszarki suszarek`],
  ['Apotheke', `
    :pill tabletka tabletki tabletek tabletkę leki lek leków lekarstwo lekarstwa lekarstw witamina witaminy witamin magnez magnezu ibuprofen paracetamol apap aspiryna aspiryny ibuprom nurofen
      kapsułka kapsułki kapsułek suplement suplementy suplementów probiotyk probiotyki pastylka pastylki pastylek
    :bandage plaster plastry plastrów plastra opatrunek opatrunki opatrunków bandaż bandaże bandaży maść maści gaza apteczka apteczki apteczek
    :bottle krople kropli kropla spray spraye sprayu
    :thermometer termometr termometry termometru
    :test-tube test testy testów
    :mask maseczka maseczki maseczek maska maski`],
  ['Küche & Haushaltswaren', `
    :pan patelnia patelni patelnie patelnię
    :pot garnek garnka garnki garników garnków garnuszek
    :casserole rondel rondla rondle rondli brytfanna brytfanny brytfannę
    :bowl miska miski misek miskę salaterka salaterki sito sita sitko sitka cedzak durszlak durszlaka durszlaki
    :knife nóż noże noży noża nożyk nożyki
    :wood deska deski desek deskę
    :cutlery sztućce sztućców widelec widelce widelców łyżka łyżki łyżek łyżkę chochla chochle chochli trzepaczka trzepaczki
    :spoon łyżeczka łyżeczki łyżeczek
    :sparkling szklanka szklanki szklanek kieliszek kieliszki kieliszków
    :tea kubek kubki kubka kubków filiżanka filiżanki filiżanek
    :plate talerz talerze talerzy talerza talerzyk talerzyki naczynia naczyń zastawa półmisek półmiski tacka tacki taca
    :foil folia folie folii alufolia woreczek woreczki woreczków
    :paper pergamin pergaminu
    :bread forma formy form blacha blachy blach keksówka
    :pie tortownica tortownice tortownicy
    :cupcake foremka foremki foremek
    :jar słoik słoiki słoików słoika pojemnik pojemniki pojemników pojemnika słoiczek
    :teapot dzbanek dzbanki dzbanka dzbanków termos termosy termosu
    :water butelka butelki butelek butelkę bidon bidony
    :salt solniczka solniczki pieprzniczka młynek młynki
    :can otwieracz otwieracze otwieracza korkociąg korkociągi
    :garlic praska praski
    :potato obieraczka obieraczki tarka tarki tarek tłuczek tłuczki
    :funnel lejek lejki lejków
    :flame grill grille grilla
    :clock waga wagi budzik budziki budzika stoper
    :sandwich lunchbox śniadaniówka śniadaniówki
    :blender blender blendery blendera mikser miksery miksera toster tostery tostera czajnik czajniki czajnika ekspres ekspresy ekspresu robot wyciskarka sokowirówka frytkownica frytkownice mikrofalówka mikrofalówki
    :ice lodówka lodówki lodówkę zamrażarka
    :thread żelazko żelazka żelazek`],
  ['Werkzeug & Baumarkt', `
    :screw wkręt wkręty wkrętów wkrętu śruba śruby śrub śrubę śrubka śrubki śrubek nakrętka nakrętki nakrętek podkładka podkładki podkładek sworzeń sworznie gwint gwinty
    :nail gwóźdź gwoździe gwoździ gwoździa gwoździk gwoździki
    :hook hak haki haków haka wieszak wieszaki wieszaka wieszaków uchwyt uchwyty uchwytów uchwytu zaczep zaczepy zaczepów haczyk haczyki haczyków
    :chain łańcuch łańcuchy łańcucha łańcuchów łańcuszek karabinek karabinki karabinka
    :wrench zawias zawiasy zawiasów klucz klucze kluczy klucza zacisk zaciski zacisków szczypce szczypców obcęgi obcęgów imadło imadła ściski ścisk
    :ruler poziomica poziomice poziomicy suwmiarka suwmiarki
    :tape-measure miarka miarki miarek miara metrówka przymiar
    :tape taśma taśmy taśm taśmę klejąca izolacja izolacji izolacje skotch
    :bottle klej kleje klejów kleju silikon silikony silikonu piana piany uszczelniacz uszczelniacze uszczelniacza szpachla szpachle szpachli szpachlówka tynk tynku
    :palette farba farby farb farbę pędzel pędzle pędzla pędzli wałek wałki walek impregnat impregnatu impregnaty bejca bejcy bejce grunt gruntu grunty rozpuszczalnik rozcieńczalnik terpentyna kolorowanka kolorowanki akwarele akwarel
    :drill wiertło wiertła wierteł wiertarka wiertarki wiertarkę wkrętarka wkrętarki wkrętarkę szlifierka szlifierki szlifierkę lutownica lutownice lutownicy frezarka frezarki kompresor kompresory
    :screwdriver wkrętak wkrętaki wkrętaków śrubokręt śrubokręty śrubokrętów bit bity bitów
    :saw piła piły pił piłę pilarka pilarki wyrzynarka wyrzynarki
    :hammer młotek młotki młotka młotków młot młoty młota gwoździarka
    :ladder drabina drabiny drabin drabinę drabinka drabinki schodek schodki rusztowanie rusztowania
    :toolbox narzędzia narzędzi narzędzie narzędziownik skrzynka skrzynki skrzynek organizer organizery organizera
    :bricks cegła cegły cegieł bloczek bloczki bloczków pustak pustaki pustaków cement cementu zaprawa zaprawy zaprawę beton betonu żwir żwiru piasek piasku kamień kamienie kamieni płytka płytki płytek fuga fugi fug gres
    :tools pilnik pilniki pilnika dłuto dłuta papierścierny papieruściernego papierścierne papieryścierne ścierny ścierne
    :wood drewno drewna drewien sklejka sklejki sklejek mdf osb kantówka kantówki panel panele paneli parkiet parkietu okleina okleiny
    :mousetrap pułapka pułapki pułapek trutka trutki
    :lock zamek zamki zamków zamka kłódka kłódki kłódek kłódkę zasuwa zasuwy zasuw rygiel rygle skobel skoble
    :window uszczelka uszczelki uszczelek uszczelkę okno okna okien szyba szyby szyb okucie okucia okuć drzwi
    :faucet kran krany kranów kranu syfon syfony syfonu perlator perlatory prysznic prysznice prysznica zawór zawory zaworów zaworu wąż węże węży wężyk wężyki
    :flashlight latarka latarki latarek latarkę czołówka czołówki reflektor reflektory reflektora
    :magnet magnes magnesy magnesów magnesu
    :needle nit nity nitów nitownica oczko oczka oczek igła igły igieł igłę agrafka agrafki agrafek
    :thread gurt gurty gurtu sznurowadło sznurowadła sznurowadeł zamekblyskawiczny rzep rzepy rzepów
    :bumper`],
  ['Elektro & Technik', `
    :plug kabel kable kabli kabla kablem przewód przewody przewodów przewodu przedłużacz przedłużacze przedłużacza przedłużaczy wtyczka wtyczki wtyczek wtyczkę zasilacz zasilacze zasilacza adapter adaptery adapterów bezpiecznik bezpieczniki bezpieczników wyłącznik przełącznik
    :outlet gniazdko gniazdka gniazdek gniazdo gniazda rozgałęźnik listwazasilajaca listwyzasilajace listwezasilajaca
    :battery bateria baterie baterii baterią akumulator akumulatory akumulatorów akumulatora akumulatorek akumulatorki powerbank powerbanki ogniwo ogniwa ogniw
    :bulb żarówka żarówki żarówek żarówkę lampa lampy lamp lampę lampka lampki lampek żyrandol żyrandole żyrandolu kinkiet kinkiety oprawka oprawki oprawek ściemniacz led ledy ledów
    :charger ładowarka ładowarki ładowarek ładowarkę usb hdmi
    :phone telefon telefony telefonów telefonu smartfon smartfony smartfona etui obudowa obudowy
    :headphones słuchawki słuchawek słuchawka mikrofon mikrofony
    :speaker głośnik głośniki głośnika głośników soundbar radio radia
    :mouse mysz myszy myszki myszkę myszka klawiatura klawiatury klawiatur
    :laptop laptop laptopy laptopa komputer komputery komputera dysk dyski dysków tablet tablety tableta pendrive kartapamieci kartypamieci
    :tv monitor monitory monitora telewizor telewizory telewizora tv pilot piloty pilota dekoder dekodery projektor
    :fan wentylator wentylatory wentylatora klimatyzator klimatyzatory
    :flame grzejnik grzejniki grzejnika kaloryfer kaloryfery kaloryfera termowentylator gaśnica gaśnice gaśnic
    :thermometer czujnik czujniki czujnika detektor detektory czujka czujki termostat termostaty
    :camera kamera kamery kamer kamerka aparat aparaty aparatu statyw statywy
    :printer drukarka drukarki drukarek drukarkę tusz tonery toner tonera kartridż kartridże
    :router router routery routera antena anteny wifi repeater`],
  ['Papeterie & Büro', `
    :paperclip spinacz spinacze spinaczy spinacza klips klipsy klipsów klamerka klamerki klamerek
    :stapler zszywacz zszywacze zszywacza zszywki zszywka zszywek dziurkacz dziurkacze dziurkacza
    :notebook zeszyt zeszyty zeszytów zeszytu notes notesy notesu notatnik notatniki notatnika blok bloki bloku karteczki karteczek karteczka kalkulator kalkulatory
    :pen długopis długopisy długopisów długopisu ołówek ołówki ołówków ołówka pióro pióra piór flamaster flamastry flamastrów marker markery markerów zakreślacz zakreślacze cienkopis cienkopisy gumka gumki gumek temperówka temperówki temperówek korektor korektory atrament atramentu
    :paper papier papieru papiery papierów kartka kartki kartek ryza ryzy karton kartony kartonów brystol papierprezentowy papieruprezentowego papieryprezentowe
    :folder segregator segregatory segregatora teczka teczki teczek skoroszyt skoroszyty skoroszytu
    :mail znaczek znaczki znaczków koperta koperty kopert kopertę pocztówka pocztówki pocztówek zaproszenie zaproszenia zaproszeń
    :package pudło pudła pudeł pudełko pudełka pudełek paczka paczki paczek paczkę przesyłka przesyłki przesyłek
    :label etykieta etykiety etykiet naklejka naklejki naklejek metka nalepka nalepki
    :crayon kredka kredki kredek kredkę pastele plastelina plasteliny
    :id identyfikator identyfikatory
    :calendar kalendarz kalendarze kalendarza kalendarzy planer planery planera terminarz terminarze
    :scissors nożyczki nożyczek nożyczkach
    :books książka książki książek książkę podręcznik podręczniki podręcznika słownik słowniki komiks komiksy
    :ruler linijka linijki linijek linijkę ekierka ekierki cyrkiel cyrkle cyrkla`],
  ['Wohnen & Deko', `
    :sofa sofa sofy sof kanapa kanapy kanap fotel fotele foteli puf pufy pufów pokrowiec pokrowce pokrowca pokrowców narzuta narzuty mebel meble mebli komoda komody komód szafa szafy szaf szafka szafki szafek
    :laundry półka półki półek regał regały regału regałów kosz kosze koszy kosza koszyk koszyki koszyków koszyka
    :bed łóżko łóżka łóżek materac materace materaca materacy pościel pościeli pościelówka prześcieradło prześcieradła prześcieradeł kołdra kołdry kołdrę kołder
    :chair krzesło krzesła krzeseł stół stoły stołu stołów stolik stoliki stolika biurko biurka biurek taboret taborety ławka ławki ławek
    :pillow poduszka poduszki poduszek poduszkę poszewka poszewki poszewek koc koce koców koca pled pledy pledu szalik szaliki szalika szalików chusta chusty chust
    :window zasłona zasłony zasłon zasłonę firanka firanki firanek firanę roleta rolety rolet rolety żaluzja żaluzje żaluzji
    :vase wazon wazony wazonu wazonów donica donice donic doniczka doniczki doniczek doniczkę kwietnik kwietniki
    :frame ramka ramki ramek ramkę obraz obrazy obrazu obrazów lustro lustra luster plakat plakaty plakatów plakatu zdjęcie zdjęcia zdjęć tablica tablice tablic
    :rug dywan dywany dywanu dywanów dywanik dywaniki dywaników wycieraczka wycieraczki wycieraczek chodnik chodniki mata maty mat matę
    :bath ręcznik ręczniki ręcznika ręczników ręczniku szlafrok szlafroki szlafroka wanna wanny wann kabina kabiny mydelniczka mydelniczki
    :lantern lampion lampiony lampionów latarnia latarnie
    :flower kwiat kwiaty kwiatów kwiatka kwiatek kwiatki kwiatków bukiet bukiety bukietu bukietów tulipan tulipany tulipanów storczyk storczyki
    :xmas-tree choinka choinki choinek choinkę bombka bombki bombek ozdoby ozdób ozdoba ozdobę dekoracja dekoracje dekoracji stroik stroiki wianek wianki
    :gift prezent prezenty prezentów prezentu upominek upominki upominków podarunek wstążka wstążki wstążek
    :balloon balon balony balonów balonik baloniki baloników girlanda girlandy girland konfetti
    :clock zegar zegary zegara zegarów`],
  ['Garten & Pflanzen', `
    :sprout roślina rośliny roślin roślinę sadzonka sadzonki sadzonek nasiona nasion nasionko trawa trawy trawę murawa mech
    :sunflower słonecznik słonecznika słoneczniki
    :rose róża róży róże róż rózę lawenda lawendy hortensja hortensje peonia piwonia piwonie bratek bratki pelargonia pelargonie begonia
    :herbs ziemia ziemi podłoże podłoża torf torfu kora kory korze kompost kompostu nawóz nawozy nawozu nawozów keramzyt keramzytu perlit
    :water konewka konewki konewek konewkę zraszacz zraszacze zraszacza spryskiwacz pompa pompy pomp
    :shovel łopata łopaty łopat łopatę łopatka łopatki szpadel szpadle szpadla grabie grabi motyka motyki motykę sekator sekatory sekatora nożyce nożyc kosiarka kosiarki kosiarkę kosiarek
      podkaszarka podkaszarki siekiera siekiery siekier siekierę taczka taczki taczek widły wideł kielnia kielnie kielni
    :wood opał opału pellet pelety peletu brykiet brykiety brykietu
    :flame węgiel węgla węgli
    :snail ślimak ślimaki ślimaków chwast chwasty chwastów
    :garden-house altana altany altanka leżak leżaki leżaków parasol parasole parasoli hamak hamaki hamaka ogród ogrodu ogrody ogrodzenie ogrodzenia płot płoty płotu szklarnia szklarnie
    :fir świerk świerki świerka jodła jodły jodeł sosna sosny sosen iglak iglaki tuja tuje tui
    :tree drzewo drzewa drzew drzewko drzewka krzew krzewy krzewów krzak krzaki krzaków żywopłot jabłoń jabłonie`],
  ['Tierbedarf', `
    :cat kot koty kota kotu kotów kotem kotek kotki kocia kocie kociej kociego kocimiętka kocimiętki kocimiętkę kuweta kuwety kuwet kuwetę drapak drapaki drapaka drapaków żwirek żwirku żwirki
    :dog pies psy psa psu psów psem piesek pieski smycz smycze smyczy smyczki kaganiec kagańce kagańca gryzak gryzaki gryzaka gryzaków szelki szelek obroża obroże obrożę
    :fish akwarium akwaria akwariów pokarm pokarmu
    :bird ptak ptaki ptaków ptaka karmnik karmniki karmnika papuga papugi papug kanarek kanarki klatka klatki klatek budka budki budek
    :rodent chomik chomiki chomika chomików królik króliki królika królików świnka świnki siano siana trociny trocin gryzoń gryzonie gryzoni szczur szczury szczurów
    :paw karma karmy karm karmę przysmak przysmaki przysmaków przysmaku legowisko legowiska legowisk transporter transportery transportera weterynarz weterynarza zwierzę zwierzęta zwierząt zwierzęcia`],
  ['Kleidung & Textil', `
    :shirt koszulka koszulki koszulek koszula koszule koszul bluzka bluzki bluzek sweter swetry swetrów swetra bluza bluzy bluz bluzę tshirt polo top topy
    :trousers spodnie spodni spodenki spodenek jeansy jeansów dżinsy dżinsów legginsy legginsów dres dresy dresów szorty szortów
    :socks skarpetki skarpetek skarpety skarpet skarpeta rajstopy rajstop podkolanówki
    :underwear majtki majtek bielizna bielizny slipy slipów bokserki bokserek biustonosz biustonosze biustonoszy stanik staniki
    :jacket kurtka kurtki kurtek kurtkę płaszcz płaszcze płaszczy płaszcza marynarka marynarki marynarek kamizelka kamizelki kamizelek parka polar polary polaru puchówka
    :dress sukienka sukienki sukienek sukienkę spódnica spódnice spódnic
    :shoe buty butów buta but obuwie obuwia trampki trampek adidasy adidasów tenisówki sandały sandałów klapki klapek kapcie kapci pantofle pantofli botki botków kozaki kozaków półbuty półbutów
    :cap czapka czapki czapek czapkę kapelusz kapelusze kapeluszy kapelusza beret berety
    :bag torba torby toreb torbę torebka torebki torebek reklamówka reklamówki reklamówek portfel portfele portfela portfeli pasek paski pasków paska walizka walizki walizek walizkę nerka nerki nerek saszetka saszetki kosmetyczka kosmetyczki
    :backpack plecak plecaki plecaków plecaka tornister tornistry tornistra
    :sunglasses okulary okularów okularami
    :thread nić nici nitka nitki włóczka włóczki włóczek materiał materiały materiału tkanina tkaniny tkanin guzik guziki guzików guzika
    :needle szpilka szpilki szpilek
    :watch zegarek zegarki zegarka zegarków
    :swimwear strój stroje strojów kostium kostiumy kostiumów kąpielówki kąpielówek bikini pizama pizamy pizam pizamę piżama piżamy`],
  ['Baby & Kind', `
    :baby-bottle pielucha pieluchy pieluch pieluszka pieluszki pieluszek pampers pampersy pampersów pieluchomajtki smoczek smoczki smoczka smoczków kaszka kaszki
    :teddy zabawka zabawki zabawek zabawkę miś misie misiów maskotka maskotki maskotek pluszak pluszaki klocki klocków klocek klocka lego puzzle puzzli układanka układanki lalka lalki lalek lalkę grzechotka grzechotki
    :baby wózek wózki wózków wózka nosidło nosidła kojec kojce łóżeczko łóżeczka łóżeczek śliniak śliniaki śliniaka śliniaków becik becika niemowlę niemowlak niemowlaki niemowląt
    :kid dziecko dzieci dziecka dziecięcy dziecięca szkoła szkoły szkołę wyprawka wyprawki`],
  ['Sport & Freizeit', `
    :soccer piłka piłki piłek piłkę bramka bramki bramek getry getrów
    :volleyball siatkówka siatkówki koszykówka koszykówki pompka pompki pompek
    :barbell hantle hantli hantel hantla sztanga sztangi sztang joga jogi białko białka
    :run bieżnia bieżnie bieżni
    :swim czepek czepki czepka czepków okularki
    :tent namiot namioty namiotu namiotów śpiwór śpiwory śpiworów śpiwora karimata karimaty
    :ski narty nart narta nartach snowboard kask kaski kaska kasków sanki sanek łyżwy łyżew łyżwa
    :fishing wędka wędki wędek wędkę przynęta przynęty przynęt żyłka żyłki kołowrotek
    :mountain wspinaczka uprząż
    :tennis rakieta rakiety rakiet rakietę paletka paletki paletek piłeczka piłeczki piłeczek badminton lotka lotki lotek pingpong
    :hiking kijki kijek kijków trekking mapa mapy map kompas kompasy kompasu
    :guitar gitara gitary gitar gitarę struny strun struna strunę ukulele flet flety fletu
    :dice kostka kostki kostek karty kart talia talie gra gry gier szachy szachów warcaby domino
    :news gazeta gazety gazet gazetę czasopismo czasopisma czasopism magazyn magazyny magazynu prasa prasy tygodnik tygodniki`],
  ['Auto & Velo', `
    :bike rower rowery rowerów roweru rowerem dętka dętki dętek dzwonek dzwonki dzwonka bagażnik bagażniki bagażnika siodełko siodełka siodło siodła kierownica kierownice kierownicy pedały pedał pedałów hamulec hamulce hamulców smar smary smaru koło koła kół
    :car samochód samochody samochodów samochodu auto auta aut olejsilnikowy olejusilnikowego olejesilnikowe winieta winiety winiet trójkąt trójkąty trójkąta filtr filtry filtra filtrów paliwo paliwa paliw benzyna benzyny fotelik fotelika foteliki
    :tire opona opony opon oponę felga felgi felg
    :ice skrobaczka skrobaczki skrobaczkę odmrażacz odmrażacze odmrażacza
    :parking parking parkingi parkingu
    :scooter hulajnoga hulajnogi hulajnóg hulajnogę rolki wrotki deskorolka deskorolki deskorolkę skuter skutery skutera motocykl motocykle motocykla`],
];

const ENDS = ['ami', 'ach', 'ego', 'ymi', 'ych', 'iej', 'ej', 'ym', 'em', 'om', 'ow', 'ie', 'ek', 'ke', 'ki', 'ku', 'ka', 'ko', 'y', 'i', 'e', 'a', 'u', 'o'];
const RESTORE = ['a', 'o', 'e', 'y', 'i', 'ka', 'ki', 'ek'];
const V = /[aeiouy]/;
// Stems for Polish case endings (input is already diacritic-folded): -ów/-ami/-ach/-om/-y/-i/-e/-a/-u/-ę ... plus fleeting e (ogórków -> ogórek, kabli -> kabel)
function forms(w) {
  const out = new Set();
  for (const e of ENDS) {
    if (!w.endsWith(e) || w.length - e.length < 2) continue;
    const b = w.slice(0, -e.length);
    out.add(b);
    for (const s of RESTORE) out.add(b + s);
    if (b.endsWith('k')) out.add(b.slice(0, -1) + 'ek');
    if (b.length > 3 && !V.test(b[b.length - 1]) && !V.test(b[b.length - 2])) out.add(b.slice(0, -1) + 'e' + b.slice(-1));
  }
  return [...out];
}

const icons = {
  DATA: [...SPEC, ...DATA].map(([c, s]) => [c, s.replace(/\s+/g, ' ').trim()]),
  HEAD: 'first',
  SPLIT: /^(do|na|dla|z|ze|bez|w|we|od|po|przy|pod|nad|oraz|i)$/i,
  MODS: [
    [/^(kot|kota|koty|kotow|kocia|kocie|kocich|pies|psa|psy|psia|psie|psich|ptasi|ptasia|chomik|krolik)$/, 'Tierbedarf'],
    [/^(rowerowy|rowerowa|rowerowe|rowerowych|samochodowy|samochodowa|samochodowe|samochodowych)$/, 'Auto & Velo'],
    [/^(dzieciecy|dzieciece|dzieciecych|dzieciecej|niemowlecy|niemowlece)$/, 'Baby & Kind'],
    [/^(ogrodowy|ogrodowa|ogrodowe|ogrodowych|ogrodowej)$/, 'Garten & Pflanzen'],
  ],
  STORE: {
    budow: 'Werkzeug & Baumarkt', castorama: 'Werkzeug & Baumarkt', leroy: 'Werkzeug & Baumarkt', obi: 'Werkzeug & Baumarkt', bricomarche: 'Werkzeug & Baumarkt',
    drogeri: 'Körperpflege', rossmann: 'Körperpflege', hebe: 'Körperpflege', aptek: 'Apotheke',
    rtv: 'Elektro & Technik', elektro: 'Elektro & Technik', 'media': 'Elektro & Technik',
    zoolog: 'Tierbedarf', zwierz: 'Tierbedarf', papier: 'Papeterie & Büro', ogrod: 'Garten & Pflanzen',
    sport: 'Sport & Freizeit', decathlon: 'Sport & Freizeit', rower: 'Auto & Velo', motoryz: 'Auto & Velo',
    ikea: 'Wohnen & Deko', mebl: 'Wohnen & Deko', odzie: 'Kleidung & Textil', ubran: 'Kleidung & Textil', smyk: 'Baby & Kind', dzie: 'Baby & Kind',
    piekar: 'Brot & Gebäck', mies: 'Fleisch & Fisch', rzezni: 'Fleisch & Fisch', monopol: 'Getränke', napoj: 'Getränke',
  },
  forms,
};

export default { parser, icons };
