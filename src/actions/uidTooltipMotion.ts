type Position = { x: number; y: number; tilt: number };

export function uidTooltipMotion(node: HTMLButtonElement, copied: boolean) {
   const motion = node.querySelector<HTMLElement>(".game-copy-motion");
   const icon = node.querySelector<HTMLElement>(".game-copy-icon");
   if (!motion || !icon) return;

   let cursor: Position = { x: 0, y: -8, tilt: 0 };
   let animation: Animation | null = null;
   const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

   function transform(position: Position) {
      return `translateX(-50%) translate(${position.x}px, ${position.y}px) rotate(${position.tilt}deg)`;
   }

   function moveTo(target: Position, jump = false) {
      if (!motion) return;
      const from = getComputedStyle(motion).transform;
      const matrix = new DOMMatrixReadOnly(from === "none" ? undefined : from);
      animation?.cancel();
      const to = transform(target);
      motion.style.transform = to;
      if (reducedMotion.matches) return;

      const frames: Keyframe[] = [{ transform: from }];
      if (jump) {
         frames.push({
            transform: transform({
               x: (matrix.m41 + motion.offsetWidth / 2 + target.x) / 2,
               y: Math.min(matrix.m42, target.y) - 18,
               tilt: target.x > matrix.m41 + motion.offsetWidth / 2 ? 12 : -12,
            }),
            offset: 0.45,
         });
      }
      frames.push({ transform: to });
      const next = motion.animate(frames, {
         duration: jump ? 420 : 120,
         easing: jump ? "cubic-bezier(0.22, 1, 0.36, 1)" : "ease-out",
      });
      animation = next;
      void next.finished
         .then(() => {
            if (animation !== next) return;
            animation = null;
            next.cancel();
         })
         .catch(() => {});
   }

   function trackCursor(event: MouseEvent) {
      const bounds = node.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const x = (ratio - 0.5) * node.offsetWidth;
      const direction = Math.max(-8, Math.min(8, (x - cursor.x) * 0.6));
      const arc = ratio * 2 - 1;
      cursor = { x, y: -8 * (1 - arc * arc), tilt: arc * 6 + direction };
      if (!copied) moveTo(cursor);
   }

   function focus() {
      if (!node.matches(":focus-visible")) return;
      cursor = { x: 0, y: -8, tilt: 0 };
      if (!copied) moveTo(cursor);
   }

   motion.style.transform = transform(cursor);
   node.addEventListener("mouseenter", trackCursor);
   node.addEventListener("mousemove", trackCursor);
   node.addEventListener("mouseleave", trackCursor);
   node.addEventListener("focus", focus);

   return {
      update(nextCopied: boolean) {
         if (copied === nextCopied) return;
         copied = nextCopied;
         moveTo(
            copied
               ? { x: icon.offsetLeft + icon.offsetWidth / 2 - node.offsetWidth / 2, y: 0, tilt: 0 }
               : cursor,
            true
         );
      },
      destroy() {
         animation?.cancel();
         node.removeEventListener("mouseenter", trackCursor);
         node.removeEventListener("mousemove", trackCursor);
         node.removeEventListener("mouseleave", trackCursor);
         node.removeEventListener("focus", focus);
      },
   };
}
