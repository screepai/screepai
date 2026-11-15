import type { TransitionConfig } from "svelte/transition";
type SwipeParams = {
   direction: number;
   delay?: number;
};
const exitDurations = new WeakMap<Element, number>();

function prefersReducedMotion() {
   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function softBackOut(t: number) {
   const strength = 0.75;
   const value = t - 1;
   return 1 + value * value * ((strength + 1) * value + strength);
}

export function swipeIn(_node: Element, { direction, delay = 0 }: SwipeParams): TransitionConfig {
   void _node;
   if (prefersReducedMotion()) {
      return { duration: 160, css: (t) => `opacity: ${t};` };
   }
   return {
      delay,
      duration: 480,
      easing: softBackOut,
      css: (t) => `
         transform: translate3d(${direction * (1 - t) * 100}%, 0, 0);
         opacity: ${t};
       `,
   };
}

export function holdForExit(node: Element): TransitionConfig {
   // Keep the panel mounted without hiding its staggered child animations.
   return { duration: exitDurations.get(node) ?? 0 };
}

export function playOutAnimations(panel: HTMLElement, outgoingDirection: number) {
   const bounds = panel.closest<HTMLElement>(".slide-scroll")?.getBoundingClientRect();
   const animations: Animation[] = [];
   const reducedMotion = prefersReducedMotion();
   let duration = 0;

   function isVisible(node: HTMLElement | null): node is HTMLElement {
      if (!node || node.dataset.scrollHidden === "true") return false;
      const rect = node.getBoundingClientRect();
      return (
         rect.height > 0 &&
         Number(getComputedStyle(node).opacity) > 0 &&
         (!bounds || (rect.bottom > bounds.top && rect.top < bounds.bottom))
      );
   }

   function exit(node: HTMLElement, x: number, y: number, delay = 0) {
      const styles = getComputedStyle(node);
      const opacity = Number(styles.opacity);
      const transform = styles.transform;
      node.getAnimations().forEach((animation) => animation.cancel());
      node.style.animation = "none";
      const timing = {
         delay: reducedMotion ? 0 : delay,
         duration: reducedMotion ? 160 : 280,
         easing: "cubic-bezier(0.4, 0, 0.2, 1)",
         fill: "both" as const,
      };
      const animation = node.animate(
         reducedMotion
            ? [
                 { opacity, transform },
                 { opacity: 0, transform },
              ]
            : [
                 { opacity, transform },
                 {
                    opacity: opacity * 0.7,
                    offset: 0.35,
                    transform: `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(0.98)`,
                 },
                 { opacity: 0, transform: `translate3d(${x}px, ${y}px, 0) scale(0.94)` },
              ],
         timing
      );
      duration = Math.max(duration, timing.delay + timing.duration);
      animations.push(animation);
   }

   const heading = panel.querySelector<HTMLElement>(".heading-card");
   if (isVisible(heading)) exit(heading, 0, -70);

   const items = Array.from(panel.querySelectorAll<HTMLElement>(".item-card")).filter(isVisible);
   const itemX = outgoingDirection > 0 ? -110 : 110;
   items.forEach((item, index) => {
      exit(item, itemX, 0, 30 + index * 65);
   });

   const note = panel.querySelector<HTMLElement>(".note-card");
   if (isVisible(note)) exit(note, 0, 70, 30 + items.length * 65);

   exitDurations.set(panel, duration);
   return {
      enterDelay: reducedMotion ? 0 : Math.max(0, duration - 240),
      finished: Promise.allSettled(animations.map((animation) => animation.finished)).then(
         () => undefined
      ),
   };
}
