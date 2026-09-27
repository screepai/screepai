import type { TransitionConfig } from "svelte/transition";
type SwipeParams = {
   direction: number;
};
function softBackOut(t: number) {
   const strength = 0.75;
   const value = t - 1;
   return 1 + value * value * ((strength + 1) * value + strength);
}

export function swipeIn(_node: Element, { direction }: SwipeParams): TransitionConfig {
   void _node;
   return {
      duration: 420,
      easing: softBackOut,
      css: (t) => `
         transform: translate3d(${direction * (1 - t) * 100}%, 0, 0);
         opacity: ${0.65 + t * 0.35};
       `,
   };
}

export function swipeOut(_node: Element, { direction }: SwipeParams): TransitionConfig {
   void _node;
   const outgoingDirection = direction;
   return {
      duration: 420,
      css: (t) => {
         const u = 1 - t;
         const movement = u * u;
         return `
           transform: translate3d(${-outgoingDirection * movement * 100}%, 0, 0);
           opacity: ${0.25 + t * 0.75};
         `;
      },
   };
}

export function playOutAnimations(panel: HTMLElement, outgoingDirection: number) {
   const heading = panel.querySelector<HTMLElement>(".heading-card");
   const items = panel.querySelectorAll<HTMLElement>(".item-card");
   const note = panel.querySelector<HTMLElement>(".note-card");
   const itemX = outgoingDirection > 0 ? -110 : 110;
   if (heading) {
      heading.getAnimations().forEach((animation) => animation.cancel());
      heading.animate(
         [
            {
               opacity: 1,
               transform: "translate3d(0, 0, 0) scale(1)",
            },
            {
               opacity: 0.8,
               offset: 0.25,
               transform: "translate3d(0, -10px, 0) scale(1)",
            },
            {
               opacity: 0,
               transform: "translate3d(0, -70px, 0) scale(0.94)",
            },
         ],
         {
            duration: 330,
            easing: "cubic-bezier(0.55, 0, 1, 0.45)",
            fill: "forwards",
         }
      );
   }
   items.forEach((item, index) => {
      if (item.dataset.scrollHidden === "true") {
         return;
      }
      item.getAnimations().forEach((animation) => animation.cancel());
      item.animate(
         [
            {
               opacity: 1,
               transform: "translate3d(0, 0, 0) scale(1)",
            },
            {
               opacity: 0.85,
               offset: 0.2,
               transform: `translate3d(${itemX * 0.15}px, 0, 0) scale(1)`,
            },
            {
               opacity: 0,
               transform: `translate3d(${itemX}px, 0, 0) scale(0.94)`,
            },
         ],
         {
            delay: index * 25,
            duration: 320,
            easing: "cubic-bezier(0.55, 0, 1, 0.45)",
            fill: "forwards",
         }
      );
   });
   if (note) {
      note.getAnimations().forEach((animation) => animation.cancel());
      note.animate(
         [
            {
               opacity: 1,
               transform: "translate3d(0, 0, 0) scale(1)",
            },
            {
               opacity: 0.8,
               offset: 0.25,
               transform: "translate3d(0, 10px, 0) scale(1)",
            },
            {
               opacity: 0,
               transform: "translate3d(0, 70px, 0) scale(0.94)",
            },
         ],
         {
            duration: 330,
            easing: "cubic-bezier(0.55, 0, 1, 0.45)",
            fill: "forwards",
         }
      );
   }
}
