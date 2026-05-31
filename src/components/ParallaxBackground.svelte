<script lang="ts">
   import { fade } from "svelte/transition";
   import { parallax } from "../actions/parallax";
   import { ANIMATION } from "../config/animation";
   import { getThemeDefinition } from "../config/theme";

   export let darkMode: boolean;
   export let transitionEnd: boolean;

   const darkBackground = getThemeDefinition("dark");
   const lightBackground = getThemeDefinition("light");
</script>

<style>
   .background-parallax {
      display: block;
      justify-content: center;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
      width: 100%;
      height: 100%;
   }

   .bg-layer {
      position: fixed;
      width: 100%;
      height: 110vh;
      background-attachment: fixed;
      background-repeat: no-repeat;
      background-size: cover;
      pointer-events: none;
      transition: opacity 0.5s ease;
      opacity: 0;
      border-radius: 10px;
   }
</style>

<div use:parallax transition:fade={{ delay: ANIMATION.TRANSITION.FADE_DELAY, duration: ANIMATION.TRANSITION.FADE_DURATION }} class="background-parallax">
   <div
      data-depth="0.02"
      class="bg-layer"
      style:opacity={darkMode ? 1 : 0}
      style:z-index={!darkMode && transitionEnd ? 0 : 1}
      style:background-image={`url(${darkBackground.backgroundImage})`}
      style:background-position={darkBackground.backgroundPosition}
   ></div>
   <div
      data-depth="0.02"
      class="bg-layer"
      style:opacity={darkMode ? 0 : 1}
      style:z-index={darkMode && transitionEnd ? 0 : 2}
      style:background-image={`url(${lightBackground.backgroundImage})`}
      style:background-position={lightBackground.backgroundPosition}
   ></div>
</div>
