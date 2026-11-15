import type { MemoryWipePick } from "../../config/contents";
import { mediaReferenceKey } from "./covers";
import type { MediaDetails, MediaEntry } from "./types";

const seriesRelations = new Set(["seq", "preq", "set", "alt", "fan", "orig", "side", "par", "ser"]);

export function relatedMedia(entries: readonly MediaEntry[]) {
   const items = new Map(
      entries.flatMap((entry) => {
         const key = mediaReferenceKey(entry.url);
         return key ? [[key, entry] as const] : [];
      })
   );
   const nameWords = (title: string) =>
      title
         .normalize("NFKC")
         .toLowerCase()
         .match(/[\p{L}]+/gu) ?? [];
   const baseNames = new Set(
      [...items.values()]
         .map((entry) => nameWords(entry.title))
         .filter((words) => words.length === 1 && words[0].length >= 4)
         .map(([word]) => word)
   );
   function sameFranchise(a: MediaEntry, b: MediaEntry) {
      const left = nameWords(a.title);
      const right = nameWords(b.title);
      let common = 0;
      while (common < Math.min(left.length, right.length) && left[common] === right[common])
         common++;
      return common >= 2 || (common === 1 && baseNames.has(left[0]));
   }
   const graph = new Map([...items.keys()].map((key) => [key, new Set<string>()]));
   for (const [key, entry] of items) {
      for (const relation of entry.relations ?? []) {
         const targetKey = `${key.split(":")[0]}:${relation.id}`;
         const target = items.get(targetKey);
         if (
            !relation.relation_official ||
            !seriesRelations.has(relation.relation) ||
            !target ||
            target.kind !== entry.kind
         )
            continue;
         if (relation.relation === "set" && !sameFranchise(entry, target)) continue;
         graph.get(key)!.add(targetKey);
         graph.get(targetKey)!.add(key);
      }
   }
   const related = new Map<string, readonly string[]>();
   const visited = new Set<string>();
   for (const key of items.keys()) {
      if (visited.has(key)) continue;
      const pending = [key];
      const component: string[] = [];
      while (pending.length) {
         const current = pending.pop()!;
         if (visited.has(current)) continue;
         visited.add(current);
         const entry = items.get(current)!;
         if (
            entry.userScore !== null ||
            ["current", "completed", "on-hold", "dropped"].includes(entry.status)
         )
            component.push(current);
         for (const neighbor of graph.get(current)!) pending.push(neighbor);
      }
      if (component.length < 2) continue;
      component.sort((a, b) => {
         const left = items.get(a)!;
         const right = items.get(b)!;
         return (
            (left.released || "9999").localeCompare(right.released || "9999") ||
            Number(left.id.replace(/^v/, "")) - Number(right.id.replace(/^v/, ""))
         );
      });
      for (const member of component) related.set(member, component);
   }
   return related;
}

export function groupMediaPicks(
   picks: readonly MemoryWipePick[],
   media: Readonly<Record<string, MediaDetails>>
) {
   const configured = new Map(picks.map((pick) => [mediaReferenceKey(pick.url), pick]));
   const seen = new Set<string>();
   const groups: { pick: MemoryWipePick; parts?: readonly MemoryWipePick[] }[] = [];
   for (const pick of picks) {
      const key = mediaReferenceKey(pick.url);
      if (key && seen.has(key)) continue;
      const related = key ? media[key]?.related : undefined;
      if (!related?.length) {
         groups.push({ pick });
         continue;
      }
      const parts = related.map((partKey) => {
         seen.add(partKey);
         const part = configured.get(partKey);
         return {
            url:
               part?.url ??
               (partKey.startsWith("vndb:")
                  ? `https://vndb.org/${partKey.slice(5)}`
                  : `https://myanimelist.net/${partKey.replace(":", "/")}`),
            note: partKey === key ? undefined : part?.note,
         };
      });
      groups.push({ pick, parts });
   }
   return groups;
}

export function mediaSeriesTitle(
   parts: readonly MemoryWipePick[],
   media: Readonly<Record<string, MediaDetails>>
) {
   const details = parts.map((part) => media[mediaReferenceKey(part.url) ?? ""]).filter(Boolean);
   function commonName(names: string[]) {
      if (names.length !== parts.length) return "";
      let prefix = names[0] ?? "";
      for (const name of names.slice(1)) {
         while (prefix && !name.toLowerCase().startsWith(prefix.toLowerCase()))
            prefix = prefix.slice(0, -1);
      }
      prefix = prefix
         .split(":")[0]
         .trim()
         .replace(/[~–—\s]+$/u, "");
      if (prefix.length < 3 || /^(the|a|an)$/i.test(prefix)) return "";
      return prefix;
   }
   const name =
      commonName(details.map((item) => item.title)) ||
      commonName(details.map((item) => item.alternateTitle ?? item.title));
   return name ? `${name} series` : details[0] ? `${details[0].title} & related` : "related titles";
}
