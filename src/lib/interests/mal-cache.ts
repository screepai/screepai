import { fetchMalAnime, fetchMalManga, type MalConfig } from "./sources/mal";
import type { MediaEntry } from "./types";

const lists = new Map<string, { expires: number; value: Promise<MediaEntry[]> }>();

export function cachedMalList(kind: "anime" | "manga", config: MalConfig, fetcher: typeof fetch) {
   const key = JSON.stringify([kind, config.username, config.clientId, config.accessToken]);
   const cached = lists.get(key);
   if (cached && cached.expires > Date.now()) return cached.value;
   const value = (kind === "anime" ? fetchMalAnime : fetchMalManga)(config, fetcher).catch(
      (error) => {
         lists.delete(key);
         throw error;
      }
   );
   lists.set(key, { expires: Date.now() + 5 * 60 * 1000, value });
   return value;
}
