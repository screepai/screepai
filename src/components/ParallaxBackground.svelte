<script lang="ts">
   import ParallaxJS from "parallax-js";
   import { onMount } from "svelte";
   import { fade } from "svelte/transition";
   import { ANIMATION } from "../config/animation";

   export let darkMode: boolean;
   export let transitionEnd: boolean;

   let background: HTMLElement;

   onMount(() => {
      const scene = document.getElementById("scene");
      new ParallaxJS(background);
      if (scene) new ParallaxJS(scene);
   });
</script>

<div bind:this={background} id="background" transition:fade={{ delay: ANIMATION.TRANSITION.FADE_DELAY, duration: ANIMATION.TRANSITION.FADE_DURATION }} class="parallax">
   <div data-depth="0.02" class="bg dark-mode" style:opacity="{darkMode ? 1 : 0}" style:z-index="{!darkMode && transitionEnd ? 0 : 1}"></div>
   <div data-depth="0.02" class="bg light-mode" style:opacity="{darkMode ? 0 : 1}" style:z-index="{darkMode && transitionEnd ? 0 : 2}"></div>
</div> 
