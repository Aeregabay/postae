// English language pack (UK + US): spoken-sentence parser rules and head-final icon keyword pack.
const R = String.raw;

const parser = {
  UNIT_MAP: {
    kilogram: ['kg'], kilograms: ['kg'], kilo: ['kg'], kilos: ['kg'], kg: ['kg'], kgs: ['kg'],
    gram: ['g'], grams: ['g'], gramme: ['g'], grammes: ['g'], g: ['g'],
    litre: ['l'], litres: ['l'], liter: ['l'], liters: ['l'], l: ['l'],
    millilitre: ['ml'], millilitres: ['ml'], milliliter: ['ml'], milliliters: ['ml'], ml: ['ml'], cl: ['cl'], dl: ['dl'],
    pound: ['lb'], pounds: ['lb'], lb: ['lb'], lbs: ['lb'], ounce: ['oz'], ounces: ['oz'], oz: ['oz'],
    pc: ['pc', 'pcs'], pcs: ['pc', 'pcs'], piece: ['pc', 'pcs'], pieces: ['pc', 'pcs'],
    pack: ['pack', 'packs'], packs: ['pack', 'packs'], packet: ['pack', 'packs'], packets: ['pack', 'packs'], package: ['pack', 'packs'], packages: ['pack', 'packs'],
    can: ['can', 'cans'], cans: ['can', 'cans'], tin: ['tin', 'tins'], tins: ['tin', 'tins'],
    bottle: ['bottle', 'bottles'], bottles: ['bottle', 'bottles'],
    bunch: ['bunch', 'bunches'], bunches: ['bunch', 'bunches'],
    roll: ['roll', 'rolls'], rolls: ['roll', 'rolls'],
    metre: ['m'], metres: ['m'], meter: ['m'], meters: ['m'], m: ['m'],
  },
  NW: { one: 1, a: 1, an: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12 },
  PHRASES: [
    R`don['’]?t\s+forget(?:\s+to)?|do\s+not\s+forget(?:\s+to)?|don['’]?t\s+let\s+me\s+forget(?:\s+to)?|remember(?:\s+to)?|remind\s+me(?:\s+to)?|make\s+sure\s+(?:we|i|you)\s+(?:get|buy|grab|have)|make\s+a\s+note\s+of`,
    R`(?:(?:we|i)(?:['’]re|['’]m|['’]ve)?\s+)?(?:(?:are|am|have|has|is)\s+)?(?:(?:run|ran|running)\s+)?(?:out|low)\s+(?:of|on)`,
    R`(?:there['’]s|there\s+is|there\s+are)\s+no(?:\s+more)?|no\s+more|(?:is|are|has|have)\s+(?:all\s+|almost\s+|nearly\s+)?(?:gone|finished|empty|used\s+up|run\s+out|out)`,
    R`(?:on|onto|to|in)\s+(?:the\s+|my\s+|our\s+)?(?:shopping\s+|grocery\s+|groceries\s+)?list`,
    R`pick(?:ing)?\s+(?:me\s+)?up`,
    R`(?:would\s+like|need|needs|have|has|want|wants|got|going|gotta|ought|should|must|like|try)\s+to`,
    R`(?:can|could|would|will|shall|should)\s+(?:you|we|i)(?:\s+please)?`,
    R`for\s+(?:me|us|myself|ourselves|home|the\s+house|the\s+flat)`,
    R`(?:a\s+)?(?:couple|few|bit|little|lot|lots|load|loads|plenty)\s+of`,
  ],
  TOKENS: R`i['’]m|i['’]ve|i['’]ll|i['’]d|we['’]re|we['’]ve|we['’]ll|we['’]d|let['’]s|you['’]re|you['’]ll|it['’]s|that['’]s|there['’]s|i|we|you|me|us|lets|let|need|needs|needed|needing|want|wants|wanted|wanna|gotta|gonna|would|should|could|will|shall|might|must|may|get|gets|getting|got|grab|grabbing|buy|buying|bought|purchase|fetch|bring|take|order|add|adding|put|putting|write|include|also|just|please|pls|thanks|then|really|still|actually|maybe|probably|today|tonight|tomorrow|now|already|um|uh|er|erm|hmm|hm|ah|oh|okay|ok|hey|hi|hello|some|have|has|had|having|do|does|is|are|am|be|it|them|this|that|these|those|my|our|your|something|stuff`,
  STOP: ['a', 'an', 'the', 'of', 'and', 'or', 'some', 'any', 'for', 'with', 'to', 'in', 'on', 'at', 'my', 'our', 'your', 'more', 'another', 'it', 'is', 'are', 'am', 'be', 'do', 'one'],
  LEAD: R`a\s+couple\s+of|a\s+few|some|any|the|an|a|one|of|my|our|your|more|another|fresh`,
  CONJ: R`oh\s+and|and\s+then|and\s+also|and\s+maybe|and|then|plus|also|as\s+well\s+as|along\s+with|together\s+with|after\s+that|next`,
  PURPOSE: R`(?<![\p{L}\p{N}])(?:for|to\s+fit)\s+(?:(?:the|my|our|a|an|these|those|this|that)\s+)?`,
  FOR: 'for ',
  PRE: R`(?:(?:from\s+the|at\s+the|in\s+the|over\s+at|down\s+at|at|from|in|via|to)\s+)?`,
  HALF: R`half(?:\s+an?)?(?:\s+of)?`,
  ONE_UNIT: 'a|an|one',
  TRAIL: R`please|up|today|tomorrow|tonight|now|too|as\s+well|again|thanks|thank\s+you`,
  TRAIL2: R`more|too|please|thanks`,
  DEC: '.',
  CAP: true,
};

