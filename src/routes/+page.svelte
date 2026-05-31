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
   import { parallax } from "../actions/parallax";
   import { ANIMATION } from "../config/animation";
   import {
      applyTheme,
      backgroundImageUrls,
      discordImageUrls,
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

<style>
   .scene-parallax {
      display: block;
      justify-content: center;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
   }

   .profile {
      position: relative !important;
      left: var(--profile-left) !important;
      top: 50% !important;
      max-width: 25.625rem;
      background: #FBFBFB;
      box-shadow: 20px 20px 20px rgba(56, 56, 56, 0.306);
      border-radius: 10px;
      pointer-events: auto !important;
      transition: left 0.5s cubic-bezier(.26, 1.5, .46, 1);
   }

   .profile::before {
      content: "☆~";
      position: absolute;
      top: -65px;
      left: var(--profile-before-left);
      font-size: 49px;
      rotate: var(--profile-before-deg);
      color: var(--fill);
      filter: drop-shadow(0 0 0.625rem var(--fill));
      animation: bob 4s ease-in-out infinite;
      transition: left 0.5s cubic-bezier(0.25, 1.25, 0.75, 1),
         rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center center;
      max-width: 100vw;
      will-change: transform;
   }

   .profile::after {
      content: "";
      position: absolute;
      border: 2px dashed var(--fill);
      width: 100%;
      height: 100%;
      padding: 10px;
      left: -12px;
      top: -12px;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
   }

   .profile > .magic {
      display: inline-block;
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 999;
   }

   .centered-shell {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      color: var(--uwu);
      transition: color 0.5s ease;
   }

   .centered-motion {
      position: relative;
      display: inline-block;
      will-change: transform, opacity;
   }

   .centered {
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 200;
      font-display: swap;
      font-size: 46px;
      letter-spacing: 0.04em;
      animation: none;
   }

   .centered span {
      will-change: opacity, filter;
   }

   .centered-char {
      display: inline-block;
      opacity: 0;
      animation-name: centered-char-fade-in;
      animation-fill-mode: forwards;
      animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
   }

   .centered.winking {
      animation: wink-shake 0.4s ease-in-out forwards;
   }

   .wink-shooting-star {
      position: absolute;
      left: calc(100% - 0.4rem);
      top: -0.25rem;
      width: 1.45rem;
      height: 1.45rem;
      color: var(--fill);
      pointer-events: none;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      contain: paint;
      will-change: transform, opacity;
      animation:
         wink-star-travel 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards,
         wink-star-fade 650ms ease-out forwards;
      z-index: 1;
   }

   .wink-shooting-star svg {
      display: block;
      width: 100%;
      height: 100%;
   }

   .wink-shooting-star path {
      fill: currentColor;
   }

   @keyframes bob {
      0%,
      100% {
         transform: translate(0, 0px);
      }

      50% {
         transform: translate(0, -10px);
      }
   }

   @keyframes centered-char-fade-in {
      from {
         opacity: 0;
      }

      to {
         opacity: 1;
      }
   }

   @keyframes wink-shake {
      0% {
         transform: translateY(0);
      }
      25% {
         transform: translateY(2px);
      }
      50% {
         transform: translateY(-2px);
      }
      100% {
         transform: translateY(0);
      }
   }

   @keyframes wink-star-travel {
      0% {
         transform: translate3d(0, 0, 0) rotate(-10deg) scale(0.45);
      }

      100% {
         transform: translate3d(48px, -21.4px, 0) rotate(105deg) scale(0.7);
      }
   }

   @keyframes wink-star-fade {
      0% {
         opacity: 0;
      }

      12% {
         opacity: 1;
      }

      45% {
         opacity: 0.72;
      }

      75% {
         opacity: 0.28;
      }

      100% {
         opacity: 0;
      }
   }

   @media only screen and (max-width: 1024px) {
      .profile {
         --profile-left: 0%;
      }
   }
</style>

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
</svelte:head>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" display="none" width="0" height="0">
   <symbol id="icon-969" viewBox="0 0 576 512"><path d={youtube} /></symbol>
   <symbol id="icon-910" viewBox="0 0 16 16"><path d={x} /></symbol>
   <symbol id="icon-905" viewBox="0 0 496 512"><path d={github} /></symbol>
</svg>

{#if visible}
   <div class="centered-shell">
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
   <div use:parallax transition:fade={{ delay: ANIMATION.TRANSITION.FADE_DELAY, duration: ANIMATION.TRANSITION.FADE_DURATION }} class="scene-parallax">
      <div data-depth="0.15" class="profile">
         <ThemeToggle {darkMode} onToggle={handleThemeToggle} />
         <span class="magic">
            <StarAnimation />
            <DiscordProfile {darkMode} />
            <ContentSlider />
         </span>
      </div>
   </div>
{/if}
