import type { InterestExample } from "./types";

function seriesTitle(title: string) {
   return title
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .replace(/\b(?:\d+(?:st|nd|rd|th)?|first|second|third|fourth|fifth|final)\s+season\b.*$/u, "")
      .replace(/\b(?:season|part|chapter|episode|volume|vol)\s+(?:\d+|[ivx]+)\b.*$/u, "")
      .replace(/\b(?:mini\s+)?after\s+story\b.*$/u, "")
      .trim();
}

export function selectInterestExamples(
   candidates: readonly (readonly InterestExample[])[],
   limit: number
): InterestExample[][] {
   const titles = new Set(
      candidates.flatMap((examples) => examples.map((example) => seriesTitle(example.title)))
   );
   const seriesKey = (example: InterestExample) => {
      let title = seriesTitle(example.title);
      const prefix = seriesTitle(example.title.split(/:\s+|\s+[-–—]\s+/u)[0]);
      if (prefix && titles.has(prefix)) {
         title = prefix;
      }
      const base = title.replace(/\s*(?:\d+|\b[ivx]+)(?:\s+plus)?$/u, "").trim();
      return base && titles.has(base) ? base : title;
   };
   const selected: InterestExample[][] = candidates.map(() => []);
   const selectedSeries = candidates.map(() => new Set<string>());
   const uses = new Map<string, number>();

   for (let slot = 0; slot < limit; slot++) {
      candidates.forEach((examples, index) => {
         let choice: InterestExample | undefined;
         let fewestUses = Infinity;
         for (const example of examples) {
            const key = seriesKey(example);
            if (selectedSeries[index].has(key)) continue;
            const count = uses.get(key) ?? 0;
            if (count < fewestUses) {
               choice = example;
               fewestUses = count;
            }
            if (count === 0) break;
         }
         if (!choice) return;
         const key = seriesKey(choice);
         selected[index].push(choice);
         selectedSeries[index].add(key);
         uses.set(key, (uses.get(key) ?? 0) + 1);
      });
   }

   return selected;
}
