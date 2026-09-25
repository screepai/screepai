import type {
   InterestSignal,
   MediaEntry,
   MediaStatus,
} from "../types";


type VndbUser = {
   id: string;
   username: string;
};


type VndbLabel = {
   id: number;
   label: string;
};


type VndbTag = {
   id: string;
   name: string;

   category: string;

   rating: number;
   spoiler: number;

   lie: boolean;
};


type VndbVisualNovel = {
   title: string;

   tags:
      readonly VndbTag[];
};


type VndbListEntry = {
   id: string;

   vote: number | null;

   started:
      string | null;

   finished:
      string | null;

   labels:
      readonly VndbLabel[];

   vn: VndbVisualNovel;
};


type VndbListResponse = {
   results:
      readonly VndbListEntry[];

   more: boolean;
};


export type VndbConfig = {
   user: string;
   token?: string;
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


function createHeaders(
   token?: string
) {
   const headers =
      new Headers();

   headers.set(
      "Content-Type",
      "application/json"
   );

   if (token) {
      headers.set(
         "Authorization",
         `Token ${token}`
      );
   }

   return headers;
}


async function resolveUser(
   config: VndbConfig,
   fetcher: typeof fetch
): Promise<VndbUser> {
   const requested =
      config.user.trim();

   const response =
      await fetcher(
         `https://api.vndb.org/kana/user?q=${encodeURIComponent(
            requested
         )}`,
         {
            headers:
               createHeaders(
                  config.token
               ),
         }
      );

   if (!response.ok) {
      throw new Error(
         `VNDB user lookup returned ${response.status}`
      );
   }

   const body =
      await response.json() as
         Record<
            string,
            VndbUser | null
         >;

   const user =
      body[requested];

   if (!user) {
      throw new Error(
         `VNDB user "${requested}" was not found`
      );
   }

   return user;
}


function normalizeStatus(
   entry: VndbListEntry
): MediaStatus {
   const labels =
      entry.labels.map(
         (label) =>
            label.label.toLowerCase()
      );

   if (
      labels.includes(
         "finished"
      )
   ) {
      return "completed";
   }

   if (
      labels.includes(
         "playing"
      )
   ) {
      return "current";
   }

   if (
      labels.includes(
         "stalled"
      )
   ) {
      return "on-hold";
   }

   if (
      labels.includes(
         "dropped"
      )
   ) {
      return "dropped";
   }

   if (
      labels.includes(
         "wishlist"
      )
   ) {
      return "planned";
   }

   if (entry.finished) {
      return "completed";
   }

   if (entry.started) {
      return "current";
   }

   return "unknown";
}


function normalizeVote(
   vote: number | null
) {
   if (
      vote === null ||
      vote <= 0
   ) {
      return null;
   }

   return clamp01(
      vote / 100
   );
}

const ignoredVndbTagPatterns = [
   /\bprotagonist\b/i,
   /\bheroine\b/i,
   /\bhero\b/i,
   /\bbreast/i,
   /\bvirgin/i,
   /\bstudent\b/i,
   /\bhair\b/i,
   /\beyes?\b/i,
   /\bheight\b/i,
   /\bbody\b/i,
   /\bage\b/i,
   /\bflashback\b/i,
   /\bkissing scene\b/i,
   /\bunder the same roof\b/i,
   /\blove overcomes all\b/i,
   /\bpillow talk\b/i,
   /\bbrother\/sister romance\b/i,
];


function isUsefulVndbInterest(
   tag: VndbTag
) {
   return !ignoredVndbTagPatterns.some(
      (pattern) =>
         pattern.test(tag.name)
   );
}


function tagsToSignals(
   tags: readonly VndbTag[]
): InterestSignal[] {
   return tags
      .filter(
         (tag) =>
            tag.category ===
               "cont" &&

            tag.spoiler ===
               0 &&

            !tag.lie &&

            tag.rating >=
               1 &&

            isUsefulVndbInterest(
               tag
            )
      )
      .map(
         (tag) => ({
            id:
               `vndb-tag-${tag.id}`,

            name:
               tag.name,

            strength:
               clamp01(
                  tag.rating /
                     3
               ),
         })
      );
}


export async function fetchVndbVisualNovels(
   config: VndbConfig,
   fetcher: typeof fetch
): Promise<{
   user: VndbUser;
   entries: MediaEntry[];
}> {
   const user =
      await resolveUser(
         config,
         fetcher
      );

   const entries:
      MediaEntry[] = [];

   let page = 1;
   let more = true;

   while (more) {
      const response =
         await fetcher(
            "https://api.vndb.org/kana/ulist",
            {
               method: "POST",

               headers:
                  createHeaders(
                     config.token
                  ),

               body:
                  JSON.stringify({
                     user:
                        user.id,

                     page,

                     results: 100,

                     fields:
                        [
                           "vote",
                           "started",
                           "finished",
                           "labels{id,label}",
                           "vn{title,tags{id,name,category,rating,spoiler,lie}}",
                        ].join(","),
                  }),
            }
         );

      if (!response.ok) {
         const message =
            await response.text();

         throw new Error(
            `VNDB returned ${response.status}: ${message}`
         );
      }

      const body =
         await response.json() as
            VndbListResponse;

      for (
         const item of
         body.results
      ) {
         const status =
            normalizeStatus(
               item
            );

         entries.push({
            source:
               "vndb",

            kind:
               "visual-novel",

            id:
               item.id,

            title:
               item.vn.title,

            url:
               `https://vndb.org/${item.id}`,

            status,

            progress:
               status ===
               "completed"
                  ? 1
                  : null,

            userScore:
               normalizeVote(
                  item.vote
               ),

            signals:
               tagsToSignals(
                  item.vn.tags
               ),
         });
      }

      more =
         body.more;

      page++;
   }

   return {
      user,
      entries,
   };
}