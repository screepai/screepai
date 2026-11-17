<script lang="ts">
   import { onMount } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import { github, mal } from "../config/shapes";
   import ThemeToggle from "../components/ThemeToggle.svelte";
   import DiscordProfile from "../components/DiscordProfile.svelte";
   import StarAnimation from "../components/StarAnimation.svelte";
   import WinkStar from "../components/WinkStar.svelte";
   import ConsoleEasterEgg from "../components/ConsoleEasterEgg.svelte";
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
   import siteFontUrl from "@fontsource/inter-tight/files/inter-tight-latin-400-normal.woff2?url";
   import { preloadInterests, preloadMalRelations } from "#lib/interests/client.js";

   import "../styles/global.css";

   let darkMode = $state(false);
   let introPhase = $state<IntroPhase>("hidden");
   let introRunId = 0;
   let backgroundUrls = $state(getBackgroundUrlsFor("jpg"));

   type IntroPhase = "hidden" | "typing" | "loading" | "wink" | "holdingWink" | "leaving" | "ready";

   const OWO_TEXT = "(´•ω•`)";
   const WINK_TEXT = "(´•ω<`)";
   const WINK_STAR_DURATION = ANIMATION.WINK.DURATION;
   const INTERESTS_PRELOAD_BUDGET_MS = 2000;
   const LOADING_LETTER_HOP_MS = 900;
   const LOADING_STATUS_MIN_MS = LOADING_LETTER_HOP_MS * 2;
   const LOADING_TEXT = "loading data...";
   let introTimeouts: ReturnType<typeof setTimeout>[] = [];

   let visible = $derived(
      introPhase === "typing" ||
         introPhase === "loading" ||
         introPhase === "wink" ||
         introPhase === "holdingWink"
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

   function animateLoadingLetters(node: HTMLSpanElement) {
      const letters = [...node.querySelectorAll<HTMLElement>(".loading-letter")];
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let animation: Animation | undefined;
      let nextLetter = 0;

      function hop() {
         if (reducedMotion.matches || document.hidden || !letters.length) return;
         const letter = letters[nextLetter];
         nextLetter = (nextLetter + 1) % letters.length;
         animation = letter.animate(
            [
               { transform: "none", offset: 0 },
               { transform: "translateY(0) scale(1.07, 0.9)", offset: 0.12 },
               { transform: "translateY(-7px) scale(0.98, 1.04)", offset: 0.38 },
               {
                  transform: "translateY(-7px) scale(1)",
                  offset: 0.47,
                  easing: "cubic-bezier(0.77, 0, 0.175, 1)",
               },
               { transform: "translateY(0) scale(1.08, 0.88)", offset: 0.8 },
               { transform: "translateY(-0.5px) scale(0.995, 1.015)", offset: 0.9 },
               { transform: "none", offset: 1 },
            ].map((frame) => ({ easing: "cubic-bezier(0.23, 1, 0.32, 1)", ...frame })),
            { duration: LOADING_LETTER_HOP_MS }
         );
         animation.onfinish = () => {
            // Release the glyph's layer before the next letter takes its turn.
            animation?.cancel();
            hop();
         };
      }

      function play() {
         animation?.cancel();
         nextLetter = 0;
         hop();
      }

      play();
      reducedMotion.addEventListener("change", play);
      document.addEventListener("visibilitychange", play);
      return {
         destroy() {
            reducedMotion.removeEventListener("change", play);
            document.removeEventListener("visibilitychange", play);
            animation?.cancel();
         },
      };
   }

   async function runIntroSequence() {
      const runId = ++introRunId;
      const isCurrentRun = () => runId === introRunId;

      const interestsReady = preloadInterests().catch((error) => {
         console.warn("Interests preload failed:", error);
      });
      void preloadMalRelations().catch((error) => {
         console.warn("MAL relations preload failed:", error);
      });

      const assetsReady = preloadIntroAssets();
      const textReady = wait(getInitialAnimationDelay());
      const introReady = Promise.all([
         assetsReady,
         Promise.race([interestsReady, wait(INTERESTS_PRELOAD_BUDGET_MS)]),
      ]);

      await wait(100);
      if (!isCurrentRun()) return;
      introPhase = "typing";

      await textReady;
      if (!isCurrentRun()) return;
      introPhase = "loading";

      await Promise.all([introReady, wait(LOADING_STATUS_MIN_MS)]);
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
   <link rel="preload" as="font" type="font/woff2" href={siteFontUrl} crossorigin="anonymous" />
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

<ConsoleEasterEgg />

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
         {#if introPhase === "loading" || isWinking}
            <p class="intro-status" role="status" aria-atomic="true" in:fade={{ duration: 160 }}>
               {#if isWinking}
                  <span class="loaded-wipe">
                     <span class="wipe-old" aria-hidden="true">{LOADING_TEXT}</span>
                     <span class="loaded-text">data loaded!</span>
                  </span>
               {:else}
                  <span class="loading-accessible">{LOADING_TEXT}</span>
                  <span class="loading-letters" aria-hidden="true" use:animateLoadingLetters>
                     {#each LOADING_TEXT as letter, i (i)}
                        <span class="loading-letter">{letter === " " ? "\u00a0" : letter}</span>
                     {/each}
                  </span>
               {/if}
            </p>
         {/if}
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
      position: fixed;
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
      inset: 0;
      display: grid;
      place-items: center;
      color: var(--uwu);
      transition: color 0.5s ease;
   }

   .centered-motion {
      position: relative;
      display: inline-block;
   }

   .centered {
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 200;
      font-size: 46px;
      letter-spacing: 0.04em;
      animation: none;
   }

   .intro-status {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      text-align: center;
      white-space: nowrap;
      margin: 0.8em 0 0;
      color: inherit;
      opacity: 0.5;
      font-size: 12px;
      font-weight: 400;
      line-height: 1.5;
      letter-spacing: 0.035em;
   }

   .loading-accessible {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
   }

   .loading-letters {
      display: inline-block;
   }

   .loading-letter {
      display: inline-block;
      transform-origin: center bottom;
   }

   .loaded-wipe {
      position: relative;
      display: inline-grid;
      justify-items: center;
   }

   .wipe-old,
   .loaded-text {
      grid-area: 1 / 1;
   }

   .wipe-old {
      animation: loaded-wipe-text 560ms step-end forwards reverse;
   }

   .loaded-wipe::after {
      content: "";
      position: absolute;
      inset: 0 -0.15em;
      background: currentColor;
      clip-path: inset(100% 0 0 0);
      animation: loaded-wipe-block 560ms cubic-bezier(0.77, 0, 0.175, 1) forwards;
   }

   .loaded-text {
      opacity: 0;
      animation: loaded-wipe-text 560ms step-end forwards;
   }

   @keyframes loaded-wipe-block {
      0% {
         clip-path: inset(100% 0 0 0);
      }
      50% {
         clip-path: inset(0 0 0 0);
      }
      100% {
         clip-path: inset(0 0 100% 0);
      }
   }

   @keyframes loaded-wipe-text {
      0% {
         opacity: 0;
      }
      50%,
      100% {
         opacity: 1;
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .loaded-wipe::after {
         animation: none;
      }

      .loaded-text {
         opacity: 1;
         animation: none;
      }

      .wipe-old {
         visibility: hidden;
         animation: none;
      }
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
