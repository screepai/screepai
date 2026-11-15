<script lang="ts">
   import { ANIMATION } from "../config/animation";
   import { star } from "../config/shapes";

   const sparks = [
      {
         delay: ANIMATION.WINK.RELEASE_DELAY,
         duration: ANIMATION.WINK.FLIGHT_DURATION,
         size: 1.45,
         distance: 66,
         lift: 42,
         opacity: 1,
      },
      { delay: 165, duration: 335, size: 0.55, distance: 38, lift: 22, opacity: 0.45 },
      { delay: 210, duration: 260, size: 0.38, distance: 30, lift: 18, opacity: 0.35 },
   ];

   function fly(node: HTMLElement, spark: (typeof sparks)[number]) {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced && spark !== sparks[0]) return;

      const frames: Keyframe[] = reduced
         ? [{ opacity: 0 }, { opacity: 0.7 }, { opacity: 0 }]
         : Array.from({ length: 45 }, (_, index) => {
               const t = index / 44;
               const u = 1 - t;
               const x =
                  3 * u * u * t * spark.distance * 0.32 +
                  3 * u * t * t * spark.distance * 0.8 +
                  t * t * t * spark.distance;
               const y = -3 * u * u * t * spark.lift - 3 * u * t * t * spark.lift + t * t * t * 4;
               const scale = 0.95 + Math.sin(Math.PI * t) * 0.17;
               return {
                  offset: t,
                  opacity: Math.min(1, t / 0.1, (1 - t) / 0.35) * spark.opacity,
                  transform: `translate3d(${x}px, ${y}px, 0) rotate(${-18 + t * 148}deg) scale(${scale})`,
               };
            });
      const animation = node.animate(frames, {
         duration: reduced ? 200 : spark.duration,
         delay: reduced ? 0 : spark.delay,
         easing: "linear",
         fill: "both",
      });
      return { destroy: () => animation.cancel() };
   }
</script>

<span class="wink-stars" aria-hidden="true">
   {#each sparks as spark, i (i)}
      <span
         class="wink-spark"
         class:echo={i > 0}
         class:last-echo={i === 2}
         style={`width:${spark.size}rem;height:${spark.size}rem;`}
         use:fly={spark}
      >
         <svg viewBox="0 0 512 512"><path d={star} /></svg>
      </span>
   {/each}
</span>

<style>
   .wink-stars {
      position: absolute;
      inset: 0;
      pointer-events: none;
      color: var(--fill);
   }

   .wink-spark {
      position: absolute;
      left: calc(100% - 0.4rem);
      top: -0.25rem;
      opacity: 0;
   }

   svg {
      display: block;
      width: 100%;
      height: 100%;
   }

   path {
      fill: color-mix(in srgb, var(--fill) 75%, white);
   }

   .echo {
      top: 0.1rem;
   }

   .last-echo {
      top: -0.45rem;
      left: calc(100% - 0.7rem);
   }
</style>
