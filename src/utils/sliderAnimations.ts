import type { TransitionConfig } from "svelte/transition";
type SwipeParams = {
   direction: number;
   delay?: number;
};

type ExitSnapshot = {
   node: HTMLElement;
   opacity: number;
   transform: string;
};

const exitDurations = new WeakMap<Element, number>();
const DISCORD_NOTE_ERASE_MS = 420;

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

function eraseDiscordNote(note: HTMLElement) {
   const paths = Array.from(note.querySelectorAll("path"), (path) => ({
      path,
      offset: getComputedStyle(path).strokeDashoffset,
   }));
   const label = note.querySelector<HTMLElement>(".discord-label");
   const opacity = label ? getComputedStyle(label).opacity : "0";
   const timing = { duration: DISCORD_NOTE_ERASE_MS, fill: "both" as const };
   const animations = paths.map(({ path, offset }) =>
      path.animate(
         [
            { strokeDashoffset: offset, opacity: 1 },
            { offset: 0.9, opacity: 1 },
            { strokeDashoffset: "1px", opacity: 0 },
         ],
         timing
      )
   );
   if (label) {
      animations.push(
         label.animate(
            [
               { opacity, clipPath: "inset(0 0% 0 0)" },
               { opacity, clipPath: "inset(0 100% 0 0)" },
            ],
            timing
         )
      );
   }
   return animations;
}

export function playOutAnimations(panel: HTMLElement, outgoingDirection: number) {
   const bounds = panel.closest<HTMLElement>(".slide-scroll")?.getBoundingClientRect();
   const animations: Animation[] = [];
   const reducedMotion = prefersReducedMotion();
   let duration = 0;

   function measure(node: HTMLElement | null): ExitSnapshot | null {
      if (!node || node.dataset.scrollHidden === "true") return null;
      const rect = node.getBoundingClientRect();
      if (
         rect.height === 0 ||
         (bounds && (rect.bottom <= bounds.top || rect.top >= bounds.bottom))
      ) {
         return null;
      }
      const styles = getComputedStyle(node);
      const opacity = Number(styles.opacity);
      return opacity > 0 ? { node, opacity, transform: styles.transform } : null;
   }

   function exit({ node, opacity, transform }: ExitSnapshot, x: number, y: number, delay = 0) {
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

   const heading = measure(panel.querySelector<HTMLElement>(".heading-card"));
   const items = Array.from(panel.querySelectorAll<HTMLElement>(".item-card"), measure).filter(
      (item) => item !== null
   );
   const note = measure(panel.querySelector<HTMLElement>(".note-card"));
   const discordNote = measure(panel.querySelector<HTMLElement>(".discord-note"));
   const handwriting = discordNote && !reducedMotion ? eraseDiscordNote(discordNote.node) : [];
   if (heading) exit(heading, 0, -70);
   const itemX = outgoingDirection > 0 ? -110 : 110;
   items.forEach((item, index) => {
      exit(item, itemX, 0, 30 + index * 65);
   });

   if (note) exit(note, 0, 70, 30 + items.length * 65);

   const enterDelay = reducedMotion ? 0 : Math.max(0, duration - 240);
   if (handwriting.length) {
      duration = Math.max(duration, DISCORD_NOTE_ERASE_MS);
      animations.push(...handwriting);
   }
   if (discordNote && reducedMotion) exit(discordNote, 0, 0);

   exitDurations.set(panel, duration);
   return {
      enterDelay,
      finished: Promise.allSettled(animations.map((animation) => animation.finished)).then(
         () => undefined
      ),
   };
}
