# Store catalog spec (Fetchy)

Output: one JSON file per country: /home/claude/postae/catalog/<CC>.json  (CC = ISO 3166-1 alpha-2, uppercase)

```json
{
  "country": "CH",
  "researched_at": "2026-11-28",
  "stores": [
    {
      "name": "Migros",
      "kind": "Lebensmittel",
      "rank": 1,
      "color": "#FF6600",
      "aliases": ["migros", "migro"],
      "regions": null,
      "online_only": false,
      "source": "https://..."
    }
  ]
}
```

Fields
- name: official brand name as customers say it (no legal suffixes).
- kind: EXACTLY one of these ids (German ids, stored in DB):
  Lebensmittel, Discounter, Drogerie, Apotheke, Kleidung, Online, Elektronik, Baumarkt, Möbel, Wohnen, Tierbedarf, Sport, Sonstige
  (Wohnen = home decor/household goods like Zara Home, Depot, Søstrene Grene; Möbel = furniture like IKEA; Discounter = Aldi/Lidl/Denner-type grocery discounters; Online = online-first retailers like Amazon, Galaxus, Zalando, Allegro, bol.com.)
- rank: 1..20 for the country's overall TOP 20 most relevant stores for everyday household shopping (by market share / footprint / popularity); null for stores that are only in a category top 5.
- Coverage: overall top 20 PLUS the top 5 per kind (overlaps allowed, no duplicates in the list) → typically 45–65 entries.
- color: brand's primary color as hex. If two stores IN THE SAME COUNTRY would be indistinguishable (e.g. both orange), give the less iconic one its secondary brand color. Every color must be readable as a small dot on white.
- aliases: lowercase spellings/variants a speech recognizer may produce (incl. without accents, common short forms), max 5.
- regions: only where coverage differs strongly by region (e.g. CH: ["de","fr","it"] language regions where the chain is present; BE: ["nl","fr"]); else null.
- online_only: true for pure online retailers.
- source: one URL supporting relevance (market share ranking, retailer list, or official site).

Rules
- Use web search for current facts (2025/2026 market data); don't rely on memory for rankings. Exclude chains that closed or exited the country.
- Validate with node: valid JSON, kinds from the allowed list, unique names, colors /^#[0-9A-F]{6}$/i, rank 1..20 unique.
- Do not edit any other file. Reply in max 3 lines: file(s) written + store counts.
