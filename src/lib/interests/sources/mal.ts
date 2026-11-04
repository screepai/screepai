import type { InterestSignal, MediaEntry, MediaKind, MediaStatus } from "../types";

import { MAX_PAGES, REQUEST_TIMEOUT_MS, clamp01 } from "../util";

type MalGenre = {
   id: number;
   name: string;
};

type MalNode = {
   id: number;
   title: string;

   genres?: readonly MalGenre[];

   [field: string]: unknown;
};

type MalListStatus = {
   status: string;

   score?: number;

   [field: string]: unknown;
};

type MalListItem = {
   node: MalNode;
   list_status: MalListStatus;
};

type MalPagedResponse = {
   data: readonly MalListItem[];

   paging?: {
      next?: string;
   };
};

export type MalConfig = {
   username: string;
   clientId: string;
   accessToken?: string;
};

type MalKindConfig = {
   kind: MediaKind;
   listPath: string;
   urlPath: string;
   totalField: string;
   progressField: string;
   statuses: Readonly<Record<string, MediaStatus>>;
};

const malKinds = {
   anime: {
      kind: "anime",
      listPath: "animelist",
      urlPath: "anime",
      totalField: "num_episodes",
      progressField: "num_episodes_watched",
      statuses: {
         watching: "current",
         completed: "completed",
         on_hold: "on-hold",
         dropped: "dropped",
         plan_to_watch: "planned",
      },
   },
   manga: {
      kind: "manga",
      listPath: "mangalist",
      urlPath: "manga",
      totalField: "num_chapters",
      progressField: "num_chapters_read",
      statuses: {
         reading: "current",
         completed: "completed",
         on_hold: "on-hold",
         dropped: "dropped",
         plan_to_read: "planned",
      },
   },
} as const satisfies Record<string, MalKindConfig>;

function numberField(source: Record<string, unknown>, field: string) {
   const value = source[field];

   return typeof value === "number" ? value : undefined;
}

function normalizeProgress(
   completedAmount: number | undefined,
   totalAmount: number | undefined,
   status: MediaStatus
) {
   if (status === "completed") {
      return 1;
   }

   if (!completedAmount || !totalAmount || totalAmount <= 0) {
      return null;
   }

   return clamp01(completedAmount / totalAmount);
}

function normalizeScore(score: number | undefined) {
   if (!score || score <= 0) {
      return null;
   }

   return clamp01(score / 10);
}

const ignoredMalGenres = new Set([84]);

function genresToSignals(genres: readonly MalGenre[] | undefined): InterestSignal[] {
   return (genres ?? [])
      .filter((genre) => !ignoredMalGenres.has(genre.id))
      .map((genre) => ({
         id: `mal-genre-${genre.id}`,

         name: genre.name,

         strength: 1,
      }));
}

async function fetchAllPages(firstUrl: string, headers: HeadersInit, fetcher: typeof fetch) {
   const result: MalListItem[] = [];

   let nextUrl: string | undefined = firstUrl;

   for (let page = 0; nextUrl && page < MAX_PAGES; page++) {
      const response = await fetcher(nextUrl, {
         headers,

         signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
         const message = await response.text();

         throw new Error(`MAL returned ${response.status}: ${message}`);
      }

      const body = (await response.json()) as MalPagedResponse;

      result.push(...body.data);

      nextUrl = body.paging?.next;
   }

   return result;
}

function createHeaders(config: MalConfig) {
   const headers = new Headers();

   headers.set("X-MAL-CLIENT-ID", config.clientId);

   if (config.accessToken) {
      headers.set("Authorization", `Bearer ${config.accessToken}`);
   }

   return headers;
}

async function fetchMalList(
   config: MalConfig,
   fetcher: typeof fetch,
   kind: MalKindConfig
): Promise<MediaEntry[]> {
   const fields = [
      kind.totalField,
      "genres",
      `list_status{status,score,${kind.progressField}}`,
   ].join(",");

   const url = new URL(
      `https://api.myanimelist.net/v2/users/${encodeURIComponent(config.username)}/${kind.listPath}`
   );

   url.searchParams.set("limit", "1000");

   url.searchParams.set("fields", fields);

   const items = await fetchAllPages(url.toString(), createHeaders(config), fetcher);

   return items.map(({ node, list_status }) => {
      const status = Object.hasOwn(kind.statuses, list_status.status)
         ? kind.statuses[list_status.status]
         : "unknown";

      return {
         source: "mal",
         kind: kind.kind,

         id: String(node.id),

         title: node.title,

         url: `https://myanimelist.net/${kind.urlPath}/${node.id}`,

         status,

         progress: normalizeProgress(
            numberField(list_status, kind.progressField),
            numberField(node, kind.totalField),
            status
         ),

         userScore: normalizeScore(list_status.score),

         signals: genresToSignals(node.genres),
      };
   });
}

export function fetchMalAnime(config: MalConfig, fetcher: typeof fetch): Promise<MediaEntry[]> {
   return fetchMalList(config, fetcher, malKinds.anime);
}

export function fetchMalManga(config: MalConfig, fetcher: typeof fetch): Promise<MediaEntry[]> {
   return fetchMalList(config, fetcher, malKinds.manga);
}
