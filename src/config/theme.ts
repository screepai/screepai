export const themeNames = ["light", "dark"] as const;

export type ThemeName = (typeof themeNames)[number];

const THEME_STORAGE_KEY = "theme";

const themeBackgrounds: Record<ThemeName, string> = {
   light: "#f7f8f3",
   dark: "#232a44",
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

export function applyTheme(theme: ThemeName) {
   document.documentElement.style.setProperty("--bg", themeBackgrounds[theme]);
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
