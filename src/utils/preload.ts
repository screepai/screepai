export function preloadImage(
   src: string,
   timeoutMs = 10000
) {
   if (typeof Image === "undefined") {
      return Promise.resolve();
   }

   return new Promise<void>((resolve) => {
      const image = new Image();

      let settled = false;

      const done = () => {
         if (settled) return;

         settled = true;

         clearTimeout(timeout);

         image.onload = null;
         image.onerror = null;

         resolve();
      };

      const loaded = async () => {
         try {
            await image.decode();
         } catch {
            // the image may already be usable even if decode() rejects
         }

         done();
      };

      const timeout = setTimeout(
         done,
         timeoutMs
      );

      image.onload = () => {
         void loaded();
      };

      image.onerror = done;

      image.src = src;

      if (image.complete) {
         void loaded();
      }
   });
}

export async function preloadImages(
   srcs: readonly string[]
) {
   await Promise.all(
      srcs.map((src) =>
         preloadImage(src)
      )
   );
}