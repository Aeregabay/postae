// Dutch language pack (Netherlands + Flemish/Belgian vocabulary in one pack). See lang/README.md.
const parser = {
  UNIT_MAP: {
    kilogram: ['kg'], kilo: ['kg'], kilos: ['kg'], kg: ['kg'], gram: ['g'], gr: ['g'], g: ['g'], pond: ['pond'],
    liter: ['l'], liters: ['l'], l: ['l'], deciliter: ['dl'], dl: ['dl'], centiliter: ['cl'], cl: ['cl'], milliliter: ['ml'], ml: ['ml'],
    stuk: ['st'], stuks: ['st'], stukken: ['st'], st: ['st'],
    pak: ['pak', 'pakken'], pakken: ['pak', 'pakken'], pakje: ['pakje', 'pakjes'], pakjes: ['pakje', 'pakjes'],
    blik: ['blik', 'blikken'], blikken: ['blik', 'blikken'], blikje: ['blikje', 'blikjes'], blikjes: ['blikje', 'blikjes'],
    fles: ['fles', 'flessen'], flessen: ['fles', 'flessen'], flesje: ['flesje', 'flesjes'], flesjes: ['flesje', 'flesjes'],
    bos: ['bos', 'bossen'], bossen: ['bos', 'bossen'], bosje: ['bosje', 'bosjes'], bosjes: ['bosje', 'bosjes'],
    rol: ['rol', 'rollen'], rollen: ['rol', 'rollen'], rolletje: ['rolletje', 'rolletjes'], rolletjes: ['rolletje', 'rolletjes'],
    meter: ['m'], meters: ['m'], m: ['m'], cm: ['cm'], mm: ['mm'],
    doos: ['doos', 'dozen'], dozen: ['doos', 'dozen'], doosje: ['doosje', 'doosjes'], doosjes: ['doosje', 'doosjes'],
    zak: ['zak', 'zakken'], zakken: ['zak', 'zakken'], zakje: ['zakje', 'zakjes'], zakjes: ['zakje', 'zakjes'],
    pot: ['pot', 'potten'], potten: ['pot', 'potten'], potje: ['potje', 'potjes'], potjes: ['potje', 'potjes'],
    krop: ['krop', 'kroppen'], kroppen: ['krop', 'kroppen'], bakje: ['bakje', 'bakjes'], bakjes: ['bakje', 'bakjes'],
    tros: ['tros', 'trossen'], trossen: ['tros', 'trossen'], plak: ['plak', 'plakken'], plakken: ['plak', 'plakken'],
  },
  NW: { een: 1, 'één': 1, twee: 2, drie: 3, vier: 4, vijf: 5, zes: 6, zeven: 7, acht: 8, negen: 9, tien: 10, elf: 11, twaalf: 12 },
  PHRASES: [
    "(?:op|aan|in)\\s+(?:de|het|mijn|onze|ons|die)\\s+(?:(?:boodschappen|winkel)\\s*)?(?:lijstje|lijst|lijsten)",
    "vergeet(?:\\s+(?:alsjeblieft|alstublieft|asjeblieft|aub))?(?:\\s+niet)?(?:\\s+om)?",
    "niet\\s+vergeten",
    "denk(?:\\s+(?:er|eraan))?(?:\\s+(?:ook|alsjeblieft|aub))*(?:\\s+aan)?",
    "(?:is|zijn)\\s+(?:bijna\\s+|helemaal\\s+)?(?:op|leeg|uitverkocht)",
    "(?:een\\s+)?(?:klein\\s+)?beetje",
    "te\\s+(?:koop|kopen|halen|bestellen|regelen)",
  ],
  TOKENS: "ik|wij|we|jij|je|jullie|u|men|ons|mij|me|er|hebben|heb|hebt|heeft|had|hadden|nodig|moet|moeten|moest|moesten|zou|zouden|zal|zullen|" +
    "wil|willen|wilt|wilde|wou|kan|kun|kunt|kunnen|mag|mogen|koop|koopt|kopen|haal|haalt|halen|ophalen|neem|neemt|nemen|meenemen|" +
    "bestel|bestelt|bestellen|bijkopen|inkopen|ga|gaan|voeg|voegen|toevoegen|toe|erbij|zet|zetten|schrijf|schrijven|noteer|noteren|opschrijven|doe|doen|" +
    "alsjeblieft|alsjeblief|alstublieft|asjeblieft|aub|graag|even|maar|gewoon|dus|eens|toch|wel|zeker|vooral|echt|nou|nu|ja|ok|oke|oké|hoi|hallo|hey|" +
    "euh|uh|uhm|ehm|eh|hm|hmm|ook|nog|dan|wat|geen|niet|meer|bijna|ongeveer|circa|ca",
  STOP: ['de', 'het', 'een', 'één', 'van', 'voor', 'en', 'of', 'met', 'op', 'in', 'aan', 'te', 'niet', 'geen', 'meer', 'nog', 'ook', 'wat', 'paar',
    'enkele', 'verse', 'vers', 'zo', 'die', 'dat', 'deze', 'dit', 'mijn', 'onze', 'ons', 'er', 'is', 'zijn', 'ik', 'we', 'wij'],
  LEAD: "een\\s+paar|paar|een|één|de|het|['’]t|enkele|verse|vers|nieuwe|nieuw|extra|van\\s+(?:de|het|dat|die|deze)|van|dat|die|deze|dit|mijn|onze|ons|zo['’]n|zo\\s+een",
  CONJ: "en\\s+dan|en\\s+nog|en\\s+ook|en\\s+verder|en|dan|daarna|verder|bovendien|plus|alsook|evenals",
  PURPOSE: "(?<![\\p{L}\\p{N}])voor\\s+(?:(?:op|in|aan|bij)\\s+)?(?:(?:de|het|een|mijn|onze|ons|dat|die|deze|dit)\\s+)?",
  FOR: 'voor ',
  PRE: "(?:(?:bij\\s+de|bij\\s+het|bij\\s+['’]t|bij\\s+een|bij|van\\s+de|van\\s+het|van|in\\s+de|in\\s+het|in|naar\\s+de|naar\\s+het|naar|uit\\s+de|uit|op\\s+de|op)\\s+)?",
  HALF: "(?:een\\s+)?(?:halve|halfje|half)",
  ONE_UNIT: 'een|één',
  TRAIL: 'bij|erbij|toe|mee|op|aan|te',
  TRAIL2: 'meer|erbij|extra|ook',
  DEC: ',',
  CAP: true,
};

