<script lang="ts">
   import { fade } from "svelte/transition";
   import { parallax } from "../actions/parallax";
   import { ANIMATION } from "../config/animation";
   import { getThemeDefinition, type ThemeName } from "../config/theme";

   interface Props {
      backgroundUrls: Record<ThemeName, string>;
      darkMode: boolean;
   }

   let { backgroundUrls, darkMode }: Props = $props();

   const darkBackground = getThemeDefinition("dark");
   const lightBackground = getThemeDefinition("light");
</script>

<div
   use:parallax
   transition:fade={{
      delay: ANIMATION.TRANSITION.FADE_DELAY,
      duration: ANIMATION.TRANSITION.FADE_DURATION,
   }}
   class="background-parallax"
>
   <div
      data-depth="0.02"
      class="bg-layer"
      style:background-color={darkBackground.bodyBackground}
      style:background-image={`url(${backgroundUrls.dark})`}
      style:background-position={darkBackground.backgroundPosition}
      style:background-size={darkBackground.backgroundSize}
   ></div>
   <div
      data-depth="0.02"
      class="bg-layer"
      style:opacity={darkMode ? 0 : 1}
      style:background-color={lightBackground.bodyBackground}
      style:background-image={`url(${backgroundUrls.light})`}
      style:background-position={lightBackground.backgroundPosition}
      style:background-size={lightBackground.backgroundSize}
   ></div>
</div>

<style>
   .background-parallax {
      display: block;
      position: fixed;
      inset: 0;

      width: 100vw;
      height: 100vh;

      overflow: hidden;
      transform: none !important;
   }

   .bg-layer {
      position: absolute;
      inset: 0 auto auto 0;
      width: 106vw;
      height: 106vh;

      margin-left: -3vw;
      margin-top: -3vh;

      background-repeat: no-repeat;
      background-size: cover;

      pointer-events: none;

      opacity: 1;
      transition: none;

      border-radius: 10px;
   }

   .bg-layer + .bg-layer {
      transition: opacity 0.5s ease;
   }
</style>
