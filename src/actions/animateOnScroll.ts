function getScrollStaggerDelay(root: HTMLElement, node: HTMLElement) {
   const rootRect = root.getBoundingClientRect();
   const visibleItems = Array.from(
      root.querySelectorAll<HTMLElement>(
         ['[data-scroll-hidden="true"]', '[data-scroll-revealing="true"]'].join(",")
      )
   )
      .filter((item) => {
         const rect = item.getBoundingClientRect();
         return rect.bottom > rootRect.top && rect.top < rootRect.bottom;
      })
      .sort((a, b) => {
         const aRect = a.getBoundingClientRect();
         const bRect = b.getBoundingClientRect();
         return aRect.top - bRect.top;
      });
   const index = visibleItems.indexOf(node);
   if (index === -1) {
      return 0;
   }
   return index * 85;
}

export function animateOnScroll(node: HTMLElement) {
   const root = node.closest<HTMLElement>(".slide-scroll");
   if (!root) return;
   let initialCheck = true;
   let revealed = false;
   let revealAnimation: Animation | null = null;
   const observer = new IntersectionObserver(
      ([entry]) => {
         if (initialCheck) {
            initialCheck = false;
            if (entry.isIntersecting) {
               observer.disconnect();
               return;
            }
            node.style.animation = "none";
            node.style.opacity = "0";
            const startX = getComputedStyle(node).getPropertyValue("--item-start-x");
            node.style.transform = `translate3d(${startX}, 0, 0) scale(0.95)`;
            node.dataset.scrollHidden = "true";
            return;
         }
         if (!entry.isIntersecting || revealed) {
            return;
         }
         revealed = true;
         const scrollDelay = getScrollStaggerDelay(root, node);
         node.dataset.scrollRevealing = "true";
         delete node.dataset.scrollHidden;
         const styles = getComputedStyle(node);
         const startX = styles.getPropertyValue("--item-start-x");
         const bounce1 = styles.getPropertyValue("--item-bounce-1");
         const bounce2 = styles.getPropertyValue("--item-bounce-2");
         const bounce3 = styles.getPropertyValue("--item-bounce-3");
         const bounce4 = styles.getPropertyValue("--item-bounce-4");
         revealAnimation = node.animate(
            [
               {
                  opacity: 0,
                  transform: `translate3d(${startX}, 0, 0) scale(0.95)`,
                  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
               },
               {
                  opacity: 1,
                  transform: `translate3d(${bounce1}, 0, 0) scale(1)`,
                  offset: 0.52,
                  easing: "cubic-bezier(0.25, 0.7, 0.35, 1)",
               },
               {
                  opacity: 1,
                  transform: `translate3d(${bounce2}, 0, 0) scale(1)`,
                  offset: 0.68,
                  easing: "cubic-bezier(0.25, 0.7, 0.35, 1)",
               },
               {
                  opacity: 1,
                  transform: `translate3d(${bounce3}, 0, 0) scale(1)`,
                  offset: 0.81,
                  easing: "cubic-bezier(0.25, 0.7, 0.35, 1)",
               },
               {
                  opacity: 1,
                  transform: `translate3d(${bounce4}, 0, 0) scale(1)`,
                  offset: 0.91,
                  easing: "ease-out",
               },
               {
                  opacity: 1,
                  transform: "translate3d(0, 0, 0) scale(1)",
               },
            ],
            {
               duration: 820,
               delay: 60 + scrollDelay,
               fill: "forwards",
            }
         );
         revealAnimation.onfinish = () => {
            delete node.dataset.scrollRevealing;
            node.style.opacity = "1";
            node.style.transform = "translate3d(0, 0, 0) scale(1)";
            revealAnimation?.cancel();
            revealAnimation = null;
         };
         observer.disconnect();
      },
      {
         root,
         threshold: 0.15,
         rootMargin: "0px 0px -4% 0px",
      }
   );
   observer.observe(node);
   return {
      destroy() {
         observer.disconnect();
         revealAnimation?.cancel();
      },
   };
}
