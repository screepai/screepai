import { mediaReferenceKey } from "./covers";
import type { MediaDetails, MediaEntry } from "./types";
import { REQUEST_TIMEOUT_MS } from "./util";
import { mediaNames, vndbRomajiTitle, type VndbTitle } from "./titles";
import { relatedMedia } from "./series";

type Options = {
   urls: readonly string[];
   entries: readonly MediaEntry[];
   malClientId: string;
   malAvailable: boolean;
   vndbAvailable: boolean;
   fetcher: typeof fetch;
};

type VndbDetails = {
   id: string;
   title?: string;
   name?: string;
   titles?: readonly VndbTitle[];
   languages?: readonly { lang: string; title: string | null; latin?: string | null }[];
   image?: { thumbnail?: string; url?: string } | null;
};

const vndbEndpoints = {
   v: { path: "vn", fields: "title,titles{lang,title,latin,official},image.thumbnail" },
   r: { path: "release", fields: "title,languages{lang,title,latin}" },
   p: { path: "producer", fields: "name" },
   c: { path: "character", fields: "name,image.url" },
} as const;

export async function resolveMediaDetails({
   urls,
   entries,
   malClientId,
   malAvailable,
   vndbAvailable,
   fetcher,
}: Options) {
   const requiredKeys = new Set(urls.map(mediaReferenceKey).filter((key) => key !== null));
   const featuredKeys = new Set(requiredKeys);
   const series = relatedMedia(entries);
   for (const key of featuredKeys) {
      for (const related of series.get(key) ?? []) requiredKeys.add(related);
   }
   const media: Record<string, MediaDetails> = {};
   for (const entry of entries) {
      const key = mediaReferenceKey(entry.url);
      if (!key || !requiredKeys.has(key)) continue;
      media[key] = {
         ...mediaNames(entry.title, entry.englishTitle, entry.romajiTitle),
         imageUrl: entry.imageUrl,
         status: entry.status,
         related: featuredKeys.has(key) ? series.get(key) : undefined,
         rating: {
            score: entry.userScore === null ? null : Math.round(entry.userScore * 100) / 10,
            source: entry.source,
         },
      };
   }

   const missing = [...requiredKeys].filter((key) => !media[key]);
   const requests: Promise<Record<string, MediaDetails>>[] = [];
   if (malAvailable) {
      for (const key of missing.filter((key) => !key.startsWith("vndb:"))) {
         requests.push(
            (async () => {
               const [kind, id] = key.split(":");
               const response = await fetcher(
                  `https://api.myanimelist.net/v2/${kind}/${id}?fields=alternative_titles`,
                  {
                     headers: { "X-MAL-CLIENT-ID": malClientId },
                     signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                  }
               );
               if (!response.ok) throw new Error(`MAL title returned ${response.status}`);
               const body = (await response.json()) as {
                  title: string;
                  alternative_titles?: { en?: string; ja?: string };
                  main_picture?: { medium?: string; large?: string };
               };
               return {
                  [key]: {
                     ...mediaNames(body.title, body.alternative_titles?.en || null, body.title),
                     imageUrl: body.main_picture?.medium || body.main_picture?.large || null,
                     rating: { score: null, source: "mal" },
                  },
               };
            })()
         );
      }
   }

   if (vndbAvailable) {
      for (const [prefix, { path, fields }] of Object.entries(vndbEndpoints)) {
         const ids = missing
            .filter((key) => key.startsWith(`vndb:${prefix}`))
            .map((key) => key.split(":")[1]);
         for (let offset = 0; offset < ids.length; offset += 100) {
            const batch = ids.slice(offset, offset + 100);
            const filters =
               batch.length === 1
                  ? ["id", "=", batch[0]]
                  : ["or", ...batch.map((id) => ["id", "=", id])];
            requests.push(
               (async () => {
                  const response = await fetcher(`https://api.vndb.org/kana/${path}`, {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ filters, fields, results: batch.length }),
                     signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
                  });
                  if (!response.ok) throw new Error(`VNDB titles returned ${response.status}`);
                  const body = (await response.json()) as { results: VndbDetails[] };
                  return Object.fromEntries(
                     body.results.map((item) => [
                        `vndb:${item.id}`,
                        {
                           ...mediaNames(
                              item.title || item.name || item.id,
                              item.titles?.find((title) => title.lang === "en" && title.official)
                                 ?.title ||
                                 item.languages?.find((title) => title.lang === "en")?.title ||
                                 null,
                              item.title
                                 ? vndbRomajiTitle(item.title, item.titles || []) ||
                                      item.languages?.find((title) => title.lang === "ja")?.latin ||
                                      null
                                 : null
                           ),
                           rating: prefix === "v" ? { score: null, source: "vndb" } : null,
                           imageUrl:
                              prefix === "v" || prefix === "c"
                                 ? item.image?.thumbnail || item.image?.url || null
                                 : undefined,
                        } satisfies MediaDetails,
                     ])
                  );
               })()
            );
         }
      }
   }

   const results = await Promise.allSettled(requests);
   let incomplete = false;
   for (const result of results) {
      if (result.status === "fulfilled") Object.assign(media, result.value);
      else {
         incomplete = true;
         console.warn("Title details unavailable:", result.reason);
      }
   }
   return { media, incomplete };
}