// Specific head nouns first (first definition of a keyword wins).
const SPEC = [
  ['Küche & Haushaltswaren', `:lid lid lids pan-lid pan-lids pot-lid pot-lids saucepan-lid glass-lid
    :splash splash-guard splash-guards splashguard splashguards splatter-guard splatter-screen guard guards`],
  ['Tierbedarf', `:net cat-net cat-nets catnet balcony-net`],
  ['Werkzeug & Baumarkt', `:net net nets netting mesh fence-netting garden-netting
    :cable-tie cable-tie cable-ties zip-tie zip-ties tie ties cable-wrap velcro-strap
    :rod rod rods pole poles pipe pipes tubing curtain-rod curtain-rods threaded-rod threaded-rods dowel-rod aluminium-pole
    :dowel wall-plug wall-plugs rawlplug rawlplugs dowel dowels anchor anchors screw-anchor
    :bumper rubber-feet rubber-foot feet felt-pad felt-pads furniture-glides glides glide bumper bumpers stopper stoppers door-stop doorstop door-stopper
    :connector connector connectors coupler couplers coupling couplings fitting fittings elbow-joint pipe-connector pipe-connectors
    :bungee bungee bungees bungee-cord bungee-cords shock-cord elastic-cord
    :rope rope ropes cord cords twine paracord`],
  ['Elektro & Technik', `:duct cable-trunking cable-trunk trunking cable-raceway raceway raceways cable-duct duct ducts conduit cable-channel cable-cover cable-management cable-tray
    :cable-tie cable-clip cable-clips cable-holder cable-saddle
    :outlet socket sockets outlet outlets wall-socket plug-socket power-socket`],
  ['Papeterie & Büro', `:ruler ruler rulers set-square protractor :label label labels name-labels label-maker :stapler stapler staplers staple-remover`],
];

