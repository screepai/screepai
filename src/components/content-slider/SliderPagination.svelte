<script lang="ts">
   import type { ContentSlide } from "../../config/contents";
   export let slides: readonly ContentSlide[];
   export let activeIndex: number;
   export let changeSlide: (index: number) => void;
   function rotationOne(index: number) {
      return ((index * 17) % 40) - 10;
   }
   function rotationTwo(index: number) {
      return ((index * 23) % 40) - 30;
   }
</script>

<div class="pagination" aria-label="Profile sections">
   {#each slides as slide, index (slide.label)}
      <button
         type="button"
         class="pagination-button"
         class:active={index === activeIndex}
         aria-pressed={index === activeIndex}
         style={`--r1:${rotationOne(index)}deg;--r2:${rotationTwo(index)}deg;`}
         on:click={() => changeSlide(index)}
      >
         {slide.label}
      </button>
   {/each}
</div>

<style>
   .pagination {
      display: flex;
      justify-content: center;
      flex: 0 0 auto;
      font-size: clamp(10px, calc(5.5px + 1.35vw), 16px);
      gap: 0.45em;
      padding: 0 20px 18px;
      position: relative;
      z-index: 5;
      background: #fbfbfb;
      border-radius: 0 0 12px 12px;
   }

   .pagination::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -2em;
      height: 2em;
      background: linear-gradient(
         to bottom,
         transparent 0%,
         rgb(251 251 251 / 0.35) 30%,
         rgb(251 251 251 / 0.75) 65%,
         #fbfbfb 100%
      );
      pointer-events: none;
   }

   .pagination-button {
      position: relative;
      width: auto;
      height: auto;
      padding: 0.35em 0.75em;
      border: 0.145em solid var(--bullet-color);
      border-radius: 0.7em;
      background: var(--bullet-background-color);
      color: var(--bullet-color);
      font-family: "Inter Tight", sans-serif;
      font-size: 0.88em;
      line-height: 1.25;
      cursor: pointer;
      transition:
         background 300ms ease,
         transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
         box-shadow 300ms ease;
      font-weight: 600;
   }

   .pagination-button:hover,
   .pagination-button.active {
      background: var(--bullet-active-color);
      box-shadow: 0 0 10px var(--bullet-active-color);
   }

   .pagination-button:hover {
      transform: translateY(-2px);
   }

   .pagination-button::before,
   .pagination-button::after {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      color: var(--fill);
      text-shadow:
         0 0 0.3em var(--fill),
         0 0 0.7em var(--bullet-active-color);
      transform: scale(0.2) rotate(calc(var(--star-r) - 30deg));
      transition:
         opacity 180ms ease,
         transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
   }

   .pagination-button::before {
      content: "✦";
      --star-r: var(--r1);
      top: -0.8em;
      right: -0.65em;
      font-size: 1.1em;
   }

   .pagination-button::after {
      content: "✧";
      --star-r: var(--r2);
      bottom: -0.75em;
      left: -0.6em;
      font-size: 0.9em;
   }

   .pagination-button.active::before,
   .pagination-button.active::after {
      opacity: 1;
      transform: scale(1) rotate(var(--star-r));
   }

   .pagination-button:hover::before,
   .pagination-button:hover::after {
      animation: sparkle-pop 420ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
   }

   @keyframes sparkle-pop {
      0% {
         opacity: 0;
         transform: scale(0.15) rotate(calc(var(--star-r) - 35deg));
      }
      55% {
         opacity: 1;
         transform: scale(1.35) rotate(calc(var(--star-r) + 8deg));
      }
      75% {
         transform: scale(0.9) rotate(calc(var(--star-r) - 3deg));
      }
      100% {
         opacity: 1;
         transform: scale(1) rotate(var(--star-r));
      }
   }
</style>
