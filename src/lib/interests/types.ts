export type InterestSource = "mal" | "vndb";

export type MediaKind = "anime" | "manga" | "light-novel" | "visual-novel";

export type MediaStatus = "current" | "completed" | "on-hold" | "dropped" | "planned" | "unknown";

export type InterestSignal = {
   id: string;
   name: string;
   strength: number;
};

export type MediaEntry = {
   source: InterestSource;
   kind: MediaKind;
   id: string;
   title: string;
   englishTitle: string | null;
   romajiTitle: string | null;
   url: string;
   status: MediaStatus;
   progress: number | null;
   userScore: number | null;
   imageUrl?: string | null;
   released?: string | null;
   relations?: readonly { id: string; relation: string; relation_official: boolean }[];
   signals: readonly InterestSignal[];
};

export type InterestExample = {
   id: string;
   title: string;
   url: string;
};

export type RankedInterest = {
   id: string;
   name: string;
   score: number;
   titleCount: number;
   share: number;
   examples: readonly InterestExample[];
};

export type InterestCollection = {
   kind: MediaKind;
   source: InterestSource;
   sourceLabel: string;
   profileUrl: string;
   totalEntries: number;
   analyzedEntries: number;
   top: readonly RankedInterest[];
};

export type MusicTrack = {
   name: string;
   artist: string;
   url: string;
   playcount: number;
};

export type MusicCollection = {
   source: "lastfm";
   sourceLabel: "Last.fm";
   profileUrl: string;
   period: "1month";
   tracks: readonly MusicTrack[];
};

export type InterestsResponse = {
   version: 6;
   generatedAt: string;
   anime: InterestCollection;
   manga: InterestCollection;
   lightNovels: InterestCollection;
   visualNovels: InterestCollection;
   music: MusicCollection;
   media: Readonly<Record<string, MediaDetails>>;
   warnings: readonly string[];
};

export type MediaDetails = {
   title: string;
   alternateTitle: string | null;
   imageUrl?: string | null;
   status?: MediaStatus;
   related?: readonly string[];
   rating: { score: number | null; source: InterestSource } | null;
};
