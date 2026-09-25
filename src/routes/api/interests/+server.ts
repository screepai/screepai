import {
   json,
   type RequestHandler,
} from "@sveltejs/kit";

import {
   env,
} from "$env/dynamic/private";

import {
   aggregateInterests,
   emptyInterestCollection,
} from "../../../lib/interests/score";

import {
   fetchMalAnime,
   fetchMalManga,
} from "../../../lib/interests/sources/mal";

import {
   fetchVndbVisualNovels,
} from "../../../lib/interests/sources/vndb";

import type {
   InterestsResponse,
   MediaEntry,
} from "../../../lib/interests/types";


export const prerender = false;


export const GET:
   RequestHandler =
   async ({
      fetch,
      setHeaders,
   }) => {
      setHeaders({
         "cache-control":
            [
               "public",
               "max-age=0",
               "s-maxage=21600",
               "stale-while-revalidate=86400",
            ].join(", "),
      });


      const warnings:
         string[] = [];


      const malUsername =
         env.MAL_USERNAME?.trim();

      const malClientId =
         env.MAL_CLIENT_ID?.trim();

      const malAccessToken =
         env.MAL_ACCESS_TOKEN?.trim();


      const vndbUser =
         env.VNDB_USER?.trim();

      const vndbToken =
         env.VNDB_TOKEN?.trim();


      let animeEntries:
         MediaEntry[] = [];

      let mangaEntries:
         MediaEntry[] = [];

      let vnEntries:
         MediaEntry[] = [];

      let vndbProfileUrl = "";


      /*
       * MAL
       */
      if (
         malUsername &&
         malClientId
      ) {
         const config = {
            username:
               malUsername,

            clientId:
               malClientId,

            accessToken:
               malAccessToken ||
               undefined,
         };

         const [
            animeResult,
            mangaResult,
         ] =
            await Promise.allSettled([
               fetchMalAnime(
                  config,
                  fetch
               ),

               fetchMalManga(
                  config,
                  fetch
               ),
            ]);


         if (
            animeResult.status ===
            "fulfilled"
         ) {
            animeEntries =
               animeResult.value;
         } else {
            console.error(
               animeResult.reason
            );

            warnings.push(
               "Anime data could not be loaded."
            );
         }


         if (
            mangaResult.status ===
            "fulfilled"
         ) {
            mangaEntries =
               mangaResult.value;
         } else {
            console.error(
               mangaResult.reason
            );

            warnings.push(
               "Manga data could not be loaded."
            );
         }
      } else {
         warnings.push(
            "MAL_USERNAME or MAL_CLIENT_ID is missing."
         );
      }


      /*
       * VNDB
       */
      if (vndbUser) {
         try {
            const result =
               await fetchVndbVisualNovels(
                  {
                     user:
                        vndbUser,

                     token:
                        vndbToken ||
                        undefined,
                  },
                  fetch
               );

            vnEntries =
               result.entries;

            vndbProfileUrl =
               `https://vndb.org/${result.user.id}`;
         } catch (error) {
            console.error(
               error
            );

            warnings.push(
               "VNDB data could not be loaded."
            );
         }
      } else {
         warnings.push(
            "VNDB_USER is missing."
         );
      }


      const malProfileUrl =
         malUsername
            ? `https://myanimelist.net/profile/${encodeURIComponent(
                 malUsername
              )}`
            : "";


      const response:
         InterestsResponse = {
         version: 1,

         generatedAt:
            new Date()
               .toISOString(),

         anime:
            malUsername
               ? aggregateInterests({
                    kind:
                       "anime",

                    source:
                       "mal",

                    sourceLabel:
                       "MyAnimeList",

                    profileUrl:
                       malProfileUrl,

                    entries:
                       animeEntries,

                    top: 6,
                 })
               : emptyInterestCollection(
                    "anime",
                    "mal",
                    "MyAnimeList",
                    ""
                 ),

         manga:
            malUsername
               ? aggregateInterests({
                    kind:
                       "manga",

                    source:
                       "mal",

                    sourceLabel:
                       "MyAnimeList",

                    profileUrl:
                       malProfileUrl,

                    entries:
                       mangaEntries,

                    top: 6,
                 })
               : emptyInterestCollection(
                    "manga",
                    "mal",
                    "MyAnimeList",
                    ""
                 ),

         visualNovels:
            vndbUser
               ? aggregateInterests({
                    kind:
                       "visual-novel",

                    source:
                       "vndb",

                    sourceLabel:
                       "VNDB",

                    profileUrl:
                       vndbProfileUrl,

                    entries:
                       vnEntries,

                    top: 8,
                 })
               : emptyInterestCollection(
                    "visual-novel",
                    "vndb",
                    "VNDB",
                    ""
                 ),

         warnings,
      };


      return json(
         response
      );
   };