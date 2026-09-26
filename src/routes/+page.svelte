<script lang="ts">
   import { onMount } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import { github, star, mal } from "../config/shapes";
   import ThemeToggle from "../components/ThemeToggle.svelte";
   import DiscordProfile from "../components/DiscordProfile.svelte";
   import StarAnimation from "../components/StarAnimation.svelte";
   import ContentSlider from "../components/ContentSlider.svelte";
   import ParallaxBackground from "../components/ParallaxBackground.svelte";
   import { parallax } from "../actions/parallax";
   import { ANIMATION } from "../config/animation";
   import {
      applyTheme,
      getDiscordUrl,
      getInitialTheme,
      getThemeDefinition,
      isDarkTheme,
      saveTheme,
      themeFromDarkMode,
      toggleTheme,
      watchSystemTheme,
      type ThemeName,
   } from "../config/theme";
   import { preloadImages } from "../utils/preload";
   import {
      preloadInterests,
   } from "$lib/interests/client";

   import "../styles/global.css";

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

   function preloadOtherThemeAssets(currentTheme: ThemeName) {
      const otherTheme = toggleTheme(currentTheme);

      const otherThemeUrls = [
         getThemeDefinition(otherTheme).backgroundImage,
         getDiscordUrl(otherTheme),
      ];

      setTimeout(() => {
         void preloadImages(otherThemeUrls);
      }, 500);
   }

   async function preloadIntroAssets() {
      const currentTheme = themeFromDarkMode(darkMode);

      const introUrls = [
         getThemeDefinition(currentTheme).backgroundImage,
         getDiscordUrl("light"),
         getDiscordUrl("dark"),
      ];

      await preloadImages(introUrls);

      preloadOtherThemeAssets(currentTheme);
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

      void preloadInterests()
         .catch((error) => {
            console.warn(
               "Interests preload failed:",
               error
            );
         });

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
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
   }

   .profile {
      --theme-space: 5em;
      position: relative !important;
      left: var(--profile-left) !important;
      top: 50% !important;
      width: clamp(15rem, 72vw, 25.625rem);
      max-width: 25.625rem;
      max-height: calc(85dvh - var(--theme-space));
      background: #FBFBFB;
      box-shadow: 20px 20px 20px rgba(56, 56, 56, 0.306);
      border-radius: 10px;
      pointer-events: auto !important;
      transition:
         left 0.5s cubic-bezier(.26, 1.5, .46, 1);
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
      transition:
         left 0.5s cubic-bezier(0.25, 1.25, 0.75, 1),
         rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center center;
      max-width: 100vw;
      will-change: transform;
      font-weight: 700;
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
      border-radius: 10px;
   }

   .profile > .magic {
      display: flex;
      flex-direction: column;
      position: relative;
      width: 100%;
      height: auto;
      max-height: calc(85dvh - var(--theme-space));
      min-height: 0;
      overflow: visible;
      border-radius: inherit;
      z-index: 999;
   }

   .profile > .magic::-webkit-scrollbar {
      width: 6px;
   }

   .profile > .magic::-webkit-scrollbar-track {
      background: transparent;
   }

   .profile > .magic::-webkit-scrollbar-thumb {
      background:
         color-mix(
            in srgb,
            var(--fill) 45%,
            transparent
         );

      border-radius: 999px;
   }

   .profile > .magic::-webkit-scrollbar-thumb:hover {
      background:
         color-mix(
            in srgb,
            var(--fill) 70%,
            transparent
         );
   }

   .profile-header {
      flex: 0 0 auto;
      position: relative;
      z-index: 2;
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
      animation-timing-function: cubic-bezier(
         0.68,
         -0.55,
         0.265,
         1.55
      );
   }

   .centered.winking {
      animation:
         wink-pop 650ms
         cubic-bezier(0.22, 1, 0.36, 1)
         forwards;
   }

   @keyframes wink-pop {
      0% {
         transform:
            translateY(0)
            scale(1, 1)
            rotate(0deg);
      }
      18% {
         transform:
            translateY(2px)
            scale(1.08, 0.91)
            rotate(-1.5deg);
      }
      42% {
         transform:
            translateY(-3px)
            scale(0.96, 1.08)
            rotate(1.3deg);
      }
      68% {
         transform:
            translateY(1px)
            scale(1.025, 0.98)
            rotate(-0.5deg);
      }
      100% {
         transform:
            translateY(0)
            scale(1, 1)
            rotate(0deg);
      }
   }

   .wink-shooting-star {
      position: absolute;
      left: calc(100% - 0.4rem);
      top: -0.25rem;
      width: 1.45rem;
      height: 1.45rem;
      color: var(--fill);
      pointer-events: none;

      offset-path: path(
         "M 0 0 C 13 -42, 40 -45, 52 15"
      );

      offset-distance: 0%;
      offset-rotate: 0deg;

      backface-visibility: hidden;

      will-change:
         opacity,
         offset-distance;

      animation:
         wink-star-travel
         590ms
         cubic-bezier(0.25, 0.1, 0.25, 1)
         60ms
         forwards,

         wink-star-fade
         590ms
         ease-out
         60ms
         forwards;

      z-index: 1;
   }

   .wink-shooting-star svg {
      display: block;
      width: 100%;
      height: 100%;

      transform-origin: center center;
      transform-box: fill-box;

      backface-visibility: hidden;
      will-change: transform;

      animation:
         wink-star-transform
         590ms
         linear
         60ms
         forwards;
   }

   .wink-shooting-star path {
      fill: currentColor;
   }

   @keyframes wink-star-travel {
      from {
         offset-distance: 0%;
      }

      to {
         offset-distance: 100%;
      }
   }

   @keyframes wink-star-transform {
      0% {
         transform:
            rotate(-15deg)
            scale(0.4);
      }

      22% {
         transform:
            rotate(20deg)
            scale(1.1);
      }

      48% {
         transform:
            rotate(55deg)
            scale(0.98);
      }

      72% {
         transform:
            rotate(87deg)
            scale(0.85);
      }

      100% {
         transform:
            rotate(125deg)
            scale(0.65);
      }
   }

   @keyframes wink-star-fade {
      0% {
         opacity: 0;
      }

      10% {
         opacity: 1;
      }

      55% {
         opacity: 0.9;
      }

      75% {
         opacity: 0.55;
      }

      90% {
         opacity: 0.2;
      }

      100% {
         opacity: 0;
      }
   }

   @keyframes bob {
      0%,
      100% {
         transform: translate(0, 0);
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
   <meta property="og:url" content="https://screepy.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="seepie" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="/og.png" />
</svelte:head>

<svg
   xmlns="http://www.w3.org/2000/svg"
   aria-hidden="true"
   width="0"
   height="0"
   style="position: absolute; overflow: hidden;"
>
   <symbol id="icon-mal" viewBox="0 0 24 24">
      <path d={mal} fill="currentColor" />
   </symbol>

   <symbol id="icon-vndb" viewBox="0 0 64 24">
      <text
         x="32"
         y="19"
         text-anchor="middle"
         fill="currentColor"
         font-family="Futura, 'Century New Gothic', Arial, serif"
         font-size="24"
         font-weight="bold"
         font-style="italic"
         letter-spacing="-1.5"
      >
         vndb
      </text>
   </symbol>

   <symbol id="icon-github" viewBox="0 0 496 512">
      <path d={github} fill="currentColor" />
   </symbol>
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
         <StarAnimation />
         <div class="magic">
            <div class="profile-header">
               <DiscordProfile {darkMode} />
            </div>
            <ContentSlider />
         </div>
      </div>
   </div>
{/if}