const DATA = [
  ['Früchte & Gemüse', `:apple apple crabapple cooking-apple eating-apple
    :banana banana plantain
    :orange orange tangerine mandarin clementine satsuma grapefruit pomelo kumquat
    :lemon lemon lime
    :grapes grape grapes
    :strawberry strawberry
    :berries blueberry blackberry raspberry cranberry blackcurrant redcurrant currant gooseberry berry elderberry mulberry
    :pear pear
    :peach peach nectarine apricot plum damson greengage
    :cherry cherry
    :melon melon cantaloupe honeydew galia
    :watermelon watermelon
    :mango mango papaya guava lychee passionfruit pomegranate persimmon dragonfruit fig starfruit rhubarb
    :pineapple pineapple
    :kiwi kiwi kiwifruit
    :avocado avocado guacamole
    :tomato tomato cherry-tomato plum-tomato vine-tomato
    :cucumber cucumber gherkin courgette zucchini
    :carrot carrot parsnip turnip swede beetroot radish celeriac daikon mooli
    :potato potato spud kohlrabi squash pumpkin butternut marrow jerusalem-artichoke artichoke
    :sweet-potato sweet-potato yam
    :onion onion shallot leek scallion spring-onion red-onion
    :garlic garlic
    :lettuce lettuce salad rocket arugula spinach cabbage kale chard cress watercress endive chicory fennel celery pak-choi bok-choy iceberg romaine lambs-lettuce coleslaw sprouts brussels-sprouts greens
    :broccoli broccoli cauliflower romanesco broccolini
    :pepper bell-pepper pepper capsicum
    :chili chilli chili jalapeno cayenne habanero
    :eggplant aubergine eggplant
    :mushroom mushroom champignon portobello shiitake chanterelle
    :corn corn sweetcorn corn-on-the-cob cob maize
    :ginger ginger turmeric galangal
    :herbs basil parsley chives coriander cilantro dill mint rosemary thyme sage oregano tarragon herbs bay-leaf lemongrass
    :beans pea peas bean green-beans asparagus mangetout edamame broad-beans runner-beans french-beans sugar-snap`],
  ['Brot & Gebäck', `:bread bread loaf sourdough toast wholemeal wholegrain rye breadcrumbs bun buns bap baps stottie
    :baguette baguette roll bread-roll bread-rolls ciabatta-roll
    :bagel bagel
    :croissant croissant pastry pastries danish pain-au-chocolat brioche scone crumpet teacake
    :pretzel pretzel
    :flatbread pitta pita naan tortilla wrap chapati flatbread focaccia ciabatta roti paratha
    :pancakes pancake waffle crepe blini
    :cake cake gateau cheesecake brownie flapjack sponge-cake battenberg
    :cupcake cupcake muffin
    :donut doughnut donut eclair
    :cookie biscuit cookie shortbread digestive rich-tea
    :pie pie tart quiche pasty strudel mince-pie`],
  ['Milch & Käse', `:milk milk semi-skimmed skimmed whole-milk oat-milk soya-milk soy-milk almond-milk buttermilk evaporated-milk condensed-milk cream double-cream single-cream whipping-cream creamer half-and-half
    :butter butter margarine ghee spread
    :cheese cheese cheddar mozzarella parmesan gouda edam brie camembert feta halloumi ricotta mascarpone gruyere emmental stilton gorgonzola cream-cheese cottage-cheese paneer babybel
    :egg egg
    :yogurt yoghurt yogurt skyr kefir quark fromage-frais
    :pudding pudding custard mousse jelly dessert rice-pudding trifle`],
  ['Fleisch & Fisch', `:chicken chicken turkey duck goose poultry drumstick wings
    :meat beef mince minced-beef minced-meat steak pork lamb veal mutton venison meat burger burgers meatball meatballs chop chops ribs sirloin brisket gammon liver kidney offal roast
    :bacon bacon pancetta
    :sausage sausage chorizo hotdog frankfurter bratwurst kielbasa
    :ham ham salami prosciutto pepperoni pastrami cold-cuts deli
    :fish fish salmon trout tuna cod haddock mackerel sardine anchovy herring sea-bass seabass halibut plaice sole tilapia fishcake fishfinger fish-fingers smoked-salmon kipper
    :shrimp shrimp prawn scampi crab lobster squid calamari
    :oyster oyster mussel clam scallop`],
  ['Vorräte', `:pasta pasta spaghetti penne fusilli tagliatelle lasagne lasagna macaroni noodles noodle ramen linguine tortellini orzo gnocchi vermicelli rigatoni farfalle
    :rice rice risotto couscous quinoa bulgur polenta basmati semolina
    :can can tin baked-beans chickpeas passata chopped-tomatoes tomato-puree tomato-paste ketchup mustard mayonnaise mayo stock bouillon stock-cubes gravy sauce soup pesto coconut-milk relish chutney tomato-sauce pasta-sauce ravioli sardines baked-bean
    :salt salt spice spices seasoning paprika cumin cinnamon nutmeg vanilla curry-powder mixed-herbs
    :chili black-pepper peppercorns chili-flakes tabasco hot-sauce sriracha
    :olive olive olives olive-oil oil sunflower-oil vegetable-oil rapeseed-oil coconut-oil sesame-oil
    :bottle vinegar balsamic soy-sauce worcestershire
    :bowl oats porridge cereal muesli granola cornflakes weetabix bran
    :grain flour cornflour starch yeast self-raising
    :candy sugar icing-sugar caster-sugar sweetener
    :honey honey syrup maple-syrup treacle
    :strawberry jam marmalade preserve
    :nuts peanut-butter almonds peanuts walnuts hazelnuts cashews pistachios pecan pecans raisins sultanas dried-fruit seeds chia nut
    :chocolate chocolate-spread nutella cocoa
    :legumes lentils lentil chickpea legumes dal dhal tofu tempeh falafel hummus houmous
    :cupcake baking-powder baking-soda bicarbonate food-colouring`],
  ['Tiefkühl', `:pizza pizza frozen-pizza
    :fries chips fries french-fries wedges hash-browns oven-chips
    :icecream ice-cream icecream gelato sorbet ice-lolly popsicle
    :ice frozen ice-cubes
    :dumpling dumplings gyoza frozen-veg frozen-peas frozen-vegetables frozen-fruit`],
  ['Getränke', `:water water mineral-water sparkling-water tonic-water still-water
    :soda cola coke pepsi fanta sprite lemonade fizzy-drink soft-drink cordial energy-drink red-bull ginger-beer ginger-ale root-beer iced-tea soda
    :juice juice orange-juice apple-juice smoothie nectar
    :tea tea green-tea herbal-tea chai earl-grey camomile chamomile peppermint-tea
    :teapot teabag tea-bags teabags infuser
    :coffee coffee espresso instant-coffee decaf nespresso coffee-pods ground-coffee coffee-beans latte cappuccino
    :beer beer lager ale ipa stout cider pale-ale
    :wine wine red-wine white-wine rose
    :sparkling prosecco champagne cava sparkling-wine
    :spirits whisky whiskey gin vodka rum tequila brandy cognac liqueur spirits bourbon
    :cocktail cocktail aperol
    :milk hot-chocolate
    :bubble-tea bubble-tea boba`],
  ['Snacks & Süsses', `:chocolate chocolate choc chocolate-bar candy-bar snickers mars kitkat twix bounty galaxy cadbury lindt toblerone ferrero truffle truffles praline
    :cookie oreo oreos hobnobs
    :nuts trail-mix mixed-nuts
    :popcorn popcorn crisps crisp potato-chips tortilla-chips pringles doritos nachos
    :candy sweets sweet candy gummies jelly-babies wine-gums haribo toffee fudge liquorice licorice chewing-gum bubblegum gum
    :lollipop lollipop marshmallow
    :pretzel breadsticks
    :cracker cracker crackers cream-crackers oatcakes ricecakes rice-cakes crispbread
    :pudding snack`],
];

