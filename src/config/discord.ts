export const discordThemes = ["light", "dark"] as const;

export type DiscordTheme = (typeof discordThemes)[number];

export function getDiscordUrl(theme: DiscordTheme) {
   const isDark = theme === "dark";
   const bg = "FBFBFB";
   const idleMessage = "( ´ ω ` )ノﾞ";
   const hideBadges = "true";
   const hideNameplate = "true";
   const useDisplayName = "true";
   const waveColor = isDark ? "bfc5e7-light" : "f3bdbb";
   const gradient = isDark ? "bfc5e7-a9b0e6-868ac9-6065da" : "f3bdbb-f7a9a7-e98e8c-fe7585";
   const forceGradient = "true";

   return `https://lanyard.kyrie25.dev/api/534375062099460097?theme=${theme}&bg=${bg}&idleMessage=${encodeURIComponent(idleMessage)}&hideBadges=${hideBadges}&hideNameplate=${hideNameplate}&useDisplayName=${useDisplayName}&waveColor=${waveColor}&waveSpotifyColor=${waveColor}&gradient=${gradient}&forceGradient=${forceGradient}`;
}

export const discordImageUrls = discordThemes.map(getDiscordUrl);
