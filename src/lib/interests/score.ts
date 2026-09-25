import type {
   InterestCollection,
   InterestSource,
   MediaEntry,
   MediaKind,
   MediaStatus,
   RankedInterest,
} from "./types";


function clamp(
   value: number,
   min = 0,
   max = 1
) {
   return Math.min(
      max,
      Math.max(
         min,
         value
      )
   );
}


function getConsumptionWeight(
   status: MediaStatus,
   progress: number | null
) {
   const safeProgress =
      progress === null
         ? null
         : clamp(progress);

   switch (status) {
      case "completed":
         return 1;

      case "current":
         return safeProgress === null
            ? 0.75
            : 0.55 +
               safeProgress * 0.45;

      case "on-hold":
         return safeProgress === null
            ? 0.45
            : 0.3 +
               safeProgress * 0.5;

      case "dropped":
         return safeProgress === null
            ? 0.2
            : 0.1 +
               safeProgress * 0.35;

      case "planned":
         return 0;

      default:
         return 0.25;
   }
}


type AggregateOptions = {
   kind: MediaKind;
   source: InterestSource;
   sourceLabel: string;
   profileUrl: string;
   entries: readonly MediaEntry[];

   top?: number;
   examplesPerInterest?: number;
};


export function aggregateInterests({
   kind,
   source,
   sourceLabel,
   profileUrl,
   entries,
   top = 6,
   examplesPerInterest = 3,
}: AggregateOptions): InterestCollection {
   const interests =
      new Map<
         string,
         {
            id: string;
            name: string;
            score: number;

            titles: Set<string>;

            examples: Map<
               string,
               {
                  id: string;
                  title: string;
                  url: string;
                  contribution: number;
               }
            >;
         }
      >();

   let analyzedEntries = 0;

   for (const entry of entries) {
      const consumption =
         getConsumptionWeight(
            entry.status,
            entry.progress
         );

      if (
         consumption <= 0 ||
         entry.signals.length === 0
      ) {
         continue;
      }

      analyzedEntries++;

      for (const signal of entry.signals) {
         const strength =
            clamp(signal.strength);

         if (strength <= 0) {
            continue;
         }

         const contribution =
            consumption *
            strength;

         let interest =
            interests.get(
               signal.id
            );

         if (!interest) {
            interest = {
               id: signal.id,
               name: signal.name,
               score: 0,

               titles: new Set(),

               examples: new Map(),
            };

            interests.set(
               signal.id,
               interest
            );
         }

         interest.score +=
            contribution;

         interest.titles.add(
            entry.id
         );

         const previousExample =
            interest.examples.get(
               entry.id
            );

         if (
            !previousExample ||
            contribution >
               previousExample.contribution
         ) {
            interest.examples.set(
               entry.id,
               {
                  id: entry.id,
                  title: entry.title,
                  url: entry.url,
                  contribution,
               }
            );
         }
      }
   }

   const ranked =
      Array.from(
         interests.values()
      )
         .sort((a, b) => {
            if (
               b.score !==
               a.score
            ) {
               return (
                  b.score -
                  a.score
               );
            }

            return (
               b.titles.size -
               a.titles.size
            );
         });

   const strongestScore =
      ranked[0]?.score ?? 0;

   const topInterests:
      RankedInterest[] =
      ranked
         .slice(0, top)
         .map((interest) => {
            const examples =
               Array.from(
                  interest.examples.values()
               )
                  .sort(
                     (a, b) =>
                        b.contribution -
                        a.contribution
                  )
                  .slice(
                     0,
                     examplesPerInterest
                  )
                  .map(
                     ({
                        id,
                        title,
                        url,
                     }) => ({
                        id,
                        title,
                        url,
                     })
                  );

            return {
               id: interest.id,
               name: interest.name,

               score:
                  Math.round(
                     interest.score *
                        1000
                  ) / 1000,

               titleCount:
                  interest.titles.size,

               share:
                  strongestScore > 0
                     ? Math.round(
                          (
                             interest.score /
                             strongestScore
                          ) *
                             1000
                       ) / 1000
                     : 0,

               examples,
            };
         });

   return {
      kind,
      source,
      sourceLabel,
      profileUrl,
      totalEntries: entries.length,
      analyzedEntries,
      top: topInterests,
   };
}


export function emptyInterestCollection(
   kind: MediaKind,
   source: InterestSource,
   sourceLabel: string,
   profileUrl: string
): InterestCollection {
   return {
      kind,
      source,
      sourceLabel,
      profileUrl,
      totalEntries: 0,
      analyzedEntries: 0,
      top: [],
   };
}