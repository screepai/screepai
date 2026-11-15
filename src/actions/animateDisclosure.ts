export function animateDisclosure(node: HTMLDetailsElement) {
   const summaryElement = node.querySelector("summary");
   const contentElement = node.querySelector<HTMLElement>(".series-parts");
   if (!summaryElement || !contentElement) return;
   const summary = summaryElement;
   const content = contentElement;

   const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
   let expanded = node.open;
   let animation: Animation | undefined;
   let fade: Animation | undefined;

   function finish() {
      node.open = expanded;
      node.style.height = "";
      node.style.overflow = "";
      animation?.cancel();
      fade?.cancel();
      animation = fade = undefined;
   }

   function toggle(event: MouseEvent) {
      if (event.target instanceof Element && event.target.closest("a, button")) return;
      event.preventDefault();
      const height = node.getBoundingClientRect().height;
      const opacity = node.open ? Number(getComputedStyle(content).opacity) : 0;
      animation?.cancel();
      fade?.cancel();
      expanded = !expanded;
      node.dataset.expanded = String(expanded);
      summary.setAttribute("aria-expanded", String(expanded));
      content.inert = !expanded;
      node.open = true;
      node.style.height = "";
      const target = expanded ? node.getBoundingClientRect().height : summary.offsetHeight;
      node.style.height = `${height}px`;
      node.style.overflow = "hidden";
      const timing = {
         duration: 220,
         easing: "cubic-bezier(0.23, 1, 0.32, 1)",
         fill: "both" as const,
      };
      if (reducedMotion.matches) {
         finish();
         return;
      }
      const next = node.animate([{ height: `${height}px` }, { height: `${target}px` }], timing);
      animation = next;
      fade = content.animate([{ opacity }, { opacity: expanded ? 1 : 0 }], timing);
      next.onfinish = () => {
         if (animation === next) finish();
      };
   }

   node.dataset.expanded = String(expanded);
   summary.setAttribute("aria-expanded", String(expanded));
   summary.addEventListener("click", toggle);
   reducedMotion.addEventListener("change", finish);

   return {
      destroy() {
         summary.removeEventListener("click", toggle);
         reducedMotion.removeEventListener("change", finish);
         finish();
      },
   };
}
