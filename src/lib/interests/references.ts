import { contentSlides } from "../../config/contents";

const urls = new Set<string>();
for (const slide of contentSlides) {
   if (slide.kind !== "interests") continue;
   for (const picks of Object.values(slide.memoryPicks)) {
      for (const pick of picks) {
         if (pick.url) urls.add(pick.url);
         if (!Array.isArray(pick.note)) continue;
         for (const part of pick.note) {
            if (typeof part !== "string" && "url" in part) urls.add(part.url);
         }
      }
   }
}

export const featuredMediaUrls = [...urls];
