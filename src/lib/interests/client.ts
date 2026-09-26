import type {
   InterestsResponse,
} from "./types";


let interestsPromise:
   Promise<InterestsResponse> | null = null;


export function preloadInterests() {
   if (interestsPromise) {
      return interestsPromise;
   }

   interestsPromise =
      fetch("/api/interests")
         .then(
            async (response) => {
               if (!response.ok) {
                  throw new Error(
                     `HTTP ${response.status}`
                  );
               }

               return (
                  await response.json()
               ) as InterestsResponse;
            }
         )
         .catch((error) => {
            interestsPromise = null;

            throw error;
         });

   return interestsPromise;
}