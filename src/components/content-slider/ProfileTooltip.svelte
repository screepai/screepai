<script lang="ts" module>
   export type TooltipCover = {
      imageUrl?: string;
      unavailable?: boolean;
      pinned?: boolean;
   };

   export type TooltipState = {
      name: string;
      text: string;
      x: number;
      y: number;
      cover?: TooltipCover;
   };

   export type ShowTooltip = (
      target: MouseEvent | FocusEvent | HTMLElement,
      name: string,
      text: string,
      cover?: TooltipCover
   ) => void;
</script>

<script lang="ts">
   import { onMount, tick, untrack } from "svelte";
   import CoverLoadingStars from "./CoverLoadingStars.svelte";

   interface Props {
      tooltip: TooltipState | null;
      arrowOffset?: number;
   }

   let { tooltip, arrowOffset = 0 }: Props = $props();
   let displayedTooltip: TooltipState = $state({ name: "", text: "", x: 0, y: 0 });
   let content: HTMLDivElement | null = $state(null);
   let outgoingContent: HTMLDivElement | null = $state(null);
   let outgoingTooltip: TooltipState | null = $state(null);
   let viewport: HTMLDivElement | null = $state(null);
   let tooltipElement: HTMLDivElement | null = $state(null);
   let loadedCover = $state("");
   let failedCover = $state("");
   let tooltipWidth = $state(280);
   let tooltipHeight = $state(0);
   let viewportWidth = $state(0);
   let viewportHeight = $state(0);
   let tooltipX = $derived(
      Math.max(
         tooltipWidth / 2 + 12,
         Math.min(displayedTooltip.x, viewportWidth - tooltipWidth / 2 - 12)
      )
   );
   let below = $derived(displayedTooltip.y < tooltipHeight + 26);
   let tooltipY = $derived(
      below
         ? Math.min(displayedTooltip.y + 32, viewportHeight - tooltipHeight - 12)
         : displayedTooltip.y
   );
   let contentAnimation: Animation | null = null;
   let outgoingAnimation: Animation | null = null;
   let heightAnimation: Animation | null = null;
   let contentLeaving = false;
   let visible = false;
   let positioned = $state(false);
   let height = 0;
   let revision = 0;

   function reducedMotion() {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
   }

   function clearOutgoing() {
      outgoingAnimation?.cancel();
      outgoingAnimation = null;
      outgoingTooltip = null;
   }

   function animateContent(entering: boolean, fresh = false) {
      if (!content) return null;
      const styles = getComputedStyle(content);
      const from = fresh
         ? { opacity: 0, transform: "translateX(32px)" }
         : { opacity: Number(styles.opacity), transform: styles.transform };
      contentAnimation?.cancel();
      contentLeaving = !entering;
      const animation = content.animate(
         [
            from,
            {
               opacity: entering ? 1 : 0,
               transform: entering ? "translateX(0)" : "translateX(-32px)",
            },
         ],
         {
            duration: reducedMotion() ? 0 : entering ? 220 : 140,
            easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            fill: "forwards",
         }
      );
      contentAnimation = animation;
      if (entering) {
         void animation.finished
            .then(() => {
               if (contentAnimation !== animation) return;
               contentAnimation = null;
               animation.cancel();
            })
            .catch(() => {});
      }
      return animation;
   }

   async function updateContent(next: TooltipState | null) {
      positioned = displayedTooltip.name !== "";
      const currentRevision = ++revision;
      const wasVisible = visible;
      visible = next !== null;
      if (!next) {
         clearOutgoing();
         animateContent(false);
         return;
      }
      if (next.cover || displayedTooltip.cover) {
         clearOutgoing();
         contentAnimation?.cancel();
         contentAnimation = null;
         contentLeaving = false;
         displayedTooltip = next;
         return;
      }
      const sameContent =
         next.name === displayedTooltip.name &&
         next.text === displayedTooltip.text &&
         Boolean(next.cover) === Boolean(displayedTooltip.cover);
      if (wasVisible && sameContent) {
         displayedTooltip = next;
         if (contentLeaving) animateContent(true);
         return;
      }
      clearOutgoing();
      const styles = content && !sameContent ? getComputedStyle(content) : null;
      const outgoingFrom = styles
         ? { opacity: Number(styles.opacity), transform: styles.transform }
         : null;
      if (outgoingFrom && displayedTooltip.name) outgoingTooltip = displayedTooltip;
      displayedTooltip = next;
      const fresh = !sameContent || !contentAnimation;
      await tick();
      if (currentRevision !== revision) return;
      if (outgoingContent && outgoingFrom) {
         const animation = outgoingContent.animate(
            [outgoingFrom, { opacity: 0, transform: "translateX(-32px)" }],
            {
               duration: reducedMotion() ? 0 : 220,
               easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
               fill: "forwards",
            }
         );
         outgoingAnimation = animation;
         void animation.finished
            .then(() => {
               if (outgoingAnimation === animation) clearOutgoing();
            })
            .catch(() => {});
      }
      animateContent(true, fresh);
   }

   function resizeContent() {
      if (!content || !viewport) return;
      const nextHeight = content.offsetHeight;
      if (nextHeight === height) return;
      const from = viewport.getBoundingClientRect().height;
      const previousHeight = height;
      height = nextHeight;
      heightAnimation?.cancel();
      heightAnimation = null;
      viewport.style.height = `${nextHeight}px`;
      if (!visible || !previousHeight || from === nextHeight || reducedMotion()) return;
      const animation = viewport.animate([{ height: `${from}px` }, { height: `${nextHeight}px` }], {
         duration: 220,
         easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      });
      heightAnimation = animation;
      void animation.finished
         .then(() => {
            if (heightAnimation === animation) heightAnimation = null;
         })
         .catch(() => {});
   }

   $effect.pre(() => {
      const next = tooltip;
      untrack(() => void updateContent(next));
   });

   onMount(() => {
      if (tooltipElement) document.body.appendChild(tooltipElement);
      function measureTooltip() {
         if (!tooltipElement) return;
         tooltipWidth = tooltipElement.offsetWidth;
         tooltipHeight = tooltipElement.offsetHeight;
         viewportWidth = window.innerWidth;
         viewportHeight = window.innerHeight;
      }
      const observer = new ResizeObserver(resizeContent);
      if (content) observer.observe(content);
      const positionObserver = new ResizeObserver(measureTooltip);
      if (tooltipElement) positionObserver.observe(tooltipElement);
      window.addEventListener("resize", measureTooltip);
      measureTooltip();
      resizeContent();
      return () => {
         revision++;
         observer.disconnect();
         positionObserver.disconnect();
         window.removeEventListener("resize", measureTooltip);
         tooltipElement?.remove();
         contentAnimation?.cancel();
         outgoingAnimation?.cancel();
         heightAnimation?.cancel();
      };
   });
