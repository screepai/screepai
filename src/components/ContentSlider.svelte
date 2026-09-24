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

      if (scrollRegion) {
         scrollRegion.scrollTop = 0;
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

      await nextFrame();

      viewport.style.height = `${targetHeight}px`;

      window.setTimeout(() => {
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

      void init();

      window.addEventListener("resize", syncCurrentHeight);

      return () => {
         mounted = false;
         window.removeEventListener("resize", syncCurrentHeight);
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
      font-size: 12px;
      text-align: center;
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
         transform: translate3d(-52px, 0, 0) scale(0.95);
         animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }

      52% {
         opacity: 1;
         transform: translate3d(5px, 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      68% {
         transform: translate3d(-2.2px, 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      81% {
         transform: translate3d(0.8px, 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }

      91% {
         transform: translate3d(-0.25px, 0, 0) scale(1);
         animation-timing-function: ease-out;
      }

      100% {
         opacity: 1;
         transform: translate3d(0, 0, 0) scale(1);
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
                              style={`--in-delay:${180 + i * 85}ms;`}
                           >
                              <p>{item}</p>
                           </li>
                        {/each}
                     </ul>
                  {:else if activeSlide.kind === "socials"}
                     <ul class="social-icons">
                        {#each activeSlide.links as socialLink, i (socialLink.url)}
                           <li
                              class="item-card"
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
