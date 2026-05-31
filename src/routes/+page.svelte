<script lang="ts">
   import { onMount, tick } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import aos from "aos";
   import { github, star, x, youtube } from "../config/shapes";
   import ThemeToggle from "../components/ThemeToggle.svelte";
   import DiscordProfile from "../components/DiscordProfile.svelte";
   import StarAnimation from "../components/StarAnimation.svelte";
   import ContentSlider from "../components/ContentSlider.svelte";
   import ParallaxBackground from "../components/ParallaxBackground.svelte";
   import { ANIMATION } from "../config/animation";
   import { backgroundImageUrls } from "../config/backgrounds";
   import { discordImageUrls } from "../config/discord";
   import { preloadImages } from "../utils/preload";

   import "../styles/global.css";
   import "../styles/swiper.css";
   import "../styles/checkbox.css";

   let ready = false;
   let visible = false;
   let darkMode = false;
   let transitionEnd = true;
   let owoText = "(´•ω•`)";
   let winkText = "(´•ω<`)";
   let displayOwo = owoText;
   let isWinking = false;
   let winkStarVisible = false;
   let initialAnimationComplete = false;
   let preloadComplete = false;
   let winkStarTimeout: ReturnType<typeof setTimeout> | undefined;
   let introSequenceStarted = false;

   const WINK_STAR_DURATION = 650;

   async function preloadIntroAssets() {
      await Promise.all([
         preloadImages(backgroundImageUrls),
         preloadImages(discordImageUrls),
      ]);

      preloadComplete = true;
      tryTriggerWink();
   }

   function tryTriggerWink() {
      if (preloadComplete && initialAnimationComplete && !introSequenceStarted) {
         introSequenceStarted = true;
         isWinking = true;
         displayOwo = winkText;
         winkStarVisible = true;
         clearTimeout(winkStarTimeout);
         winkStarTimeout = setTimeout(() => {
            winkStarVisible = false;
         }, WINK_STAR_DURATION);
         startAnimationSequence();
      }
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

   onMount(() => {
      const localStorageTheme = localStorage.getItem("theme");
      const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
      darkMode = localStorageTheme 
         ? localStorageTheme === "dark"
         : systemSettingDark.matches;
      
      setTimeout(() => {
         visible = true;
      }, 100);

      void preloadIntroAssets();

      const initialAnimationDuration = displayOwo.length * ANIMATION.CENTERED_TEXT.CHAR_DELAY + ANIMATION.CENTERED_TEXT.DURATION * 1.2;
      setTimeout(() => {
         initialAnimationComplete = true;
         tryTriggerWink();
      }, 200 + initialAnimationDuration);
      
      tick();
      
      return () => {
         clearTimeout(winkStarTimeout);
      };
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
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
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
   <div class="centered-shell" class:light-mode={!darkMode} class:dark-mode={darkMode}>
      <div class="centered-motion" out:fly={{ y: -50, duration: ANIMATION.CENTERED_TEXT.DURATION, easing: backInOut }}>
         <div class="centered" class:winking={isWinking}>
            {#each displayOwo as char, i (i)}
               <span
                  class="centered-char"
                  style:animation-delay={`${i * ANIMATION.CENTERED_TEXT.CHAR_DELAY}ms`}
                  style:animation-duration={`${ANIMATION.CENTERED_TEXT.DURATION * 1.2}ms`}
               >{char}</span>
            {/each}
         </div>
         {#if winkStarVisible}
            <span class="wink-shooting-star" aria-hidden="true">
               <svg viewBox="0 0 512 512">
                  <path d={star} />
               </svg>
            </span>
         {/if}
      </div>
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
