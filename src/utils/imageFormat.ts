export type ImageFormat = "avif" | "webp" | "jpg";

const AVIF_SAMPLE =
   "data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAG1pZjFhdmlmbWlhZgAAANZtZXRhAAAAAAAAACFoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAAAAAACJpbG9jAAAAAERAAAEAAQAAAAAA+gABAAAAAAAAABwAAAAjaWluZgAAAAAAAQAAABVpbmZlAgAAAAABAABhdjAxAAAAAA5waXRtAAAAAAABAAAAVmlwcnAAAAA4aXBjbwAAAAxhdjFDgSACAAAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAABZpcG1hAAAAAAAAAAEAAQOBAgMAAAAkbWRhdBIACgc4AAaQENBpMg8cQmLk6aaaYWNgAJA1jjU=";

const WEBP_SAMPLE =
   "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAABQAQCdASoBAAEAAUAmJaQABYwAAP6igAA=";

let bestFormat: Promise<ImageFormat> | undefined;

async function canDecode(sample: string) {
   if (typeof Image === "undefined") return false;

   const image = new Image();
   image.src = sample;

   try {
      await image.decode();
      return image.naturalWidth > 0;
   } catch {
      return false;
   }
}

async function detectBestFormat(): Promise<ImageFormat> {
   if (await canDecode(AVIF_SAMPLE)) return "avif";
   if (await canDecode(WEBP_SAMPLE)) return "webp";
   return "jpg";
}

export function getBestImageFormat() {
   bestFormat ??= detectBestFormat();

   return bestFormat;
}
