import type { RequestHandler } from "@sveltejs/kit";
import { MAL_CLIENT_ID } from "$app/env/private";
import { featuredMediaUrls } from "#lib/interests/references.js";
import { mediaCoverKey, type MediaCover } from "#lib/interests/covers.js";
import { REQUEST_TIMEOUT_MS } from "#lib/interests/util.js";

export const prerender = false;

const allowedKeys = new Set<string>();
for (const url of featuredMediaUrls) {
   const key = mediaCoverKey(url);
   if (key) allowedKeys.add(key);
}

const CACHE_MS = 24 * 60 * 60 * 1000;
const covers = new Map<string, { expires: number; value: Promise<MediaCover | null> }>();

async function fetchCover(key: string, fetcher: typeof fetch): Promise<MediaCover | null> {
   const [source, id] = key.split(":");
   if (source === "vndb") {
      const release = id.startsWith("r");
      const character = id.startsWith("c");
      const endpoint = character ? "character" : release ? "release" : "vn";
      const response = await fetcher(`https://api.vndb.org/kana/${endpoint}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            filters: ["id", "=", id],
            fields: character
               ? "name,image.url"
               : release
                 ? "title,images{type,thumbnail},vns{image.thumbnail}"
                 : "title,image.thumbnail",
            results: 1,
         }),
         signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`VNDB cover returned ${response.status}`);
      const body = (await response.json()) as {
         results: {
            title?: string;
            name?: string;
            image?: { thumbnail?: string; url?: string } | null;
            images?: { type: string; thumbnail: string }[];
            vns?: { image: { thumbnail: string } | null }[];
         }[];
      };
      const vn = body.results[0];
      const imageUrl = character
         ? vn?.image?.url
         : release
           ? vn?.images?.find((image) => image.type === "pkgfront" || image.type === "dig")
                ?.thumbnail || vn?.vns?.[0]?.image?.thumbnail
           : vn?.image?.thumbnail;
      return imageUrl ? { title: vn.title || vn.name || id, imageUrl } : null;
   }

   if (!MAL_CLIENT_ID.trim()) throw new Error("MAL client ID is unavailable");
   const response = await fetcher(
      `https://api.myanimelist.net/v2/${source}/${id}?fields=main_picture`,
      {
         headers: { "X-MAL-CLIENT-ID": MAL_CLIENT_ID.trim() },
         signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      }
   );
   if (response.status === 404) return null;
   if (!response.ok) throw new Error(`MAL cover returned ${response.status}`);
   const body = (await response.json()) as {
      title: string;
      main_picture?: { medium?: string; large?: string };
   };
   const imageUrl = body.main_picture?.medium || body.main_picture?.large;
   return imageUrl ? { title: body.title, imageUrl } : null;
}

export const GET: RequestHandler = async ({ params, fetch, setHeaders }) => {
   const key = params.key ?? "";
   if (!allowedKeys.has(key)) {
      return Response.json({ error: "Unknown title" }, { status: 404 });
   }

   let cached = covers.get(key);
   if (!cached || cached.expires <= Date.now()) {
      const value = fetchCover(key, fetch).catch((error) => {
         covers.delete(key);
         throw error;
      });
      cached = { expires: Date.now() + CACHE_MS, value };
      covers.set(key, cached);
   }

   try {
      const cover = await cached.value;
      setHeaders({
         "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      });
      return Response.json(cover);
   } catch (error) {
      console.warn("Cover preview unavailable:", error);
      return Response.json(
         { error: "Cover unavailable" },
         {
            status: 502,
            headers: { "cache-control": "no-store" },
         }
      );
   }
};
