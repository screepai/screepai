export const backgroundImages = {
   dark: "/sw.jpg",
   light: "/background2.jpg",
} as const;

export type BackgroundTheme = keyof typeof backgroundImages;

export const backgroundImageUrls = Object.values(backgroundImages);