// ---- icons ----
// Specific head nouns first (first definition of a keyword wins).
const SPEC = [
  ['Küche & Haushaltswaren', `:lid pannendeksel pannendeksels potdeksel potdeksels deksel deksels glasdeksel kookdeksel :splash spatscherm spatschermen spatscherm-pan`],
  ['Tierbedarf', `:net kattennet kattennetten kattenbalkonnet balkonnet balkonnetten kattengaas beschermnet kattenhor`],
  ['Werkzeug & Baumarkt', `:net net netten gaas schermgaas vogelnet vogelnetten klimnet plantennet afdeknet insectengaas vliegengaas vliegenhor
    :cable-tie kabelbinder kabelbinders tiewrap tiewraps tie-wrap tie-raps tyrap tyraps wirebinder bundelbandje klittenband klittenbandje
    :bungee snelbinder snelbinders spanband spanbanden spanrubber spanrubbers elastiek elastieken elastiekje bagage-elastiek spanriem spanriemen ratelband ratelbanden sjorband sjorbanden sjorriem sjorriemen
    :rod stang stangen paal palen buis buizen buisje pijp pijpen roede roedes rondhout staaf staven profiel profielen aluminiumprofiel hoekprofiel hoekprofielen telescoopstang telescoopstangen douchestang kledingstang kapstokstang gordijnroede gordijnroedes gordijnstang gordijnstangen
    :connector koppelstuk koppelstukken koppeling koppelingen verbindingsstuk verbindingsstukken verbinder verbinders hoekverbinder hoekverbinders hoekstuk hoekstukken t-stuk t-stukken bochtstuk bochtstukken mof moffen kruisstuk verloopstuk verloopstukken buisverbinder buisverbinders buiskoppeling buiskoppelingen verbindingsklem buisklem buisklemmen
    :dowel plug pluggen muurplug muurpluggen spreidplug spreidpluggen gipsplaatplug nylonplug
    :bumper rubberenvoetjes rubberenvoetje rubbervoetjes rubbervoetje voetje voetjes meubelvoetjes meubelvoetje viltjes viltglijders meubelglijders glijders doppen dop rubberdoppen rubberdop eindkap eindkappen buisdop buisdoppen deurstopper deurstoppers deurbuffer buffer buffers stootrubber hoekbeschermers noppen rubbernoppen stelvoet stelvoeten antislipdoppen bumpers`],
  ['Elektro & Technik', `:duct kabelgoot kabelgoten kabelgeul kabelkoker kabelkokers kabelkanaal kabelkanalen leidingkoker leidingkokers`],
  ['Papeterie & Büro', `:ruler liniaal linialen geodriehoek :label etiket etiketten stickers sticker labels labeltjes naamstickers :stapler nietmachine nietjesmachine hechter perforator`],
];

