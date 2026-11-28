// French language pack (France, Switzerland/Romandie, Belgium): spoken-sentence parser rules + head-initial icon keywords.
// Design notes for icons: HEAD 'first'; "de/du/des/à/au/aux/en" are NOT split words, so hyphenated compounds
// ("pommes-de-terre", "brosse-à-dents", "colliers-de-serrage") match as one keyword when the whole name equals them.
// Ambiguous generic heads (papier, brosse, crème, sac, boîte, pot, bouteille, collier, carte, fil, pâte) are deliberately
// not keyed on their own so the complement decides ("brosse à dents" -> dents, "papier de toilette" -> toilette).

const B = "(?<![\\p{L}\\p{N}])", E = "(?![\\p{L}\\p{N}])";
const W = s => new RegExp(`${B}(?:${s})${E}`, "giu");
// intent phrase that may be followed by de / du / des / d' (swallowed)
const WD = s => new RegExp(`${B}(?:${s})(?:\\s+(?:(?:des|du|de)(?![\\p{L}\\p{N}])|d['’])\\s*|(?![\\p{L}\\p{N}]))`, "giu");

// ------------------------------------------------------------------ parser
const UNIT_MAP = {
  kilogrammes: ["kg"], kilogramme: ["kg"], kilos: ["kg"], kilo: ["kg"], kg: ["kg"],
  grammes: ["g"], gramme: ["g"], gr: ["g"], g: ["g"],
  litres: ["l"], litre: ["l"], l: ["l"],
  décilitres: ["dl"], décilitre: ["dl"], decilitres: ["dl"], decilitre: ["dl"], dl: ["dl"],
  centilitres: ["cl"], centilitre: ["cl"], cl: ["cl"],
  millilitres: ["ml"], millilitre: ["ml"], ml: ["ml"],
  pièces: ["pce"], pièce: ["pce"], pieces: ["pce"], piece: ["pce"], pces: ["pce"], pce: ["pce"],
  paquets: ["paquet", "paquets"], paquet: ["paquet", "paquets"],
  sachets: ["sachet", "sachets"], sachet: ["sachet", "sachets"],
  boîtes: ["boîte", "boîtes"], boîte: ["boîte", "boîtes"], boites: ["boîte", "boîtes"], boite: ["boîte", "boîtes"],
  bouteilles: ["bouteille", "bouteilles"], bouteille: ["bouteille", "bouteilles"],
  bottes: ["botte", "bottes"], botte: ["botte", "bottes"],
  rouleaux: ["rouleau", "rouleaux"], rouleau: ["rouleau", "rouleaux"],
  mètres: ["m"], mètre: ["m"], metres: ["m"], metre: ["m"], m: ["m"],
  douzaines: ["douzaine", "douzaines"], douzaine: ["douzaine", "douzaines"],
  barquettes: ["barquette", "barquettes"], barquette: ["barquette", "barquettes"],
  briques: ["brique", "briques"], brique: ["brique", "briques"],
  tranches: ["tranche", "tranches"], tranche: ["tranche", "tranches"],
  packs: ["pack", "packs"], pack: ["pack", "packs"],
};
// "boîte à outils" / "boîte aux lettres" are items, not a unit
const U = "bo[iî]tes?(?!\\s+(?:à|aux?|de\\s+(?:rangement|vitesse))(?![\\p{L}\\p{N}]))|" +
  Object.keys(UNIT_MAP).filter(k => !/^bo[iî]te/.test(k)).sort((a, b) => b.length - a.length).join("|");

const NW = {
  un: 1, une: 1, deux: 2, trois: 3, quatre: 4, cinq: 5, six: 6, sept: 7, huit: 8, neuf: 9, dix: 10, onze: 11, douze: 12,
  treize: 13, quatorze: 14, quinze: 15, seize: 16, "dix-sept": 17, "dix-huit": 18, "dix-neuf": 19, vingt: 20,
  trente: 30, quarante: 40, cinquante: 50, soixante: 60, septante: 70, huitante: 80, octante: 80, nonante: 90, cent: 100,
};
const NUMW = "dix-neuf|dix-huit|dix-sept|soixante|quarante|cinquante|septante|huitante|octante|nonante|quatorze|quinze|treize|trente|douze|seize|onze|vingt|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|cent";

