<script lang="ts">
   import { onMount } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import { github, mal } from "../config/shapes";
   import ThemeToggle from "../components/ThemeToggle.svelte";
   import DiscordProfile from "../components/DiscordProfile.svelte";
   import StarAnimation from "../components/StarAnimation.svelte";
   import WinkStar from "../components/WinkStar.svelte";
   import ContentSlider from "../components/ContentSlider.svelte";
   import ParallaxBackground from "../components/ParallaxBackground.svelte";
   import { parallax } from "../actions/parallax";
   import { ANIMATION } from "../config/animation";
   import {
      applyTheme,
      getBackgroundUrls,
      getBackgroundUrlsFor,
      getDiscordUrl,
      getInitialTheme,
      isDarkTheme,
      saveTheme,
      themeFromDarkMode,
      toggleTheme,
      watchSystemTheme,
      type ThemeName,
   } from "../config/theme";
   import { preloadImage, preloadImages } from "../utils/preload";
   import introFontUrl from "@fontsource/inter-tight/files/inter-tight-latin-200-normal.woff2?url";
   import { preloadInterests } from "#lib/interests/client.js";

   import "../styles/global.css";

   let darkMode = $state(false);
   let introPhase = $state<IntroPhase>("hidden");
   let introRunId = 0;
   let backgroundUrls = $state(getBackgroundUrlsFor("jpg"));

   type IntroPhase = "hidden" | "typing" | "wink" | "holdingWink" | "leaving" | "ready";

   const OWO_TEXT = "(´•ω•`)";
   const WINK_TEXT = "(´•ω<`)";
   const WINK_STAR_DURATION = ANIMATION.WINK.DURATION;
   let introTimeouts: ReturnType<typeof setTimeout>[] = [];

   let visible = $derived(
      introPhase === "typing" || introPhase === "wink" || introPhase === "holdingWink"
   );
   let ready = $derived(introPhase === "ready");
   let isWinking = $derived(introPhase === "wink" || introPhase === "holdingWink");
   let winkStarVisible = $derived(introPhase === "wink");
   let displayOwo = $derived(isWinking ? WINK_TEXT : OWO_TEXT);

   function setTheme(theme: ThemeName) {
      darkMode = isDarkTheme(theme);
      applyTheme(theme);
   }

   function handleThemeToggle() {
      const nextTheme = toggleTheme(themeFromDarkMode(darkMode));
      setTheme(nextTheme);
      saveTheme(nextTheme);
   }

   function preloadOtherThemeAssets(currentTheme: ThemeName, urls: Record<ThemeName, string>) {
      const otherTheme = toggleTheme(currentTheme);

      const otherThemeUrls = [urls[otherTheme], getDiscordUrl(otherTheme, false)];

      setTimeout(() => {
         void preloadImages(otherThemeUrls);
      }, 500);
   }

   async function preloadIntroAssets() {
      const currentTheme = themeFromDarkMode(darkMode);

      const backgroundReady = getBackgroundUrls().then(async (urls) => {
         backgroundUrls = urls;
         await preloadImage(urls[currentTheme]);

         return urls;
      });

      await preloadImage(getDiscordUrl(currentTheme, false));

      preloadOtherThemeAssets(currentTheme, await backgroundReady);
   }

   function getInitialAnimationDelay() {
      return (
         200 +
         OWO_TEXT.length * ANIMATION.CENTERED_TEXT.CHAR_DELAY +
         ANIMATION.CENTERED_TEXT.DURATION * 1.2
      );
   }

   function wait(ms: number) {
      if (ms <= 0) return Promise.resolve();

      return new Promise<void>((resolve) => {
         const timeout = setTimeout(() => {
            introTimeouts = introTimeouts.filter((introTimeout) => introTimeout !== timeout);
            resolve();
         }, ms);
         introTimeouts = [...introTimeouts, timeout];
      });
   }

   function clearIntroTimeouts() {
      introTimeouts.forEach((timeout) => clearTimeout(timeout));
      introTimeouts = [];
   }

   async function runIntroSequence() {
      const runId = ++introRunId;
      const isCurrentRun = () => runId === introRunId;

      void preloadInterests().catch((error) => {
         console.warn("Interests preload failed:", error);
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
         stopWatchingSystemTheme();
      };
   });
