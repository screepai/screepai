<script lang="ts">
   import { animateOnScroll } from "../../../actions/animateOnScroll";

   export let kind: "games" | "music" | "vn" | "anime" | "manga";
   export let title: string;
   export let kicker: string;
   export let count: number | string;
   export let delay: number;
   export let sourceUrl = "";
   export let sourceLabel = "";
</script>

<div
   class="item-card interest-piece-wrap"
   use:animateOnScroll
   style={"--in-delay:" + delay + "ms;"}
>
   <article class="interest-piece" class:interest-piece-wide={kind === "vn"} data-kind={kind}>
      <span class="interest-tape"></span>

      {#if kind === "vn"}
         <span class="interest-doodle" aria-hidden="true">✦</span>
      {/if}

      <div class="interest-header">
         <div>
            <span class="interest-kicker">{kicker}</span>
            <h5>{title}</h5>
         </div>
         <span class="interest-count">{count}</span>
      </div>

      <slot />

      {#if sourceUrl}
         <a class="interest-source" href={sourceUrl} target="_blank" rel="noreferrer">
            {sourceLabel}
         </a>
      {/if}
   </article>
</div>

<style>
   .interest-piece-wrap {
      min-width: 0;
   }

   .interest-piece {
      --paper: color-mix(in srgb, var(--fill) 5%, white);
      --tilt: 0deg;
      --tape-tilt: 0deg;
      position: relative;
      min-height: 100%;
      padding: 1em 0.9em 0.85em;
      border: 1px solid color-mix(in srgb, var(--fill) 18%, transparent);
      border-radius: 0.8em;
      background: var(--paper);
      box-shadow: 0 5px 14px rgb(0 0 0 / 0.045);
      transform: rotate(var(--tilt));
      transform-origin: center;
      transition:
         transform 220ms ease,
         box-shadow 220ms ease,
         border-color 220ms ease;
   }

   .interest-piece:hover {
      transform: rotate(0deg) translateY(-1px);
      border-color: color-mix(in srgb, var(--fill) 32%, transparent);
      box-shadow: 0 7px 18px rgb(0 0 0 / 0.065);
   }

   .interest-piece[data-kind="anime"] {
      --paper: color-mix(in srgb, var(--color1) 7%, white);
      --tilt: -0.75deg;
      --tape-tilt: 5deg;
   }

   .interest-piece[data-kind="manga"] {
      --paper: color-mix(in srgb, var(--color2) 7%, white);
      --tilt: 0.65deg;
      --tape-tilt: -4deg;
   }

   .interest-piece[data-kind="vn"] {
      --paper: color-mix(in srgb, var(--color3) 6%, white);
      --tilt: -0.25deg;
      --tape-tilt: 2deg;
   }

   .interest-piece-wide {
      padding: 1em 1em 0.9em;
   }

   .interest-tape {
      position: absolute;
      top: -0.38em;
      left: 50%;
      width: 3.1em;
      height: 0.8em;
      border-radius: 0.12em;
      background: color-mix(in srgb, var(--fill) 13%, white);
      opacity: 0.85;
      transform: translateX(-50%) rotate(var(--tape-tilt));
      pointer-events: none;
   }

   .interest-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.8em;
      margin-bottom: 0.75em;
   }

   .interest-header h5 {
      margin: 0.05em 0 0;
      color: var(--fill);
      font-size: 1em;
      font-weight: 750;
      letter-spacing: 0.025em;
   }

   .interest-kicker {
      display: block;
      opacity: 0.48;
      font-size: 0.68em;
      font-weight: 600;
      letter-spacing: 0.025em;
   }

   .interest-count {
      flex: 0 0 auto;
      opacity: 0.42;
      font-size: 0.72em;
      font-weight: 700;
   }

   .interest-source {
      display: block;
      width: fit-content;
      margin-top: 0.8em;
      margin-left: auto;
      color: #999999;
      font-size: 0.68em;
      font-weight: 550;
      text-decoration: none;
      transition: color 180ms ease;
   }

   .interest-source:hover {
      color: var(--fill);
   }

   .interest-doodle {
      position: absolute;
      right: 0.75em;
      bottom: 0.65em;
      color: var(--fill);
      opacity: 0.2;
      font-size: 1.4em;
      transform: rotate(18deg);
      pointer-events: none;
   }

   :global(.interest-small-pair) .interest-piece {
      padding: 0.75em 0.8em 0.7em;
   }

   :global(.interest-small-pair) .interest-header {
      margin-bottom: 0.55em;
   }

   .interest-piece[data-kind="games"] {
      --paper: color-mix(in srgb, var(--color2) 6%, white);
      --tilt: -0.45deg;
      --tape-tilt: 3deg;
   }

   .interest-piece[data-kind="music"] {
      --paper: color-mix(in srgb, var(--color1) 6%, white);
      --tilt: 0.45deg;
      --tape-tilt: -3deg;
   }

   .interest-piece[data-kind="music"] {
      display: flex;
      flex-direction: column;
   }

   .interest-piece[data-kind="music"] .interest-source {
      position: static;
      margin-top: auto;
      padding-top: 0.85em;
      opacity: 0.58;
      transition:
         opacity 180ms ease,
         color 180ms ease;
   }

   .interest-piece[data-kind="music"] .interest-source:hover {
      opacity: 1;
   }
</style>
