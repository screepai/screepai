<script lang="ts">
   import ParallaxJS from "parallax-js";
   import { onMount } from "svelte";
   import { fade } from "svelte/transition";
   import { ANIMATION } from "../config/animation";

   export let darkMode: boolean;
   export let transitionEnd: boolean;
   export let onPreloaded: (data: {type: string}) => void = () => {};
   
   let darkBgLoaded = false;
   let lightBgLoaded = false;
   
   function checkAllLoaded() {
      if (darkBgLoaded && lightBgLoaded) {
         onPreloaded({ type: darkMode ? 'dark' : 'light' });
      }
   }
   
   function handleDarkBgLoaded() {
      darkBgLoaded = true;
      checkAllLoaded();
   }
   
   function handleLightBgLoaded() {
      lightBgLoaded = true;
      checkAllLoaded();
   }

   onMount(() => {
      const background = document.getElementById("background");
      const scene = document.getElementById("scene");
      if (background) new ParallaxJS(background);
      if (scene) new ParallaxJS(scene);
      
      const darkBgImg = new Image();
      darkBgImg.onload = handleDarkBgLoaded;
      darkBgImg.src = '/sw.jpg';
      
      const lightBgImg = new Image();
      lightBgImg.onload = handleLightBgLoaded;
      lightBgImg.src = '/background2.jpg';
   });
</script>

<div id="background" transition:fade={{ delay: ANIMATION.TRANSITION.FADE_DELAY, duration: ANIMATION.TRANSITION.FADE_DURATION }} class="parallax">
   <div data-depth="0.02" class="bg dark-mode" style:opacity="{darkMode ? 1 : 0}" style:z-index="{!darkMode && transitionEnd ? 0 : 1}"></div>
   <div data-depth="0.02" class="bg light-mode" style:opacity="{darkMode ? 0 : 1}" style:z-index="{darkMode && transitionEnd ? 0 : 2}"></div>
</div> 