const DATA = [
  ['Früchte & Gemüse', `
    :apple appel appels appeltje appeltjes elstar jonagold granny-smith goudreinet
    :banana banaan bananen
    :orange sinaasappel sinaasappelen sinaasappels mandarijn mandarijnen clementine clementines grapefruit pompelmoes pomelo satsuma
    :lemon citroen citroenen limoen limoenen
    :grapes druif druiven
    :strawberry aardbei aardbeien
    :berries bosbes bosbessen framboos frambozen braam bramen rode-bessen cranberry cranberries kruisbes aalbes
    :pear peer peren conference
    :peach perzik perziken nectarine nectarines abrikoos abrikozen pruim pruimen
    :cherry kers kersen
    :melon meloen meloenen galiameloen
    :watermelon watermeloen watermeloenen
    :mango mango mangos papaja
    :pineapple ananas
    :kiwi kiwi kiwis
    :avocado avocado avocados
    :tomato tomaat tomaten trostomaten cherrytomaten cherrytomaat tomaatjes snoeptomaten vleestomaat vleestomaten
    :cucumber komkommer komkommers courgette courgettes
    :carrot wortel wortelen wortels peen penen winterpeen worteltjes
    :potato aardappel aardappelen aardappels piepers pieper krieltjes kriel pompoen pompoenen radijs radijsjes rammenas pastinaak knolselderij schorseneer schorseneren rapen raap
    :sweet-potato zoete-aardappel zoete-aardappelen bataat bataten
    :onion ui uien sjalot sjalotten lente-ui lenteui lenteuien bosui bosuien rode-ui rode-uien
    :garlic knoflook knoflooktenen knoflookteen look
    :lettuce sla ijsbergsla kropsla veldsla rucola spinazie andijvie witlof prei bleekselderij selderij venkel snijbiet boerenkool spruitjes spruiten rodekool rode-kool witte-kool savooiekool spitskool chinese-kool koolrabi kool paksoi pak-choi little-gem
    :broccoli broccoli bloemkool romanesco
    :pepper paprika paprikas puntpaprika rode-paprika
    :chili chilipeper chilipepers pepertje pepertjes rode-peper jalapeno
    :eggplant aubergine aubergines
    :mushroom champignon champignons paddenstoel paddenstoelen cantharel cantharellen shiitake oesterzwam
    :corn mais maiskolf maiskolven suikermais
    :ginger gember
    :herbs basilicum peterselie bieslook koriander dille munt rozemarijn tijm salie oregano kruiden verse-kruiden bladpeterselie
    :beans boon bonen sperziebonen sperzieboon snijbonen doperwten doperwt erwten peultjes suikerbonen tuinbonen asperge asperges edamame
    :potato biet bieten rode-biet rode-bieten`],
  ['Brot & Gebäck', `
    :bread brood broden volkorenbrood witbrood bruinbrood sandwichbrood meergranenbrood speltbrood desembrood boerenbrood toastbrood casinobrood paneermeel rozijnenbrood krentenbrood beschuit beschuiten ontbijtkoek boterhammen boterham
    :baguette stokbrood stokbroodje baguette baguettes pistolet pistolets broodje broodjes kadetje kadetjes bolletje bolletjes puntjes waterbroodje ciabatta focaccia
    :croissant croissant croissants kroissant chocoladebroodje koffiekoek koffiekoeken suisse
    :pretzel pretzel krakeling krakelingen
    :bagel bagel bagels
    :flatbread pita wrap wraps tortilla tortillas naan turks-brood
    :pancakes pannenkoek pannenkoeken poffertjes wafel wafels
    :cake taart taartje gebak gebakje appeltaart slagroomtaart cake tompouce soes soesjes eclair vlaai
    :cupcake muffin muffins cupcake cupcakes
    :donut donut donuts oliebol oliebollen appelbeignet beignet
    :cookie koek koekje koekjes speculaas speculoos gevulde-koek
    :pie appelflap appelflappen worstenbroodje saucijzenbroodje`],
  ['Milch & Käse', `
    :milk melk volle-melk halfvolle-melk magere-melk karnemelk havermelk sojamelk amandelmelk rijstmelk chocolademelk room kookroom slagroom koffiemelk condensmelk haverdrank haverdrink sojadrank amandeldrank cacao
    :butter boter roomboter margarine halvarine bakboter ghee
    :cheese kaas kazen jonge-kaas oude-kaas belegen-kaas geitenkaas schapenkaas boerenkaas gouda goudse edammer leerdammer maasdammer emmentaler mozzarella parmezaan parmezaanse-kaas feta brie camembert ricotta mascarpone roomkaas smeerkaas cottage-cheese geraspte-kaas kaasplakken raclette blauwe-kaas gorgonzola halloumi kruidenkaas komijnekaas pecorino grana-padano passendale herve
    :egg ei eieren eitje eitjes scharreleieren
    :yogurt yoghurt yogurt kwark vla vlaflip drinkyoghurt skyr kefir griekse-yoghurt
    :pudding pudding puddingen rijstepap rijstebrij griesmeelpap mousse tiramisu`],
  ['Fleisch & Fisch', `
    :chicken kip kippen kippenbouten kippenbout kipfilet kippendij kippendijen kippenpoot kippenvleugels hele-kip kalkoen kalkoenfilet eend gevogelte kippenborst kipdij haantje
    :meat vlees rundvlees varkensvlees kalfsvlees lamsvlees schapenvlees gehakt rundergehakt halfomhalf gehaktbal gehaktballen hamburger hamburgers burger burgers biefstuk biefstukken steak entrecote ossenhaas rosbief stoofvlees riblappen runderlappen hachee shoarma kebab speklapjes karbonade karbonades schnitzel schnitzels varkenshaas procureur fricandeau slavink slavinken boulets boulet stoverij vol-au-vent
    :bacon spek spekjes spekblokjes ontbijtspek rookspek bacon pancetta
    :sausage worst worsten rookworst rookworsten braadworst braadworsten saucijs saucijzen chipolata merguez knakworst frankfurter cervela
    :ham ham hammetjes gekookte-ham achterham beenham ardense-ham boerenham beleg vleeswaren salami leverworst pastrami chorizo filet-americain pate smeerworst rookvlees
    :fish vis vissen zalm zalmfilet forel tonijn kabeljauw kibbeling schol tong heek pangasius makreel haring paling zeebaars tilapia gerookte-zalm rolmops ansjovis stokvis
    :shrimp garnaal garnalen scampi gamba gambas
    :oyster mossel mosselen oester oesters kreeft krab sint-jakobsschelp`],
  ['Vorräte', `
    :pasta spaghetti pasta macaroni penne fusilli tagliatelle lasagne lasagnebladen vermicelli noedels mie mienoedels bami nasi noodles cannelloni tortellini gnocchi farfalle rigatoni
    :rice rijst basmatirijst langkorrelrijst risotto couscous quinoa bulgur polenta
    :can tomatenpuree tomatensaus passata ketchup mosterd mayonaise bouillon bouillonblokjes bouillonblokje saus sauzen pastasaus tomatenblokjes conserven konserven blik blikken blikje blikjes augurken zuurkool piccalilly sambal ketjap soep soepen tomatensoep kippensoep instantsoep ravioli sardines sardientjes pindasaus sojasaus satesaus currysaus kokosmelk kokoscreme
    :salt zout zeezout specerijen kruidenmix
    :chili peper zwarte-peper chilipoeder cayennepeper paprikapoeder kerrie kerriepoeder kaneel nootmuskaat komijn kurkuma kruidnagel kardemom laurierblad
    :olive olijfolie olie zonnebloemolie arachideolie koolzaadolie bakolie braadolie kokosolie olijven olijf
    :bowl havermout cornflakes muesli granola ontbijtgranen havervlokken cruesli choco-pops pap
    :grain bloem tarwebloem zelfrijzend-bakmeel bakmeel maizena maiszetmeel griesmeel gries zetmeel rijstmeel speltmeel volkorenmeel
    :candy suiker basterdsuiker poedersuiker kristalsuiker rietsuiker
    :chocolate hagelslag vlokken chocoladevlokken muisjes chocoladepasta chocopasta
    :honey honing stroop appelstroop ahornsiroop siroop agavesiroop suikerstroop
    :strawberry jam confituur confituren marmelade aardbeienjam abrikozenjam vruchtenspread
    :nuts pindakaas notenpasta hazelnootpasta speculoospasta speculaaspasta noten amandelen pinda pindas walnoten hazelnoten cashewnoten pistachenoten pistache rozijnen krenten gedroogde-vruchten studentenhaver pecannoten paranoten zonnebloempitten pompoenpitten pitten lijnzaad chiazaad sesamzaad
    :yogurt azijn balsamico appelazijn wijnazijn
    :legumes linzen kikkererwten witte-bonen bruine-bonen kidneybonen kapucijners
    :cupcake bakpoeder gist vanillesuiker vanille puddingpoeder`],
  ['Tiefkühl', `
    :pizza diepvriespizza pizza pizzas
    :fries friet frites frieten patat patatjes aardappelkroketten kroketten oven-frites rosti
    :icecream ijs roomijs waterijs ijsje ijsjes ijsco magnum cornetto softijs sorbet ijstaart
    :ice diepvries diepvriesgroente diepvriesspinazie diepvriesmaaltijd ijsblokjes ijsklontjes kant-en-klaarmaaltijd
    :dumpling loempia loempias bitterballen bitterbal frikandel kaassouffle nasischijf nuggets kipnuggets
    :shrimp diepvriesvis vissticks visstick`],
  ['Getränke', `
    :water water bronwater mineraalwater spuitwater plat-water bruiswater chaudfontaine
    :soda cola frisdrank limonade sinas fanta sprite fristi ranja icetea ice-tea energiedrank redbull tonic bitter-lemon ginger-ale radler
    :juice sap vruchtensap sinaasappelsap appelsap multivruchtensap ananassap tomatensap grapefruitsap smoothie cranberrysap verse-jus appelsientje
    :tea thee groene-thee zwarte-thee kruidenthee muntthee rooibos earl-grey ijsthee
    :teapot theezakjes theezakje theebladeren
    :coffee koffie espresso koffiecups koffiecapsules capsules nespresso senseo koffiepads koffiepad koffiebonen gemalen-koffie oploskoffie filterkoffie cappuccino latte
    :beer bier bieren pils pilsje witbier tripel dubbel kriek duvel jupiler stella leffe hoegaarden grolsch heineken amstel bavaria alcoholvrij-bier speciaalbier
    :wine wijn rode-wijn witte-wijn rose rosewijn huiswijn port sherry
    :sparkling prosecco champagne cava mousserend bubbels
    :spirits whisky gin wodka rum jenever cognac likeur advocaat brandewijn amaretto baileys tequila
    :cocktail cocktail aperol limoncello
    :milk chocomel drinkchocolade
    :bubble-tea bubbeltee`],
  ['Snacks & Süsses', `
    :chocolate chocolade chocolaatje chocoladereep reep repen tonys-chocolonely bonbons bonbon pralines praline chocoladeletter mueslireep energiereep fruitreep
    :cookie stroopwafel stroopwafels biscuit biscuits koeken oreos
    :nuts nootjes borrelnootjes gezouten-noten borrelnoten
    :popcorn chips popcorn paprikachips zoutjes tortillachips nachos pringles
    :candy snoep snoepjes drop dropjes winegums winegum gummibeertjes kauwgom kauwgum toffees toffee haribo zuurtjes pepermunt pepermuntjes tictac fruitgum
    :cracker crackers toastjes melba rijstwafel rijstwafels knackebrod
    :pudding dessert nagerecht
    :lollipop lolly lollys lollies marshmallow marshmallows`],
  ['Haushalt', `
    :toilet-paper wc-papier toiletpapier wc-rol keukenrol keukenrollen keukenpapier huishoudpapier servetten servet
    :sponge spons sponzen schuurspons sponsje afwasspons schuursponsjes vaatwastabletten vaatwastablet vaatwasblokjes vaatwasmiddel
    :bottle afwasmiddel schoonmaakmiddel luchtverfrisser geurverfrisser wc-blok wc-blokjes toiletblokjes
    :laundry wasmiddel wasverzachter waspoeder wascapsules was vlekkenverwijderaar
    :soap allesreiniger schoonmaakazijn ontkalker badkamerreiniger toiletreiniger wc-reiniger wc-eend glasreiniger vloerreiniger schoonmaakspray ontvetter keukenreiniger sanitairreiniger chloor bleekmiddel javel schuurmiddel microvezeldoek microvezeldoekjes
    :trash vuilniszak vuilniszakken pedaalemmerzakken afvalzak afvalzakken zwarte-zakken pmd-zakken pmd restafval vuilnisbak prullenbak afvalbak
    :broom bezem stoffer stofzuiger stofzuigerzakken stofzuigerzak dweil dweilen mop vloerwisser raamtrekker plumeau
    :flame lucifers luciferdoosje aansteker aanmakers aanmaakblokjes bbq-aanstekers
    :bucket emmer emmers dweilemmer teil
    :gloves afwashandschoenen huishoudhandschoenen rubberen-handschoenen
    :bug insectenspray muggenspray mottenballen vliegenmepper insecticide mierenlokdoos lokdoos`],
  ['Körperpflege', `
    :toothbrush tandpasta tandenborstel tandenborstels tandzijde mondwater tandenstokers floss elektrische-tandenborstel opzetborstels
    :bottle shampoo douchegel doucheschuim deodorant deo bodylotion lotion handcreme gezichtscreme dagcreme nachtcreme creme zonnebrand zonnebrandcreme haargel haarlak conditioner haarspoeling lichaamslotion bodymilk aftersun massageolie badolie badschuim parfum eau-de-toilette eau-de-parfum
    :soap zeep handzeep zeepje vloeibare-zeep zeepdispenser
    :razor scheermesje scheermesjes scheerapparaat scheerschuim scheergel aftershave
    :tissue zakdoekjes papieren-zakdoekjes tissues kleenex
    :toilet-paper wattenstaafjes wattenstaafje wattenschijfjes watten maandverband tampons tampon inlegkruisjes inlegkruisje
    :nail-polish nagellak nagelvijl nagelschaartje nagelknipper nagelknippers nagellakremover
    :lipstick lippenstift mascara make-up foundation oogschaduw eyeliner lipgloss lippenbalsem afschminken afschminkdoekjes micellair-water
    :comb kam haarborstel haarelastiekjes haarelastiek haarband speldjes haarspeld haarspelden scrunchie`],
  ['Apotheke', `
    :pill paracetamol ibuprofen dafalgan aspirine pijnstillers pijnstiller tabletten tablet vitamines vitamine multivitamine magnesium voedingssupplement supplement hoestdrank keelpastilles keeltabletten antihistaminicum hooikoorts medicijn medicijnen medicatie recept zinktabletten ijzertabletten probiotica
    :bandage pleister pleisters verband zwachtel zalf wondzalf brandzalf zinkzalf compressen
    :bottle ontsmettingsmiddel desinfectiemiddel alcohol jodium handgel handalcohol oogdruppels oordruppels druppels neusspray
    :thermometer thermometer koortsthermometer bloeddrukmeter
    :honey hoestsiroop
    :test-tube coronatest zwangerschapstest zelftest
    :mask mondkapje mondmasker
    :mosquito muggenstift anti-muggen tekentang tekenpincet`],
  ['Küche & Haushaltswaren', `
    :pan pan pannen koekenpan braadpan grillpan wok wokpan crepepan
    :pot kookpot soeppan steelpan steelpannen sauspan snelkookpan kookpan
    :casserole braadslede ovenschaal ovenschotel stoofpan cocotte
    :bowl schaal schaaltje schaaltjes kom kommen mengkom saladekom soepkom vergiet zeef
    :knife mes messen keukenmes broodmes snijplank snijplanken koksmes schilmesje pizzames
    :cutlery bestek vork vorken lepel lepels pollepel soeplepel spatel garde klopper handmixer
    :spoon theelepel eetlepel lepeltje koffielepel
    :sparkling glas glazen wijnglas wijnglazen drinkglas drinkglazen champagneglas bierglas bierglazen waterglas
    :tea kopje kopjes mok mokken koffiekopje theekopje
    :plate bord borden diep-bord dessertbord serviesgoed servies schotel
    :toilet-paper plasticfolie vershoudfolie huishoudfolie
    :foil aluminiumfolie alufolie bakfolie
    :paper bakpapier vetvrij-papier
    :bread bakblik bakvorm bakplaat bakblikken taartvorm cakevorm broodblik
    :pie springvorm taartplaat
    :cupcake muffinvorm koekjesvorm uitsteekvormpjes uitsteekvormen
    :jar bewaardoos bewaardoosjes voorraadpot voorraadbus voorraadpotten weckpot weckpotten inmaakpot glazen-pot jampot
    :ice ijsblokjesvorm frigo ijskast koelkast diepvriezer vriezer
    :yogurt drinkfles thermosfles waterfles karaf kan theepot koffiekan thermoskan
    :salt zoutvaatje peperpot peper-en-zoutstel pepermolen zoutmolen kruidenmolen
    :can blikopener flesopener kurkentrekker opener
    :garlic knoflookpers
    :potato aardappelstamper stamper dunschiller schiller rasp kaasrasp
    :funnel trechter maatbeker maatbekers maatlepel
    :flame bbq barbecue grill grilltang tang
    :gloves pannenlappen pannenlap ovenhandschoen ovenhandschoenen ovenwanten
    :laundry theedoek theedoeken keukendoek vaatdoek vaatdoekjes afwasborstel afwaskwast afwasteil afdruiprek afdruipmat afwasrek droogrek wasmachine wasdroger droogkast
    :rice rijstkoker
    :soda rietje rietjes
    :clock keukenweegschaal weegschaal kookwekker eierwekker
    :sandwich broodtrommel broodtrommeltje lunchbox boterhamdoos broodtrommels
    :blender mixer staafmixer blender broodrooster toaster waterkoker koffiezetapparaat koffiemachine melkopschuimer keukenmachine airfryer heteluchtfriteuse frituurpan friteuse magnetron oven slowcooker sapcentrifuge juicer vaatwasser
    :wood houten-lepel kookboek
    :teapot theekan keukengerei`],
  ['Werkzeug & Baumarkt', `
    :screw schroef schroeven schroefje schroefjes bout bouten moer moeren sluitring sluitringen houtschroef houtschroeven spaanplaatschroef spaanplaatschroeven tapbout draadeind draadstang schroefdraad
    :nail spijker spijkers nagel nagels draadnagel klinknagel klinknagels popnagels nietjes
    :hook haak haken haakje haakjes kapstok kapstokhaak kapstokhaken ophanghaakjes plakhaakjes schroefhaak schroefhaken schroefoog oogbout scharnier scharnieren
    :chain ketting kettingen schakel karabijnhaak karabijnhaken s-haak
    :rope touw touwen koord koorden nylontouw sisaltouw trekkoord paracord waslijn spandraad staaldraad
    :tape plakband tape afplaktape schilderstape isolatietape ducttape duct-tape gaffa gaffatape dubbelzijdig-plakband dubbelzijdige-tape montagetape tesa verpakkingstape pakbandtape afplakband washitape textieltape reparatietape
    :tape-measure rolmaat meetlint duimstok duimstokken meetlat lasermeter
    :drill boor boren boormachine boormachines accuboormachine schroefmachine slagboormachine steenboor houtboor metaalboor boorset bitset bitjes
    :saw zaag zagen handzaag decoupeerzaag cirkelzaag figuurzaag ijzerzaag zaagblad zaagbladen
    :hammer hamer hamers voorhamer rubberen-hamer klauwhamer moker
    :ladder ladder ladders trap trapladder huishoudtrap vouwladder steiger
    :wrench moersleutel steeksleutel ringsleutel inbussleutel inbus tangen combinatietang waterpomptang punttang kniptang dopsleutel verstelbare-sleutel engelse-sleutel
    :bottle kit siliconenkit siliconen montagekit lijm houtlijm secondelijm contactlijm purschuim pur kitspuit acrylaatkit muurvuller plamuur
    :palette verf muurverf houtverf lak beits kwast kwasten verfkwast verfroller verfrol verfbak afplakfolie primer grondverf latex acrylverf
    :screwdriver schroevendraaier schroevendraaiers kruiskopschroevendraaier torx
    :toolbox gereedschap gereedschapskist gereedschapskoffer gereedschapsset werkkist werkbank doe-het-zelf
    :bricks baksteen bakstenen cement mortel beton tegel tegels tegellijm voegmiddel gips specie metselspecie steen betontegel
    :tools vijl vijlen schuurpapier schuurblok schuurmachine beitel beitels waterpas
    :mousetrap muizenval muizenvallen rattenval rattengif
    :lock slot sloten hangslot cilinder cilindersloten grendel grendels deurslot cijferslot kabelslot
    :window raamdichting tochtstrip tochtstrips tochtrand kierdichting afdichting afdichtingsband tochtprofiel
    :faucet sifon kraan kranen douchekop doucheslang waterkraan
    :flashlight zaklamp zaklantaarn hoofdlamp zaklampen
    :magnet magneet magneten magneetjes magneetstrip`],
  ['Elektro & Technik', `
    :cable-tie kabelclips kabelclip kabelhouder kabelklem kabelklemmetje kabelhaakjes kabelgeleider
    :outlet stopcontact stopcontacten stekkerdoos stekkerdozen contactdoos verdeelstekker wandcontactdoos
    :plug stekker stekkers kabel kabels verlengsnoer verlengkabel verlengsnoeren snoer adapter adapters reisstekker reisadapter voeding voedingskabel netsnoer kabelhaspel haspel
    :battery batterij batterijen accu accus powerbank knoopcel knoopcelbatterijen oplaadbare-batterijen alkaline penlite penlites
    :bulb lamp lampen gloeilamp ledlamp ledlampen spaarlamp lampje lampjes lichtbron lichtsnoer lichtslinger kerstverlichting kerstlichtjes ledstrip ledstrips nachtlampje bureaulamp vloerlamp tafellamp hanglamp plafondlamp wandlamp buitenlamp spot spots inbouwspots halogeenlamp tl-buis tl-lamp schemerlamp leeslamp
    :charger oplader opladers lader laadkabel usb usb-kabel usb-c lightning laadstation snellader autolader draadloze-oplader hdmi hdmi-kabel netwerkkabel ethernetkabel utp aux aux-kabel
    :phone telefoon gsm gsms mobieltje mobiel smartphone telefoonhoesje gsm-hoesje screenprotector telefoonhouder simkaart
    :headphones koptelefoon koptelefoons oordopjes oortjes headset airpods
    :mouse muis computermuis toetsenbord keyboard muismat mousepad webcam
    :laptop laptop computer pc monitor beeldscherm harde-schijf externe-harde-schijf geheugenkaart sd-kaart usb-stick geheugenstick tablet ipad
    :flashlight schakelaar dimmer lichtschakelaar tijdschakelaar schemerschakelaar bewegingssensor
    :tv televisie tv afstandsbediening beamer soundbar decoder
    :fan ventilator ventilatoren kachel kachels heater straalkachel radiator airco luchtreiniger luchtontvochtiger ontvochtiger
    :thermometer rookmelder rookmelders koolmonoxidemelder bewegingsmelder sensor thermostaat
    :camera camera fototoestel fotocamera spiegelreflex actiecamera deurbel
    :printer printer printers inkt inktpatroon inktpatronen cartridge cartridges toner printerinkt
    :router router wifi wifi-versterker repeater modem tv-antenne antenne
    :speaker radio luidspreker luidsprekers speaker bluetooth-speaker wekker wekkerradio`],
  ['Papeterie & Büro', `
    :paperclip paperclip paperclips paperclipjes bulldogclip klemmetjes
    :notebook notitieboek notitieblok schrift schriften schrijfblok blocnote post-its post-it plakbriefjes memoblok
    :pen pen pennen balpen balpennen potlood potloden stift stiften viltstift viltstiften markeerstift markeerstiften marker markers fineliner vulpen gum gummen puntenslijper slijper correctievloeistof tippex
    :paper papier printpapier kopieerpapier karton
    :folder map mappen ordner ordners ringband ringbanden showtas showtassen hangmap hangmappen multomap multomappen insteekhoes insteekhoezen tabbladen tabblad scheidingsbladen
    :mail postzegel postzegels envelop enveloppen briefpapier wenskaart wenskaarten ansichtkaart ansichtkaarten uitnodiging uitnodigingen
    :package pakket verpakking verhuisdoos verhuisdozen verzenddoos
    :crayon kleurpotloden kleurpotlood waskrijt wasco tekenblok kleurplaat
    :id lamineerhoes lamineerhoezen lamineerapparaat
    :calendar kalender agenda planner jaarplanner weekplanner
    :scissors schaar scharen kantoorschaar lijmstift
    :books boek boeken
    :news krant kranten tijdschrift tijdschriften magazine`],
  ['Wohnen & Deko', `
    :sofa bank banken zetel zetels sofa fauteuil bankhoes bankhoezen meubelhoes meubelhoezen meubels meubel kast kasten kledingkast boekenkast tv-meubel dressoir poef meubelbeschermer
    :bed bed bedden matras matrassen lattenbodem bedlinnen dekbedovertrek dekbed dekbedden laken lakens hoeslaken hoeslakens kussensloop slopen hoofdkussen
    :chair stoel stoelen eetkamerstoel bureaustoel tafel tafels eettafel salontafel bijzettafel bureau stoelkussen zitkussen kruk krukje
    :pillow kussen kussens sierkussen sierkussens kussenhoes plaid plaids deken dekens sprei bedsprei fleecedeken
    :window gordijn gordijnen vitrage vitrages overgordijn overgordijnen rolgordijn rolgordijnen jaloezie jaloezieen lamellen gordijnrail gordijnrails gordijnringen gordijnhaakjes gordijnhaken raamdecoratie
    :candle kaars kaarsen kaarsje kaarsjes theelicht theelichtjes kandelaar kandelaars kaarsenhouder windlicht geurkaars geurkaarsen stompkaars
    :vase vaas vazen bloempot bloempotten sierpot plantenpot
    :frame fotolijst fotolijsten lijst lijsten schilderij schilderijen poster posters spiegel spiegels wanddecoratie
    :rug tapijt tapijten vloerkleed vloerkleden kleed matje mat deurmat badmat wc-mat antislipmat antislipmatje karpet
    :bath douchegordijn badhanddoek handdoek handdoeken washandje washandjes badlaken badjas
    :laundry wasmand wasmanden opbergmand opbergmanden opbergbox opbergdoos opbergdozen kist kisten rek rekken plank planken wandplank wandplanken boekenplank
    :lantern lantaarn lantaarns sfeerlicht
    :flower bloemen boeket bloemetjes bloemstuk kunstbloemen
    :xmas-tree kerstboom kerstballen kerstversiering kerstdecoratie kerststal slinger slingers feestversiering decoratie versiering
    :gift cadeau cadeaus cadeaupapier inpakpapier cadeaulint strik cadeaubon geschenk
    :balloon ballon ballonnen helium
    :clock klok wandklok klokken`],
  ['Garten & Pflanzen', `
    :sprout plant planten zaad zaden zaadjes bloemzaad bloemzaden zaaigoed zaaiaarde stekjes stek kamerplant kamerplanten tuinplant tuinplanten
    :sunflower zonnebloem zonnebloemen
    :rose roos rozen tulp tulpen narcis narcissen hyacint krokus orchidee orchideeen lavendel geranium viooltje violen
    :herbs potgrond tuinaarde compost mest kunstmest plantenvoeding bemesting turf schors bodembedekker houtsnippers
    :water gieter gieters tuinslang slang slangen sproeier sproeiers druppelaar regenton regenput
    :gloves tuinhandschoenen werkhandschoenen
    :shovel schep scheppen spade spades hark harken schoffel snoeischaar snoeischaren heggenschaar grasmaaier kantensteker bladblazer bladhark kruiwagen tuinschaar takkenschaar tuingereedschap
    :wood haardhout brandhout houtskool briketten pellets
    :snail slakkenkorrels onkruidverdelger onkruidbestrijder onkruidkiller mierenpoeder
    :flame barbecuekolen
    :garden-house tuinstoel tuinstoelen tuinmeubels tuinmeubelen tuintafel parasol parasols loungeset hangmat schuur tuinhuis
    :fir spar dennenboom conifeer
    :tree boom bomen struik struiken heester heesters haag hagen klimop`],
  ['Tierbedarf', `
    :cat kattenvoer kattenbrokken kattenbak kattenbakvulling kattenbakkorrels kattenhalsband kattenspeelgoed kattenmand kattenboom krabpaal krabplank krabmeubel kattensnoep kattenkruid kattengras kat katten poes kitten kittenvoer
    :dog hondenvoer hondenbrokken hondenriem hondenlijn hondenhalsband hondenspeelgoed hondenmand hondenkluif hondenkoekjes hondensnoepjes poepzakjes hondenpoepzakjes hond honden puppy puppyvoer tuigje hondentuig
    :fish visvoer aquarium aquaria vissenvoer goudvis
    :bird vogelvoer vogelzaad vogelhuisje vogelhuis vogelkooi vetbollen parkiet kanarie
    :rodent hamster hamsters konijn konijnen cavia caviavoer konijnenvoer hooi knaagdierenvoer houtkrullen
    :paw dierenvoer dierenbenodigdheden dierenvoeding voerbak voerbakje drinkbak drinkfontein vlooienmiddel vlooienband tekenmiddel ontwormingsmiddel dierenarts dierenmand dierendraagtas reismand`],
  ['Kleidung & Textil', `
    :shirt t-shirt shirt tshirt hemd overhemd trui truien sweater hoodie vest blouse polo top truitje longsleeve
    :trousers broek broeken jeans spijkerbroek joggingbroek legging leggings short shorts pantalon
    :socks sokken sok kousen panty pantys maillot maillots enkelsokken sportsokken kniekousen
    :underwear ondergoed onderbroek onderbroeken boxer boxershorts slip slips bh beha onderhemd
    :jacket jas jassen jack regenjas winterjas zomerjas bodywarmer parka mantel regenpak
    :dress jurk jurkje jurken rok rokje tuniek
    :shoe schoen schoenen sneakers gympen gympies laarzen regenlaarzen sandalen slippers pantoffels sloffen muiltjes instappers pumps schoenveters inlegzolen schoenpoets
    :cap muts mutsen pet petje hoed honkbalpet baret
    :gloves handschoenen wanten
    :pillow sjaal sjaals omslagdoek bandana
    :bag tas tassen handtas rugzak schoudertas shopper portemonnee portefeuille riem riemen
    :sunglasses zonnebril zonnebrillen bril
    :thread naald naalden garen naaigaren stof stoffen knoop knopen ritssluiting rits strijkijzer strijkplank kleerhanger kleerhangers hanger hangers pluizenborstel kledingborstel
    :watch horloge horloges
    :swimwear zwembroek badpak bikini zwemkleding pyjama pyjamas nachthemd slaapkleding`],
  ['Baby & Kind', `
    :baby-bottle luier luiers pampers babyvoeding flesvoeding babymelk zuigfles flesje flesjes speen spenen fopspeen fopspenen babyflesjes babydoekjes billendoekjes babypoeder babyolie flessenwarmer
    :teddy speelgoed knuffel knuffels knuffelbeer pop poppen puzzel puzzels lego duplo blokken bouwblokken spelletje spelletjes gezelschapsspel bordspel
    :palette kleurboek kleurboeken klei plasticine knutselspullen knutselmateriaal verfdoos
    :baby baby babykleding kinderwagen wandelwagen buggy babyfoon bijtring slabbetje slabbetjes slab speelkleed
    :kid kind kinderen schooltas brooddoos drinkbeker kinderstoel`],
  ['Sport & Freizeit', `
    :soccer voetbal bal ballen basketbal
    :barbell halter halters gewichten yogamat fitnessmat fitnessband weerstandsband springtouw
    :run hardloopschoenen sportschoenen sportkleding sportshirt
    :swim badmuts zwembril zwemband zwemvest
    :tent tent tenten slaapzak kampeerstoel kampeergas gasbrander kampeerkachel luchtbed
    :ski skis skibril skihelm snowboard
    :fishing hengel hengels vishaken vislijn
    :mountain klimtouw klimschoenen
    :tennis tennisracket badmintonracket shuttle pingpong tafeltennis tennisballen tennisbal
    :hiking wandelschoenen wandelstok wandelstokken
    :volleyball ballenpomp
    :guitar gitaar gitaarsnaren
    :dice dobbelsteen dobbelstenen kaartspel speelkaarten`],
  ['Auto & Velo', `
    :bike fiets fietsen fietsband fietsbanden binnenband binnenbanden fietspomp fietshelm fietslicht fietslamp fietsslot fietsketting kettingolie kettingspray plakset fietstas fietstassen bagagedrager remblokjes remkabel
    :car auto autoshampoo ruitenwisser ruitenwissers ruitenvloeistof motorolie autowas autopoets antivries
    :tire autoband autobanden winterbanden banden band bandenspanning
    :battery startkabels startkabel acculader
    :ice ijskrabber
    :parking parkeerschijf parkeerkaart
    :scooter step steps scooter bromfiets brommer`],
];

