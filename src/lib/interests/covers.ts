export type MediaCover = {
   title: string;
   imageUrl: string;
};

export function mediaCoverKey(href: string): string | null {
   let url: URL;
   try {
      url = new URL(href);
   } catch {
      return null;
   }
   if (url.protocol !== "https:") return null;

   if (url.hostname === "vndb.org") {
      const match = /^\/([vr]\d+)\/?$/.exec(url.pathname);
      return match ? `vndb:${match[1]}` : null;
   }
   if (url.hostname === "myanimelist.net") {
      const match = /^\/(anime|manga)\/(\d+)(?:\/|$)/.exec(url.pathname);
      return match ? `${match[1]}:${match[2]}` : null;
   }
   return null;
}
