<script lang="ts">
   import { onDestroy } from "svelte";
   import { ANIMATION } from "../config/animation";
   import { getDiscordUrl, type DiscordTheme } from "../config/discord";
   import { preloadImage } from "../utils/preload";

   export let darkMode: boolean;

   let currentDiscordUrl = "";
   let nextDiscordUrl = "";
   let showNextImage = false;
   let theme: DiscordTheme;
   let requestedDiscordUrl = "";
   let transitionRequest = 0;
   let transitionTimeout: ReturnType<typeof setTimeout> | undefined;

   $: theme = darkMode ? "dark" : "light";
   $: newDiscordUrl = getDiscordUrl(theme);
   $: if (newDiscordUrl !== requestedDiscordUrl) {
      requestedDiscordUrl = newDiscordUrl;
      void transitionToDiscordUrl(newDiscordUrl);
   }

   async function transitionToDiscordUrl(url: string) {
      const requestId = ++transitionRequest;

      if (currentDiscordUrl === "" || url === currentDiscordUrl) {
         currentDiscordUrl = url;
         nextDiscordUrl = "";
         showNextImage = false;
         clearTimeout(transitionTimeout);
         return;
      }

      nextDiscordUrl = url;
      await preloadImage(url);
      if (requestId !== transitionRequest) return;

      showNextImage = true;
      clearTimeout(transitionTimeout);
      transitionTimeout = setTimeout(() => {
         if (requestId !== transitionRequest) return;

         currentDiscordUrl = url;
         nextDiscordUrl = "";
         showNextImage = false;
      }, ANIMATION.TRANSITION.THEME_DURATION);
   }

   onDestroy(() => {
      transitionRequest += 1;
      clearTimeout(transitionTimeout);
   });
</script>

<style>
   @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
   }
   .fade-in {
      animation: fadeIn var(--theme-duration) cubic-bezier(.26, 1.5, .46, 1) forwards;
   }
</style>

<div class="discord">
   <a href="https://discord.com/users/534375062099460097" target="_blank">
      <div style="position: relative; width: 100%;">
         <img 
            style="opacity: 1; transition: opacity {ANIMATION.TRANSITION.THEME_DURATION}ms cubic-bezier(.26, 1.5, .46, 1);" 
            src={currentDiscordUrl} 
            alt="screepy"
         />
         {#if showNextImage && nextDiscordUrl}
            <img 
               class="fade-in"
               style="position: absolute; top: 0; left: 0; width: 100%; --theme-duration: {ANIMATION.TRANSITION.THEME_DURATION}ms;" 
               src={nextDiscordUrl} 
               alt="screepy"
            />
         {/if}
      </div>
   </a>
</div>