const PHRASES = [
  // "demi-litre" -> "demi litre"
  new RegExp("(?<=demi)-(?=\\s*(?:litre|kilo|kg|gramme|livre|dl|cl|ml|l)s?(?![\\p{L}]))", "giu"),
  // j'ai besoin de / on a besoin de / nous avons besoin des
  WD("(?:(?:j['’]|je\\s+|on\\s+|nous\\s+|tu\\s+|vous\\s+|il\\s+|elle\\s+)?(?:ai|a|as|avons|avez|aurais|aurait|aurions|aurez|avoir)\\s+(?:encore\\s+|aussi\\s+|vraiment\\s+|bien\\s+|également\\s+)?besoin)"),
  // il (nous) faut / il manque
  WD("il\\s+(?:(?:me|nous|te|vous|lui|leur)\\s+)?(?:faut|faudrait|faudra|manque|manquerait|manquent)"),
  WD("(?:nous|me)\\s+manque(?:nt)?"),
  WD("(?:on|nous|je)\\s+manqu(?:e|ons)"),
  // n'oublie pas (de) / ne pas oublier
  WD("n['’]oubli(?:e|ez|ons)\\s+pas|ne\\s+(?:me\\s+)?laisse\\s+pas\\s+oublier|ne\\s+pas\\s+oublier|ne\\s+oublie\\s+pas"),
  // pense à / pensez à
  WD("pens(?:e|ez|er|ons)\\s+(?:bien\\s+)?(?:à|a)(?:\\s+(?:acheter|prendre|ramener|rapporter|mettre|ajouter))?"),
  WD("rappelle(?:z)?(?:-|\\s+)(?:moi|nous)"),
  // mets sur la liste / ajoute à la liste de courses
  W("(?:(?:mets?|mettre|mettez|ajoute|ajouter|ajoutez|inscris|inscrire|note|noter|notez|rajoute|rajouter|écris|écrire)\\s+(?:(?:ça|ceci|cela|le|la|les|en\\s+plus)\\s+)?)?(?:sur|dans|à|en)\\s+(?:la|ma|notre|une|cette|ta|votre)\\s+(?:liste\\s+de\\s+courses|liste\\s+des\\s+courses|liste\\s+d['’]achats|liste|courses)"),
  W("(?:à|a)\\s+(?:acheter|prendre|ramener|rapporter|commander|récupérer|chercher|racheter|renouveler)"),
  W("(?:est|sont|était)\\s+(?:presque\\s+|bientôt\\s+|déjà\\s+)?(?:fini|finie|finis|finies|vide|vides|épuisé|épuisée|épuisés|épuisées|terminé|terminée|terminés|terminées|périmé|périmée|périmés|périmées|cassé|cassée|cassés|cassées|usé|usée|usés|usées)"),
  // on n'a plus (de) / il n'y a plus / il ne reste plus
  WD("(?:(?:je|on|nous|il|elle|tu|vous)\\s+)?n['’](?:y\\s+en\\s+a|y\\s+a|ai|a|avons|avez|as)\\s+(?:presque\\s+plus|plus\\s+beaucoup|plus\\s+assez|pas\\s+assez|plus)"),
  WD("il\\s+ne\\s+(?:nous\\s+|me\\s+)?reste\\s+(?:presque\\s+plus|plus\\s+beaucoup|plus)"),
  WD("(?:on|nous|je)\\s+(?:est|sommes|suis)\\s+(?:à|a)\\s+court"),
  WD("(?:aller|va|vas|allez)\\s+(?:me\\s+|nous\\s+)?(?:chercher|acheter|prendre)"),
  W("(?:peux|pourrais|pouvez|pourriez|veux|voulez|voudrais|voudriez)(?:-|\\s+)(?:tu|vous)(?:\\s+(?:me|nous))?"),
  W("s['’]il\\s+(?:te|vous)\\s+pla[iî]t|stp|svp|merci"),
  W("pour\\s+(?:moi|nous\\s+deux|nous\\s+tous|nous|toi|vous)"),
];

const TOKENS = new RegExp(`${B}(?:(?:j|m|t|s|c|qu|n)['’]|(?:` + [
  "je", "tu", "il", "elle", "on", "nous", "vous", "ils", "elles", "me", "te", "moi", "toi",
  "ai", "as", "avons", "avez", "ont",
  "dois", "doit", "devons", "devez", "devrais", "devrait", "devrions", "devriez",
  "veux", "veut", "voulons", "voulez", "voudrais", "voudrait", "voudrions", "voudriez",
  "peux", "peut", "pouvons", "pouvez", "pourrais", "pourrait", "pourrions", "pourriez",
  "faut", "faudrait", "faudra", "aimerais", "aimerait", "aimerions", "aimeriez",
  "achète", "achètes", "achetons", "achetez", "acheter", "acheté", "achetée", "achetés", "achetées", "racheter", "rachète",
  "prends", "prend", "prenons", "prenez", "prendre", "prendrais", "pris",
  "ramène", "ramènes", "ramenons", "ramenez", "ramener", "rapporte", "rapportes", "rapportons", "rapportez", "rapporter",
  "apporte", "apportes", "apporter", "amène", "amener", "récupère", "récupérer", "récupérez", "chercher", "cherche",
  "commande", "commander", "commandons", "ajoute", "ajoutes", "ajoutons", "ajoutez", "ajouter", "rajoute", "rajouter",
  "mets", "mettre", "mettez", "met", "mettons", "inscris", "inscrire", "note", "notes", "noter", "notez", "écris", "écrire",
  "besoin", "aussi", "encore", "également", "déjà", "juste", "simplement", "vraiment", "bien", "alors", "donc",
  "ben", "bah", "euh", "heu", "hum", "ok", "okay", "voilà", "hé", "hey", "salut", "bonjour", "hello", "svp", "stp", "ça", "ceci", "cela",
].join("|") + `)${E})`, "giu");

const STOP = ["la", "le", "les", "un", "une", "des", "du", "de", "d", "l", "au", "aux", "et", "ou", "avec", "pour", "à", "sur", "dans", "en", "ce", "ces", "cette",
  "quelques", "plusieurs", "chez", "sans", "ça", "aussi", "encore", "plus", "pas", "ne", "n", "y", "peu"];

const LEAD = new RegExp("^(?:(?:quelques|plusieurs|un\\s+peu\\s+(?:de|du|des)|un\\s+peu|encore\\s+(?:du|de|des)|de\\s+la|du|des|de|la|le|les|un|une|au|aux|ces|ce|cet|cette|mes|mon|ma|notre|nos|fraîche|fraîches|nouveau|nouvelle|nouveaux|nouvelles)" +
  "(?![\\p{L}\\p{N}])|(?:de\\s+l|d|l|qu)['’])\\s*", "giu");

