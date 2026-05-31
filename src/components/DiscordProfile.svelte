<script lang="ts">
   import { ANIMATION } from "../config/animation";
   import { getDiscordUrl, type DiscordTheme } from "../config/discord";

   export let darkMode: boolean;

   let currentDiscordUrl = "";
   let nextDiscordUrl = "";
   let showNextImage = false;
   let imageCache: { [key in DiscordTheme]: HTMLImageElement | null } = { light: null, dark: null };
   let theme: DiscordTheme;

   $: theme = darkMode ? "dark" : "light";
   $: newDiscordUrl = getDiscordUrl(theme);

   $: {
      if (currentDiscordUrl === "") {
         currentDiscordUrl = newDiscordUrl;
      }
      if (newDiscordUrl !== currentDiscordUrl && currentDiscordUrl !== "") {
         nextDiscordUrl = newDiscordUrl;
         let cachedImg = imageCache[theme];
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
            imageCache[theme] = img;
         }
      }
   }

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
         {#if showNextImage}
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
