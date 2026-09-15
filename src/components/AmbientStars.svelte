<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes";

   const magicStars = Array.from(
      { length: 6 },
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

      const scale =
         rand(70, 100) / 100;

      const scaleDuration =
         rand(800, 1600);

      const spinDuration =
         rand(1000, 3000);

      starElement.style.setProperty(
         "--star-left",
         `${rand(-30, 130)}%`
      );

      starElement.style.setProperty(
         "--star-top",
         `${rand(-30, 130)}%`
      );

      starElement.style.setProperty(
         "--star-color",
         `var(${randomColor})`
      );

      starElement.style.setProperty(
         "--star-spin-duration",
         `${spinDuration}ms`
      );

      activeAnimations[index]?.cancel();

      const animation =
         starElement.animate(
            [
               {
                  transform: "scale(0)",
               },
               {
                  transform:
                     `scale(${scale})`,
                  offset: 0.5,
               },
               {
                  transform: "scale(0)",
               },
            ],
            {
               duration: scaleDuration,
               easing: "ease",
               fill: "forwards",
            }
         );

      activeAnimations[index] = animation;

      animation.onfinish = () => {
         if (
            activeAnimations[index] ===
            animation
         ) {
            activeAnimations[index] =
               undefined;
         }
      };
   }

   onMount(() => {
      const interval = 1500;

      starElements.forEach(
         (starElement, index) => {
            const initialDelay =
               setTimeout(() => {
                  animate(starElement, index);

                  const intervalId =
                     setInterval(
                        () =>
                           animate(
                              starElement,
                              index
                           ),
                        interval
                     );

                  cleanupFunctions.push(
                     () =>
                        clearInterval(
                           intervalId
                        )
                  );
               },
               index *
                  (interval /
                     starElements.length)
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
         clamp(20px, 1.5vw, 69px);

      position: absolute;

      display: block;

      width: var(--size);
      height: var(--size);

      left: var(--star-left);
      top: var(--star-top);

      transform: scale(0);

      z-index: 99999;

      pointer-events: none;
   }

   .magic-star > svg {
      display: block;

      width: 100%;
      height: 100%;

      opacity: 0.7;

      filter:
         drop-shadow(
            0 0 0.625rem
            var(--star-color)
         );

      animation:
         rotate
         var(
            --star-spin-duration,
            1000ms
         )
         linear
         infinite;
   }

   .magic-star > svg > path {
      fill: var(--star-color);
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