const CONJ = "et\\s+(?:ensuite|puis|après|aussi|encore|également|enfin|en\\s+plus)|et|ensuite|puis|après|ainsi\\s+que|en\\s+plus|enfin";

const PURPOSE = new RegExp(`${B}(?:pour|afin\\s+de|destiné(?:e|s|es)?\\s+(?:à|aux?))\\s+(?:(?:les|le|la|des|du|de\\s+la|un|une|mes|mon|ma|nos|notre|ses|son|sa)\\s+|(?:de\\s+l|d|l)['’]\\s*)?`, "iu");

const parser = {
  UNIT_MAP, U, NW, NUMW, PHRASES, TOKENS, STOP, LEAD, CONJ, PURPOSE, FOR: "pour ",
  PRE: "(?:(?:de\\s+chez|chez|à\\s+la|au|à|dans\\s+(?:la|le)|dans)\\s+|à\\s+l['’]\\s*|de\\s+l['’]\\s*)?",
  HALF: "(?:(?:un|une)\\s+)?demie?",
  ONE_UNIT: "un|une", TRAIL: "à|de|du|pour", TRAIL2: "aussi|encore|également|en\\s+plus|de\\s+plus", DEC: ",", CAP: true,
};

// ------------------------------------------------------------------ icons
const K = "Küche & Haushaltswaren", W_ = "Werkzeug & Baumarkt", EL = "Elektro & Technik", PB = "Papeterie & Büro", TB = "Tierbedarf",
  FG = "Früchte & Gemüse", BG = "Brot & Gebäck", MK = "Milch & Käse", FF = "Fleisch & Fisch", VO = "Vorräte", TK = "Tiefkühl", GE = "Getränke",
  SN = "Snacks & Süsses", HH = "Haushalt", KP = "Körperpflege", AP = "Apotheke", WD_ = "Wohnen & Deko", GP = "Garten & Pflanzen",
  KT = "Kleidung & Textil", BK = "Baby & Kind", SP = "Sport & Freizeit", AV = "Auto & Velo";

