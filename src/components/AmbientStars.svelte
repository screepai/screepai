<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes";

   const magicStars = Array.from(
      { length: 8 },
      (_, index) => index
   );

   const colors = [
      "--color1",
      "--color2",
      "--color3",
      "--color4",
   ];

   let starElements: HTMLElement[] = [];

   const activeAnimations:
      (Animation | undefined)[] =
         Array(magicStars.length);

   const cleanupFunctions:
      Array<() => void> = [];

   const rand = (
      min: number,
      max: number
   ) =>
      Math.floor(
         Math.random() *
            (max - min + 1)
      ) + min;

   const randFloat = (
      min: number,
      max: number
   ) =>
      Math.random() *
         (max - min) +
      min;

   function randomEdgePosition() {
      const edge = rand(0, 3);

      if (edge === 0) {
         return {
            left: rand(-18, 8),
            top: rand(5, 95),
         };
      }

      if (edge === 1) {
         return {
            left: rand(92, 118),
            top: rand(5, 95),
         };
      }

      if (edge === 2) {
         return {
            left: rand(4, 96),
            top: rand(-14, 8),
         };
      }

      return {
         left: rand(4, 96),
         top: rand(92, 112),
      };
   }

   function animate(
      starElement: HTMLElement,
      index: number
   ) {
      const randomColor =
         colors[
            Math.floor(
               Math.random() *
                  colors.length
            )
         ];

      const position =
         randomEdgePosition();

      const magical =
         Math.random() < 0.18;

      const scale = magical
         ? randFloat(1.0, 1.35)
         : randFloat(0.5, 1.0);

      const duration = magical
         ? rand(1900, 2800)
         : rand(1400, 2200);

      const spinDuration =
         rand(2800, 5200);

      const driftX =
         rand(-8, 8);

      const driftY =
         rand(-8, 8);

      const glow = magical
         ? randFloat(0.75, 1.05)
         : randFloat(0.45, 0.8);

      starElement.style.setProperty(
         "--star-left",
         `${position.left}%`
      );

      starElement.style.setProperty(
         "--star-top",
         `${position.top}%`
      );

      starElement.style.setProperty(
         "--star-color",
         `var(${randomColor})`
      );

      starElement.style.setProperty(
         "--star-spin-duration",
         `${spinDuration}ms`
      );

      starElement.style.setProperty(
         "--star-glow",
         `${glow}`
      );

      activeAnimations[index]?.cancel();

      const animation =
         starElement.animate(
            [
               {
                  opacity: 0,
                  transform:
                     "translate3d(0, 4px, 0) scale(0.15)",
               },
               {
                  opacity: 1,
                  transform:
                     `translate3d(
                        ${driftX * 0.25}px,
                        ${driftY * 0.25}px,
                        0
                     )
                     scale(${scale * 1.16})`,
                  offset: 0.25,
               },
               {
                  opacity: 0.8,
                  transform:
                     `translate3d(
                        ${driftX * 0.55}px,
                        ${driftY * 0.55}px,
                        0
                     )
                     scale(${scale})`,
                  offset: 0.55,
               },
               {
                  opacity: 0.35,
                  transform:
                     `translate3d(
                        ${driftX * 0.8}px,
                        ${driftY * 0.8}px,
                        0
                     )
                     scale(${scale * 0.82})`,
                  offset: 0.82,
               },
               {
                  opacity: 0,
                  transform:
                     `translate3d(
                        ${driftX}px,
                        ${driftY}px,
                        0
                     )
                     scale(${scale * 0.55})`,
               },
            ],
            {
               duration,
               easing:
                  "cubic-bezier(0.16, 1, 0.3, 1)",
               fill: "forwards",
            }
         );

      activeAnimations[index] =
         animation;

      animation.onfinish = () => {
         if (
            activeAnimations[index] !==
            animation
         ) {
            return;
         }

         activeAnimations[index] =
            undefined;

         scheduleNext(
            starElement,
            index
         );
      };
   }

   function scheduleNext(
      starElement: HTMLElement,
      index: number
   ) {
      const delay =
         rand(500, 2200);

      const timeoutId =
         window.setTimeout(() => {
            animate(
               starElement,
               index
            );
         }, delay);

      cleanupFunctions.push(
         () =>
            clearTimeout(
               timeoutId
            )
      );
   }

   onMount(() => {
      starElements.forEach(
         (starElement, index) => {
            const initialDelay =
               window.setTimeout(
                  () => {
                     animate(
                        starElement,
                        index
                     );
                  },
                  rand(
                     100,
                     1800
                  )
               );

            cleanupFunctions.push(
               () =>
                  clearTimeout(
                     initialDelay
                  )
            );
         }
      );

      return () => {
         cleanupFunctions.forEach(
            (cleanup) => cleanup()
         );

         activeAnimations.forEach(
            (animation) =>
               animation?.cancel()
         );
      };
   });
</script>

<style>
   .magic-star {
      --size:
         clamp(12px, 1.15vw, 28px);

      position: absolute;

      display: block;

      width: var(--size);
      height: var(--size);

      left: var(--star-left);
      top: var(--star-top);

      opacity: 0;

      z-index: 99999;

      pointer-events: none;

      will-change:
         transform,
         opacity;
   }

   .magic-star > svg {
      display: block;
      width: 100%;
      height: 100%;

      opacity: 0.95;

      filter:
         drop-shadow(
            0 0
            calc(
               0.35rem *
               var(--star-glow, 0.6)
            )
            white
         )
         drop-shadow(
            0 0
            calc(
               0.7rem *
               var(--star-glow, 0.6)
            )
            var(--star-color)
         )
         drop-shadow(
            0 0
            calc(
               1.15rem *
               var(--star-glow, 0.6)
            )
            color-mix(
               in srgb,
               var(--star-color) 45%,
               transparent
            )
         );

      animation:
         rotate
         var(
            --star-spin-duration,
            4000ms
         )
         linear
         infinite;
   }

   .magic-star > svg > path {
      fill:
         color-mix(
            in srgb,
            var(--star-color) 72%,
            white 28%
         );
   }

   @keyframes rotate {
      from {
         transform: rotate(0deg);
      }

      to {
         transform: rotate(180deg);
      }
   }
</style>

{#each magicStars as starId (starId)}
   <span
      bind:this={starElements[starId]}
      class="magic-star"
      aria-hidden="true"
   >
      <svg viewBox="0 0 512 512">
         <path d={star} />
      </svg>
   </span>
{/each}