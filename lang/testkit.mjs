// Test helper for language packs: loadPack('fr') imports ./fr.js (default export {parser, icons}) and registers both.
import { registerParser, parseUtterance } from '../parser.js';
import { registerIcons, resolveIcon, matchKeyword, guessCategory, suggestionKeywords } from '../icons.js';
export async function loadPack(lang) {
  const mod = await import(`./${lang}.js`);
  const pack = mod.default;
  if (!pack || !pack.parser || !pack.icons) throw new Error(`lang/${lang}.js must default-export { parser, icons }`);
  registerParser(lang, pack.parser);
  const keywords = registerIcons(lang, pack.icons);
  return { lang, keywords, parse: (t, stores) => parseUtterance(t, stores, lang), resolveIcon: (n, c) => resolveIcon(n, c, lang),
    matchKeyword: n => matchKeyword(n, lang), guessCategory: (n, k) => guessCategory(n, k, lang), suggestionKeywords: () => suggestionKeywords(lang) };
}
