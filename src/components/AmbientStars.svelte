<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes";
   export let darkMode = false;

   const magicStars = Array.from({ length: 8 }, (_, index) => index);
   const shootingStars = [0, 1, 2];

   const colors = ["--color1", "--color2", "--color3", "--color4"];

   let starElements: HTMLElement[] = [];
   let shootingElements: HTMLElement[] = [];

   const activeAnimations: (Animation | undefined)[] = Array(magicStars.length);

   const starTimeouts: (number | undefined)[] = [];
   const shootingTimeouts: (number | undefined)[] = [];
   const shootingAnimations: (Animation[] | undefined)[] = [];
   let burstTimeout: number | undefined;
   let mounted = false;
   let shootingDirection = -1;

   const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

   const randFloat = (min: number, max: number) => Math.random() * (max - min) + min;

   function resetShootingStars(isDark: boolean) {
      shootingDirection = isDark ? 1 : -1;
      clearTimeout(burstTimeout);
      shootingStars.forEach((index) => {
         clearTimeout(shootingTimeouts[index]);
         shootingAnimations[index]?.forEach((animation) => animation.cancel());
         shootingAnimations[index] = undefined;
      });
      scheduleShootingBurst(true);
   }

   $: if (mounted) resetShootingStars(darkMode);

   function scheduleShootingBurst(initial = false) {
      burstTimeout = window.setTimeout(
         () => {
            if (
               !document.hidden &&
               !window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
               const count = Math.random() < 0.38 ? rand(2, 3) : 1;
               const stagger = rand(100, 180);
               const edge = rand(0, 3);
               for (let index = 0; index < count; index++) {
                  shootingTimeouts[index] = window.setTimeout(
                     () => shoot(shootingElements[index], index, edge),
                     index * stagger
                  );
               }
            }
            scheduleShootingBurst();
         },
         initial ? rand(2000, 4000) : rand(5000, 9000)
      );
   }

   function shoot(element: HTMLElement, index: number, edge: number) {
      if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
         return;
      }
      const layer = element.parentElement;
      const head = element.querySelector("svg");
      const trail = element.querySelector<HTMLElement>(".shooting-trail");
      if (!layer || !head || !trail) return;
      const width = layer.clientWidth;
      const height = layer.clientHeight;
      const angle = (45 * Math.PI) / 180;
      const distance = rand(100, 145);
      const dx = Math.cos(angle) * distance * shootingDirection;
      const dy = Math.sin(angle) * distance;
      const rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
      if (edge < 2) {
         element.style.left = `${edge === 0 ? -18 - Math.max(0, dx) : width + 18 - Math.min(0, dx)}px`;
         element.style.top = `${randFloat(12, Math.max(12, height - dy - 12))}px`;
      } else {
         element.style.left = `${randFloat(24 - Math.min(0, dx), width - 24 - Math.max(0, dx))}px`;
         element.style.top = `${edge === 2 ? -dy - 16 : height + 16}px`;
      }
      element.style.setProperty("--shooting-color", `var(${colors[rand(0, colors.length - 1)]})`);
      element.style.setProperty("--shooting-size", `${rand(10, 16)}px`);
      element.style.setProperty("--trail-length", `${rand(65, 100)}px`);
      const duration = rand(460, 580);
      const path = (progress: number) =>
         `translate3d(${dx * progress}px, ${dy * progress}px, 0) rotate(${rotation}deg)`;
      const animation = element.animate(
         [
            { opacity: 0, transform: path(0) },
            { opacity: 1, transform: path(0.04), offset: 0.04 },
            { opacity: 1, transform: path(1) },
         ],
         { duration, easing: "linear" }
      );
      const trailAnimation = trail.animate(
         [
            { transform: "translateY(-50%) scaleX(0)" },
            { transform: "translateY(-50%) scaleX(1)", offset: 0.08 },
            { transform: "translateY(-50%) scaleX(1)", offset: 0.35 },
            { transform: "translateY(-50%) scaleX(0)", offset: 0.6 },
            { transform: "translateY(-50%) scaleX(0)" },
         ],
         { duration, easing: "linear", fill: "forwards" }
      );
      const spin = 360 * shootingDirection;
      const twinkle = head.animate(
         [
            { opacity: 0, transform: "rotate(0deg) scale(0.3)" },
            { opacity: 1, transform: `rotate(${spin * 0.25}deg) scale(1)`, offset: 0.08 },
            { opacity: 1, transform: `rotate(${spin}deg) scale(1.15)`, offset: 0.38 },
            { opacity: 0.45, transform: `rotate(${spin}deg) scale(0.55)`, offset: 0.54 },
            { opacity: 0.75, transform: `rotate(${spin}deg) scale(0.85)`, offset: 0.68 },
            { opacity: 0.3, transform: `rotate(${spin}deg) scale(0.4)`, offset: 0.84 },
            { opacity: 0, transform: `rotate(${spin}deg) scale(0)` },
         ],
         { duration, easing: "linear", fill: "forwards" }
      );
      shootingAnimations[index] = [animation, trailAnimation, twinkle];
      animation.onfinish = () => {
         if (shootingAnimations[index]?.[0] !== animation) return;
         shootingAnimations[index].forEach((running) => running.cancel());
         shootingAnimations[index] = undefined;
      };
   }

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

   function animate(starElement: HTMLElement, index: number) {
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const position = randomEdgePosition();

      const magical = Math.random() < 0.18;

      const scale = magical ? randFloat(1.0, 1.35) : randFloat(0.5, 1.0);

      const duration = magical ? rand(1900, 2800) : rand(1400, 2200);

      const spinDuration = rand(2800, 5200);

      const driftX = rand(-8, 8);

      const driftY = rand(-8, 8);

      const glow = magical ? randFloat(0.75, 1.05) : randFloat(0.45, 0.8);

      starElement.style.setProperty("--star-left", `${position.left}%`);

      starElement.style.setProperty("--star-top", `${position.top}%`);

      starElement.style.setProperty("--star-color", `var(${randomColor})`);

      starElement.style.setProperty("--star-spin-duration", `${spinDuration}ms`);

      starElement.style.setProperty("--star-glow", `${glow}`);

      activeAnimations[index]?.cancel();

      const animation = starElement.animate(
         [
            {
               opacity: 0,
               transform: "translate3d(0, 4px, 0) scale(0.15)",
            },
            {
               opacity: 1,
               transform: `translate3d(
                        ${driftX * 0.25}px,
                        ${driftY * 0.25}px,
                        0
                     )
                     scale(${scale * 1.16})`,
               offset: 0.25,
            },
            {
               opacity: 0.8,
               transform: `translate3d(
                        ${driftX * 0.55}px,
                        ${driftY * 0.55}px,
                        0
                     )
                     scale(${scale})`,
               offset: 0.55,
            },
            {
               opacity: 0.35,
               transform: `translate3d(
                        ${driftX * 0.8}px,
                        ${driftY * 0.8}px,
                        0
                     )
                     scale(${scale * 0.82})`,
               offset: 0.82,
            },
            {
               opacity: 0,
               transform: `translate3d(
                        ${driftX}px,
                        ${driftY}px,
                        0
                     )
                     scale(${scale * 0.55})`,
            },
         ],
         {
            duration,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "forwards",
         }
      );

      activeAnimations[index] = animation;

      animation.onfinish = () => {
         if (activeAnimations[index] !== animation) {
            return;
         }

         activeAnimations[index] = undefined;
         animation.cancel();

         scheduleNext(starElement, index);
      };
   }

   function scheduleNext(starElement: HTMLElement, index: number) {
      const delay = rand(500, 2200);

      starTimeouts[index] = window.setTimeout(() => {
         animate(starElement, index);
      }, delay);
   }

   onMount(() => {
      mounted = true;
      starElements.forEach((starElement, index) => {
         starTimeouts[index] = window.setTimeout(
            () => {
               animate(starElement, index);
            },
            rand(100, 1800)
         );
      });

      return () => {
         mounted = false;
         clearTimeout(burstTimeout);
         starTimeouts.forEach((timeout) => clearTimeout(timeout));
         shootingTimeouts.forEach((timeout) => clearTimeout(timeout));
         activeAnimations.forEach((animation) => animation?.cancel());
         shootingAnimations.forEach((animations) =>
            animations?.forEach((animation) => animation.cancel())
         );
      };
   });
