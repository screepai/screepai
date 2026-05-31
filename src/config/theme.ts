export const themeNames = ["light", "dark"] as const;

export type ThemeName = (typeof themeNames)[number];

const THEME_STORAGE_KEY = "theme";
const DISCORD_USER_ID = "534375062099460097";

type DiscordThemeConfig = {
   waveColor: string;
   gradient: string;
};

type ThemeDefinition = {
   bodyBackground: string;
   backgroundImage: string;
   backgroundPosition: string;
   cssVars: Record<string, string>;
   discord: DiscordThemeConfig;
};

export const themeDefinitions: Record<ThemeName, ThemeDefinition> = {
   light: {
      bodyBackground: "#f7f8f3",
      backgroundImage: "/background2.jpg",
      backgroundPosition: "center -3.5em",
      cssVars: {
         "--profile-left": "-80%",
         "--profile-before-left": "-15%",
         "--profile-before-deg": "-25deg",
         "--fill": "#e98e8c",
         "--a": "#fe7585",
         "--uwu": "#000",
         "--bullet-color": "#d6dbf0",
         "--bullet-background-color": "#eceefb",
         "--bullet-active-color": "#FBFBFB",
         "--color1": "#fe9eaa",
         "--color2": "#fe919d",
         "--color3": "#fe8391",
         "--color4": "#fe7585",
      },
      discord: {
         waveColor: "f3bdbb",
         gradient: "f3bdbb-f7a9a7-e98e8c-fe7585",
      },
   },
   dark: {
      bodyBackground: "#232a44",
      backgroundImage: "/sw.jpg",
      backgroundPosition: "center center",
      cssVars: {
         "--profile-left": "80%",
         "--profile-before-left": "100%",
         "--profile-before-deg": "200deg",
         "--fill": "#868ac9",
         "--a": "#6065da",
         "--uwu": "#f7f8f3",
         "--bullet-color": "#a9b0e6",
         "--bullet-background-color": "#bfc5e7",
         "--bullet-active-color": "#c4cef1",
         "--color1": "#9093e5",
         "--color2": "#8084e1",
         "--color3": "#7074de",
         "--color4": "#6065da",
      },
      discord: {
         waveColor: "bfc5e7-light",
         gradient: "bfc5e7-a9b0e6-868ac9-6065da",
      },
   },
};

export function themeFromDarkMode(darkMode: boolean): ThemeName {
   return darkMode ? "dark" : "light";
}

export function isDarkTheme(theme: ThemeName) {
   return theme === "dark";
}

function isThemeName(value: string | null): value is ThemeName {
   return value === "light" || value === "dark";
}

export function getStoredTheme() {
   const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
   return isThemeName(storedTheme) ? storedTheme : null;
}

export function getSystemTheme() {
   return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getInitialTheme() {
   return getStoredTheme() ?? getSystemTheme();
}

export function getThemeDefinition(theme: ThemeName) {
   return themeDefinitions[theme];
}

export function applyTheme(theme: ThemeName) {
   const definition = getThemeDefinition(theme);
   document.documentElement.style.setProperty("--bg", definition.bodyBackground);

   for (const [property, value] of Object.entries(definition.cssVars)) {
      document.documentElement.style.setProperty(property, value);
   }
}

export function saveTheme(theme: ThemeName) {
   localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function toggleTheme(theme: ThemeName) {
   return theme === "dark" ? "light" : "dark";
}

export function watchSystemTheme(onChange: (theme: ThemeName) => void) {
   const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
   const handleChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme() === null) {
         onChange(event.matches ? "dark" : "light");
      }
   };

   systemSettingDark.addEventListener("change", handleChange);

   return () => {
      systemSettingDark.removeEventListener("change", handleChange);
   };
}

export function getDiscordUrl(theme: ThemeName) {
   const { discord } = getThemeDefinition(theme);
   const bg = "FBFBFB";
   const idleMessage = "( ´ ω ` )ノﾞ";
   const hideBadges = "true";
   const hideNameplate = "true";
   const useDisplayName = "true";
   const forceGradient = "true";

   return `https://lanyard.kyrie25.dev/api/${DISCORD_USER_ID}?theme=${theme}&bg=${bg}&idleMessage=${encodeURIComponent(idleMessage)}&hideBadges=${hideBadges}&hideNameplate=${hideNameplate}&useDisplayName=${useDisplayName}&waveColor=${discord.waveColor}&waveSpotifyColor=${discord.waveColor}&gradient=${discord.gradient}&forceGradient=${forceGradient}`;
}

export const backgroundImageUrls = themeNames.map(theme => getThemeDefinition(theme).backgroundImage);
export const discordImageUrls = themeNames.map(getDiscordUrl);