DATA.push(
  ['Haushalt', `:toilet-paper toilet-paper toilet-roll toilet-rolls toilet-tissue loo-roll loo-paper bog-roll kitchen-roll kitchen-rolls kitchen-towel kitchen-towels paper-towel paper-towels paper-napkins napkin napkins serviette serviettes toilet-papers
    :tissue tissue tissues facial-tissues kleenex wipes wet-wipes cleaning-wipes disinfectant-wipes
    :sponge sponge scourer scourers dish-sponge scrub-pad scrubber dishcloth dishcloths cloth cloths microfibre microfiber
    :bottle washing-up-liquid dish-soap dish-washing-liquid bleach disinfectant air-freshener room-spray febreze
    :sponge dishwasher-tablets dishwasher-tabs dishwasher-pods dishwasher-salt rinse-aid
    :laundry laundry detergent fabric-softener washing-powder washing-liquid laundry-detergent laundry-pods washing-pods dryer-sheets stain-remover
    :soap all-purpose-cleaner multi-surface-cleaner bathroom-cleaner toilet-cleaner toilet-duck limescale limescale-remover descaler glass-cleaner window-cleaner oven-cleaner polish furniture-polish cleaner cleaning-spray
    :trash bin-bag bin-bags bin-liner bin-liners rubbish-bags trash-bags garbage-bags binbags trash garbage bin dustbin wastebasket
    :broom broom mop dustpan vacuum hoover vacuum-bags hoover-bags duster feather-duster squeegee brush brushes toilet-brush scrubbing-brush
    :flame match matches lighter firelighters
    :bucket bucket
    :gloves rubber-gloves marigolds washing-up-gloves
    :bug insect-spray bug-spray fly-spray ant-killer mothballs moth-balls fly-paper`],
  ['Körperpflege', `:toothbrush toothbrush toothpaste floss mouthwash toothpick dental-floss
    :bottle shampoo conditioner shower-gel body-wash body-lotion lotion moisturiser moisturizer hand-cream face-cream deodorant deo antiperspirant hairspray hair-gel hair-wax hair-dye sunscreen suncream sun-cream aftersun perfume aftershave cologne shaving-cream
    :soap soap handwash hand-soap hand-wash bar-soap
    :razor razor razors razor-blades shaving-foam shaving-gel shaver
    :tissue cotton-buds cotton-wool cotton-pads
    :toilet-paper tampons sanitary-towels sanitary-pads panty-liners pantyliners
    :nail-polish nail-polish nail-varnish nail-file nail-scissors nail-clippers
    :lipstick lipstick lip-balm lip-gloss mascara eyeliner foundation concealer makeup make-up blusher eyeshadow makeup-remover
    :comb comb hairbrush hair-brush hairband hairbands scrunchie scrunchies hair-ties bobby-pins hairpins hairclip hair-clip tweezers`],
  ['Apotheke', `:pill painkillers painkiller paracetamol ibuprofen aspirin tablets tablet pills pill vitamins vitamin supplements medicine medication antihistamine hayfever lozenges cough-sweets magnesium zinc omega-3 melatonin probiotics laxative
    :bandage plaster plasters bandage dressing gauze antiseptic savlon first-aid-kit sticking-plasters band-aid band-aids ointment
    :bottle nasal-spray eye-drops cough-syrup cough-medicine
    :thermometer thermometer
    :test-tube covid-test lateral-flow pregnancy-test test
    :mask face-mask mask masks ffp2
    :mosquito mosquito-repellent insect-repellent bite-cream`],
  ['Küche & Haushaltswaren', `:pan pan frying-pan frypan saucepan skillet wok griddle grill-pan
    :pot pot stockpot
    :casserole casserole-dish roasting-tin roaster dutch-oven
    :bowl bowl mixing-bowl sieve colander salad-bowl
    :knife knife knives chef-knife bread-knife chopping-board chopping-boards cutting-board cutting-boards peeler
    :cutlery cutlery fork forks ladle spatula whisk tongs fish-slice masher
    :spoon spoon teaspoon tablespoon wooden-spoon
    :sparkling glass glasses wine-glass tumbler flute
    :tea mug cup cups teacup
    :plate plate dish dishes platter crockery tableware saucer
    :toilet-paper cling-film clingfilm cling-wrap saran-wrap
    :foil foil tin-foil aluminium-foil kitchen-foil baking-foil
    :paper baking-paper baking-parchment greaseproof parchment
    :bread baking-tin loaf-tin cake-tin baking-tray baking-sheet
    :pie flan-dish pie-dish springform tart-tin
    :cupcake muffin-tin muffin-cases cupcake-cases cookie-cutter
    :jar jar storage-jar kilner mason-jar tupperware storage-box food-container freezer-bag freezer-bags sandwich-bags
    :ice ice-cube-tray
    :bottle water-bottle flask thermos carafe jug pitcher decanter
    :salt salt-shaker salt-mill pepper-mill grinder
    :can can-opener tin-opener bottle-opener corkscrew opener
    :garlic garlic-press
    :potato potato-masher grater zester mandoline
    :funnel funnel measuring-jug measuring-cup measuring-spoons
    :gloves oven-gloves oven-glove pot-holder
    :laundry tea-towel tea-towels dishtowel drying-rack dish-rack draining-rack washing-up-bowl
    :rice rice-cooker
    :soda straw straws
    :clock kitchen-scales scales timer
    :sandwich lunchbox lunch-box bread-bin bread-box
    :blender blender mixer food-processor toaster kettle air-fryer slow-cooker microwave coffee-machine coffee-maker cafetiere french-press juicer hand-blender
    :cookie biscuit-cutter
    :wood rolling-pin cookbook slice`],
);