</script>

<svelte:head>
   <title>⸜( ´ ꒳ ` )⸝</title>
   <meta property="og:title" content="⸜( ´ ꒳ ` )⸝" />
   <meta name="description" content="about me" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.moe/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="seepie" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="/og.jpg" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="676" />
   <link rel="preload" as="font" type="font/woff2" href={introFontUrl} crossorigin="anonymous" />
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
      <div
         class="centered-motion"
         out:fly={{ y: -50, duration: ANIMATION.CENTERED_TEXT.DURATION, easing: backInOut }}
      >
         <div class="centered" class:winking={isWinking}>
            {#each displayOwo as char, i (i)}
               <span
                  class="centered-char"
                  style:animation-delay={`${i * ANIMATION.CENTERED_TEXT.CHAR_DELAY}ms`}
                  style:animation-duration={`${ANIMATION.CENTERED_TEXT.DURATION * 1.2}ms`}
                  >{char}</span
               >
            {/each}
         </div>
         {#if winkStarVisible}
            <WinkStar />
         {/if}
      </div>
   </div>
{/if}
{#if ready}
   <ParallaxBackground {backgroundUrls} {darkMode} />
   <div
      use:parallax
      transition:fade={{
         delay: ANIMATION.TRANSITION.FADE_DELAY,
         duration: ANIMATION.TRANSITION.FADE_DURATION,
      }}
      class="scene-parallax"
   >
      <div data-depth="0.15" class="profile">
         <div class="profile-doodle" aria-hidden="true"><span>☆~</span></div>
         <ThemeToggle {darkMode} onToggle={handleThemeToggle} />
         <StarAnimation {darkMode} />
         <div class="magic">
            <div class="profile-header">
               <DiscordProfile {darkMode} />
            </div>
            <ContentSlider />
         </div>
      </div>
   </div>
{/if}

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
      left: 0 !important;
      translate: var(--profile-left) 0;
      top: 50% !important;
      width: clamp(15rem, 72vw, 25.625rem);
      max-width: 25.625rem;
      max-height: calc(85dvh - var(--theme-space));
      background: #fbfbfb;
      box-shadow: 20px 20px 20px rgba(56, 56, 56, 0.306);
      border-radius: 10px;
      pointer-events: auto !important;
      transition: translate 0.5s cubic-bezier(0.26, 1.5, 0.46, 1);
   }

   .profile-doodle {
      position: absolute;
      top: -65px;
      left: 0;
      width: 100%;
      translate: var(--profile-before-left) 0;
      pointer-events: none;
      transition: translate 0.5s cubic-bezier(0.25, 1.25, 0.75, 1);
   }

   .profile-doodle span {
      display: inline-block;
      font-size: 49px;
      rotate: var(--profile-before-deg);
      color: var(--fill);
      filter: drop-shadow(0 0 0.625rem var(--fill));
      animation: bob 4s ease-in-out infinite;
      transition: rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      transform-origin: center center;
      max-width: 100vw;
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
      background: color-mix(in srgb, var(--fill) 45%, transparent);

      border-radius: 999px;
   }

   .profile > .magic::-webkit-scrollbar-thumb:hover {
      background: color-mix(in srgb, var(--fill) 70%, transparent);
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
      animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
   }

   .centered.winking {
      animation: wink-pop 650ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
   }

   @keyframes wink-pop {
      0% {
         transform: translateY(0) scale(1, 1) rotate(0deg);
      }
      18% {
         transform: translateY(2px) scale(1.045, 0.95) rotate(-1deg);
      }
      42% {
         transform: translateY(-2px) scale(0.98, 1.04) rotate(0.8deg);
      }
      68% {
         transform: translateY(0.5px) scale(1.012, 0.99) rotate(-0.3deg);
      }
      100% {
         transform: translateY(0) scale(1, 1) rotate(0deg);
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .centered.winking {
         animation: none;
      }

      .profile-doodle span {
         animation: none;
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
