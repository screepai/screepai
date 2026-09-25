<script lang="ts">
   import { onMount, tick } from "svelte";
   import type { TransitionConfig } from "svelte/transition";
   import { contentSlides } from "../config/contents";

   type SwipeParams = {
      direction: number;
   };

   type SocialTooltip = {
      name: string;
      text: string;
      x: number;
      y: number;
   };

   let activeIndex = 0;
   let direction = 1;
   let slideViewport: HTMLDivElement | null = null;
   let sliderRoot: HTMLDivElement | null = null;
   let changingSlide = false;
   let socialTooltip: SocialTooltip | null = null;
   let scrollRegion: HTMLDivElement | null = null;

   $: activeSlide = contentSlides[activeIndex];

   function softBackOut(t: number) {
      const strength = 0.75;
      const value = t - 1;
      return 1 + value * value * ((strength + 1) * value + strength);
   }

   function swipeIn(_node: Element, { direction }: SwipeParams): TransitionConfig {
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

   function swipeOut(_node: Element): TransitionConfig {
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

   function playOutAnimations(panel: HTMLElement, outgoingDirection: number) {
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
   
   function getScrollStaggerDelay(
      root: HTMLElement,
      node: HTMLElement
   ) {
      const rootRect =
         root.getBoundingClientRect();

      const visibleItems =
         Array.from(
            root.querySelectorAll<HTMLElement>(
               [
                  '[data-scroll-hidden="true"]',
                  '[data-scroll-revealing="true"]',
               ].join(",")
            )
         )
            .filter((item) => {
               const rect =
                  item.getBoundingClientRect();

               return (
                  rect.bottom >
                     rootRect.top &&
                  rect.top <
                     rootRect.bottom
               );
            })
            .sort((a, b) => {
               const aRect =
                  a.getBoundingClientRect();

               const bRect =
                  b.getBoundingClientRect();

               return (
                  aRect.top -
                  bRect.top
               );
            });

      const index =
         visibleItems.indexOf(node);

      if (index === -1) {
         return 0;
      }

      return index * 85;
   }

   function animateOnScroll(node: HTMLElement) {
      const root =
         node.closest<HTMLElement>(".slide-scroll");

      if (!root) return;

      let initialCheck = true;
      let revealed = false;
      let revealAnimation:
         Animation | null = null;

      const observer =
         new IntersectionObserver(
            ([entry]) => {
               if (initialCheck) {
                  initialCheck = false;

                  if (entry.isIntersecting) {
                     observer.disconnect();
                     return;
                  }

                  node.style.animation = "none";

                  node.style.opacity = "0";

                  const startX =
                     getComputedStyle(node)
                        .getPropertyValue(
                           "--item-start-x"
                        );

                  node.style.transform =
                     `translate3d(${startX}, 0, 0) scale(0.95)`;

                  node.dataset.scrollHidden =
                     "true";

                  return;
               }

               if (
                  !entry.isIntersecting ||
                  revealed
               ) {
                  return;
               }

               revealed = true;

               const scrollDelay =
                  getScrollStaggerDelay(
                     root,
                     node
                  );

               node.dataset.scrollRevealing =
                  "true";

               delete node.dataset.scrollHidden;

                              const styles =
                  getComputedStyle(node);

               const startX =
                  styles.getPropertyValue(
                     "--item-start-x"
                  );

               const bounce1 =
                  styles.getPropertyValue(
                     "--item-bounce-1"
                  );

               const bounce2 =
                  styles.getPropertyValue(
                     "--item-bounce-2"
                  );

               const bounce3 =
                  styles.getPropertyValue(
                     "--item-bounce-3"
                  );

               const bounce4 =
                  styles.getPropertyValue(
                     "--item-bounce-4"
                  );

                              revealAnimation =
                  node.animate(
                     [
                        {
                           opacity: 0,
                           transform:
                              `translate3d(${startX}, 0, 0) scale(0.95)`,
                           easing:
                              "cubic-bezier(0.16, 1, 0.3, 1)",
                        },
                        {
                           opacity: 1,
                           transform:
                              `translate3d(${bounce1}, 0, 0) scale(1)`,
                           offset: 0.52,
                           easing:
                              "cubic-bezier(0.25, 0.7, 0.35, 1)",
                        },
                        {
                           opacity: 1,
                           transform:
                              `translate3d(${bounce2}, 0, 0) scale(1)`,
                           offset: 0.68,
                           easing:
                              "cubic-bezier(0.25, 0.7, 0.35, 1)",
                        },
                        {
                           opacity: 1,
                           transform:
                              `translate3d(${bounce3}, 0, 0) scale(1)`,
                           offset: 0.81,
                           easing:
                              "cubic-bezier(0.25, 0.7, 0.35, 1)",
                        },
                        {
                           opacity: 1,
                           transform:
                              `translate3d(${bounce4}, 0, 0) scale(1)`,
                           offset: 0.91,
                           easing:
                              "ease-out",
                        },
                        {
                           opacity: 1,
                           transform:
                              "translate3d(0, 0, 0) scale(1)",
                        },
                     ],
                     {
                        duration: 820,
                        delay:
                           60 +
                           scrollDelay,
                        fill: "forwards",
                     }
                  );

               revealAnimation.onfinish =
                  () => {
                     delete node.dataset
                        .scrollRevealing;

                     node.style.opacity = "1";

                     node.style.transform =
                        "translate3d(0, 0, 0) scale(1)";

                     revealAnimation?.cancel();
                     revealAnimation = null;
                  };

               observer.disconnect();
            },
            {
               root,
               threshold: 0.15,
               rootMargin:
                  "0px 0px -4% 0px",
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

   function nextFrame() {
      return new Promise<void>((resolve) => {
         requestAnimationFrame(() => resolve());
      });
   }

   function showSocialTooltip(
      event: MouseEvent | FocusEvent,
      name: string,
      text: string
   ) {
      if (!sliderRoot) return;

      const button = event.currentTarget as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      const rootRect = sliderRoot.getBoundingClientRect();

      socialTooltip = {
         name,
         text,
         x: buttonRect.left + buttonRect.width / 2 - rootRect.left,
         y: buttonRect.top - rootRect.top,
      };
   }

   function hideSocialTooltip() {
      socialTooltip = null;
   }

   function syncActiveSlideLayout() {
      if (
         !slideViewport ||
         !scrollRegion
      ) {
         return;
      }

      const viewport =
         slideViewport;

      const activeScrollRegion =
         scrollRegion;

      const panels =
         viewport.querySelectorAll<HTMLElement>(
            ".slide-panel"
         );

      const activePanel =
         panels[panels.length - 1];

      if (!activePanel) return;

      const activeContent =
         activePanel.querySelector<HTMLElement>(
            ".slide-content"
         );

      if (!activeContent) return;

      viewport.style.minHeight = "";

      const targetHeight =
         activeContent.scrollHeight;

      const targetVisibleHeight =
         measureVisibleTargetHeight(
            viewport,
            activeContent,
            activeScrollRegion
         );

      const previousViewportTransition =
         viewport.style.transition;

      const previousScrollTransition =
         activeScrollRegion.style.transition;

      viewport.style.transition = "none";

      activeScrollRegion.style.transition =
         "none";

      viewport.style.height =
         `${targetHeight}px`;

      activeScrollRegion.style.height =
         `${targetVisibleHeight}px`;

      void viewport.offsetHeight;

      viewport.style.transition =
         previousViewportTransition;

      activeScrollRegion.style.transition =
         previousScrollTransition;

      changingSlide = false;
   }

   function measureVisibleTargetHeight(
      viewport: HTMLElement,
      incomingContent: HTMLElement,
      scrollRegion: HTMLElement
   ) {
      const previousViewportHeight =
         viewport.style.height;

      const previousViewportMinHeight =
         viewport.style.minHeight;

      const previousViewportTransition =
         viewport.style.transition;

      const previousScrollHeight =
         scrollRegion.style.height;

      const previousScrollTransition =
         scrollRegion.style.transition;

      viewport.style.transition = "none";
      scrollRegion.style.transition = "none";

      viewport.style.minHeight = "";
      scrollRegion.style.height = "";

      viewport.style.height =
         `${incomingContent.scrollHeight}px`;

      void scrollRegion.offsetHeight;

      const targetVisibleHeight =
         scrollRegion
            .getBoundingClientRect()
            .height;

      viewport.style.height =
         previousViewportHeight;

      viewport.style.minHeight =
         previousViewportMinHeight;

      scrollRegion.style.height =
         previousScrollHeight;

      void scrollRegion.offsetHeight;

      viewport.style.transition =
         previousViewportTransition;

      scrollRegion.style.transition =
         previousScrollTransition;

      return targetVisibleHeight;
   }

   function resetScrollSmoothly(
      element: HTMLElement,
      duration = 220
   ) {
      const start =
         element.scrollTop;

      if (start <= 0) return;

      const startTime =
         performance.now();

      function animate(time: number) {
         const progress =
            Math.min(
               (time - startTime) /
                  duration,
               1
            );

         const eased =
            1 -
            Math.pow(
               1 - progress,
               3
            );

         element.scrollTop =
            start *
            (1 - eased);

         if (progress < 1) {
            requestAnimationFrame(
               animate
            );
         } else {
            element.scrollTop = 0;
         }
      }

      requestAnimationFrame(
         animate
      );
   }

   async function changeSlide(nextIndex: number) {
      if (
         nextIndex === activeIndex ||
         !slideViewport ||
         changingSlide
      ) {
         return;
      }

      changingSlide = true;
      socialTooltip = null;

      const viewport = slideViewport;
      const currentHeight = viewport.getBoundingClientRect().height;

      const currentScrollRegion =
         scrollRegion;

      const previousScrollTop =
         currentScrollRegion?.scrollTop ?? 0;

      const previousMinHeight =
         viewport.style.minHeight;

      if (
         currentScrollRegion &&
         previousScrollTop > 0
      ) {
         viewport.style.minHeight =
            `${viewport.scrollHeight}px`;
      }

      viewport.style.height = `${currentHeight}px`;
      direction = nextIndex > activeIndex ? 1 : -1;

      const currentPanels =
         viewport.querySelectorAll<HTMLElement>(".slide-panel");

      const outgoingPanel =
         currentPanels[currentPanels.length - 1];

      if (outgoingPanel) {
         playOutAnimations(outgoingPanel, direction);
      }

      await nextFrame();

      activeIndex = nextIndex;

      await tick();

      const activeScrollRegion = scrollRegion;

      if (!activeScrollRegion) {
         changingSlide = false;
         return;
      }

      if (previousScrollTop > 0) {
         activeScrollRegion.scrollTop = previousScrollTop;
      }

      const panels =
         viewport.querySelectorAll<HTMLElement>(".slide-panel");

      const incomingPanel =
         panels[panels.length - 1];

      if (!incomingPanel) {
         changingSlide = false;
         return;
      }

      const incomingContent =
         incomingPanel.querySelector<HTMLElement>(".slide-content");

      if (!incomingContent) {
         changingSlide = false;
         return;
      }

      const targetHeight = incomingContent.scrollHeight;

      const currentVisibleHeight =
         activeScrollRegion.getBoundingClientRect()
            .height;

      const targetVisibleHeight =
         measureVisibleTargetHeight(
            viewport,
            incomingContent,
            activeScrollRegion
         );

      activeScrollRegion.style.height = `${currentVisibleHeight}px`;

      resetScrollSmoothly(
         activeScrollRegion
      );

      await nextFrame();

      requestAnimationFrame(() => {
         viewport.style.height = `${targetHeight}px`;

         activeScrollRegion.style.height = `${targetVisibleHeight}px`;
      });

      window.setTimeout(() => {
         viewport.style.minHeight =
            previousMinHeight;
         changingSlide = false;
      }, 440);
   }

   function syncCurrentHeight() {
      socialTooltip = null;

      if (!slideViewport) return;

      const panels =
         slideViewport.querySelectorAll<HTMLElement>(".slide-panel");

      const currentPanel = panels[panels.length - 1];

      if (!currentPanel) return;

      const content =
         currentPanel.querySelector<HTMLElement>(".slide-content");

      if (!content) return;

      slideViewport.style.height = `${content.scrollHeight}px`;
   }

   function rotationOne(index: number) {
      return ((index * 17) % 40) - 10;
   }

   function rotationTwo(index: number) {
      return ((index * 23) % 40) - 30;
   }

   onMount(() => {
      let mounted = true;

      async function init() {
         await tick();

         if (!mounted || !slideViewport) return;

         const viewport = slideViewport;
         const panel =
            viewport.querySelector<HTMLElement>(".slide-panel");

         if (!panel) return;

         const content =
            panel.querySelector<HTMLElement>(".slide-content");

         if (!content) return;

         viewport.style.transition = "none";
         viewport.style.height = `${content.scrollHeight}px`;

         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               if (!mounted) return;
               viewport.style.transition = "";
            });
         });
      }

      const handleVisibilityChange =
         () => {
            socialTooltip = null;

            if (document.hidden || !mounted) {
               return;
            }

            requestAnimationFrame(() => {
               requestAnimationFrame(() => {
                  if (!mounted) return;

                  syncActiveSlideLayout();
               });
            });
         };

      void init();

      window.addEventListener("resize", syncCurrentHeight);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
         mounted = false;
         window.removeEventListener("resize", syncCurrentHeight);
         document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
   });
</script>

<style>
   .content-slider {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 0;
   }

   .slide-viewport {
      display: grid;
      position: relative;
      width: 100%;
      overflow: hidden;
      transition: height 420ms cubic-bezier(0.22, 1, 0.36, 1);
   }

   .slide-scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color:
         color-mix(
            in srgb,
            var(--fill) 45%,
            transparent
         )
         transparent;
      transition:
         height
         520ms
         cubic-bezier(0.22, 1, 0.36, 1);
   }

   .slide-scroll::-webkit-scrollbar {
      width: 5px;
   }

   .slide-scroll::-webkit-scrollbar-track {
      background: transparent;
   }

   .slide-scroll::-webkit-scrollbar-thumb {
      background:
         color-mix(
            in srgb,
            var(--fill) 45%,
            transparent
         );

      border-radius: 999px;
   }

   .slide-scroll::-webkit-scrollbar-thumb:hover {
      background:
         color-mix(
            in srgb,
            var(--fill) 70%,
            transparent
         );
   }

   .slide-panel {
      grid-column: 1;
      grid-row: 1;
      align-self: start;
      width: 100%;
      min-width: 0;
      backface-visibility: hidden;
      will-change: transform, opacity;
      pointer-events: none;
   }

   .slide-panel:last-child {
      pointer-events: auto;
   }

   .slide-content {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 20px;
      color: #777777;
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 400;
      font-size: clamp(
         10px,
         calc(5.5px + 1.35vw),
         16px
      );
      line-height: 1.3;
   }

   .centered-content {
      text-align: center;
   }

   .content-list {
      padding-inline-start: 0;
   }

   p {
      margin: 0;
   }

   h4 {
      color: var(--fill);
      margin-top: 0;
      margin-bottom: 1.2em;
      font-size: 1.1em;
      line-height: 1.2;
   }

   .centered-heading {
      text-align: center;
   }

   .social-note {
      margin-top: 35px;
      margin-bottom: 8px;
      min-height: 1.25em;
      opacity: 0.65;
      font-size: 0.82em;
      line-height: 1.25;
      text-align: center;
      flex-shrink: 0;
   }

   .social-icons {
      display: flex;
      flex-wrap: wrap;
      padding: 0;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 1.75em;
      gap: 1.375rem;
   }

   .social-icons li {
      position: relative;
      z-index: 1;
   }

   .social-icons li a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2em;
      height: 2em;
      border: solid 1px #777777;
      border-radius: 100%;
      color: #777777;
      transition:
         transform 0.375s ease,
         color 0.375s ease,
         background-color 0.375s ease,
         border-color 0.375s ease;
   }

   .social-icons li a svg {
      position: relative;
      display: block;
      width: 60%;
      height: 60%;
      fill: #777777;
      transition: fill 0.375s ease;
   }

   .social-icons a:hover {
      border-color: var(--fill);
      color: var(--fill);
   }

   .social-icons a:hover svg {
      fill: var(--fill);
   }

   .social-icons li a:hover {
      transform: scale(1.1125);
   }

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
      transform: translate(-50%, calc(-100% - 14px));
      transform-origin: bottom center;
      box-shadow: 0 5px 14px rgb(0 0 0 / 0.14);
      z-index: 10000;
      animation:
         tooltip-in
         220ms
         cubic-bezier(0.16, 1, 0.3, 1)
         both;
   }

   .profile-tip::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid var(--fill);
   }

   .tooltip-name {
      display: block;
      font-family: "Inter Tight", sans-serif;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
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

   @keyframes tooltip-in {
      from {
         opacity: 0;
         transform:
            translate(-50%, calc(-100% - 7px))
            scale(0.92);
      }

      to {
         opacity: 1;
         transform:
            translate(-50%, calc(-100% - 14px))
            scale(1);
      }
   }

   .label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
   }

   .heading-card {
      opacity: 1;
      animation:
         heading-enter
         700ms
         cubic-bezier(0.16, 1, 0.3, 1)
         100ms
         both;
   }

   .item-card {
      opacity: 1;
      animation-name: item-enter;
      animation-duration: 820ms;
      animation-timing-function: linear;
      animation-delay: var(--in-delay, 0ms);
      animation-fill-mode: both;
      will-change: transform, opacity;
   }

   .note-card {
      opacity: 1;
      animation:
         note-enter
         700ms
         cubic-bezier(0.16, 1, 0.3, 1)
         500ms
         both;
   }

   @keyframes heading-enter {
      0% {
         opacity: 0;
         transform: translateY(-48px) scale(0.94);
      }

      60% {
         opacity: 1;
         transform: translateY(4px) scale(1.01);
      }

      82% {
         transform: translateY(-1.5px) scale(0.998);
      }

      100% {
         opacity: 1;
         transform: translateY(0) scale(1);
      }
   }

   @keyframes item-enter {
      0% {
         opacity: 0;

         transform:
            translate3d(
               var(--item-start-x),
               0,
               0
            )
            scale(0.95);

         animation-timing-function:
            cubic-bezier(0.16, 1, 0.3, 1);
      }

      52% {
         opacity: 1;

         transform:
            translate3d(
               var(--item-bounce-1),
               0,
               0
            )
            scale(1);

         animation-timing-function:
            cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      68% {
         transform:
            translate3d(
               var(--item-bounce-2),
               0,
               0
            )
            scale(1);

         animation-timing-function:
            cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      81% {
         transform:
            translate3d(
               var(--item-bounce-3),
               0,
               0
            )
            scale(1);

         animation-timing-function:
            cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      91% {
         transform:
            translate3d(
               var(--item-bounce-4),
               0,
               0
            )
            scale(1);

         animation-timing-function:
            ease-out;
      }

      100% {
         opacity: 1;

         transform:
            translate3d(0, 0, 0)
            scale(1);
      }
   }

   @keyframes note-enter {
      0% {
         opacity: 0;
         transform: translateY(42px) scale(0.94);
      }

      60% {
         opacity: 1;
         transform: translateY(-4px) scale(1.01);
      }

      82% {
         transform: translateY(1.5px) scale(0.998);
      }

      100% {
         opacity: 1;
         transform: translateY(0) scale(1);
      }
   }

   .system-groups {
      display: grid;
      gap: 0.75em;
      text-align: left;
   }

   .system-group {
      padding: 0.8em 0.9em;

      border:
         1px solid
         color-mix(
            in srgb,
            var(--fill) 22%,
            transparent
         );

      border-radius: 0.85em;

      background:
         color-mix(
            in srgb,
            var(--fill) 4%,
            transparent
         );

      box-shadow:
         0 4px 14px
         rgb(0 0 0 / 0.035);

      transition:
         border-color 250ms ease,
         background 250ms ease,
         box-shadow 250ms ease;
   }

   .system-group:hover {
      border-color:
         color-mix(
            in srgb,
            var(--fill) 40%,
            transparent
         );

      background:
         color-mix(
            in srgb,
            var(--fill) 7%,
            transparent
         );

      box-shadow:
         0 5px 16px
         rgb(0 0 0 / 0.055);
   }

   .system-group h5 {
      margin:
         0
         0
         0.65em;

      color: var(--fill);

      font-size: 0.88em;
      font-weight: 700;

      letter-spacing: 0.04em;
   }

   .system-items {
      display: grid;
      gap: 0.4em;
   }

   .system-item {
      display: grid;

      grid-template-columns:
         minmax(4.5em, 0.6fr)
         1fr;

      gap: 0.8em;

      align-items: baseline;
   }

   .system-label {
      opacity: 0.62;

      font-size: 0.9em;
      font-weight: 600;
   }

   .system-value {
      min-width: 0;

      color: #777777;

      font-size: 0.9em;

      overflow-wrap: anywhere;
   }

   .stack-levels {
      display: grid;
      gap: 0.8em;
   }

   .stack-section {
      display: grid;
      gap: 0.45em;
   }

   .stack-label {
      opacity: 0.58;

      font-size: 0.82em;
      font-weight: 600;

      letter-spacing: 0.025em;
   }

   .stack-pills {
      display: flex;
      flex-wrap: wrap;

      gap: 0.4em;
   }

   .stack-pill {
      padding:
         0.28em
         0.58em;
      border:
         1px solid
         color-mix(
            in srgb,
            var(--fill) 20%,
            transparent
         );
      border-radius: 0.55em;
      background:
         color-mix(
            in srgb,
            var(--fill) 5%,
            transparent
         );
      color: #777777;
      font-size: 0.82em;
      font-weight: 550;
      line-height: 1.2;
      cursor: default;
      transition:
         background 180ms ease,
         border-color 180ms ease,
         transform 180ms ease;
   }

   .stack-pill:hover {
      border-color:
         color-mix(
            in srgb,
            var(--fill) 38%,
            transparent
         );

      background:
         color-mix(
            in srgb,
            var(--fill) 9%,
            transparent
         );

      transform:
         translateY(-1px);
   }

   .stack-section[data-level="creative"]
   .stack-pill {
      background:
         color-mix(
            in srgb,
            var(--color2) 9%,
            transparent
         );

      border-color:
         color-mix(
            in srgb,
            var(--color2) 28%,
            transparent
         );
   }

   .system-link {
      width: fit-content;

      text-decoration: none;

      transition:
         color 180ms ease,
         opacity 180ms ease;
   }

   .system-link:hover {
      color: var(--fill);
      text-decoration: underline;
      text-underline-offset: 0.18em;
   }

   .social-find-card {
      margin-top: 0.9em;
      padding: 0.8em 0.9em;

      border:
         1px solid
         color-mix(
            in srgb,
            var(--fill) 22%,
            transparent
         );

      border-radius: 0.85em;

      background:
         color-mix(
            in srgb,
            var(--fill) 4%,
            transparent
         );

      box-shadow:
         0 4px 14px
         rgb(0 0 0 / 0.035);

      text-align: left;

      transition:
         border-color 250ms ease,
         background 250ms ease,
         box-shadow 250ms ease;
   }

   .social-find-card:hover {
      border-color:
         color-mix(
            in srgb,
            var(--fill) 40%,
            transparent
         );

      background:
         color-mix(
            in srgb,
            var(--fill) 7%,
            transparent
         );

      box-shadow:
         0 5px 16px
         rgb(0 0 0 / 0.055);
   }

   .social-find-card h5 {
      margin:
         0
         0
         0.65em;

      color: var(--fill);

      font-size: 0.88em;
      font-weight: 700;

      letter-spacing: 0.04em;
   }

   .social-find-items {
      display: grid;
      gap: 0.18em;
   }

   .social-find-item {
      display: grid;

      grid-template-columns:
         minmax(5.5em, 0.65fr)
         1fr;

      gap: 0.8em;

      align-items: baseline;

      padding:
         0.3em
         0.35em;

      border-radius: 0.5em;

      color: inherit;
      text-decoration: none;

      transition:
         background 180ms ease,
         transform 180ms ease;
   }

   .social-find-item:hover {
      background:
         color-mix(
            in srgb,
            var(--fill) 7%,
            transparent
         );

      transform:
         translateX(2px);
   }

   .social-find-label {
      opacity: 0.62;

      font-size: 0.9em;
      font-weight: 600;
   }

   .social-find-value {
      min-width: 0;

      color: #777777;

      font-size: 0.9em;

      overflow-wrap: anywhere;

      transition:
         color 180ms ease;
   }

   .social-find-item:hover
   .social-find-value {
      color: var(--fill);
   }

   .pagination {
      display: flex;
      justify-content: center;
      flex: 0 0 auto;
      font-size: clamp(
         10px,
         calc(5.5px + 1.35vw),
         16px
      );
      gap: 0.45em;
      padding: 0 20px 18px;
      position: relative;
      z-index: 5;
      background: #FBFBFB;
   }

   .pagination::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      top: -2em;
      height: 2em;
      background:
         linear-gradient(
            to bottom,
            transparent 0%,
            rgb(251 251 251 / 0.35) 30%,
            rgb(251 251 251 / 0.75) 65%,
            #FBFBFB 100%
         );
      pointer-events: none;
   }

   .pagination-button {
      position: relative;
      width: auto;
      height: auto;
      padding: 0.35em 0.75em;
      border: 0.145em solid var(--bullet-color);
      border-radius: 0.7em;
      background: var(--bullet-background-color);
      color: var(--bullet-color);
      font-family: "Inter Tight", sans-serif;
      font-size: 0.88em;
      line-height: 1.25;
      cursor: pointer;
      transition:
         background 300ms ease,
         transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1),
         box-shadow 300ms ease;
      font-weight: 600;
   }

   .pagination-button:hover,
   .pagination-button.active {
      background: var(--bullet-active-color);
      box-shadow: 0 0 10px var(--bullet-active-color);
   }

   .pagination-button:hover {
      transform: translateY(-2px);
   }

   .pagination-button::before,
   .pagination-button::after {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      color: var(--fill);
      text-shadow:
         0 0 0.3em var(--fill),
         0 0 0.7em var(--bullet-active-color);
      transform:
         scale(0.2)
         rotate(calc(var(--star-r) - 30deg));
      transition:
         opacity 180ms ease,
         transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1);
   }

   .pagination-button::before {
      content: "✦";
      --star-r: var(--r1);
      top: -0.8em;
      right: -0.65em;
      font-size: 1.1em;
   }

   .pagination-button::after {
      content: "✧";
      --star-r: var(--r2);
      bottom: -0.75em;
      left: -0.6em;
      font-size: 0.9em;
   }

   .pagination-button.active::before,
   .pagination-button.active::after {
      opacity: 1;
      transform:
         scale(1)
         rotate(var(--star-r));
   }

   .pagination-button:hover::before,
   .pagination-button:hover::after {
      animation: sparkle-pop 420ms
         cubic-bezier(0.34, 1.56, 0.64, 1)
         forwards;
   }

   @keyframes sparkle-pop {
      0% {
         opacity: 0;
         transform:
            scale(0.15)
            rotate(calc(var(--star-r) - 35deg));
      }

      55% {
         opacity: 1;
         transform:
            scale(1.35)
            rotate(calc(var(--star-r) + 8deg));
      }

      75% {
         transform:
            scale(0.9)
            rotate(calc(var(--star-r) - 3deg));
      }

      100% {
         opacity: 1;
         transform:
            scale(1)
            rotate(var(--star-r));
      }
   }
