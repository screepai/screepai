import type {
   MusicCollection,
   MusicTrack,
} from "../types";


type LastfmTrack = {
   name: string;

   playcount:
      | string
      | number;

   url: string;

   artist: {
      name: string;
   };
};


type LastfmResponse = {
   toptracks?: {
      track?: LastfmTrack[];
   };

   error?: number;
   message?: string;
};

function cleanTrackTitle(
   title: string,
   artist: string
) {
   const escapedArtist =
      artist.replace(
         /[.*+?^${}()|[\]\\]/g,
         "\\$&"
      );


   let cleaned =
      title.trim();


   /*
    * Remove artist prefixes such as:
    *
    * Porter Robinson - Cheerleader
    * Porter Robinson – Cheerleader
    * Porter Robinson: Cheerleader
    */
   const artistPrefix =
      new RegExp(
         `^${escapedArtist}\\s*[-–—:]\\s*`,
         "i"
      );

   cleaned =
      cleaned.replace(
         artistPrefix,
         ""
      );


   /*
    * Common YouTube metadata when it appears
    * inside brackets.
    *
    * Examples:
    * (Official Video)
    * [Official Audio]
    * (Lyric Video)
    * [MV]
    * 【Official Music Video】
    */
   const bracketedJunk =
      /\s*(?:\(|\[|【)\s*(?:official\s+)?(?:music\s+video|video|audio|lyric\s+video|lyrics?|visualizer|mv|m\/v|pv)\s*(?:\)|\]|】)\s*/gi;

   cleaned =
      cleaned.replace(
         bracketedJunk,
         " "
      );


   /*
    * Same metadata when somebody puts it
    * naked at the end of the title.
    *
    * Cheerleader - Official Music Video
    * Cheerleader | Lyrics
    */
   const trailingJunk =
      /\s*(?:[-–—|:]\s*)?(?:official\s+)?(?:music\s+video|video|audio|lyric\s+video|lyrics?|visualizer|mv|m\/v|pv)\s*$/i;

   cleaned =
      cleaned.replace(
         trailingJunk,
         ""
      );


   /*
    * Clean up whitespace and any separator
    * accidentally left dangling at the end.
    */
   cleaned =
      cleaned
         .replace(
            /\s{2,}/g,
            " "
         )
         .replace(
            /\s*[-–—|:]\s*$/,
            ""
         )
         .trim();


   /*
    * Safety fallback in case an extremely
    * cursed YouTube title gets completely
    * stripped.
    */
   return cleaned || title.trim();
}

export async function fetchLastfmTopTracks(
   username: string,
   apiKey: string,
   fetcher: typeof fetch
): Promise<MusicCollection> {
   const params =
      new URLSearchParams({
         method:
            "user.gettoptracks",

         user:
            username,

         api_key:
            apiKey,

         format:
            "json",

         period:
            "1month",

         limit:
            "5",
      });


   const response =
      await fetcher(
         `https://ws.audioscrobbler.com/2.0/?${params.toString()}`,
         {
            headers: {
               Accept:
                  "application/json",

               "User-Agent":
                  "screepai/1.0 (https://screepy.vercel.app)",
            },
         }
      );


   const raw =
      await response.text();

   let data:
      LastfmResponse;

   try {
      data =
         JSON.parse(raw) as
            LastfmResponse;
   } catch {
      throw new Error(
         `Last.fm returned HTTP ${response.status}: ${raw}`
      );
   }


   if (!response.ok) {
      throw new Error(
         `Last.fm returned HTTP ${response.status}: ` +
         `${data.message ?? raw}`
      );
   }


   if (data.error) {
      throw new Error(
         data.message ||
         `Last.fm error ${data.error}`
      );
   }


   const tracks:
      MusicTrack[] =
      (
         data.toptracks
            ?.track ?? []
      )
         .slice(0, 5)
         .map((track) => ({
            name:
               cleanTrackTitle(
                  track.name,
                  track.artist.name
               ),

            artist:
               track.artist.name,

            url:
               track.url,

            playcount:
               Number(
                  track.playcount
               ) || 0,
         }));


   return {
      source:
         "lastfm",

      sourceLabel:
         "Last.fm",

      profileUrl:
         `https://www.last.fm/user/${encodeURIComponent(
            username
         )}`,

      period:
         "1month",

      tracks,
   };
}