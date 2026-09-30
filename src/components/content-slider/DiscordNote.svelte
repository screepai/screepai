<script lang="ts">
   export let visible: boolean;

   function eraseDiscordNote(node: HTMLElement) {
      const paths = Array.from(node.querySelectorAll<SVGPathElement>("path"));
      const offsets = paths.map((path) => parseFloat(getComputedStyle(path).strokeDashoffset));
      const label = node.querySelector<SVGTextElement>("text");
      const labelOpacity = label ? getComputedStyle(label).opacity : "1";

      paths.forEach((path, index) => {
         path.style.animation = "none";
         path.style.strokeDashoffset = String(offsets[index]);
      });
      if (label) {
         label.style.animation = "none";
         label.style.opacity = labelOpacity;
      }

      return {
         duration: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 420,
         tick: (t: number) => {
            paths.forEach((path, index) => {
               path.style.strokeDashoffset = String(
                  offsets[index] + (1 - offsets[index]) * (1 - t)
               );
            });
            if (label) {
               label.style.clipPath = `inset(0 ${(1 - t) * 100}% 0 0)`;
            }
         },
      };
   }
</script>

{#if visible}
   <div class="discord-note" aria-hidden="true" out:eraseDiscordNote>
      <svg viewBox="0 0 124 38" fill="none">
         <path
            class="arrow-body"
            d="M 4 31 C 20 34, 39 29, 39 18 C 40 11, 36 6, 32 3"
            pathLength="1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
         />
         <path
            class="arrow-tip"
            d="M 36 11 L 32 3 L 41 5"
            pathLength="1"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
         />
         <text x="47" y="24" fill="currentColor" transform="rotate(-6 47 24)"> my discord ꉂ(˵˃ ᗜ ˂˵) </text>
      </svg>
   </div>
{/if}

<style>
   .discord-note {
      position: absolute;
      top: 2px;
      left: calc(50% + 1.75rem);
      width: min(7.75rem, calc(50% - 2.25rem));
      color: var(--fill);
      z-index: 3;
      pointer-events: none;
   }

   .discord-note svg {
      display: block;
      width: 100%;
      overflow: visible;
   }

   .discord-note text {
      font-family: "Inter Tight", sans-serif;
      font-size: 12px;
      animation: discord-label-appear 240ms ease-out 860ms both;
   }

   .discord-note path {
      stroke-dasharray: 1;
      animation: discord-arrow-draw 620ms ease-in-out 150ms both;
   }

   .discord-note .arrow-tip {
      animation-duration: 180ms;
      animation-delay: 730ms;
   }

   @keyframes discord-arrow-draw {
      from {
         stroke-dashoffset: 1;
      }
      to {
         stroke-dashoffset: 0;
      }
   }

   @keyframes discord-label-appear {
      from {
         opacity: 0;
      }
      to {
         opacity: 1;
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .discord-note path,
      .discord-note text {
         animation: none;
      }
   }
</style>
