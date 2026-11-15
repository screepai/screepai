type SwipeParams = {
   direction: number;
   delay?: number;
};

type ExitSnapshot = {
   node: HTMLElement;
   opacity: number;
   transform: string;
};

const DISCORD_NOTE_ERASE_MS = 420;

function prefersReducedMotion() {
   return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function swipeIn(node: HTMLElement, { direction, delay = 0 }: SwipeParams) {
   if (prefersReducedMotion()) {
      node.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160 });
      return;
   }
   node.animate(
      [
         { transform: `translate3d(${direction * 100}%, 0, 0)`, opacity: 0 },
         { transform: "translate3d(0, 0, 0)", opacity: 1 },
      ],
      {
         delay,
         duration: 480,
         easing: "cubic-bezier(0.333333, 1.25, 0.666667, 1)",
         fill: "backwards",
      }
   );
}

function eraseDiscordNote(note: HTMLElement) {
   const paths = Array.from(note.querySelectorAll("path"), (path) => {
      const { strokeDashoffset, opacity } = getComputedStyle(path);
      return { path, strokeDashoffset, opacity };
   });
   const label = note.querySelector<HTMLElement>(".discord-label");
   const opacity = label ? getComputedStyle(label).opacity : "0";
   const timing = { duration: DISCORD_NOTE_ERASE_MS, fill: "both" as const };
   const animations = paths.map(({ path, strokeDashoffset, opacity }) =>
      path.animate(
         [
            { strokeDashoffset, opacity },
            { offset: 0.9, opacity },
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
   animations.push(...handwriting);
   if (discordNote && reducedMotion) exit(discordNote, 0, 0);

   return {
      enterDelay,
      finished: Promise.allSettled(animations.map((animation) => animation.finished)).then(
         () => undefined
      ),
   };
}