</style>

<div
   class="content-slider"
   bind:this={sliderRoot}
>
   <div
      class="slide-scroll"
      bind:this={scrollRegion}
      on:scroll={hideSocialTooltip}
   >
      <div
         class="slide-viewport"
         bind:this={slideViewport}
      >
         {#key activeIndex}
            <div
               class="slide-panel"
               in:swipeIn={{ direction }}
               out:swipeOut
            >
               <div
                  class="slide-content"
                  style={`
                     --item-start-x:${52 * direction}px;
                     --item-bounce-1:${-5 * direction}px;
                     --item-bounce-2:${2.2 * direction}px;
                     --item-bounce-3:${-0.8 * direction}px;
                     --item-bounce-4:${0.25 * direction}px;
                  `}
                  class:centered-content={activeSlide.kind !== "socials"}
               >
                  <div class="heading-card">
                     <h4
                        class:centered-heading={activeSlide.kind === "socials"}
                     >
                        {activeSlide.heading}
                     </h4>
                  </div>

                  {#if activeSlide.kind === "about"}
                     <ul class="content-list">
                        {#each activeSlide.items as item, i (item)}
                           <li
                              class="item-card"
                              use:animateOnScroll
                              style={`--in-delay:${180 + i * 85}ms;`}
                           >
                              <p>{item}</p>
                           </li>
                        {/each}
                     </ul>
                  {:else if activeSlide.kind === "system"}
                     <div class="system-groups">
                        {#each activeSlide.groups as group, i (group.title)}
                           <section
                              class="system-group item-card"
                              use:animateOnScroll
                              style={`--in-delay:${180 + i * 85}ms;`}
                           >
                              <h5>{group.title}</h5>

                              {#if group.kind === "rows"}
                                 <div class="system-items">
                                    {#each group.items as item (item.label)}
                                       <div class="system-item">
                                          <span class="system-label">
                                             {item.label}
                                          </span>
                                          {#if item.url}
                                             <a
                                                class="system-value system-link"
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                             >
                                                {item.value}
                                             </a>
                                          {:else}
                                             <span class="system-value">
                                                {item.value}
                                             </span>
                                          {/if}
                                       </div>
                                    {/each}
                                 </div>
                              {:else if group.kind === "stack"}
                                 <div class="stack-levels">
                                    {#each group.levels as level (level.label)}
                                       <div
                                          class="stack-section"
                                          data-level={level.label}
                                       >
                                          <span class="stack-label">
                                             {level.label}
                                          </span>

                                          <div class="stack-pills">
                                             {#each level.items as tech (tech)}
                                                <span class="stack-pill">
                                                   {tech}
                                                </span>
                                             {/each}
                                          </div>
                                       </div>
                                    {/each}
                                 </div>
                              {/if}
                           </section>
                        {/each}
                     </div>
                  {:else if activeSlide.kind === "socials"}
                     <ul class="social-icons">
                        {#each activeSlide.links as socialLink, i (socialLink.url)}
                           <li
                              class="item-card"
                              use:animateOnScroll
                              style={`--in-delay:${180 + i * 85}ms;`}
                           >
                              <a
                                 href={socialLink.url}
                                 target="_blank"
                                 rel="noreferrer"
                                 aria-label={socialLink.label}
                                 on:mouseenter={(event) =>
                                    showSocialTooltip(
                                       event,
                                       socialLink.label,
                                       socialLink.tooltip || ""
                                    )}
                                 on:mouseleave={hideSocialTooltip}
                                 on:focus={(event) =>
                                    showSocialTooltip(
                                       event,
                                       socialLink.label,
                                       socialLink.tooltip || ""
                                    )}
                                 on:blur={hideSocialTooltip}
                                 on:pointerup={(event) => {
                                    (
                                       event.currentTarget as HTMLElement
                                    ).blur();

                                    hideSocialTooltip();
                                 }}
                              >
                                 <svg aria-hidden="true">
                                    <use href={socialLink.icon}></use>
                                 </svg>

                                 <span class="label">
                                    {socialLink.label}
                                 </span>
                              </a>
                           </li>
                        {/each}
                     </ul>
                     {#if activeSlide.findMe.length}
                        <section
                           class="social-find-card item-card"
                           use:animateOnScroll
                           style="--in-delay:435ms;"
                        >
                           <h5>find me here</h5>

                           <div class="social-find-items">
                              {#each activeSlide.findMe as item (item.label)}
                                 <a
                                    class="social-find-item"
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                 >
                                    <span class="social-find-label">
                                       {item.label}
                                    </span>

                                    <span class="social-find-value">
                                       {item.value}
                                    </span>
                                 </a>
                              {/each}
                           </div>
                        </section>
                     {/if}
                     <div class="note-card">
                        <p class="social-note">
                           {activeSlide.note}
                        </p>
                     </div>
                  {:else}
                     <ul class="content-list">
                        {#each activeSlide.credits as credit, i (credit.url)}
                           <li
                              class="item-card"
                              use:animateOnScroll
                              style={`--in-delay:${180 + i * 85}ms;`}
                           >
                              <p>
                                 <a
                                    href={credit.url}
                                    target="_blank"
                                    rel="noreferrer"
                                 >
                                    {credit.at}
                                 </a>
                                 - {credit.name}
                              </p>
                           </li>
                        {/each}
                     </ul>
                  {/if}
               </div>
            </div>
         {/key}
      </div>
   </div>

   {#if socialTooltip}
      <div
         class="profile-tip"
         style={`--tooltip-x:${socialTooltip.x}px;--tooltip-y:${socialTooltip.y}px;`}
         aria-hidden="true"
      >
         <span class="tooltip-name">
            {socialTooltip.name}
         </span>

         <span class="tooltip-text">
            {socialTooltip.text}
         </span>
      </div>
   {/if}

   <div
      class="pagination"
      aria-label="Profile sections"
   >
      {#each contentSlides as slide, index (slide.label)}
         <button
            type="button"
            class="pagination-button"
            class:active={index === activeIndex}
            aria-pressed={index === activeIndex}
            style={`--r1:${rotationOne(index)}deg;--r2:${rotationTwo(index)}deg;`}
            on:click={() => changeSlide(index)}
         >
            {slide.label}
         </button>
      {/each}
   </div>
</div>
