// Registry of language packs. German is built into parser.js / icons.js; add other packs here:
//   import fr from './fr.js';   then add to PACKS: { fr }
import { registerParser } from '../parser.js';
import { registerIcons } from '../icons.js';

const PACKS = {};

export const availableLanguages = () => Object.keys(PACKS);
export function registerAll() {
  for (const [code, pack] of Object.entries(PACKS)) {
    registerParser(code, pack.parser);
    registerIcons(code, pack.icons);
  }
  return availableLanguages();
}
