<script lang="ts">
   import { onDestroy } from "svelte";
   import type { GameAccount } from "../../../config/contents";
   import InterestCard from "./InterestCard.svelte";
   import { uidTooltipMotion } from "../../../actions/uidTooltipMotion";

   export let games: readonly GameAccount[];
   let copiedGame: string | null = null;
   let copyGameTimeout: ReturnType<typeof setTimeout> | null = null;
   let copyRevision = 0;
   async function copyGameUid(gameName: string, uid: string) {
      const revision = ++copyRevision;
      try {
         await navigator.clipboard.writeText(uid);
         if (revision !== copyRevision) return;
         copiedGame = gameName;
         if (copyGameTimeout) {
            clearTimeout(copyGameTimeout);
         }
         copyGameTimeout = setTimeout(() => {
            copiedGame = null;
            copyGameTimeout = null;
         }, 1400);
      } catch (error) {
         console.error("Failed to copy UID:", error);
      }
   }

   onDestroy(() => {
      copyRevision++;
      if (copyGameTimeout) clearTimeout(copyGameTimeout);
   });
</script>

<InterestCard
   kind="games"
   title="games"
   kicker="currently trapped in"
   count={games.length}
   delay={435}
>
   <div class="game-list">
      {#each games as game (game.name)}
         <div class="game-entry">
            <span class="game-name">
               {game.name}
            </span>

            <div class="game-account">
               {#if game.server}
                  <span class="game-server">
                     {game.server}
                  </span>
               {/if}

               <button
                  type="button"
                  class="game-uid"
                  class:copied={copiedGame === game.name}
                  use:uidTooltipMotion={copiedGame === game.name}
                  aria-label={`Copy ${game.name} UID`}
                  on:click={() => copyGameUid(game.name, game.uid)}
               >
                  <span class="game-uid-number">
                     {game.uid}
                  </span>

                  <span class="game-copy-icon" aria-hidden="true">
                     {copiedGame === game.name ? "✓" : "⧉"}
                  </span>

                  <span class="game-copy-motion" aria-hidden="true">
                     <span class="game-copy-feedback">
                        <span class="game-copy-sparkle">✦</span>
                        <span class="game-copy-labels">
                           <span class="game-copy-prompt">copy?</span>
                           <span class="game-copy-done">copied!</span>
                        </span>
                     </span>
                  </span>
               </button>
            </div>
         </div>
      {/each}
   </div>
</InterestCard>

<style>
   .game-list {
      display: grid;
      gap: 0.45em;
   }

   .game-entry {
      display: grid;
      gap: 0.12em;
      padding: 0.38em 0.45em;
      border-radius: 0.55em;
      background: color-mix(in srgb, white 48%, transparent);
   }

   .game-name {
      color: #777777;
      font-size: 0.76em;
      font-weight: 700;
      line-height: 1.2;
   }

   .game-account {
      display: flex;
      align-items: center;
      gap: 0.35em;
      min-width: 0;
   }

   .game-server {
      flex: 0 0 auto;
      color: var(--fill);
      opacity: 0.62;
      font-size: 0.62em;
      font-weight: 700;
   }

   .game-uid {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.25em;
      min-width: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: #949494;
      font: inherit;
      font-size: 0.65em;
      cursor: pointer;
      transition:
         color 180ms ease,
         transform 180ms ease,
         text-shadow 180ms ease;
   }

   .game-uid:hover {
      color: var(--fill);
      transform: translateY(-1px);
   }

   .game-uid.copied {
      color: var(--fill);
      text-shadow: 0 0 0.55em color-mix(in srgb, var(--fill) 28%, transparent);
      animation: game-uid-copy 420ms cubic-bezier(0.16, 1, 0.3, 1);
   }

   .game-uid-number {
      min-width: 0;
   }

   .game-copy-icon {
      display: inline-grid;
      place-items: center;
      width: 1em;
      transition: transform 180ms ease;
   }

   .game-uid.copied .game-copy-icon {
      animation: game-copy-check 420ms cubic-bezier(0.16, 1, 0.3, 1);
   }

   .game-copy-motion {
      position: absolute;
      left: 50%;
      bottom: calc(100% + 0.55em);
      z-index: 20;
      pointer-events: none;
      transform: translateX(-50%);
   }

   .game-copy-feedback {
      display: flex;
      align-items: center;
      gap: 0.3em;
      padding: 0.32em 0.5em;
      border: 1px solid color-mix(in srgb, var(--fill) 18%, transparent);
      border-radius: 0.6em;
      background: color-mix(in srgb, white 88%, transparent);
      box-shadow: 0 4px 12px rgb(0 0 0 / 0.06);
      color: var(--fill);
      font-size: 0.86em;
      font-weight: 700;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(5px) scale(0.88) rotate(-6deg);
      transform-origin: bottom center;
      transition:
         opacity 160ms ease,
         transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
         background 250ms ease,
         border-color 250ms ease;
   }

   .game-uid:hover .game-copy-feedback,
   .game-uid:focus-visible .game-copy-feedback {
      opacity: 1;
      transform: translateY(0) scale(1) rotate(-3deg);
   }

   .game-uid:focus-visible {
      outline: 1px solid var(--fill);
      outline-offset: 3px;
      border-radius: 0.2em;
   }

   .game-uid.copied .game-copy-feedback {
      opacity: 1;
      transform: translateY(-2px) scale(1.04) rotate(2deg);
      background: color-mix(in srgb, var(--color2) 12%, white);
      border-color: color-mix(in srgb, var(--color2) 40%, transparent);
   }

   .game-copy-labels {
      display: grid;
      overflow: hidden;
      padding: 0.12em 0.2em;
   }

   .game-copy-prompt,
   .game-copy-done {
      grid-area: 1 / 1;
      text-align: center;
      transition:
         opacity 180ms ease,
         transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
   }

   .game-copy-done {
      opacity: 0;
      transform: translateY(110%) rotate(8deg) scale(0.85);
   }

   .game-uid.copied .game-copy-prompt {
      opacity: 0;
      transform: translateY(-110%) rotate(-8deg) scale(0.85);
   }

   .game-uid.copied .game-copy-done {
      opacity: 1;
      transform: translateY(0) rotate(0) scale(1);
   }

   .game-copy-sparkle {
      font-size: 0.8em;
      opacity: 0.65;
      transform: rotate(-15deg);
      transition: transform 300ms ease;
   }

   .game-uid.copied .game-copy-sparkle {
      animation: game-copy-sparkle 700ms ease-out both;
   }

   @keyframes game-uid-copy {
      0% {
         transform: translateY(0) scale(1);
      }
      38% {
         transform: translateY(-2px) scale(1.06);
      }
      100% {
         transform: translateY(0) scale(1);
      }
   }

   @keyframes game-copy-check {
      0% {
         opacity: 0;
         transform: rotate(-35deg) scale(0.4);
      }
      55% {
         opacity: 1;
         transform: rotate(8deg) scale(1.18);
      }
      100% {
         opacity: 1;
         transform: rotate(0) scale(1);
      }
   }

   @keyframes game-copy-sparkle {
      0% {
         opacity: 0;
         transform: rotate(-45deg) scale(0.25);
      }
      45% {
         opacity: 1;
         transform: rotate(25deg) scale(1.35);
      }
      100% {
         opacity: 0.8;
         transform: rotate(0) scale(1);
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .game-uid,
      .game-copy-feedback,
      .game-copy-prompt,
      .game-copy-done,
      .game-copy-sparkle {
         transition: none;
      }

      .game-uid.copied,
      .game-uid.copied .game-copy-icon,
      .game-uid.copied .game-copy-sparkle {
         animation: none;
      }
   }
</style>
