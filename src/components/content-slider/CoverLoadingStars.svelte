<script lang="ts">
   const stars = [
      { left: 8, size: 14, duration: 16, delay: -11, drift: 24 },
      { left: 23, size: 18, duration: 13, delay: -3, drift: 20 },
      { left: 39, size: 14, duration: 18, delay: -14, drift: 28 },
      { left: 54, size: 20, duration: 15, delay: -7, drift: 23 },
      { left: 71, size: 16, duration: 17, delay: -1, drift: 26 },
      { left: 87, size: 14, duration: 14, delay: -10, drift: 22 },
      { left: 16, size: 16, duration: 19, delay: -5, drift: 30 },
      { left: 64, size: 14, duration: 12, delay: -9, drift: 25 },
   ];
</script>

<span class="cover-snow" aria-hidden="true">
   {#each stars as star, i (i)}
      <span
         class="falling-star"
         style={`left:${star.left}%;font-size:${star.size}px;--fall-duration:${star.duration}s;--fall-delay:${star.delay}s;--drift:${star.drift}px;--rest-y:${12 + i * 11}%;--spin-direction:${i % 2 === 0 ? "normal" : "reverse"};`}
      >
         <span class="star-glyph">{i % 3 === 0 ? "✧" : "✦"}</span>
      </span>
   {/each}
</span>

<style>
   .cover-snow {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
   }

   .falling-star {
      position: absolute;
      top: 0;
      height: 100%;
      color: white;
      line-height: 1;
      opacity: 0;
      animation: snowfall var(--fall-duration) linear var(--fall-delay) infinite;
   }

   .star-glyph {
      display: block;
      animation: star-turn calc(var(--fall-duration) * 2) linear var(--fall-delay) infinite;
      animation-direction: var(--spin-direction);
   }

   @keyframes star-turn {
      to {
         transform: rotate(360deg);
      }
   }

   @keyframes snowfall {
      0% {
         transform: translate3d(var(--drift), -8%, 0);
         opacity: 0;
      }
      12% {
         opacity: 0.55;
      }
      50% {
         transform: translate3d(0, 50%, 0);
      }
      85% {
         opacity: 0.55;
      }
      100% {
         transform: translate3d(calc(-1 * var(--drift)), 108%, 0);
         opacity: 0;
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .star-glyph {
         animation: none;
      }

      .falling-star {
         animation: none;
         transform: translate3d(0, var(--rest-y), 0);
         opacity: 0.22;
      }
   }
</style>