DATA.push(
  ['Werkzeug & Baumarkt', `:screw screw screws bolt bolts washer washers wood-screws self-tapping-screws hex-bolt allen-bolt wing-nut hex-nut lock-nut
    :nail nail nails tack tacks panel-pins
    :hook hook hooks cup-hook coat-hook wall-hook adhesive-hook
    :chain chain chains carabiner karabiner
    :wrench wrench spanner spanners pliers allen-key hex-key socket-set grips mole-grips hinge hinges bracket brackets shelf-bracket l-bracket angle-bracket corner-bracket clamp clamps
    :rope strap straps ratchet-strap ratchet-straps tie-down tie-downs
    :tape tape masking-tape duct-tape gaffer-tape insulating-tape electrical-tape sellotape scotch-tape sticky-tape double-sided-tape packing-tape velcro hook-and-loop
    :tape-measure tape-measure measuring-tape spirit-level level
    :drill drill drills drill-bit drill-bits
    :screwdriver screwdriver screwdrivers bit bits
    :saw saw hacksaw jigsaw handsaw
    :hammer hammer mallet
    :ladder ladder stepladder
    :toolbox toolbox tool-kit tools tool-set toolkit
    :bricks brick cement mortar concrete grout tile tiles plasterboard
    :tools file sandpaper sanding-block chisel plane rasp stanley-knife utility-knife
    :mousetrap mouse-trap rat-trap
    :lock lock padlock latch deadbolt key keys keyring
    :window draught-excluder weatherstrip sealing-strip foam-strip window-seal
    :faucet tap taps plumbing sink-plug siphon hose-connector shower-head shower-hose
    :flashlight torch torches headtorch headlamp
    :magnet magnet magnets
    :needle staple staples staple-gun rivet rivets eyelet eyelets
    :bottle silicone sealant caulk glue superglue wood-glue epoxy filler adhesive wd-40 wd40 lubricant spray-paint
    :palette paint paint-brush paint-brushes paint-roller roller varnish primer emulsion wood-stain
    :wood wood timber plywood mdf batten battens plank planks board lumber skirting beading`],
  ['Elektro & Technik', `:plug plug plugs extension-lead extension-leads extension-cord power-strip surge-protector adapter adaptor travel-adapter cable cables wire wires extension
    :battery battery aa aaa aa-batteries aaa-batteries 9v power-bank powerbank rechargeable button-cell coin-cell
    :bulb bulb light-bulb lightbulb led lamp light lights fairy-lights string-lights led-strip nightlight night-light lightstrip spotlight
    :charger charger charging-cable usb usb-c lightning hdmi ethernet usb-cable phone-charger
    :phone phone smartphone mobile iphone screen-protector phone-case sim
    :headphones headphones earphones earbuds airpods headset
    :mouse mouse keyboard trackpad
    :laptop laptop computer pc ipad hard-drive ssd memory-card sd-card usb-stick flash-drive monitor
    :flashlight switch dimmer plug-timer
    :tv tv television remote remote-control projector
    :fan fan heater fan-heater air-conditioner humidifier dehumidifier
    :thermometer smoke-alarm smoke-detector co-detector sensor thermostat
    :camera camera webcam gopro dashcam
    :printer printer ink toner cartridge ink-cartridge
    :router router wifi wi-fi repeater modem antenna
    :speaker speaker soundbar radio
    :clock alarm-clock wall-clock`],
  ['Papeterie & Büro', `:paperclip paperclip paperclips clip clips bulldog-clip binder-clip drawing-pins pushpin pushpins thumbtack thumbtacks pin pins
    :notebook notebook notepad pad sticky-notes post-it post-its jotter diary journal exercise-book
    :pen pen pens pencil pencils biro marker markers highlighter felt-tip eraser rubber sharpener fountain-pen fineliner sharpie
    :paper paper printer-paper copy-paper a4 a3 cardboard construction-paper tracing-paper
    :folder folder folders binder binders ring-binder lever-arch wallet-folder document-wallet dividers poly-pockets
    :mail stamp stamps envelope envelopes postcard greeting-card birthday-card
    :package parcel packaging bubble-wrap sticker stickers
    :crayon crayon crayons colouring-pencils coloured-pencils colored-pencils watercolours paint-set colouring-book felt-tips pastels chalk
    :id laminating-pouches laminator
    :calendar calendar planner
    :scissors scissors craft-scissors hole-punch punch
    :books book books textbook novel
    :paperclip rubber-band rubber-bands elastic-bands`],
  ['Wohnen & Deko', `:sofa sofa couch armchair sofa-cover sofa-protector furniture-protector anti-slip anti-slip-mat furniture cabinet wardrobe dresser drawers chest
    :chair chair chairs stool table desk bench
    :bed bed mattress bed-sheet sheets duvet duvet-cover bedding bed-linen fitted-sheet pillowcase mattress-topper bedside-table
    :pillow pillow cushion throw blanket quilt bolster
    :window curtain blinds blind roller-blind net-curtain curtain-ring curtain-rings curtain-hooks curtain-track pelmet shutters
    :candle candle tealight candle-holder candlestick wax-melt incense diffuser
    :vase vase
    :frame picture-frame photo-frame frame mirror picture poster canvas painting artwork wall-art
    :rug rug carpet doormat door-mat bath-mat mat runner
    :bath shower-curtain towel bath-towel hand-towel bathrobe dressing-gown bath-sheet flannel
    :laundry basket laundry-basket storage-basket hamper shelf shelves bookcase bookshelf rack organiser organizer storage crate box
    :lantern lantern lampshade lamp-shade
    :flower flowers bouquet artificial-flowers silk-flowers
    :xmas-tree christmas-tree christmas-decorations tinsel baubles advent-calendar wreath decorations decoration decor ornament
    :gift gift present wrapping-paper gift-wrap ribbon gift-bag
    :balloon balloon banner bunting party-poppers confetti streamers`],
);

