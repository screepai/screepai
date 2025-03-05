<script lang="ts">
   import { onMount, tick } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import aos from "aos";
   import { github, x, youtube } from "../config/shapes.ts";
   import ThemeToggle from "../components/ThemeToggle.svelte";
   import DiscordProfile from "../components/DiscordProfile.svelte";
   import StarAnimation from "../components/StarAnimation.svelte";
   import ContentSlider from "../components/ContentSlider.svelte";
   import ParallaxBackground from "../components/ParallaxBackground.svelte";
   import { ANIMATION } from "../config/animation";

   import "../styles/global.css";
   import "../styles/swiper.css";
   import "../styles/checkbox.css";

   import "swiper/css";
   import "swiper/css/navigation";
   import "swiper/css/pagination";

   let ready = false;
   let visible = false;
   let darkMode = false;
   let transitionEnd = true;
   let preloadingProfile = true;
   let showPreloader = true;
   let owo = ["(´•ω•`)", "(˶°ㅁ°)!!"];
   let randomOwo = owo[Math.floor(Math.random() * owo.length)];

   function handleDiscordPreloaded() {
      preloadingProfile = false;
      showPreloader = false;
      startAnimationSequence();
   }

   function startAnimationSequence() {
      const startProfileAt = ANIMATION.CENTERED_TEXT.DISPLAY_TIME;
      const startFadeAt = startProfileAt + ANIMATION.TRANSITION.FADE_DELAY;
      const startAOSAt = startFadeAt + ANIMATION.TRANSITION.FADE_DELAY;

      setTimeout(() => {
         visible = false;
      }, startProfileAt);

      setTimeout(async () => {
         ready = true;
         await tick();
      }, startFadeAt);

      setTimeout(() => {
         aos.init({
            easing: "ease-out-back",
            offset: -999,
         });
      }, startAOSAt);
   }

   onMount(async () => {
      const localStorageTheme = localStorage.getItem("theme");
      const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
      darkMode = localStorageTheme 
         ? localStorageTheme === "dark"
         : systemSettingDark.matches;
      
      visible = true;
      await tick();
      
      const timeout = setTimeout(() => {
         if (preloadingProfile) {
            preloadingProfile = false;
            showPreloader = false;
            startAnimationSequence();
         }
      }, 5000);
      
      return () => clearTimeout(timeout);
   });
</script>

<svelte:head>
   <title>⸜( ´ ꒳ ` )⸝</title>
   <meta property="og:title" content="⸜( ´ ꒳ ` )⸝" />
   <meta name="description" content="about me" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="seepie" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="/og.png" />
   <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
   <script src="https://code.iconify.design/1/1.0.4/iconify.min.js"></script>
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
      integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg=="
      crossorigin="anonymous" referrerpolicy="no-referrer" />
   <script>
      (function() {
         const localStorageTheme = localStorage.getItem("theme");
         const isDark = localStorageTheme 
            ? localStorageTheme === "dark"
            : window.matchMedia("(prefers-color-scheme: dark)").matches;
         document.documentElement.style.setProperty("--bg", isDark ? "#232a44" : "#f7f8f3");
      })();
   </script>
   <style>
      :root {
         --bg: #f7f8f3;
      }
   </style>
</svelte:head>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" display="none" width="0" height="0">
   <symbol id="icon-969" viewBox="0 0 576 512"><path d={youtube} /></symbol>
   <symbol id="icon-910" viewBox="0 0 16 16"><path d={x} /></symbol>
   <symbol id="icon-905" viewBox="0 0 496 512"><path d={github} /></symbol>
</svg>

{#if visible}
   <div class="centered" out:fly="{{ y: -50, duration: ANIMATION.CENTERED_TEXT.DURATION, easing: backInOut }}" class:light-mode={!darkMode} class:dark-mode={darkMode}>
      {#each randomOwo as char, i}
         <span in:fade="{{ delay: i * ANIMATION.CENTERED_TEXT.CHAR_DELAY, duration: ANIMATION.CENTERED_TEXT.DURATION, easing: backInOut }}">{char}</span>
      {/each}
   </div>
{/if}

{#if showPreloader}
   <div style="position: absolute; opacity: 0; pointer-events: none;" transition:fade={{ duration: 300 }}>
      <DiscordProfile {darkMode} on:preloaded={handleDiscordPreloaded} />
   </div>
{/if}

{#if ready}
   <ParallaxBackground {darkMode} {transitionEnd} />
   <div id="scene" transition:fade={{ delay: ANIMATION.TRANSITION.FADE_DELAY, duration: ANIMATION.TRANSITION.FADE_DURATION }} class="parallax">
      <div data-depth="0.15" class:light-mode={!darkMode} class:dark-mode={darkMode} class="profile">
         <ThemeToggle bind:darkMode bind:transitionEnd />
         <span class="magic">
            <StarAnimation {darkMode} />
            <DiscordProfile {darkMode} />
            <ContentSlider />
         </span>
      </div>
   </div>
{/if}