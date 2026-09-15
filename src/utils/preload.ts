export function preloadImage(
   src: string,
   timeoutMs = 5000
) {
   if (
      typeof Image === "undefined"
   ) {
      return Promise.resolve();
   }

   return new Promise<void>(
      (resolve) => {
         const image =
            new Image();

         let settled = false;

         const done = () => {
            if (settled) return;

            settled = true;

            clearTimeout(timeout);

            image.onload = null;
            image.onerror = null;

            resolve();
         };

         const timeout =
            setTimeout(
               done,
               timeoutMs
            );

         image.onload = done;
         image.onerror = done;

         image.src = src;
      }
   );
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
