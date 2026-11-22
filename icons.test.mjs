import {resolveIcon,guessCategory,KEYWORDS,CATEGORIES} from './icons.js';
import {ICON_SVGS} from './icon-svgs.js';
const cases={'Pfannendeckel':'Küche & Haushaltswaren','Kabelbinder':'Werkzeug & Baumarkt','Gummiseile für Sofa Überzug':'Werkzeug & Baumarkt','Befestigungsstangen':'Werkzeug & Baumarkt','Katzennetz':'Tierbedarf','Spritzschutz':'Küche & Haushaltswaren','Kabelkanal':'Elektro & Technik',
'Äpfel':'Früchte & Gemüse','Rüebli':'Früchte & Gemüse','Milch':'Milch & Käse','Hafermilch':'Milch & Käse','Schneidebrett':'Küche & Haushaltswaren','Alufolie':'Küche & Haushaltswaren','Dübel':'Werkzeug & Baumarkt','Schrauben':'Werkzeug & Baumarkt','Klebeband':'Werkzeug & Baumarkt','Steckdosen':'Elektro & Technik','Batterien':'Elektro & Technik','Katzenstreu':'Tierbedarf','Kissen':'Wohnen & Deko','Kerzen':'Wohnen & Deko','Kugelschreiber':'Papeterie & Büro','Socken':'Kleidung & Textil','Windeln':'Baby & Kind','Veloschlauch':'Auto & Velo','Zahnpasta':'Körperpflege','Pflaster':'Apotheke','Duschgel':'Körperpflege','Pelati':'Vorräte','Bratpfanne':'Küche & Haushaltswaren','Mehrfachstecker':'Elektro & Technik','Filzgleiter':'Werkzeug & Baumarkt','Glühbirne':'Elektro & Technik','LED Leuchtmittel':'Elektro & Technik'};
let bad=0;for(const[n,c]of Object.entries(cases)){const r=resolveIcon(n);if(!r.matched||r.category!==c){bad++;console.log('FAIL',n,JSON.stringify(r),'want',c)}}
const un=resolveIcon('Xyzqwv');if(un.matched||un.icon!=='cart')bad++,console.log('FAIL fallback');
if(guessCategory('Xyzqwv','Baumarkt')!=='Werkzeug & Baumarkt'||guessCategory('Xyzqwv','Drogerie')!=='Körperpflege')bad++,console.log('FAIL store');
console.log('keywords',KEYWORDS.length,'cats',CATEGORIES.length);if(KEYWORDS.length<600)bad++,console.log('FAIL <600 keywords');
const want={'Pfannendeckel':['lid'],'Katzennetz':['net'],'Kabelkanal':['duct'],'Kabelbinder':['cable-tie'],'Gummiseile':['rope','bungee'],'Befestigungsstangen':['rod'],'Verbindungsstücke':['connector'],'Gumminoppen':['bumper'],'Spritzschutz':['splash'],
'Äpfel':['apple'],'Bananen':['banana'],'Milch':['milk'],'Brot':['bread'],'Käse':['cheese'],'Eier':['egg'],'Butter':['butter'],'Rüebli':['carrot'],'Tomaten':['tomato'],'Kartoffeln':['potato'],'Zitrone':['lemon'],'Lachs':['fish'],'Pasta':['pasta'],'Reis':['rice'],'Kaffee':['coffee'],'Bier':['beer'],'Wein':['wine'],'Pizza':['pizza'],'Schokolade':['chocolate'],'Avocado':['avocado'],'Gipfeli':['croissant'],'Poulet':['chicken'],'Wasser':['water'],'Glace':['icecream']};
for(const[n,ks]of Object.entries(want)){const r=resolveIcon(n);if(!ks.includes(r.icon))bad++,console.log('FAIL icon',n,r.icon,'want',ks)}
if(resolveIcon('Kabelkanal').icon==='plug')bad++,console.log('FAIL kabelkanal plug');
const cat=n=>resolveIcon(n).category;if(cat('Katzennetz')!=='Tierbedarf'||cat('Hundenetz')!=='Tierbedarf'||resolveIcon('Hundenetz').icon!=='net')bad++,console.log('FAIL modifier category');
for(const c of CATEGORIES)if(!ICON_SVGS[c.icon])bad++,console.log('FAIL category icon',c.name,c.icon);
for(const k of KEYWORDS)if(!ICON_SVGS[k.icon]){bad++,console.log('FAIL svg missing',k.kw,k.icon);break}
process.exit(bad?1:0);
