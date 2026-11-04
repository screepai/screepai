import type { RequestHandler } from "@sveltejs/kit";

import {
   MAL_USERNAME,
   MAL_CLIENT_ID,
   MAL_ACCESS_TOKEN,
   VNDB_USER,
   VNDB_TOKEN,
   LASTFM_USERNAME,
   LASTFM_API_KEY,
} from "$app/env/private";

import { aggregateInterests, emptyInterestCollection } from "../../../lib/interests/score";

import { fetchMalAnime, fetchMalManga } from "../../../lib/interests/sources/mal";

import { fetchVndbVisualNovels } from "../../../lib/interests/sources/vndb";

import type { InterestsResponse, MediaEntry } from "../../../lib/interests/types";

import { fetchLastfmTopTracks } from "../../../lib/interests/sources/lastfm";

export const prerender = false;

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
   setHeaders({
      "cache-control": [
         "public",
         "max-age=0",
         "s-maxage=21600",
         "stale-while-revalidate=86400",
      ].join(", "),
   });

   const warnings: string[] = [];
   const malUsername = MAL_USERNAME.trim();
   const malClientId = MAL_CLIENT_ID.trim();
   const malAccessToken = MAL_ACCESS_TOKEN.trim();
   const vndbUser = VNDB_USER.trim();
   const vndbToken = VNDB_TOKEN.trim();
   const lastfmUsername = LASTFM_USERNAME.trim();
   const lastfmApiKey = LASTFM_API_KEY.trim();

   const malConfig =
      malUsername && malClientId
         ? {
              username: malUsername,

              clientId: malClientId,

              accessToken: malAccessToken || undefined,
           }
         : null;

   if (!malConfig) {
      console.warn("MAL_USERNAME or MAL_CLIENT_ID is missing.");
   }

   if (!vndbUser) {
      console.warn("VNDB_USER is missing.");
   }

   if (!lastfmUsername || !lastfmApiKey) {
      console.warn("LASTFM_USERNAME or LASTFM_API_KEY is missing.");
   }

   const malProfileUrl = malUsername
      ? `https://myanimelist.net/profile/${encodeURIComponent(malUsername)}`
      : "";

   let music: InterestsResponse["music"] = {
      source: "lastfm",

      sourceLabel: "Last.fm",

      profileUrl: lastfmUsername
         ? `https://www.last.fm/user/${encodeURIComponent(lastfmUsername)}`
         : "",

      period: "1month",

      tracks: [],
   };

   const [animeResult, mangaResult, vndbResult, lastfmResult] = await Promise.allSettled([
      malConfig ? fetchMalAnime(malConfig, fetch) : Promise.resolve(null),

      malConfig ? fetchMalManga(malConfig, fetch) : Promise.resolve(null),

      vndbUser
         ? fetchVndbVisualNovels({ user: vndbUser, token: vndbToken || undefined }, fetch)
         : Promise.resolve(null),

      lastfmUsername && lastfmApiKey
         ? fetchLastfmTopTracks(lastfmUsername, lastfmApiKey, fetch)
         : Promise.resolve(null),
   ]);

   let animeEntries: MediaEntry[] = [];

   let mangaEntries: MediaEntry[] = [];

   let vnEntries: MediaEntry[] = [];

   let vndbProfileUrl = "";

   if (animeResult.status === "rejected") {
      console.error(animeResult.reason);

      warnings.push("Anime data could not be loaded.");
   } else if (animeResult.value) {
      animeEntries = animeResult.value;
   } else {
      warnings.push("Anime data is unavailable.");
   }

   if (mangaResult.status === "rejected") {
      console.error(mangaResult.reason);

      warnings.push("Manga data could not be loaded.");
   } else if (mangaResult.value) {
      mangaEntries = mangaResult.value;
   } else {
      warnings.push("Manga data is unavailable.");
   }

   if (vndbResult.status === "rejected") {
      console.error(vndbResult.reason);

      warnings.push("Visual novel data could not be loaded.");
   } else if (vndbResult.value) {
      vnEntries = vndbResult.value.entries;

      vndbProfileUrl = `https://vndb.org/${vndbResult.value.user.id}`;
   } else {
      warnings.push("Visual novel data is unavailable.");
   }

   if (lastfmResult.status === "rejected") {
      console.error(lastfmResult.reason);

      warnings.push("Last.fm data could not be loaded.");
   } else if (lastfmResult.value) {
      music = lastfmResult.value;
   }

   const response: InterestsResponse = {
      version: 2,

      generatedAt: new Date().toISOString(),

      anime: malUsername
         ? aggregateInterests({
              kind: "anime",

              source: "mal",

              sourceLabel: "MyAnimeList",

              profileUrl: malProfileUrl,

              entries: animeEntries,

              top: 6,
           })
         : emptyInterestCollection("anime", "mal", "MyAnimeList", ""),

      manga: malUsername
         ? aggregateInterests({
              kind: "manga",

              source: "mal",

              sourceLabel: "MyAnimeList",

              profileUrl: malProfileUrl,

              entries: mangaEntries,

              top: 6,
           })
         : emptyInterestCollection("manga", "mal", "MyAnimeList", ""),

      visualNovels: vndbUser
         ? aggregateInterests({
              kind: "visual-novel",

              source: "vndb",

              sourceLabel: "VNDB",

              profileUrl: vndbProfileUrl,

              entries: vnEntries,

              top: 8,
           })
         : emptyInterestCollection("visual-novel", "vndb", "VNDB", ""),
      music,
      warnings,
   };

   return Response.json(response);
};
