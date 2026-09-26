<script lang="ts">
   import { ANIMATION } from "../config/animation";
   import { getDiscordUrl } from "../config/theme";

   export let darkMode: boolean;

   const lightUrl = getDiscordUrl("light");
   const darkUrl = getDiscordUrl("dark");

   let cardRatio = "410 / 190";

   let lightFailed = false;
   let darkFailed = false;

   let lightRetries = 0;
   let darkRetries = 0;

   $: discordFailed =
      darkMode
         ? darkFailed
         : lightFailed;

   let lightSrc =
      lightUrl;

   let darkSrc =
      darkUrl;

   const MAX_HEADER_RETRIES = 3;

   function retryUrl(
      url: string
   ) {
      const separator =
         url.includes("?")
            ? "&"
            : "?";

      return (
         url +
         separator +
         "_retry=" +
         Date.now()
      );
   }

   function retryHeader(
      theme: "light" | "dark"
   ) {
      if (theme === "light") {
         lightFailed = true;

         if (
            lightRetries >=
            MAX_HEADER_RETRIES
         ) {
            return;
         }

         lightRetries += 1;

         setTimeout(() => {
            lightSrc =
               retryUrl(
                  lightUrl
               );
         }, 2000);

         return;
      }


      darkFailed = true;

      if (
         darkRetries >=
         MAX_HEADER_RETRIES
      ) {
         return;
      }

      darkRetries += 1;

      setTimeout(() => {
         darkSrc =
            retryUrl(
               darkUrl
            );
      }, 2000);
   }

   function updateCardRatio(
      event: Event
   ) {
      const image =
         event.currentTarget as HTMLImageElement;

      if (
         image.naturalWidth > 0 &&
         image.naturalHeight > 0
      ) {
         cardRatio =
            `${image.naturalWidth} / ${image.naturalHeight}`;
      }
   }
</script>

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
      grid-area:
         1 /
         1;
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
      transition:
         opacity
         300ms
         ease;
   }

   .discord-fallback.fallback-visible {
      opacity: 0.5;
   }

   .card {
      z-index: 1;
      display: block;
      width: 100%;
      max-width: 100%;
      transition:
         opacity
         var(--theme-duration)
         ease;
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

<div class="discord">
   <a
      href="https://discord.com/users/534375062099460097"
      target="_blank"
      rel="noreferrer"
   >
            <div
         class="card-stack"
         style="--theme-duration: {ANIMATION.TRANSITION.THEME_DURATION}ms;  --card-ratio: ${cardRatio}"
      >
         <div
            class="discord-fallback"
            class:fallback-visible={discordFailed}
         >
            oh nyo! you found me!!!<br />(˶˃ ᵕ ˂˶) .ᐟ.ᐟ
         </div>

         <img
            class="card"
            class:visible={!darkMode}
            class:hidden={darkMode}
            class:failed={lightFailed}
            src={lightSrc}
            alt=""
            on:load={(event) => {
               updateCardRatio(event);
               lightFailed = false;
               lightRetries = 0;
            }}

            on:error={() =>
               retryHeader("light")
            }
         />

         <img
            class="card"
            class:visible={darkMode}
            class:hidden={!darkMode}
            class:failed={darkFailed}
            src={darkSrc}
            alt=""
            on:load={(event) => {
               updateCardRatio(event);
               darkFailed = false;
               darkRetries = 0;
            }}

            on:error={() =>
               retryHeader("dark")
            }
         />
      </div>
   </a>
</div>