DATA.push(
  ['Garten & Pflanzen', `:sprout plant seeds seed seedling sapling cuttings plant-bulbs flower-bulbs
    :vase plant-pot plant-pots flowerpot flower-pot planter houseplant pot-plant hanging-basket
    :sunflower sunflower
    :rose rose tulip orchid daffodil lavender lily geranium petunia hydrangea
    :herbs soil compost potting-compost potting-soil topsoil fertiliser fertilizer plant-food peat bark mulch manure lawn-feed weedkiller weed-killer
    :water watering-can garden-hose hosepipe hose sprinkler water-butt
    :gloves gardening-gloves garden-gloves
    :shovel spade trowel rake hoe shears secateurs pruners loppers hedge-trimmer lawnmower lawn-mower strimmer wheelbarrow pitchfork garden-fork axe
    :wood firewood logs kindling charcoal
    :snail slug-pellets slug-killer pest-control
    :flame bbq barbecue briquettes fire-pit chimenea
    :garden-house shed greenhouse gazebo parasol garden-chair patio-furniture sun-lounger hammock deck-chair
    :fir fir pine spruce conifer
    :tree tree shrub bush hedge`],
  ['Tierbedarf', `:cat cat-food cat-litter cat-treats cat-toy cat-toys cat-flap catnip scratching-post cat-collar cat-bed cat-tree cat-bowl kitten kitty cat
    :dog dog-food dog-treats dog-lead dog-leash dog-collar dog-toy dog-bed dog-bowl dog-chew chew poo-bags poop-bags dog-biscuits puppy dog harness leash collar muzzle bone
    :fish fish-food aquarium fish-tank fishtank water-conditioner
    :bird bird-seed birdseed bird-food bird-feeder bird-cage budgie parrot canary birdbath
    :rodent hamster guinea-pig rabbit gerbil hay sawdust rabbit-food hutch
    :paw food pet-food pet pets pet-bed flea-treatment flea-collar worming-tablets tick-remover pet-carrier litter-tray litter treat treats scratcher pet-bowl`],
  ['Kleidung & Textil', `:shirt shirt t-shirt tshirt tee top blouse polo jumper sweater pullover hoodie sweatshirt cardigan tank-top necktie bow-tie
    :trousers trousers pants jeans leggings joggers tracksuit shorts chinos
    :socks socks sock tights stockings
    :underwear underwear underpants boxers briefs knickers bra thong
    :jacket jacket coat raincoat anorak parka gilet waistcoat blazer fleece windbreaker poncho
    :dress dress skirt gown
    :shoe shoe shoes trainers sneakers boots wellies wellingtons sandals flip-flops slippers loafers heels plimsolls
    :cap hat cap beanie bobble-hat bucket-hat balaclava headband
    :gloves gloves mittens
    :pillow scarf shawl snood
    :bag bag handbag rucksack tote purse wallet belt satchel holdall suitcase luggage
    :sunglasses sunglasses shades reading-glasses
    :thread needle thread sewing-kit fabric zip zipper button buttons elastic iron ironing-board clothes-hanger hanger hangers clothes-peg clothes-pegs peg pegs lint-roller
    :watch watch wristwatch
    :swimwear swimsuit bikini swim-trunks swimming-costume trunks pyjamas pajamas nightie`],
  ['Baby & Kind', `:baby-bottle nappies nappy diaper diapers baby-formula formula baby-milk baby-food baby-bottle teat dummy pacifier soother baby-powder baby-oil sudocrem nappy-bags nappy-cream baby-wipes breast-pads breast-pump
    :teddy toy toys teddy teddy-bear cuddly-toy soft-toy lego duplo puzzle jigsaw board-game game games playdough doll dolls building-blocks blocks rattle teether playmat
    :palette sticker-book craft-kit finger-paint
    :baby baby pram pushchair stroller buggy cot crib high-chair baby-monitor bib bibs muslin babygro sleepsuit onesie baby-carrier car-seat
    :kid school-bag lunch-bag kids child children toddler school-uniform pencil-case`],
  ['Sport & Freizeit', `:soccer football soccer ball basketball rugby-ball netball cricket-bat
    :tennis tennis-ball tennis-balls table-tennis ping-pong tennis-racket tennis-racquet badminton shuttlecock squash-racket
    :volleyball volleyball pump ball-pump
    :barbell dumbbell barbell weights kettlebell resistance-band exercise-band yoga-mat gym-mat protein protein-powder protein-bar shaker pull-up-bar
    :run running-shoes sports-bra gym-bag sweatband shin-guard shin-guards
    :swim goggles swimming-goggles swim-cap swimming-cap armbands flippers snorkel
    :tent tent sleeping-bag camping-stove camping-chair camping-mat tent-pegs tarp airbed lilo
    :ski skis ski-goggles snowboard sledge sled ski-gloves
    :fishing fishing-rod fishing-line fishing-hooks fishing-tackle bait lure
    :mountain climbing-rope climbing-shoes carabiners crampons ice-axe
    :hiking hiking-boots walking-boots walking-stick walking-poles trekking-poles
    :backpack hydration-pack daypack
    :guitar guitar ukulele violin drumsticks plectrum guitar-strings piano
    :dice dice playing-cards card-game chess monopoly
    :news magazine newspaper comic puzzle-book crossword
    :tennis bat paddle`],
  ['Auto & Velo', `:bike bike bicycle bike-lock bike-light bike-helmet bike-pump bike-chain bike-tube inner-tube puncture-repair-kit puncture-kit chain-oil chain-lube chain-spray bike-bell handlebar pedal saddle mudguard cycle-helmet cycling-helmet bike-rack kickstand
    :car car car-wash car-shampoo car-polish windscreen-wiper wiper windscreen-washer screenwash antifreeze de-icer engine-oil motor-oil oil-filter air-filter spark-plug number-plate car-mat car-mats warning-triangle jump-leads jump-starter tow-rope sat-nav satnav car-charger
    :tire tyre tire wheel
    :battery car-battery
    :ice ice-scraper
    :parking parking-disc parking-permit
    :scooter scooter e-scooter kick-scooter`],
  ['Sonstiges', `:package postage`],
);

