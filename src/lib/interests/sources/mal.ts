import type {
   InterestSignal,
   MediaEntry,
   MediaStatus,
} from "../types";


type MalGenre = {
   id: number;
   name: string;
};


type MalAnimeNode = {
   id: number;
   title: string;

   num_episodes?: number;

   genres?: readonly MalGenre[];
};


type MalAnimeStatus = {
   status: string;

   score?: number;

   num_episodes_watched?: number;
};


type MalMangaNode = {
   id: number;
   title: string;

   num_chapters?: number;

   genres?: readonly MalGenre[];
};


type MalMangaStatus = {
   status: string;

   score?: number;

   num_chapters_read?: number;
};


type MalListItem<
   Node,
   Status
> = {
   node: Node;
   list_status: Status;
};


type MalPagedResponse<T> = {
   data: readonly T[];

   paging?: {
      next?: string;
   };
};


export type MalConfig = {
   username: string;
   clientId: string;
   accessToken?: string;
};


function clamp01(
   value: number
) {
   return Math.min(
      1,
      Math.max(
         0,
         value
      )
   );
}


function normalizeProgress(
   completedAmount: number | undefined,
   totalAmount: number | undefined,
   status: MediaStatus
) {
   if (
      status === "completed"
   ) {
      return 1;
   }

   if (
      !completedAmount ||
      !totalAmount ||
      totalAmount <= 0
   ) {
      return null;
   }

   return clamp01(
      completedAmount /
         totalAmount
   );
}


function normalizeScore(
   score: number | undefined
) {
   if (
      !score ||
      score <= 0
   ) {
      return null;
   }

   return clamp01(
      score / 10
   );
}


function normalizeAnimeStatus(
   status: string
): MediaStatus {
   switch (status) {
      case "watching":
         return "current";

      case "completed":
         return "completed";

      case "on_hold":
         return "on-hold";

      case "dropped":
         return "dropped";

      case "plan_to_watch":
         return "planned";

      default:
         return "unknown";
   }
}


function normalizeMangaStatus(
   status: string
): MediaStatus {
   switch (status) {
      case "reading":
         return "current";

      case "completed":
         return "completed";

      case "on_hold":
         return "on-hold";

      case "dropped":
         return "dropped";

      case "plan_to_read":
         return "planned";

      default:
         return "unknown";
   }
}

const ignoredMalGenres =
   new Set([
      84,
   ]);


function genresToSignals(
   genres:
      readonly MalGenre[] |
      undefined
): InterestSignal[] {
   return (
      genres ?? []
   )
      .filter(
         (genre) =>
            !ignoredMalGenres.has(
               genre.id
            )
      )
      .map(
         (genre) => ({
            id:
               `mal-genre-${genre.id}`,

            name:
               genre.name,

            strength: 1,
         })
      );
}


async function fetchAllPages<T>(
   firstUrl: string,
   headers: HeadersInit,
   fetcher: typeof fetch
) {
   const result: T[] = [];

   let nextUrl:
      string | undefined =
      firstUrl;

   while (nextUrl) {
      const response =
         await fetcher(
            nextUrl,
            {
               headers,
            }
         );

      if (!response.ok) {
         const message =
            await response.text();

         throw new Error(
            `MAL returned ${response.status}: ${message}`
         );
      }

      const body =
         await response.json() as
            MalPagedResponse<T>;

      result.push(
         ...body.data
      );

      nextUrl =
         body.paging?.next;
   }

   return result;
}


function createHeaders(
   config: MalConfig
) {
   const headers =
      new Headers();

   headers.set(
      "X-MAL-CLIENT-ID",
      config.clientId
   );

   if (
      config.accessToken
   ) {
      headers.set(
         "Authorization",
         `Bearer ${config.accessToken}`
      );
   }

   return headers;
}


export async function fetchMalAnime(
   config: MalConfig,
   fetcher: typeof fetch
): Promise<MediaEntry[]> {
   const fields = [
      "num_episodes",
      "genres",
      "list_status{status,score,num_episodes_watched}",
   ].join(",");

   const url =
      new URL(
         `https://api.myanimelist.net/v2/users/${encodeURIComponent(
            config.username
         )}/animelist`
      );

   url.searchParams.set(
      "limit",
      "1000"
   );

   url.searchParams.set(
      "fields",
      fields
   );

   const items =
      await fetchAllPages<
         MalListItem<
            MalAnimeNode,
            MalAnimeStatus
         >
      >(
         url.toString(),
         createHeaders(config),
         fetcher
      );

   return items.map(
      ({
         node,
         list_status,
      }) => {
         const status =
            normalizeAnimeStatus(
               list_status.status
            );

         return {
            source: "mal",
            kind: "anime",

            id: String(
               node.id
            ),

            title:
               node.title,

            url:
               `https://myanimelist.net/anime/${node.id}`,

            status,

            progress:
               normalizeProgress(
                  list_status
                     .num_episodes_watched,
                  node.num_episodes,
                  status
               ),

            userScore:
               normalizeScore(
                  list_status.score
               ),

            signals:
               genresToSignals(
                  node.genres
               ),
         };
      }
   );
}


export async function fetchMalManga(
   config: MalConfig,
   fetcher: typeof fetch
): Promise<MediaEntry[]> {
   const fields = [
      "num_chapters",
      "genres",
      "list_status{status,score,num_chapters_read}",
   ].join(",");

   const url =
      new URL(
         `https://api.myanimelist.net/v2/users/${encodeURIComponent(
            config.username
         )}/mangalist`
      );

   url.searchParams.set(
      "limit",
      "1000"
   );

   url.searchParams.set(
      "fields",
      fields
   );

   const items =
      await fetchAllPages<
         MalListItem<
            MalMangaNode,
            MalMangaStatus
         >
      >(
         url.toString(),
         createHeaders(config),
         fetcher
      );

   return items.map(
      ({
         node,
         list_status,
      }) => {
         const status =
            normalizeMangaStatus(
               list_status.status
            );

         return {
            source: "mal",
            kind: "manga",

            id: String(
               node.id
            ),

            title:
               node.title,

            url:
               `https://myanimelist.net/manga/${node.id}`,

            status,

            progress:
               normalizeProgress(
                  list_status
                     .num_chapters_read,
                  node.num_chapters,
                  status
               ),

            userScore:
               normalizeScore(
                  list_status.score
               ),

            signals:
               genresToSignals(
                  node.genres
               ),
         };
      }
   );
}