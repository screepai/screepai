<script lang="ts">
   import { onMount, createEventDispatcher } from "svelte";
   import { fade } from "svelte/transition";
   import { ANIMATION } from "../config/animation";

   export let darkMode: boolean;
   const dispatch = createEventDispatcher<{ preloaded: void }>();

   let currentDiscordUrl = ""; 
   let nextDiscordUrl = "";
   let showNextImage = false;
   let imageCache: { [key in "light" | "dark"]: HTMLImageElement | null } = { light: null, dark: null };

   function getDiscordUrl(isDark: boolean) {
      const theme = isDark ? "dark" : "light";
      const bg = "FBFBFB";
      const idleMessage = "( ´ ω ` )ノﾞ";
      const hideBadges = "true";
      const hideNameplate = "true";
      const useDisplayName = "true";
      const waveColor = isDark ? "bfc5e7-light" : "f3bdbb";
      const gradient = isDark ? "bfc5e7-a9b0e6-868ac9-6065da" : "f3bdbb-f7a9a7-e98e8c-fe7585";
      return `https://lanyard.kyrie25.dev/api/534375062099460097?theme=${theme}&bg=${bg}&idleMessage=${encodeURIComponent(idleMessage)}&hideBadges=${hideBadges}&hideNameplate=${hideNameplate}&useDisplayName=${useDisplayName}&waveColor=${waveColor}&waveSpotifyColor=${waveColor}&gradient=${gradient}`;
   }

   $: newDiscordUrl = getDiscordUrl(darkMode);

   $: {
      if (currentDiscordUrl === "") {
         currentDiscordUrl = newDiscordUrl;
      }
      if (newDiscordUrl !== currentDiscordUrl && currentDiscordUrl !== "") {
         nextDiscordUrl = newDiscordUrl;
         let themeKey: "light" | "dark" = darkMode ? "dark" : "light";
         let cachedImg = imageCache[themeKey];
         if (cachedImg && cachedImg.complete) {
            showNextImage = true;
            setTimeout(() => {
               currentDiscordUrl = newDiscordUrl;
               showNextImage = false;
            }, ANIMATION.TRANSITION.THEME_DURATION);
         } else {
            let img = new Image();
            img.onload = () => {
               showNextImage = true;
               setTimeout(() => {
                  currentDiscordUrl = newDiscordUrl;
                  showNextImage = false;
               }, ANIMATION.TRANSITION.THEME_DURATION);
            };
            img.src = newDiscordUrl;
            imageCache[themeKey] = img;
         }
      }
   }

   onMount(async () => {
      currentDiscordUrl = newDiscordUrl;
      
      const preloadPromises = [];
      
      const preloadImage = (theme: "light" | "dark") => {
         return new Promise<void>((resolve) => {
            const url = getDiscordUrl(theme === "dark");
            let img = new Image();
            img.onload = () => resolve();
            img.src = url;
            imageCache[theme] = img;
         });
      };
      
      preloadPromises.push(preloadImage("light"));
      preloadPromises.push(preloadImage("dark"));
      
      await Promise.all(preloadPromises);
      
      dispatch('preloaded');
   });
</script>

<div class="discord">
   <a href="https://discord.com/users/534375062099460097" target="_blank">
      <div style="position: relative; width: 100%;">
         <img 
            style="opacity: 1; transition: opacity {ANIMATION.TRANSITION.THEME_DURATION}ms;" 
            src={currentDiscordUrl} 
            alt="screepy"
         />
         {#if showNextImage}
            <img 
               in:fade={{ duration: ANIMATION.TRANSITION.THEME_DURATION }}
               out:fade={{ duration: ANIMATION.TRANSITION.THEME_DURATION }}
               style="position: absolute; top: 0; left: 0; width: 100%;" 
               src={nextDiscordUrl} 
               alt="screepy"
            />
         {/if}
      </div>
   </a>
</div> 