</script>

{#each magicStars as starId (starId)}
   <span bind:this={starElements[starId]} class="magic-star" aria-hidden="true">
      <svg viewBox="0 0 512 512">
         <path d={star} />
      </svg>
   </span>
{/each}

<div class="shooting-star-layer" aria-hidden="true">
   {#each shootingStars as starId (starId)}
      <span bind:this={shootingElements[starId]} class="shooting-star">
         <span class="shooting-trail"></span>
         <svg viewBox="0 0 512 512"><path d={star} /></svg>
      </span>
   {/each}
</div>

<style>
   .shooting-star-layer {
      position: absolute;
      inset: 0;
      overflow: visible;
      pointer-events: none;
      z-index: 99999;
   }

   .shooting-star {
      position: absolute;
      width: var(--shooting-size, 12px);
      height: var(--shooting-size, 12px);
      opacity: 0;
      will-change: transform, opacity;
      filter: drop-shadow(0 0 5px var(--shooting-color));
   }

   .shooting-trail {
      position: absolute;
      right: 50%;
      top: 50%;
      width: var(--trail-length, 100px);
      height: 2px;
      border-radius: 100%;
      transform: translateY(-50%);
      transform-origin: right center;
      background: linear-gradient(
         to right,
         transparent,
         color-mix(in srgb, var(--shooting-color) 65%, transparent) 65%,
         color-mix(in srgb, var(--shooting-color) 75%, white)
      );
   }

   .shooting-star svg {
      display: block;
      width: 100%;
      height: 100%;
      fill: color-mix(in srgb, var(--shooting-color) 65%, white);
   }

   @media (prefers-reduced-motion: reduce) {
      .shooting-star-layer {
         display: none;
      }
   }

   .magic-star {
      --size: clamp(12px, 1.15vw, 28px);

      position: absolute;

      display: block;

      width: var(--size);
      height: var(--size);

      left: var(--star-left);
      top: var(--star-top);

      opacity: 0;

      z-index: 99999;

      pointer-events: none;

      will-change: transform, opacity;
   }

   .magic-star > svg {
      display: block;
      width: 100%;
      height: 100%;

      opacity: 0.95;

      filter: drop-shadow(0 0 calc(0.35rem * var(--star-glow, 0.6)) white)
         drop-shadow(0 0 calc(0.7rem * var(--star-glow, 0.6)) var(--star-color))
         drop-shadow(
            0 0 calc(1.15rem * var(--star-glow, 0.6))
               color-mix(in srgb, var(--star-color) 45%, transparent)
         );

      animation: rotate var(--star-spin-duration, 4000ms) linear infinite;
   }

   .magic-star > svg > path {
      fill: color-mix(in srgb, var(--star-color) 72%, white 28%);
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
