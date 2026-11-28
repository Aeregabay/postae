// Registry of language packs. German is built into parser.js / icons.js; add other packs here:
//   import fr from './fr.js';   then add to PACKS: { fr }
import { registerParser } from '../parser.js';
import { registerIcons } from '../icons.js';

import en from './en.js';
import fr from './fr.js';
import es from './es.js';
import it from './it.js';
import nl from './nl.js';
import pt from './pt.js';
import pl from './pl.js';

// nl-BE (Vlaams) uses the Dutch pack, which already contains Flemish vocabulary.
const PACKS = { en, fr, es, it, nl, 'nl-BE': nl, pt, pl };

export const availableLanguages = () => Object.keys(PACKS);
export function registerAll() {
  for (const [code, pack] of Object.entries(PACKS)) {
    registerParser(code, pack.parser);
    registerIcons(code, pack.icons);
  }
  return availableLanguages();
}