const MODS = [
  [/^(cat|cats|dog|dogs|puppy|kitten|pet|pets|bird|rabbit|hamster|parrot|budgie)$/, 'Tierbedarf'],
  [/^(bike|bicycle|cycle|cycling|car|auto|motorbike)$/, 'Auto & Velo'],
  [/^(baby|babies|kids|kid|child|childrens|toddler)$/, 'Baby & Kind'],
  [/^(garden|lawn|plant)$/, 'Garten & Pflanzen'],
];

const STORE = {
  hardware: 'Werkzeug & Baumarkt', diy: 'Werkzeug & Baumarkt', 'hardware store': 'Werkzeug & Baumarkt', 'home improvement': 'Werkzeug & Baumarkt', 'b&q': 'Werkzeug & Baumarkt', screwfix: 'Werkzeug & Baumarkt', wickes: 'Werkzeug & Baumarkt', toolstation: 'Werkzeug & Baumarkt', homebase: 'Werkzeug & Baumarkt', 'home depot': 'Werkzeug & Baumarkt', lowes: 'Werkzeug & Baumarkt', "lowe's": 'Werkzeug & Baumarkt', 'ace hardware': 'Werkzeug & Baumarkt',
  pharmacy: 'Apotheke', chemist: 'Apotheke', boots: 'Apotheke', cvs: 'Apotheke', walgreens: 'Apotheke', superdrug: 'Körperpflege', drugstore: 'Körperpflege', beauty: 'Körperpflege',
  electronics: 'Elektro & Technik', currys: 'Elektro & Technik', 'best buy': 'Elektro & Technik', 'electrical shop': 'Elektro & Technik',
  'pet shop': 'Tierbedarf', 'pet store': 'Tierbedarf', 'pets at home': 'Tierbedarf', petco: 'Tierbedarf', petsmart: 'Tierbedarf',
  stationery: 'Papeterie & Büro', 'office supplies': 'Papeterie & Büro', staples: 'Papeterie & Büro', 'paperchase': 'Papeterie & Büro',
  furniture: 'Wohnen & Deko', ikea: 'Wohnen & Deko', 'home store': 'Wohnen & Deko', homeware: 'Wohnen & Deko', homewares: 'Wohnen & Deko', dunelm: 'Wohnen & Deko',
  garden: 'Garten & Pflanzen', 'garden centre': 'Garten & Pflanzen', 'garden center': 'Garten & Pflanzen', nursery: 'Garten & Pflanzen', florist: 'Garten & Pflanzen',
  sports: 'Sport & Freizeit', 'sports shop': 'Sport & Freizeit', decathlon: 'Sport & Freizeit',
  clothes: 'Kleidung & Textil', clothing: 'Kleidung & Textil', primark: 'Kleidung & Textil', 'h&m': 'Kleidung & Textil',
  bakery: 'Brot & Gebäck', butcher: 'Fleisch & Fisch', butchers: 'Fleisch & Fisch', fishmonger: 'Fleisch & Fisch', greengrocer: 'Früchte & Gemüse',
  'off licence': 'Getränke', 'liquor store': 'Getränke', 'wine shop': 'Getränke',
  'car shop': 'Auto & Velo', 'bike shop': 'Auto & Velo', halfords: 'Auto & Velo', 'auto parts': 'Auto & Velo',
  toys: 'Baby & Kind', 'toy shop': 'Baby & Kind', 'toy store': 'Baby & Kind', mothercare: 'Baby & Kind',
};

const icons = {
  DATA: [...SPEC, ...DATA],
  HEAD: 'last',
  SPLIT: /^(for|with|without|and|from|in|on|to|by|per|at|&)$/i,
  MODS,
  STORE,
};

export default { parser, icons };