</script>

<div
   id="profile-tooltip"
   class="profile-tip"
   class:visible={tooltip !== null}
   class:cover-tip={Boolean(displayedTooltip.cover)}
   class:pinned={Boolean(displayedTooltip.cover?.pinned)}
   class:below
   bind:this={tooltipElement}
   style={`--tooltip-x:${tooltipX}px;--tooltip-y:${tooltipY}px;--arrow-offset:${arrowOffset + displayedTooltip.x - tooltipX}px;--position-duration:${positioned ? 220 : 0}ms;`}
   role="tooltip"
   aria-hidden={tooltip === null}
>
   <div class="tooltip-viewport" bind:this={viewport}>
      {#if outgoingTooltip}
         <div
            class="tooltip-content tooltip-outgoing"
            bind:this={outgoingContent}
            aria-hidden="true"
         >
            {#if outgoingTooltip.cover}
               <div class="tooltip-cover">
                  {#if outgoingTooltip.cover.imageUrl}
                     <img src={outgoingTooltip.cover.imageUrl} alt="" class="loaded" />
                  {/if}
               </div>
            {/if}
            <span class="tooltip-name">{outgoingTooltip.name}</span>
            <span class="tooltip-text">{outgoingTooltip.text}</span>
         </div>
      {/if}
      <div class="tooltip-content" bind:this={content}>
         {#if displayedTooltip.cover}
            <div class="tooltip-cover">
               {#if displayedTooltip.cover.imageUrl}
                  {#key displayedTooltip.cover.imageUrl}
                     <img
                        src={displayedTooltip.cover.imageUrl}
                        alt=""
                        class:loaded={loadedCover === displayedTooltip.cover.imageUrl}
                        onload={(event) =>
                           (loadedCover = event.currentTarget.getAttribute("src") ?? "")}
                        onerror={(event) =>
                           (failedCover = event.currentTarget.getAttribute("src") ?? "")}
                     />
                  {/key}
               {/if}
               {#if !displayedTooltip.cover.imageUrl || loadedCover !== displayedTooltip.cover.imageUrl}
                  {@const unavailable =
                     displayedTooltip.cover.unavailable ||
                     (displayedTooltip.cover.imageUrl &&
                        failedCover === displayedTooltip.cover.imageUrl)}
                  <span class="cover-placeholder" class:loading={!unavailable}>
                     {#if !unavailable && tooltip !== null}
                        <CoverLoadingStars />
                     {/if}
                     <span class="cover-status">
                        {unavailable ? "cover unavailable" : "loading cover…"}
                     </span>
                  </span>
               {/if}
            </div>
         {/if}
         <span class="tooltip-name" aria-hidden={!displayedTooltip.cover}>
            {displayedTooltip.name}
         </span>

         {#if displayedTooltip.text}
            <span class="tooltip-text">
               {displayedTooltip.text}
            </span>
         {/if}
      </div>
   </div>
</div>

<style>
   .profile-tip {
      position: fixed;
      left: var(--tooltip-x);
      top: var(--tooltip-y);
      width: 280px;
      max-width: calc(100vw - 24px);
      padding: 9px 12px;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--fill);
      color: #ffffff;
      text-align: center;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transform: translate(-50%, calc(-100% - 7px)) scale(0.92);
      transform-origin: bottom center;
      box-shadow: 0 5px 14px rgb(0 0 0 / 0.14);
      z-index: 10000;
      transition:
         left var(--position-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94),
         top var(--position-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94),
         opacity 160ms ease-in,
         transform 160ms ease-in,
         visibility 0s linear 160ms;
   }

   .profile-tip.visible {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, calc(-100% - 14px)) scale(1);
      transition:
         left var(--position-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94),
         top var(--position-duration) cubic-bezier(0.25, 0.46, 0.45, 0.94),
         opacity 220ms ease-out,
         transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
         visibility 0s;
   }

   .profile-tip.below {
      transform: translateX(-50%) scale(0.92);
      transform-origin: top center;
   }

   .profile-tip.below.visible {
      transform: translateX(-50%) scale(1);
   }

   .profile-tip.below::after {
      top: auto;
      bottom: 100%;
      border-top: 0;
      border-bottom: 6px solid var(--fill);
   }

   .cover-tip {
      width: 172px;
      padding: 8px;
   }

   .profile-tip.pinned {
      pointer-events: auto;
   }

   .tooltip-cover {
      position: relative;
      display: block;
      width: 100%;
      height: min(200px, 40vh);
      border-radius: 4px;
      overflow: hidden;
      background: rgb(255 255 255 / 0.12);
      margin-bottom: 7px;
   }

   .tooltip-cover img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0;
      transition: opacity 160ms ease;
   }

   .tooltip-cover img.loaded {
      opacity: 1;
   }

   .cover-placeholder {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-size: 11px;
      color: rgb(255 255 255 / 0.85);
   }

   .cover-status {
      position: relative;
   }

   .cover-placeholder.loading .cover-status {
      animation: cover-pulse 2.4s ease-in-out infinite alternate;
   }

   @keyframes cover-pulse {
      to {
         opacity: 0.45;
      }
   }

   .cover-tip .tooltip-name {
      white-space: normal;
      overflow-wrap: anywhere;
   }

   .profile-tip::after {
      content: "";
      position: absolute;
      left: clamp(12px, calc(50% + var(--arrow-offset)), calc(100% - 12px));
      top: 100%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid var(--fill);
      transition: left 120ms ease-out;
   }

   .tooltip-name {
      display: block;
      font-family: "Inter Tight", sans-serif;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
   }

   .tooltip-viewport {
      position: relative;
      overflow: hidden;
   }

   .tooltip-content {
      display: flow-root;
   }

   .tooltip-outgoing {
      position: absolute;
      inset: 0 0 auto;
   }

   .tooltip-text {
      display: block;
      margin-top: 3px;
      font-family: "Inter Tight", sans-serif;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.35;
      white-space: normal;
      overflow-wrap: break-word;
      opacity: 0.85;
   }

   @media (prefers-reduced-motion: reduce) {
      .cover-placeholder.loading .cover-status {
         animation: none;
      }

      .tooltip-cover img {
         transition: none;
      }

      .profile-tip,
      .profile-tip.visible,
      .profile-tip::after {
         transition: none;
      }
   }
</style>
