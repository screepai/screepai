<script lang="ts">
   interface Props {
      visible: boolean;
   }

   let { visible }: Props = $props();

   function eraseDiscordNote(node: HTMLElement) {
      const paths = Array.from(node.querySelectorAll<SVGPathElement>("path"));
      const offsets = paths.map((path) => parseFloat(getComputedStyle(path).strokeDashoffset));
      const label = node.querySelector<HTMLElement>(".discord-label");
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
      <svg viewBox="0 0 42 38" fill="none">
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
      </svg>
      <span class="discord-label">my discord <span class="kaomoji">ꉂ(˵˃ ᗜ ˂˵)</span></span>
   </div>
{/if}

<style>
   .discord-note {
      position: absolute;
      top: 2px;
      left: calc(50% + 1.75rem);
      right: 0.5rem;
      display: flex;
      align-items: flex-start;
      color: var(--fill);
      z-index: 3;
      pointer-events: none;
   }

   .discord-note svg {
      display: block;
      flex: 0 0 42px;
      width: 42px;
      overflow: visible;
   }

   .discord-label {
      min-width: 0;
      margin: 14px 0 0 5px;
      font-family: "Inter Tight", sans-serif;
      font-size: 12px;
      line-height: 1.2;
      transform: rotate(-6deg);
      transform-origin: 0 10px;
      animation: discord-label-appear 240ms ease-out 860ms both;
   }

   .kaomoji {
      white-space: nowrap;
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
      .discord-label {
         animation: none;
      }
   }
</style>