const DATA = [
  // ---- priority specifics (compounds and head nouns that must win over generic entries)
  [K, `:lid couvercle couvercles couvre-casserole couvre-plat
       :splash couvercle-anti-éclaboussures écran-anti-éclaboussures anti-éclaboussures pare-éclaboussures protège-éclaboussures éclaboussures`],
  [W_, `:net filet filets
        :cable-tie collier-de-serrage colliers-de-serrage collier-serflex colliers-serflex serflex rilsan collier-rilsan colliers-rilsan serre-câble serre-câbles attache-câble attaches-câbles collier-plastique colliers-plastique serrage
        :rod tringle tringles tringle-à-rideau tringles-à-rideau tringle-à-rideaux tringles-à-rideaux tringle-à-linge tringle-de-douche barre barres tube tubes tige tiges tige-filetée tiges-filetées profilé profilés
        :dowel cheville chevilles cheville-à-expansion chevilles-à-expansion cheville-molly cheville-plastique chevilles-plastique tourillon tourillons goujon goujons fischer
        :bumper patin patins patin-feutre patins-feutre patin-en-caoutchouc patins-en-caoutchouc patin-adhésif patins-adhésifs protège-meuble protège-meubles embout embouts butoir butoirs butée butées butée-de-porte cale-porte pied-en-caoutchouc pieds-en-caoutchouc capuchon capuchons plot plots
        :connector raccord raccords raccord-rapide raccords-rapides manchon manchons jonction jonctions connecteur connecteurs coude coudes réducteur réducteurs équerre équerres cornière cornières
        :bungee sandow sandows tendeur tendeurs tendeur-élastique tendeurs-élastiques élastique-de-fixation sangle-élastique araignée
        :duct tuyau tuyaux tuyau-flexible tuyaux-flexibles tube-annelé gaine gaines conduit conduits`],
  [EL, `:duct goulotte goulottes goulotte-électrique goulottes-électriques moulure-électrique gaine-électrique gaine-icta cache-câble cache-câbles passe-câble passe-câbles
        :cable-tie clip-câble clips-câble support-de-câble supports-de-câble`],
  [HH, `:broom pelle-à-poussière pelle-à-balayer`],
  [PB, `:stapler agrafeuse agrafeuses agrafe agrafes :ruler règle règles :label étiquette étiquettes étiquette-adhésive`],
  [FF, `:chicken filet-de-poulet filets-de-poulet :fish filet-de-poisson filets-de-poisson filet-de-saumon filets-de-saumon filet-de-cabillaud filet-de-perche filets-de-perche
        :meat filet-de-boeuf filet-de-bœuf filet-de-porc filet-mignon filet-de-veau filet-de-dinde`],
  [FG, `:potato pomme-de-terre pommes-de-terre :sweet-potato patate-douce patates-douces`],
  [AV, `:car huile-moteur huile-de-moteur`],
  [KP, `:toothbrush brosse-à-dents brosses-à-dents brosse-à-dent fil-dentaire`],
  [HH, `:toilet-paper papier-toilette papiers-toilette papier-wc papier-hygiénique papier-de-toilette papier-ménage papier-de-ménage papier-cuisine papier-absorbant sopalin essuie-tout rouleaux-de-ménage serviettes-en-papier serviette-en-papier
        :trash sac-poubelle sacs-poubelle sac-à-ordures sacs-à-ordures sac-à-déchets sacs-à-déchets sac-taxé sacs-taxés sac-poubelle-taxé sacs-taxe
        :bottle liquide-vaisselle produit-vaisselle produit-ménager
        :sponge lave-vaisselle tablettes-lave-vaisselle pastilles-lave-vaisselle lingette lingettes`],
  [PB, `:paper papier-a4 papier-imprimante papier-machine papier-calque papier-kraft papier-crépon papier-à-lettres :mail carte-postale cartes-postales carte-de-vœux carte-de-voeux cartes-de-voeux :folder chemise-plastique chemises-plastique pochette-plastique pochettes-plastique`],
  [WD_, `:gift papier-cadeau ruban-cadeau emballage-cadeau carte-cadeau :window rideau-de-douche rideaux-de-douche :frame cadre-photo cadres-photo`],
  [K, `:cake moule-à-gâteau moules-à-gâteau moule-à-cake moules-à-cake :pie moule-à-tarte moules-à-tarte moule-à-manqué moule-à-charnière :cupcake moule-à-muffins moules-à-muffins :bread moule-à-pain
       :pot pot-à-lait`],
  [W_, `:toolbox boîte-à-outils boîtes-à-outils caisse-à-outils trousse-à-outils servante-d'atelier :can boîte-de-conserve boîtes-de-conserve :mail boîte-aux-lettres boîtes-aux-lettres`],
  [GP, `:vase pot-de-fleurs pots-de-fleurs pot-à-fleurs pots-à-fleurs cache-pot :water tuyau-d'arrosage tuyaux-d'arrosage`],
  [SP, `:fishing canne-à-pêche cannes-à-pêche :backpack sac-à-dos sacs-à-dos`],
  [KT, `:bag sac-à-main sacs-à-main sac-de-courses sacs-de-courses sac-plastique sacs-plastique sac-de-sport`],
  [SP, `:tent sac-de-couchage sacs-de-couchage`],
  [TB, `:cat litière litière-pour-chat arbre-à-chat griffoir herbe-à-chat croquettes-pour-chat pâtée-pour-chat :dog croquettes-pour-chien pâtée-pour-chien laisse laisses os-à-mâcher sac-à-crottes sacs-à-crottes`],
  [KP, `:bottle crème-solaire crème-mains crème-pour-les-mains crème-visage crème-hydratante crème-de-jour crème-de-nuit crème-nourrissante après-soleil lait-solaire lait-corporel gel-douche gel-coiffant gel-à-raser`],
  [MK, `:milk crème-fraîche crème-liquide crème-épaisse crème-entière crème-double crème-fouettée crème-à-fouetter crème-à-café`],
  [BK, `:baby-bottle lingettes-bébé lingettes-pour-bébé`],
  [VO, `:chocolate pâte-à-tartiner :can concentré-de-tomates sauce-tomate sauce-soja`],

  // ---- fruits & légumes
  [FG, `:apple pomme granny golden gala fruit fruits
        :banana banane plantain
        :orange orange mandarine clémentine clementine pamplemousse pomelo agrume agrumes satsuma
        :lemon citron citron-vert lime limette
        :grapes raisin raisins
        :strawberry fraise fraises
        :berries myrtille framboise mûre mure cassis groseille baie baies cranberry canneberge fruits-rouges
        :pear poire
        :peach pêche peche nectarine abricot prune pruneau mirabelle reine-claude brugnon
        :cherry cerise griotte
        :melon melon
        :watermelon pastèque pasteque
        :mango mangue papaye litchi grenade figue kaki goyave fruit-de-la-passion
        :pineapple ananas
        :kiwi kiwi
        :avocado avocat
        :tomato tomate tomates-cerises tomate-cerise
        :cucumber concombre cornichon courgette
        :carrot carotte légume légumes
        :potato patate courge potiron potimarron citrouille butternut radis navet betterave panais rutabaga topinambour céleri-rave
        :sweet-potato batate
        :onion oignon échalote echalote oignon-rouge oignons-nouveaux
        :garlic ail
        :lettuce salade laitue roquette épinard epinard mâche mache céleri celeri poireau fenouil blette chou chou-rouge chou-blanc chou-chinois chou-frisé chou-rave cresson endive frisée batavia scarole
        :broccoli brocoli chou-fleur romanesco
        :pepper poivron
        :chili piment piment-rouge cayenne
        :eggplant aubergine
        :mushroom champignon cèpe cepe girolle morille pleurote shiitake
        :corn maïs épi-de-maïs
        :ginger gingembre curcuma
        :herbs basilic persil coriandre aneth menthe romarin thym sauge origan estragon laurier herbes herbes-aromatiques ciboulette
        :beans petits-pois pois haricot haricots-verts haricot-vert asperge asperges edamame fève feve`],
  [BG, `:bread pain pain-complet pain-blanc pain-de-mie pain-toast toast pain-noir pain-gris pain-paysan pain-aux-céréales pain-au-levain tresse tresse-au-beurre miche
        :baguette baguette petit-pain petits-pains flûte bâtard bürli
        :croissant croissant pain-au-chocolat chocolatine pain-aux-raisins viennoiserie viennoiseries brioche chausson gipfeli
        :pretzel bretzel
        :bagel bagel
        :flatbread pita naan tortilla wrap galette-de-blé
        :pancakes crêpe crepe gaufre pancake blini
        :cake gâteau gateau cake forêt-noire
        :cupcake muffin cupcake madeleine financier macaron
        :donut beignet donut
        :pie tarte quiche tourte feuilleté
        :bread chapelure panure`],
  [MK, `:milk lait lait-entier lait-écrémé lait-demi-écrémé lait-d'avoine lait-de-soja lait-d'amande lait-de-coco lait-en-poudre chantilly
        :butter beurre margarine
        :cheese fromage gruyère gruyere emmental emmentaler parmesan mozzarella feta raclette fondue vacherin comté comte brie camembert roquefort chèvre chevre ricotta mascarpone cheddar gouda edam appenzeller tête-de-moine gorgonzola reblochon munster maroilles cantal tomme boursin philadelphia babybel halloumi burrata
        :egg oeuf œuf
        :yogurt yaourt yoghourt yogourt yogurt skyr kéfir kefir séré sere fromage-blanc faisselle petit-suisse fromage-frais
        :pudding pudding flan crème-dessert danette riz-au-lait`],
  [FF, `:chicken poulet blanc-de-poulet cuisse-de-poulet escalope-de-poulet dinde canard poule volaille pintade
        :meat viande viande-hachée haché steak bœuf boeuf porc veau agneau escalope côtelette cotelette entrecôte entrecote rôti roti gigot ragoût ragout émincé emince burger hamburger côte travers bavette rumsteck onglet carpaccio tartare foie jarret paleron
        :bacon lard lardons bacon poitrine
        :sausage saucisse saucisson merguez chipolata cervelas cervelat knacki wienerli boudin chorizo andouille
        :ham jambon jambon-cru jambon-blanc speck salami charcuterie mortadelle viande-séchée viande-des-grisons bresaola pancetta rosette
        :fish poisson saumon truite thon cabillaud colin merlu sole dorade lieu perche sardine maquereau hareng anchois flétan lotte églefin aiglefin tilapia panga bâtonnets-de-poisson poisson-pané
        :shrimp crevette gambas scampi homard langouste langoustine calamar
        :oyster moules huître huitre coquille-saint-jacques saint-jacques coquillage poulpe`],
  [VO, `:pasta pâtes pates spaghetti penne fusilli tagliatelle lasagne macaroni coquillettes nouilles tortellini ravioli farfalle gnocchi vermicelle cannelloni linguine rigatoni spätzli spätzle
        :rice riz risotto couscous quinoa boulgour polenta semoule millet
        :can conserve conserves sauce sauces ketchup moutarde mayonnaise bouillon coulis passata pelati
        :salt sel sel-fin gros-sel fleur-de-sel épices épice poivre
        :chili paprika curry cannelle cumin muscade noix-de-muscade safran clou-de-girofle harissa tabasco wasabi
        :olive huile huile-d'olive huile-de-colza huile-de-tournesol huile-d'arachide olive olives
        :bowl flocons-d'avoine flocons müesli muesli céréales corn-flakes cornflakes granola porridge avoine soupe potage velouté
        :grain farine farine-complète fécule maïzena maizena amidon
        :candy sucre sucre-glace sucre-en-poudre sucre-vanillé cassonade sucre-roux édulcorant
        :honey miel sirop sirop-d'érable sirop-d'agave
        :strawberry confiture gelée marmelade
        :jar compote
        :nuts beurre-de-cacahuète beurre-de-cacahuètes noix noisette amande cacahuète cacahuete pistache noix-de-cajou cajou pignon noix-de-coco coco pécan fruits-secs raisin-sec dattes
        :chocolate nutella
        :bottle vinaigre vinaigre-balsamique balsamique
        :legumes lentille lentilles pois-chiche pois-chiches haricots-rouges haricots-blancs légumineuses soja
        :cupcake levure levure-chimique vanille arôme extrait-de-vanille`],
  [TK, `:pizza pizza :fries frites frites-surgelées :icecream glace crème-glacée sorbet esquimau cornet-de-glace :ice surgelé surgelés congelé glaçons glaçon légumes-surgelés fruits-surgelés`],
  [GE, `:water eau eau-minérale eau-gazeuse eau-plate eau-pétillante eau-du-robinet henniez valser evian
        :soda coca coca-cola cola fanta sprite limonade ice-tea schweppes orangina boisson boisson-gazeuse soda red-bull redbull boisson-énergisante monster
        :juice jus jus-d'orange jus-de-pomme jus-de-fruits multivitamines nectar smoothie
        :tea thé the infusion tisane thé-vert thé-noir camomille rooibos earl-grey
        :teapot sachet-de-thé théière
        :coffee café cafe expresso espresso capsules capsule nespresso cappuccino café-moulu café-en-grains décaféiné nescafé
        :beer bière biere ale lager panaché radler
        :wine vin vin-rouge vin-blanc
        :sparkling prosecco champagne crémant mousseux cava spumante
        :spirits whisky gin vodka rhum tequila liqueur eau-de-vie schnaps calvados cognac pastis apéritif aperol digestif kirsch grappa
        :cocktail cocktail
        :milk cacao chocolat-chaud chocolat-en-poudre ovomaltine ovo`],
  [SN, `:chocolate chocolat barre barre-chocolatée tablette-de-chocolat praliné pralinés truffe chocolat-noir chocolat-au-lait kinder snickers mars twix toblerone lindt
        :cookie biscuit cookie cookies petit-beurre oreo gaufrette spéculoos biscuit-apéritif
        :popcorn chips popcorn pop-corn nachos
        :candy bonbon caramel gommes chewing-gum dragées réglisse carambar haribo
        :cracker cracker gressins biscotte
        :pudding dessert mousse
        :lollipop sucette guimauve
        :pie barre-de-céréales barre-de-fruits`],
  [HH, `:tissue mouchoir mouchoirs mouchoirs-en-papier kleenex tempo
        :sponge éponge éponges lavette microfibre chiffon chiffon-microfibre
        :bottle nettoyant désinfectant spray-nettoyant détartrant dégraissant javel eau-de-javel produit-wc anticalcaire nettoyant-vitres produit-vitres
        :laundry lessive adoucissant assouplissant détachant lessive-liquide poudre-à-laver détergent
        :broom serpillière panosse balai balayette aspirateur sac-d'aspirateur vadrouille
        :trash poubelle ordures déchets
        :flame allumettes allume-feu briquet
        :bucket seau seaux
        :gloves gants-de-ménage gants-en-caoutchouc gants-jetables gants-vaisselle
        :candle bougie bougies bougie-parfumée chauffe-plat
        :bug insecticide antimite anti-mite anti-fourmis piège-à-mouches
        :bottle désodorisant spray-d'ambiance
        :laundry panier-à-linge séchoir étendoir pince-à-linge pinces-à-linge cintre cintres fer-à-repasser table-à-repasser`],
  [KP, `:toothbrush dentifrice pâte-dentifrice bain-de-bouche dents cure-dents brossette
        :bottle shampoing shampooing après-shampoing douche savon-liquide déodorant déo lotion huile-de-massage laque baume bain-moussant parfum eau-de-toilette eau-de-parfum eau-de-cologne après-rasage solaire
        :soap savon savonnette
        :razor rasoir lame-de-rasoir lames-de-rasoir mousse-à-raser rasage épilation cire-dépilatoire crème-dépilatoire
        :toilet-paper coton cotons cotons-tiges coton-tige cotons-démaquillants tampons serviettes-hygiéniques protège-slips
        :nail-polish vernis vernis-à-ongles dissolvant lime-à-ongles coupe-ongles
        :lipstick rouge-à-lèvres mascara maquillage fond-de-teint démaquillant eye-liner crayon-à-lèvres baume-à-lèvres
        :comb peigne brosse-à-cheveux cheveux élastiques-à-cheveux barrette pince-à-cheveux
        :fan sèche-cheveux
        :bath sels-de-bain gant-de-toilette`],
  [AP, `:pill comprimés comprimé médicament médicaments paracétamol paracetamol ibuprofène ibuprofene dafalgan aspirine vitamine vitamines magnésium zinc collagène antidouleur antidouleurs pastilles pastilles-pour-la-gorge probiotique complément-alimentaire compléments-alimentaires pilule antibiotique antihistaminique
        :bandage pansement pansements bande bandage compresse compresses sparadrap élastoplast pommade onguent
        :bottle spray-nasal solution-saline gel-hydroalcoolique gel-désinfectant collyre gouttes gouttes-pour-les-yeux éosine bétadine arnica
        :thermometer thermomètre tensiomètre
        :honey sirop-contre-la-toux sirop-pour-la-toux
        :tissue rhume grippe
        :test-tube test-covid test-de-grossesse autotest
        :mask masque masque-chirurgical
        :mosquito anti-moustique anti-moustiques moustique répulsif anti-tiques après-piqûre`],
  [K, `:pan poêle poêle-à-frire wok crêpière sauteuse
       :pot casserole marmite faitout cocotte autocuiseur cocotte-minute
       :casserole plat-à-gratin plat-à-four gratin
       :bowl passoire saladier bol jatte
       :knife couteau planche-à-découper couteau-de-cuisine couteau-à-pain aiguiseur
       :cutlery couverts fourchette cuillère cuillere louche spatule fouet écumoire cuillère-en-bois
       :spoon cuillère-à-café petite-cuillère cuillère-à-soupe
       :sparkling verre verres verre-à-vin coupe
       :tea tasse mug
       :plate assiette assiettes plat-de-service plateau ramequin vaisselle
       :toilet-paper film-alimentaire film-étirable film-plastique
       :foil papier-alu papier-aluminium papier-d'aluminium aluminium alu feuille-d'aluminium
       :paper papier-cuisson papier-sulfurisé papier-de-cuisson
       :jar bocal bocaux bocal-de-conservation boîte-hermétique tupperware boîte-de-conservation boîte-alimentaire pot-à-épices
       :ice bac-à-glaçons
       :yogurt gourde carafe cruche thermos
       :salt salière poivrière moulin-à-poivre moulin-à-sel
       :can ouvre-boîte ouvre-boîtes tire-bouchon décapsuleur ouvre-bouteille
       :garlic presse-ail
       :potato presse-purée écrase-purée râpe éplucheur épluche-légumes
       :funnel entonnoir verre-doseur doseur mesure
       :flame barbecue gril pince-à-grillade allume-gaz
       :gloves manique maniques gant-de-cuisine gant-de-four
       :laundry torchon
       :rice cuiseur-à-riz
       :soda paille pailles
       :clock balance-de-cuisine minuteur
       :sandwich lunchbox boîte-à-lunch porte-pain panière
       :blender mixeur blender robot-de-cuisine robot grille-pain toaster bouilloire cafetière machine-à-café batteur
       :cookie emporte-pièce emporte-pièces
       :wood planche-en-bois livre-de-cuisine`],
  [W_, `:screw vis visserie boulon boulons écrou écrous rondelle rondelles tire-fond
        :hook crochet crochets patère patères crochet-adhésif crochets-adhésifs crochet-autocollant anneau-à-vis
        :chain chaîne chaînes mousqueton mousquetons maillon
        :rope corde cordes cordon cordelette ficelle filin sangle sangles sangle-d'arrimage sangles-d'arrimage élingue
        :tape ruban-adhésif scotch adhésif adhésif-double-face double-face ruban-isolant chatterton gaffer ruban-de-masquage masquage colle colle-forte pistolet-à-colle velcro ruban
        :nail clou clous pointe pointes
        :tape-measure mètre mètre-ruban mètre-pliant niveau niveau-à-bulle
        :drill perceuse foret forets mèche mèches visseuse perceuse-visseuse meuleuse
        :wrench clé clef clé-à-molette clé-plate clé-anglaise pince pince-multiprise pince-coupante tenaille charnière charnières
        :bottle silicone colle-à-bois colle-blanche mastic joint acrylique enduit plâtre ragréage diluant white-spirit décapant
        :palette peinture lasure pinceau rouleau-à-peinture rouleau-de-peinture bâche bâche-de-protection
        :screwdriver tournevis tournevis-cruciforme embout-de-visseuse
        :saw scie scie-à-métaux scie-sauteuse égoïne scie-circulaire
        :hammer marteau maillet massette
        :ladder échelle escabeau marchepied
        :toolbox outils outil mallette
        :bricks brique ciment mortier béton parpaing carrelage carreau joint-de-carrelage sable gravier
        :tools papier-de-verre papier-abrasif abrasif ponceuse ciseau-à-bois burin ciseau étau serre-joint
        :mousetrap piège-à-souris souricière
        :lock serrure verrou cadenas cylindre antivol
        :window joint-de-fenêtre bande-d'étanchéité mousse-isolante calfeutrage
        :faucet robinet siphon joint-de-robinet mitigeur pomme-de-douche flexible-de-douche flexible douchette bonde
        :flashlight lampe-de-poche lampe-torche lampe-frontale frontale torche
        :magnet aimant aimants
        :needle œillet oeillet rivet rivets
        :wood bois planche planches latte lattes poutre contreplaqué mdf osb panneau tasseau tasseaux moulure plinthe plinthes lambris`],
  [EL, `:outlet prise prises prise-électrique prise-de-courant multiprise multiprises barrette-multiprise barrette-de-prises
        :plug câble câbles rallonge fiche adaptateur adaptateur-de-voyage
        :battery pile piles batterie batteries accumulateur powerbank pile-bouton
        :bulb ampoule ampoules lampe lampadaire luminaire guirlande-lumineuse guirlande-led led ruban-led veilleuse néon spot
        :charger chargeur câble-usb usb usb-c câble-hdmi hdmi câble-ethernet
        :phone téléphone portable natel smartphone coque coque-de-téléphone protège-écran
        :headphones casque écouteurs écouteur enceinte haut-parleur airpods
        :mouse souris clavier
        :laptop ordinateur ordinateur-portable disque-dur carte-mémoire clé-usb carte-sd tablette-tactile
        :flashlight interrupteur variateur minuterie programmateur
        :tv télévision télé téléviseur télécommande écran
        :fan ventilateur radiateur chauffage-d'appoint
        :thermometer détecteur-de-fumée détecteur-de-mouvement capteur
        :camera caméra appareil-photo webcam
        :printer imprimante cartouche cartouche-d'encre cartouches toner
        :router routeur wifi répéteur antenne box
        :speaker radio réveil radio-réveil`],
  [PB, `:paperclip trombone trombones pince-à-papier
        :notebook cahier carnet bloc bloc-notes carnet-de-notes post-it post-its mémo
        :pen stylo stylos stylo-bille crayon crayons feutre feutres surligneur marqueur gomme taille-crayon correcteur encre stylo-plume roller bic
        :paper feuille feuilles a4 carton cartons
        :folder classeur classeurs pochette trieur dossier intercalaire intercalaires
        :mail timbre timbres enveloppe enveloppes courrier faire-part invitation
        :package colis autocollant autocollants sticker stickers carton-d'emballage
        :crayon crayons-de-couleur gouache aquarelle pastel craie
        :id plastifieuse
        :calendar calendrier agenda planning
        :scissors ciseaux perforateur
        :books livre livres roman bd`],
  [WD_, `:sofa canapé canape fauteuil housse-de-canapé housse meuble meubles pouf tabouret table-basse commode
        :bed lit matelas sommier drap drap-housse draps parure-de-lit housse-de-couette couette duvet
        :chair chaise chaises table bureau
        :pillow coussin coussins oreiller plaid couverture couverture-polaire
        :window rideau rideaux voilage store stores anneaux-de-rideau rail-à-rideau volet
        :candle porte-bougie bougeoir photophore chandelier
        :vase vase
        :frame cadre cadres miroir tableau affiche poster
        :rug tapis paillasson tapis-de-bain tapis-de-sol descente-de-lit
        :bath serviette serviettes serviette-de-bain linge drap-de-bain essuie-mains
        :laundry panier corbeille étagère rangement boîte-de-rangement coffre
        :lantern lanterne
        :flower fleur fleurs bouquet fleur-artificielle
        :xmas-tree sapin sapin-de-noël décoration-de-noël boules-de-noël guirlande déco décoration couronne-de-l'avent
        :gift cadeau cadeaux
        :balloon ballon ballons ballon-de-baudruche
        :clock horloge pendule`],
  [GP, `:sprout plante plantes plant plants semis graines graine
        :sunflower tournesol
        :rose rose roses tulipe orchidée orchidee
        :herbs terre terreau engrais compost tourbe paillis
        :water arrosoir arrosage
        :gloves gants-de-jardinage
        :shovel pelle pioche râteau rateau bêche beche binette sécateur tondeuse cisaille taille-haie
        :wood bois-de-chauffage charbon-de-bois charbon allume-barbecue
        :snail anti-limaces désherbant
        :garden-house chaise-de-jardin parasol salon-de-jardin
        :tree arbre arbuste`],
  [TB, `:cat chat chats
        :dog chien chiens
        :fish nourriture-pour-poissons aquarium
        :bird graines-pour-oiseaux nichoir mangeoire cage-à-oiseaux
        :rodent hamster cochon-d'inde foin litière-pour-rongeurs
        :paw croquettes pâtée friandises gamelle anti-puces antiparasitaire vermifuge caisse-de-transport nourriture-pour-animaux`],
  [KT, `:shirt t-shirt tee-shirt chemise pull pullover sweat sweat-shirt gilet polo débardeur haut blouse chemisier
        :trousers pantalon jean jeans jogging legging short bermuda
        :socks chaussette chaussettes collants
        :underwear slip culotte caleçon boxer soutien-gorge sous-vêtements sous-vêtement lingerie
        :jacket veste manteau blouson imperméable doudoune parka cape coupe-vent
        :dress robe jupe combinaison
        :shoe chaussure chaussures basket baskets bottes sandales pantoufles chaussons tongs ballerines souliers
        :cap bonnet casquette chapeau
        :gloves gants moufles
        :pillow écharpe foulard châle
        :bag sacoche cabas cornet cornets pochette valise besace
        :sunglasses lunettes lunettes-de-soleil lunettes-de-vue
        :thread aiguille fil-à-coudre fil-de-couture tissu bouton fermeture-éclair
        :watch montre bracelet
        :swimwear maillot-de-bain bikini pyjama pyjamas`],
  [BK, `:baby-bottle couche couches couches-culottes lait-infantile lait-bébé biberon biberons tétine petits-pots
        :teddy jouet jouets peluche doudou puzzle lego duplo jeu jeux jeu-de-société jeux-de-société playmobil poupée
        :palette coloriage pâte-à-modeler peinture-à-doigts bricolage
        :baby bébé poussette lange langes bavoir gigoteuse
        :kid enfant cartable`],
  [SP, `:soccer football ballon-de-foot ballon-de-football
        :volleyball ballon-de-volley pompe-à-ballon
        :barbell haltère haltères tapis-de-yoga yoga fitness poids
        :run chaussures-de-course chaussures-de-sport maillot
        :swim bonnet-de-bain lunettes-de-natation
        :tent tente matelas-gonflable camping réchaud
        :ski ski skis casque-de-ski snowboard
        :mountain corde-d'escalade escalade magnésie
        :tennis raquette tennis ping-pong badminton volant
        :hiking chaussures-de-randonnée randonnée bâton-de-marche bâtons-de-marche
        :guitar guitare cordes-de-guitare
        :dice jeu-de-cartes cartes-à-jouer
        :news journal journaux magazine revue`],
  [AV, `:bike vélo velo vélos bicyclette chambre-à-air kit-de-réparation pompe-à-vélo casque-de-vélo lumière-de-vélo dérailleur huile-de-chaîne
        :car voiture auto essuie-glace essuie-glaces antigel lave-glace vignette triangle-de-signalisation tapis-de-voiture
        :tire pneu jante
        :battery câble-de-démarrage
        :ice grattoir
        :parking disque-de-stationnement
        :scooter trottinette scooter
        :bottle produit-lave-glace lustrant`],
];

