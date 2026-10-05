<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   export let slide: Extract<
      ContentSlide,
      {
         kind: "credits";
      }
   >;
</script>

<ul class="content-list">
   {#each slide.credits as credit, i (credit.url)}
      <li class="item-card" use:animateOnScroll style={`--in-delay:${180 + i * 85}ms;`}>
         <p>
            <a href={credit.url} target="_blank" rel="noreferrer">
               {credit.at}
            </a>
            - {credit.name}
         </p>
      </li>
   {/each}
   <li
      class="aster-dedication item-card"
      use:animateOnScroll
      style={`--in-delay:${180 + slide.credits.length * 85}ms;`}
   >
      <a
         href="https://docs.google.com/document/d/1cB4kM_t8N1-dWhlDPqh1rnrd2h0hrmoqDz3RNi4Yj10/edit?usp=sharing"
         target="_blank"
         rel="noreferrer"
      >
         <span class="aster-star star-leading" aria-hidden="true">✦</span>
         To You, My Aster
         <span class="aster-star star-trailing" aria-hidden="true">✧</span>
         <span class="aster-star star-small" aria-hidden="true">⋆</span>
      </a>
   </li>
</ul>

<style>
   .aster-dedication {
      padding-top: 1.5em;
      list-style: none;
   }

   .aster-dedication a {
      position: relative;
      display: inline-block;
      padding: 0.5em 1.4em;
      color: var(--fill);
      font-style: italic;
      font-weight: 500;
      letter-spacing: 0.03em;
      text-decoration-color: color-mix(in srgb, var(--fill) 35%, transparent);
      text-underline-offset: 0.3em;
      border-radius: 0.4em;
      transition:
         background-color 180ms ease,
         text-decoration-color 180ms ease;
   }

   .aster-dedication a:hover,
   .aster-dedication a:focus-visible {
      background-color: color-mix(in srgb, var(--fill) 8%, transparent);
      text-decoration-color: var(--fill);
   }

   .aster-star {
      position: absolute;
      display: inline-block;
      font-style: normal;
      pointer-events: none;
      animation: star-twinkle 3.6s ease-in-out infinite;
   }

   .star-leading {
      top: 0.15em;
      left: 0.15em;
      font-size: 0.75em;
   }

   .star-trailing {
      top: 0;
      right: 0.15em;
      font-size: 0.9em;
      animation-delay: -1.2s;
   }

   .star-small {
      right: 0.8em;
      bottom: 0;
      font-size: 0.65em;
      animation-delay: -2.4s;
   }

   @keyframes star-twinkle {
      0%,
      100% {
         opacity: 0.45;
         transform: scale(0.85);
      }
      50% {
         opacity: 1;
         transform: scale(1.1);
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .aster-star {
         animation: none;
         opacity: 0.7;
      }
   }
</style>
