export function preloadImage(src: string, timeoutMs = 10000) {
   if (typeof Image === "undefined") {
      return Promise.resolve(false);
   }

   return new Promise<boolean>((resolve) => {
      const image = new Image();

      let settled = false;

      const done = (loadedOk: boolean) => {
         if (settled) return;

         settled = true;

         clearTimeout(timeout);

         image.onload = null;
         image.onerror = null;

         resolve(loadedOk);
      };

      const loaded = async () => {
         try {
            await image.decode();
         } catch {
            // the image may already be usable even if decode() rejects
         }

         done(true);
      };

      const timeout = setTimeout(() => done(false), timeoutMs);

      image.onload = () => {
         void loaded();
      };

      image.onerror = () => done(false);

      image.src = src;

      if (image.complete) {
         void loaded();
      }
   });
}

export async function preloadImages(srcs: readonly string[]) {
   await Promise.all(srcs.map((src) => preloadImage(src)));
}