const icons = {
  HEAD: "first",
  SPLIT: /^(pour|avec|sans|contre|sur|dans|chez|et|&)$/i,
  MODS: [
    [/^(chats?|chiens?|oiseaux?|rongeurs?|lapins?|animaux|animal|aquarium)$/, TB],
    [/^(velos?|voitures?|autos?|motos?|vtt)$/, AV],
    [/^(bebes?|enfants?)$/, BK],
    [/^jardin$/, GP],
  ],
  STORE: {
    pharmacie: AP, droguerie: KP, parfumerie: KP, quincaillerie: W_, bricolage: W_, brico: W_, "magasin de bricolage": W_, "magasin de bois": W_,
    boulangerie: BG, "boulangerie-pâtisserie": BG, pâtisserie: BG, patisserie: BG, boucherie: FF, charcuterie: FF, poissonnerie: FF, traiteur: FF,
    jardinerie: GP, animalerie: TB, papeterie: PB, librairie: PB, électro: EL, electro: EL, électroménager: EL, informatique: EL, "magasin d'électronique": EL,
    vêtements: KT, vetements: KT, habits: KT, mode: KT, sport: SP, sports: SP, vélo: AV, velo: AV, garage: AV,
    décoration: WD_, deco: WD_, meubles: WD_, boissons: GE, "marchand de vin": GE, cave: GE, jouets: BK, puériculture: BK,
    fromagerie: MK, crémerie: MK, laiterie: MK, primeur: FG, marché: FG, "marché de légumes": FG, surgelés: TK, cuisine: K, vaisselle: K,
  },
  forms: w => {
    const o = [];
    if (w.length > 3) {
      if (w.endsWith("aux")) o.push(w.slice(0, -3) + "al");
      if (w.endsWith("s") || w.endsWith("x")) o.push(w.slice(0, -1));
    }
    return o;
  },
  DATA: DATA.map(([c, s]) => [c, s.replace(/\s+/g, " ").trim()]),
};

export default { parser, icons };