const icons = {
  DATA: [...SPEC, ...DATA],
  HEAD: 'suffix',
  SPLIT: /^(voor|met|van|zonder|tegen|uit|op|in|en|of|&)$/i,
  MODS: [[/^(katten|honden|hond|kat|vogel|dieren|knaagdieren|konijnen)/, 'Tierbedarf'], [/^(fiets|auto|autos)/, 'Auto & Velo'], [/^(baby|kinder)/, 'Baby & Kind'], [/^tuin/, 'Garten & Pflanzen']],
  STORE: {
    bouwmarkt: 'Werkzeug & Baumarkt', gamma: 'Werkzeug & Baumarkt', karwei: 'Werkzeug & Baumarkt', praxis: 'Werkzeug & Baumarkt', hornbach: 'Werkzeug & Baumarkt',
    brico: 'Werkzeug & Baumarkt', hubo: 'Werkzeug & Baumarkt', 'doe-het-zelf': 'Werkzeug & Baumarkt', ijzerhandel: 'Werkzeug & Baumarkt',
    drogist: 'Körperpflege', drogisterie: 'Körperpflege', kruidvat: 'Körperpflege', etos: 'Körperpflege', trekpleister: 'Körperpflege',
    apotheek: 'Apotheke', apotheker: 'Apotheke', ikea: 'Wohnen & Deko', woonwinkel: 'Wohnen & Deko', xenos: 'Wohnen & Deko', hema: 'Wohnen & Deko',
    elektronica: 'Elektro & Technik', mediamarkt: 'Elektro & Technik', coolblue: 'Elektro & Technik', bcc: 'Elektro & Technik',
    dierenwinkel: 'Tierbedarf', zooplus: 'Tierbedarf', 'pets place': 'Tierbedarf', boekhandel: 'Papeterie & Büro', kantoorboekhandel: 'Papeterie & Büro', kantoor: 'Papeterie & Büro',
    tuincentrum: 'Garten & Pflanzen', tuin: 'Garten & Pflanzen', sport: 'Sport & Freizeit', fietsenwinkel: 'Auto & Velo', kleding: 'Kleidung & Textil',
    bakker: 'Brot & Gebäck', bakkerij: 'Brot & Gebäck', slager: 'Fleisch & Fisch', slagerij: 'Fleisch & Fisch', beenhouwer: 'Fleisch & Fisch', beenhouwerij: 'Fleisch & Fisch',
    visboer: 'Fleisch & Fisch', viswinkel: 'Fleisch & Fisch', dranken: 'Getränke', drankenhandel: 'Getränke', groenteboer: 'Früchte & Gemüse', kaaswinkel: 'Milch & Käse',
  },
  // Dutch plural/diminutive stems: -en/-s/-n/-e/-jes, consonant doubling (netten), z/v voicing (buizen), vowel lengthening (palen -> paal)
  forms: w => {
    const o = new Set();
    const add = s => { if (s && s.length >= 3 && s !== w) o.add(s); };
    const stems = [];
    for (const e of ['etjes', 'pjes', 'tjes', 'jes', 'en', 'tje', 'je', 's', 'n', 'e']) if (w.endsWith(e) && w.length - e.length >= 3) stems.push(w.slice(0, -e.length));
    for (const st of stems) {
      const base = [st];
      if (/([^aeiou])\1$/.test(st)) base.push(st.slice(0, -1));
      if (/z$/.test(st)) base.push(st.slice(0, -1) + 's');
      if (/v$/.test(st)) base.push(st.slice(0, -1) + 'f');
      for (const b of [...base]) {
        add(b);
        const m = b.match(/^(.*[^aeiou])([aeou])([^aeiou])$/);
        if (m) add(m[1] + m[2] + m[2] + m[3]);
      }
    }
    return [...o];
  },
};

export default { parser, icons };
