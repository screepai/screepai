export type InterestSource =
   | "mal"
   | "vndb";

export type MediaKind =
   | "anime"
   | "manga"
   | "visual-novel";

export type MediaStatus =
   | "current"
   | "completed"
   | "on-hold"
   | "dropped"
   | "planned"
   | "unknown";


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
   url: string;
   status: MediaStatus;
   progress: number | null;
   userScore: number | null;
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


export type InterestsResponse = {
   version: 1;
   generatedAt: string;
   anime: InterestCollection;
   manga: InterestCollection;
   visualNovels: InterestCollection;
   warnings: readonly string[];
};