import type { RequestHandler } from "@sveltejs/kit";
import { MAL_USERNAME, MAL_CLIENT_ID, MAL_ACCESS_TOKEN } from "$app/env/private";
import { cachedMalList } from "../../../lib/interests/mal-cache";
import { loadMalRelations } from "../../../lib/interests/mal-relations";
import { resolveMediaDetails } from "../../../lib/interests/details";
import { featuredMediaUrls } from "../../../lib/interests/references";

export const prerender = false;

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
   const config = {
      username: MAL_USERNAME.trim(),
      clientId: MAL_CLIENT_ID.trim(),
      accessToken: MAL_ACCESS_TOKEN.trim() || undefined,
   };
   if (!config.username || !config.clientId) return Response.json({ media: {} });
   const lists = await Promise.allSettled([
      cachedMalList("anime", config, fetch),
      cachedMalList("manga", config, fetch),
   ]);
   const entries = lists.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
   const urls = featuredMediaUrls.filter((url) => new URL(url).hostname === "myanimelist.net");
   const related = await loadMalRelations(entries, urls, config, fetch);
   const { media } = await resolveMediaDetails({
      urls,
      entries: related.entries,
      malClientId: config.clientId,
      malAvailable: false,
      vndbAvailable: false,
      fetcher: fetch,
   });
   const incomplete = related.incomplete || lists.some((result) => result.status === "rejected");
   setHeaders({
      "cache-control": incomplete
         ? "public, max-age=0, s-maxage=60"
         : "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
   });
   return Response.json({ media });
};
