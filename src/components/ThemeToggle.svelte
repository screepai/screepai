<script lang="ts">
   import { onMount } from "svelte";
   import { ANIMATION } from "../config/animation";

   export let darkMode: boolean;
   export let transitionEnd: boolean;

   function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }: { localStorageTheme: string | null, systemSettingDark: MediaQueryList }) {
      if (localStorageTheme !== null) {
         darkMode = localStorageTheme === "dark";
      } else {
         darkMode = systemSettingDark.matches;
      }
   }

   function setThemeFromLocalStorage() {
      const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
      const localStorageTheme = localStorage.getItem("theme");
      calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });
      document.documentElement.style.setProperty("--bg", darkMode ? "#232a44" : "#f7f8f3");

      systemSettingDark.addEventListener("change", e => {
         darkMode = e.matches;
         document.documentElement.style.setProperty("--bg", e.matches ? "#232a44" : "#f7f8f3");
         saveThemeToLocalStorage(darkMode ? "dark" : "light");
      });
   }

   function toggleTheme() {
      transitionEnd = false;
      darkMode = !darkMode;
      document.documentElement.style.setProperty("--bg", darkMode ? "#232a44" : "#f7f8f3");
      saveThemeToLocalStorage(darkMode ? "dark" : "light");
      setTimeout(() => {
         transitionEnd = true;
      }, ANIMATION.TRANSITION.THEME_DURATION);
   }

   function saveThemeToLocalStorage(theme: string) {
      localStorage.setItem("theme", theme);
   }

   onMount(() => {
      setThemeFromLocalStorage();
   });
</script>

<label>
   <input class="toggle-checkbox" type="checkbox" bind:checked={darkMode} on:click={toggleTheme}>
   <div class="toggle-slot">
      <div class="sun-icon-wrapper">
         <div class="iconify sun-icon" data-icon="feather-sun" data-inline="false"></div>
      </div>
      <div class="toggle-button"></div>
      <div class="moon-icon-wrapper">
         <div class="iconify moon-icon" data-icon="feather-moon" data-inline="false"></div>
      </div>
   </div>
</label> 