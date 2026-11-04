import { defineEnvVars } from "@sveltejs/kit/env";

export const variables = defineEnvVars({
   MAL_USERNAME: { schema: (input) => input ?? "" },
   MAL_CLIENT_ID: { schema: (input) => input ?? "" },
   MAL_ACCESS_TOKEN: { schema: (input) => input ?? "" },
   VNDB_USER: { schema: (input) => input ?? "" },
   VNDB_TOKEN: { schema: (input) => input ?? "" },
   LASTFM_USERNAME: { schema: (input) => input ?? "" },
   LASTFM_API_KEY: { schema: (input) => input ?? "" },
});
