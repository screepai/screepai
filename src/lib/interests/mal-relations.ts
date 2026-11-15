import { mediaReferenceKey } from "./covers";
import { fetchMalRelations, type MalConfig } from "./sources/mal";
import type { MediaEntry } from "./types";

type Relations = NonNullable<MediaEntry["relations"]>;
const cache = new Map<string, { expires: number; value: Promise<Relations> }>();

function cachedRelations(key: string, config: MalConfig, fetcher: typeof fetch) {
   const cached = cache.get(key);
   if (cached && cached.expires > Date.now()) return cached.value;
   const [kind, id] = key.split(":") as ["anime" | "manga", string];
   const value = fetchMalRelations(config, kind, id, fetcher).catch((error) => {
      cache.delete(key);
      throw error;
   });
   if (cache.size >= 512) cache.delete(cache.keys().next().value!);
   cache.set(key, { expires: Date.now() + 24 * 60 * 60 * 1000, value });
   return value;
}

export async function loadMalRelations(
   entries: readonly MediaEntry[],
   urls: readonly string[],
   config: MalConfig,
   fetcher: typeof fetch
) {
   const indexed = new Map(entries.map((entry) => [mediaReferenceKey(entry.url)!, { ...entry }]));
   const pending = [
      ...new Set(
         urls.map(mediaReferenceKey).filter((key): key is string => !!key && indexed.has(key))
      ),
   ];
   const queued = new Set(pending);
   const tracked = new Set(indexed.keys());
   const depth = new Map(pending.map((key) => [key, 0]));
   const deadline = Date.now() + 15000;
   let count = 0;
   let incomplete = false;
   while (pending.length && count < 120 && Date.now() < deadline) {
      const batch = pending.splice(0, Math.min(6, 120 - count));
      count += batch.length;
      const results = await Promise.allSettled(
         batch.map((key) => cachedRelations(key, config, fetcher))
      );
      results.forEach((result, index) => {
         if (result.status === "rejected") {
            incomplete = true;
            return;
         }
         const key = batch[index];
         const entry = indexed.get(key)!;
         entry.relations = result.value;
         const path = key.split(":")[0];
         for (const relation of result.value) {
            const targetKey = `${path}:${relation.id}`;
            const nextDepth = tracked.has(targetKey) ? 0 : (depth.get(key) ?? 0) + 1;
            if (nextDepth > 2) continue;
            let target = indexed.get(targetKey);
            if (!target) {
               target = {
                  source: "mal",
                  kind: entry.kind,
                  id: relation.id,
                  title: relation.id,
                  englishTitle: null,
                  romajiTitle: null,
                  url: `https://myanimelist.net/${path}/${relation.id}`,
                  status: "unknown",
                  progress: null,
                  userScore: null,
                  signals: [],
               };
               indexed.set(targetKey, target);
            }
            if (target.kind !== entry.kind || queued.has(targetKey)) continue;
            depth.set(targetKey, nextDepth);
            queued.add(targetKey);
            pending.push(targetKey);
         }
      });
   }
   return { entries: [...indexed.values()], incomplete: incomplete || pending.length > 0 };
}
