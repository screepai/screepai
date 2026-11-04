<script lang="ts">
   import { onMount, untrack } from "svelte";
   import { ANIMATION } from "../config/animation";
   import {
      getDiscordUrl,
      themeFromDarkMode,
      themeNames,
      toggleTheme,
      type ThemeName,
   } from "../config/theme";
   import { preloadImage } from "../utils/preload";

   interface Props {
      darkMode: boolean;
   }

   type CardQuality = "static" | "animated";

   type CardState = {
      src: string | undefined;
      quality: CardQuality;
      staticLoaded: boolean;
      upgradeStarted: boolean;
      failed: boolean;
      retries: number;
   };

   let { darkMode }: Props = $props();

   const MAX_HEADER_RETRIES = 3;
   const ANIMATED_PRELOAD_TIMEOUT = 30000;
   const IDLE_PREFETCH_TIMEOUT = 3000;

   const cardUrls: Record<ThemeName, Record<CardQuality, string>> = {
      light: { static: getDiscordUrl("light", false), animated: getDiscordUrl("light") },
      dark: { static: getDiscordUrl("dark", false), animated: getDiscordUrl("dark") },
   };

   function createCard(): CardState {
      return {
         src: undefined,
         quality: "static",
         staticLoaded: false,
         upgradeStarted: false,
         failed: false,
         retries: 0,
      };
   }

   let cardRatio = $state("410 / 190");

   let cards = $state<Record<ThemeName, CardState>>({
      light: createCard(),
      dark: createCard(),
   });

   let activeTheme = $derived(themeFromDarkMode(darkMode));
   let discordFailed = $derived(cards[activeTheme].failed);

   let destroyed = false;
   let prefetchScheduled = false;
   let idleCallbackId: number | undefined;
   let prefetchTimeoutId: ReturnType<typeof setTimeout> | undefined;

   function retryUrl(url: string) {
      const separator = url.includes("?") ? "&" : "?";

      return url + separator + "_retry=" + Date.now();
   }

   function requestStatic(theme: ThemeName) {
      cards[theme].src ??= cardUrls[theme].static;
   }

   async function upgradeToAnimated(theme: ThemeName) {
      const card = cards[theme];

      if (card.upgradeStarted || !card.staticLoaded) return;

      card.upgradeStarted = true;

      const url = cardUrls[theme].animated;
      const loaded = await preloadImage(url, ANIMATED_PRELOAD_TIMEOUT);

      if (!loaded || destroyed) return;

      card.quality = "animated";
      card.src = url;
   }

   function prefetchInactiveTheme() {
      if (prefetchScheduled) return;

      prefetchScheduled = true;

      const prefetch = () => requestStatic(toggleTheme(activeTheme));

      if (typeof requestIdleCallback === "function") {
         idleCallbackId = requestIdleCallback(prefetch, { timeout: IDLE_PREFETCH_TIMEOUT });
         return;
      }

      prefetchTimeoutId = setTimeout(prefetch, 300);
   }

   function retryHeader(theme: ThemeName) {
      const card = cards[theme];

      card.failed = true;

      if (card.retries >= MAX_HEADER_RETRIES) {
         return;
      }

      card.retries += 1;

      setTimeout(() => {
         card.src = retryUrl(cardUrls[theme][card.quality]);
      }, 2000);
   }

   function updateCardRatio(event: Event) {
      const image = event.currentTarget as HTMLImageElement;

      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
         cardRatio = `${image.naturalWidth} / ${image.naturalHeight}`;
      }
   }

   function handleCardLoad(theme: ThemeName, event: Event) {
      const card = cards[theme];

      updateCardRatio(event);
      card.failed = false;
      card.retries = 0;

      if (card.quality !== "static") return;

      card.staticLoaded = true;

      if (theme !== activeTheme) return;

      void upgradeToAnimated(theme);
      prefetchInactiveTheme();
   }

   $effect(() => {
      const theme = activeTheme;

      untrack(() => {
         requestStatic(theme);
         void upgradeToAnimated(theme);
      });
   });

   onMount(() => {
      return () => {
         destroyed = true;

         if (idleCallbackId !== undefined) cancelIdleCallback(idleCallbackId);
         clearTimeout(prefetchTimeoutId);
      };
   });
</script>

<div class="discord">
   <a href="https://discord.com/users/534375062099460097" target="_blank" rel="noreferrer">
      <div
         class="card-stack"
         style="--theme-duration: {ANIMATION.TRANSITION
            .THEME_DURATION}ms;  --card-ratio: {cardRatio}"
      >
         <div class="discord-fallback" class:fallback-visible={discordFailed}>
            oh nyo! you found me!!!<br />(˶˃ ᵕ ˂˶) .ᐟ.ᐟ
         </div>

         {#each themeNames as theme (theme)}
            <img
               class="card"
               class:visible={activeTheme === theme}
               class:hidden={activeTheme !== theme}
               class:failed={cards[theme].failed}
               src={cards[theme].src}
               alt=""
               onload={(event) => handleCardLoad(theme, event)}
               onerror={() => retryHeader(theme)}
            />
         {/each}
      </div>
   </a>
</div>

<style>
   .discord {
      pointer-events: none;
      width: 100%;
   }

   .discord a {
      pointer-events: auto;
      display: block;
      width: 100%;
   }

   .card-stack {
      position: relative;
      display: grid;
      width: 100%;
      min-height: 5rem;
      -webkit-mask-image: linear-gradient(
         to bottom,
         black 0%,
         black 88%,
         rgba(0, 0, 0, 0.8) 92%,
         rgba(0, 0, 0, 0.4) 96%,
         transparent 100%
      );
      aspect-ratio: var(--card-ratio);
      mask-image: linear-gradient(
         to bottom,
         black 0%,
         black 88%,
         rgba(0, 0, 0, 0.8) 92%,
         rgba(0, 0, 0, 0.4) 96%,
         transparent 100%
      );
   }

   .card,
   .discord-fallback {
      grid-area: 1 / 1;
   }

   .discord-fallback {
      z-index: 0;
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      padding: 1rem;
      color: var(--fill);
      opacity: 0;
      font-size: 1em;
      font-weight: 500;
      line-height: 1.4;
      text-align: center;
      text-decoration: none;
      box-sizing: border-box;
      pointer-events: none;
      transition: opacity 300ms ease;
   }

   .discord-fallback.fallback-visible {
      opacity: 0.5;
   }

   .card {
      z-index: 1;
      display: block;
      width: 100%;
      max-width: 100%;
      transition: opacity var(--theme-duration) ease;
      backface-visibility: hidden;
   }

   .card.failed {
      visibility: hidden;
   }

   .visible {
      opacity: 1;
   }

   .hidden {
      opacity: 0;
   }
</style>
