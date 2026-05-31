export function preloadImage(src: string) {
   if (typeof Image === "undefined") {
      return Promise.resolve();
   }

   return new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
   });
}

export async function preloadImages(srcs: readonly string[]) {
   await Promise.all(srcs.map(preloadImage));
}
