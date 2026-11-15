export type VndbTitle = {
   lang: string;
   title: string;
   latin?: string | null;
   official?: boolean;
};

export function vndbRomajiTitle(title: string, titles: readonly VndbTitle[]) {
   const japanese = titles.find((item) => item.lang === "ja");
   if (!japanese) return null;
   return japanese.latin?.trim() || title;
}

export function mediaNames(title: string, englishTitle: string | null, romajiTitle: string | null) {
   const primary = englishTitle?.trim() || title.trim();
   const alternate = romajiTitle?.trim() || null;
   const romanized =
      alternate && !/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(alternate);
   const comparable = (name: string) => name.normalize("NFKC").toLowerCase().replace(/\s+/g, " ");
   return {
      title: primary,
      alternateTitle: romanized && comparable(primary) !== comparable(alternate) ? alternate : null,
   };
}
