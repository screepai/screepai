/** Mouse-only parallax. Frame work stops as soon as the layers settle. */
export function parallax(node: HTMLElement) {
   const pointer = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
   const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
   const layers = Array.from(node.children)
      .filter((child): child is HTMLElement => child instanceof HTMLElement)
      .map((element) => ({
         element,
         depthX: Number(element.dataset.depthX ?? element.dataset.depth ?? 0),
         depthY: Number(element.dataset.depthY ?? element.dataset.depth ?? 0),
         transform: element.style.transform,
      }));
   let width = node.clientWidth;
   let height = node.clientHeight;
   let viewportWidth = window.innerWidth;
   let viewportHeight = window.innerHeight;
   let x = 0;
   let y = 0;
   let targetX = 0;
   let targetY = 0;
   let frame = 0;
   let previousTime = 0;

   function enabled() {
      return pointer.matches && !reducedMotion.matches && !document.hidden;
   }

   function render(now: number) {
      frame = 0;
      const elapsed = previousTime ? Math.min(now - previousTime, 64) : 1000 / 60;
      previousTime = now;
      const blend = 1 - Math.exp(-elapsed / 100);
      x += (targetX - x) * blend;
      y += (targetY - y) * blend;
      const settled = Math.abs(targetX - x) < 0.001 && Math.abs(targetY - y) < 0.001;
      if (settled) {
         x = targetX;
         y = targetY;
      }
      for (const layer of layers) {
         const dx = -x * width * 0.1 * layer.depthX;
         const dy = -y * height * 0.1 * layer.depthY;
         // Keep smooth tracking, but let text settle on whole pixels in a 2D layer.
         layer.element.style.transform = `translate(${settled ? Math.round(dx) : dx.toFixed(3)}px, ${settled ? Math.round(dy) : dy.toFixed(3)}px)`;
      }
      if (!settled) frame = requestAnimationFrame(render);
      else previousTime = 0;
   }

   function schedule() {
      if (enabled() && !frame) frame = requestAnimationFrame(render);
   }

   function reset() {
      cancelAnimationFrame(frame);
      frame = previousTime = x = y = targetX = targetY = 0;
      for (const layer of layers) layer.element.style.transform = layer.transform;
   }

   function onPointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !enabled()) return;
      targetX = (event.clientX / viewportWidth) * 2 - 1;
      targetY = (event.clientY / viewportHeight) * 2 - 1;
      schedule();
   }

   function onResize() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      if (x || y || targetX || targetY) schedule();
   }

   function onCapabilityChange() {
      if (!enabled()) reset();
   }

   const observer = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width;
      height = entry.contentRect.height;
      if (x || y || targetX || targetY) schedule();
   });
   observer.observe(node);
   window.addEventListener("pointermove", onPointerMove, { passive: true });
   window.addEventListener("resize", onResize, { passive: true });
   window.addEventListener("blur", reset);
   document.addEventListener("visibilitychange", onCapabilityChange);
   pointer.addEventListener("change", onCapabilityChange);
   reducedMotion.addEventListener("change", onCapabilityChange);

   return {
      destroy() {
         reset();
         observer.disconnect();
         window.removeEventListener("pointermove", onPointerMove);
         window.removeEventListener("resize", onResize);
         window.removeEventListener("blur", reset);
         document.removeEventListener("visibilitychange", onCapabilityChange);
         pointer.removeEventListener("change", onCapabilityChange);
         reducedMotion.removeEventListener("change", onCapabilityChange);
      },
   };
}
