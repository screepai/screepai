<script lang="ts" context="module">
   export type TooltipState = {
      name: string;
      text: string;
      x: number;
      y: number;
   };
</script>

<script lang="ts">
   import { onMount, tick } from "svelte";

   export let tooltip: TooltipState | null;
   export let arrowOffset = 0;
   let displayedTooltip: TooltipState = { name: "", text: "", x: 0, y: 0 };
   let content: HTMLDivElement | null = null;
   let outgoingContent: HTMLDivElement | null = null;
   let outgoingTooltip: TooltipState | null = null;
   let viewport: HTMLDivElement | null = null;
   let contentAnimation: Animation | null = null;
   let outgoingAnimation: Animation | null = null;
   let heightAnimation: Animation | null = null;
   let contentLeaving = false;
   let visible = false;
   let positioned = false;
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
      const sameContent =
         next.name === displayedTooltip.name && next.text === displayedTooltip.text;
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

   $: void updateContent(tooltip);

   onMount(() => {
      const observer = new ResizeObserver(resizeContent);
      if (content) observer.observe(content);
      resizeContent();
      return () => {
         revision++;
         observer.disconnect();
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
   style={`--tooltip-x:${displayedTooltip.x}px;--tooltip-y:${displayedTooltip.y}px;--arrow-offset:${arrowOffset}px;--position-duration:${positioned ? 220 : 0}ms;`}
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
            <span class="tooltip-name">{outgoingTooltip.name}</span>
            <span class="tooltip-text">{outgoingTooltip.text}</span>
         </div>
      {/if}
      <div class="tooltip-content" bind:this={content}>
         <span class="tooltip-name" aria-hidden="true">
            {displayedTooltip.name}
         </span>

         <span class="tooltip-text">
            {displayedTooltip.text}
         </span>
      </div>
   </div>
</div>

<style>
   .profile-tip {
      position: absolute;
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
      .profile-tip,
      .profile-tip.visible,
      .profile-tip::after {
         transition: none;
      }
   }
</style>
