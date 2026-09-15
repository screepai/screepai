<script lang="ts">
   import { ANIMATION } from "../config/animation";
   import { getDiscordUrl } from "../config/theme";

   export let darkMode: boolean;

   const lightUrl = getDiscordUrl("light");
   const darkUrl = getDiscordUrl("dark");
</script>

<style>
   .discord {
      pointer-events: none;
      width: 100%;
   }

   .discord a {
      pointer-events: auto;
      display: block;
      width: 100%;
   }

   .card-stack {
      position: relative;
      width: 100%;

      -webkit-mask-image: linear-gradient(
         to bottom,
         black 0%,
         black 88%,
         rgba(0, 0, 0, 0.8) 92%,
         rgba(0, 0, 0, 0.4) 96%,
         transparent 100%
      );

      mask-image: linear-gradient(
         to bottom,
         black 0%,
         black 88%,
         rgba(0, 0, 0, 0.8) 92%,
         rgba(0, 0, 0, 0.4) 96%,
         transparent 100%
      );
   }

   .card {
      display: block;
      width: 100%;
      max-width: 100%;
      transition: opacity var(--theme-duration) ease;
      backface-visibility: hidden;
   }

   .card-overlay {
      position: absolute;
      inset: 0;
   }

   .visible {
      opacity: 1;
   }

   .hidden {
      opacity: 0;
   }
</style>

<div class="discord">
   <a
      href="https://discord.com/users/534375062099460097"
      target="_blank"
      rel="noreferrer"
   >
      <div
         class="card-stack"
         style="--theme-duration: {ANIMATION.TRANSITION.THEME_DURATION}ms"
      >
         <img
            class="card"
            class:visible={!darkMode}
            class:hidden={darkMode}
            src={lightUrl}
            alt="screepy"
         />

         <img
            class="card card-overlay"
            class:visible={darkMode}
            class:hidden={!darkMode}
            src={darkUrl}
            alt="screepy"
         />
      </div>
   </a>
</div>
