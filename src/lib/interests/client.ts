import type { InterestsResponse, MediaDetails } from "./types";

let interestsPromise: Promise<InterestsResponse> | null = null;
let relationsPromise: Promise<Readonly<Record<string, MediaDetails>>> | null = null;
export const INTERESTS_URL = "/api/interests?v=6";

export function preloadInterests() {
   if (interestsPromise) {
      return interestsPromise;
   }

   interestsPromise = fetch(INTERESTS_URL, { signal: AbortSignal.timeout(15000) })
      .then(async (response) => {
         if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
         }

         return (await response.json()) as InterestsResponse;
      })
      .catch((error) => {
         interestsPromise = null;

         throw error;
      });

   return interestsPromise;
}

export function preloadMalRelations() {
   if (relationsPromise) return relationsPromise;
   relationsPromise = fetch("/api/mal-relations?v=2", { signal: AbortSignal.timeout(25000) })
      .then(async (response) => {
         if (!response.ok) throw new Error(`MAL relations returned ${response.status}`);
         return ((await response.json()) as { media: Readonly<Record<string, MediaDetails>> })
            .media;
      })
      .catch((error) => {
         relationsPromise = null;
         throw error;
      });
   return relationsPromise;
}
