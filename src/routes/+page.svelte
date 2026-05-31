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
   import {
      applyTheme,
      getInitialTheme,
      isDarkTheme,
      saveTheme,
      themeFromDarkMode,
      toggleTheme,
      watchSystemTheme,
      type ThemeName,
   } from "../config/theme";
   import { preloadImages } from "../utils/preload";

   import "../styles/global.css";
   import "../styles/swiper.css";
   import "../styles/checkbox.css";

   let darkMode = false;
   let transitionEnd = true;
   let themeTransitionTimeout: ReturnType<typeof setTimeout> | undefined;
   let introPhase: IntroPhase = "hidden";
   let introRunId = 0;

   type IntroPhase = "hidden" | "typing" | "wink" | "holdingWink" | "leaving" | "ready";

   const OWO_TEXT = "(´•ω•`)";
   const WINK_TEXT = "(´•ω<`)";
   const WINK_STAR_DURATION = 650;
   let introTimeouts: ReturnType<typeof setTimeout>[] = [];

   $: visible = introPhase === "typing" || introPhase === "wink" || introPhase === "holdingWink";
   $: ready = introPhase === "ready";
   $: isWinking = introPhase === "wink" || introPhase === "holdingWink";
   $: winkStarVisible = introPhase === "wink";
   $: displayOwo = isWinking ? WINK_TEXT : OWO_TEXT;

   function setTheme(theme: ThemeName) {
      darkMode = isDarkTheme(theme);
      applyTheme(theme);
   }

   function handleThemeToggle() {
      transitionEnd = false;
      clearTimeout(themeTransitionTimeout);
      const nextTheme = toggleTheme(themeFromDarkMode(darkMode));
      setTheme(nextTheme);
      saveTheme(nextTheme);

      themeTransitionTimeout = setTimeout(() => {
         transitionEnd = true;
      }, ANIMATION.TRANSITION.THEME_DURATION);
   }

   async function preloadIntroAssets() {
      await Promise.all([
         preloadImages(backgroundImageUrls),
         preloadImages(discordImageUrls),
      ]);
   }

   function getInitialAnimationDelay() {
      return 200 + OWO_TEXT.length * ANIMATION.CENTERED_TEXT.CHAR_DELAY + ANIMATION.CENTERED_TEXT.DURATION * 1.2;
   }

   function wait(ms: number) {
      if (ms <= 0) return Promise.resolve();

      return new Promise<void>((resolve) => {
         const timeout = setTimeout(() => {
            introTimeouts = introTimeouts.filter(introTimeout => introTimeout !== timeout);
            resolve();
         }, ms);
         introTimeouts = [...introTimeouts, timeout];
      });
   }

   function clearIntroTimeouts() {
      introTimeouts.forEach(timeout => clearTimeout(timeout));
      introTimeouts = [];
   }

   async function runIntroSequence() {
      const runId = ++introRunId;
      const isCurrentRun = () => runId === introRunId;
      const assetsReady = preloadIntroAssets();
      const textReady = wait(getInitialAnimationDelay());

      await wait(100);
      if (!isCurrentRun()) return;
      introPhase = "typing";

      await Promise.all([assetsReady, textReady]);
      if (!isCurrentRun()) return;
      introPhase = "wink";

      await wait(WINK_STAR_DURATION);
      if (!isCurrentRun()) return;
      introPhase = "holdingWink";

      await wait(ANIMATION.CENTERED_TEXT.DISPLAY_TIME - WINK_STAR_DURATION);
      if (!isCurrentRun()) return;
      introPhase = "leaving";

      await wait(ANIMATION.TRANSITION.FADE_DELAY);
      if (!isCurrentRun()) return;
      introPhase = "ready";
      await tick();

      await wait(ANIMATION.TRANSITION.FADE_DELAY);
      if (!isCurrentRun()) return;
      aos.init({
         easing: "ease-out-back",
         offset: -999,
      });
   }

   onMount(() => {
      setTheme(getInitialTheme());
      const stopWatchingSystemTheme = watchSystemTheme(setTheme);

      void runIntroSequence();

      return () => {
         introRunId += 1;
         clearIntroTimeouts();
         clearTimeout(themeTransitionTimeout);
         stopWatchingSystemTheme();
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
   <style>
      :root {
         --bg: #f7f8f3;
      }

      @media (prefers-color-scheme: dark) {
         :root {
            --bg: #232a44;
         }
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
         <ThemeToggle {darkMode} onToggle={handleThemeToggle} />
         <span class="magic">
            <StarAnimation {darkMode} />
            <DiscordProfile {darkMode} />
            <ContentSlider />
         </span>
      </div>
   </div>
{/if}
