<script lang="ts">
   import type { InterestsResponse } from "#lib/interests/types.js";
   import { swipeIn, playOutAnimations } from "../utils/sliderAnimations";
   import { nextFrame, getSlidePanel, measureVisibleTargetHeight } from "../utils/sliderLayout";
   import AboutSlide from "./content-slider/slides/AboutSlide.svelte";
   import SystemSlide from "./content-slider/slides/SystemSlide.svelte";
   import SocialsSlide from "./content-slider/slides/SocialsSlide.svelte";
   import InterestsSlide from "./content-slider/slides/InterestsSlide.svelte";
   import CreditsSlide from "./content-slider/slides/CreditsSlide.svelte";
   import SlideContent from "./content-slider/SlideContent.svelte";
   import DiscordNote from "./content-slider/DiscordNote.svelte";
   import ProfileTooltip, {
      type TooltipCover,
      type TooltipState,
   } from "./content-slider/ProfileTooltip.svelte";
   import SliderPagination from "./content-slider/SliderPagination.svelte";
   import { onMount, tick } from "svelte";
   import { contentSlides } from "../config/contents";
   import { preloadInterests } from "#lib/interests/client.js";

   const SLIDE_SETTLE_MS = 560;

   let activeIndex = $state(0);
   let renderedIndices = $state([0]);
   let direction = $state(1);
   let enterDelay = $state(0);
   let slideViewport: HTMLDivElement | null = $state(null);
   let sliderRoot: HTMLDivElement | null = $state(null);
   let changingSlide = $state(false);
   let tooltip: TooltipState | null = $state(null);
   let tooltipArrowOffset = $state(0);
   let scrollRegion: HTMLDivElement | null = $state(null);
   let interestsData: InterestsResponse | null = $state(null);
   let interestsLoading = $state(false);
   let interestsError = $state("");

   let activeSlide = $derived(contentSlides[activeIndex]);
   let settleTimeout: number | undefined;

   function showTooltip(
      event: MouseEvent | FocusEvent | HTMLElement,
      name: string,
      text: string,
      cover?: TooltipCover
   ) {
      if (!sliderRoot) return;
      const button = event instanceof HTMLElement ? event : (event.currentTarget as HTMLElement);
      const buttonRect = button.getBoundingClientRect();
      const x = buttonRect.left + buttonRect.width / 2;
      const y = buttonRect.top;
      tooltipArrowOffset =
         event instanceof MouseEvent
            ? Math.min(buttonRect.right, Math.max(buttonRect.left, event.clientX)) -
              (buttonRect.left + buttonRect.width / 2)
            : 0;
      if (
         tooltip?.name === name &&
         tooltip.text === text &&
         tooltip.cover === cover &&
         tooltip.x === x &&
         tooltip.y === y
      ) {
         return;
      }
      tooltip = {
         name,
         text,
         x,
         y,
         cover,
      };
   }

   function hideTooltip(event?: Event) {
      if (tooltip && sliderRoot && event instanceof MouseEvent) {
         const buttonRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
         tooltipArrowOffset =
            Math.min(buttonRect.right, Math.max(buttonRect.left, event.clientX)) -
            (buttonRect.left + buttonRect.width / 2);
      }
      tooltip = null;
   }

   async function loadInterests() {
      if (interestsData || interestsLoading) {
         return;
      }
      interestsLoading = true;
      interestsError = "";
      try {
         interestsData = await preloadInterests();
      } catch (error) {
         console.error("Failed to load interests:", error);
         interestsError = "couldn't load my antidepressant :(";
      } finally {
         interestsLoading = false;
         if (activeSlide.kind === "interests") {
            await tick();
            if (!changingSlide) settleSlideLayout();
         }
      }
   }

   function settleSlideLayout() {
      if (!slideViewport || !scrollRegion) return;
      scrollRegion.style.height = "";
      slideViewport.style.height = "";
   }

   function scheduleSettle() {
      clearTimeout(settleTimeout);
      settleTimeout = window.setTimeout(() => {
         settleTimeout = undefined;
         settleSlideLayout();
      }, SLIDE_SETTLE_MS);
   }

   async function changeSlide(nextIndex: number) {
      if (nextIndex === activeIndex || !slideViewport || !scrollRegion || changingSlide) {
         return;
      }
      changingSlide = true;
      clearTimeout(settleTimeout);
      const viewport = slideViewport;
      const activeScrollRegion = scrollRegion;
      try {
         tooltip = null;
         renderedIndices = [activeIndex, nextIndex];
         await tick();
         const incomingPanel = getSlidePanel(viewport, nextIndex);
         const incomingMotion = incomingPanel?.querySelector<HTMLElement>(".slide-motion");
         const incomingContent = incomingMotion?.querySelector<HTMLElement>(".slide-content");
         if (!incomingPanel || !incomingMotion || !incomingContent) return;

         const targetHeight = incomingContent.offsetHeight;
         const targetVisibleHeight = measureVisibleTargetHeight(
            incomingContent,
            activeScrollRegion
         );
         const currentHeight = viewport.getBoundingClientRect().height;
         const currentVisibleHeight = activeScrollRegion.getBoundingClientRect().height;
         await nextFrame();

         const previousScrollTop = activeScrollRegion.scrollTop;
         direction = nextIndex > activeIndex ? 1 : -1;
         const outgoingPanel = getSlidePanel(viewport, activeIndex);
         let exitFinished: Promise<void> | undefined;
         enterDelay = 0;
         if (outgoingPanel) {
            const exit = playOutAnimations(outgoingPanel, direction);
            exitFinished = exit.finished;
            enterDelay = exit.enterDelay;
            if (previousScrollTop > 0) {
               outgoingPanel.style.translate = `0 ${-previousScrollTop}px`;
            }
         }
         swipeIn(incomingMotion, { direction, delay: enterDelay });
         viewport.style.height = `${currentHeight}px`;
         activeScrollRegion.style.height = `${currentVisibleHeight}px`;
         activeScrollRegion.scrollTop = 0;
         activeIndex = nextIndex;
         incomingPanel.dataset.entryHeight = String(targetVisibleHeight);
         await tick();
         await nextFrame();
         viewport.style.height = `${Math.max(currentHeight, targetHeight)}px`;
         activeScrollRegion.style.height = `${Math.max(currentVisibleHeight, targetVisibleHeight)}px`;
         await exitFinished;
         viewport.style.height = `${targetHeight}px`;
         activeScrollRegion.style.height = `${targetVisibleHeight}px`;
         scheduleSettle();
      } finally {
         renderedIndices = [activeIndex];
         changingSlide = false;
      }
   }

   function syncCurrentHeight() {
      tooltip = null;
      if (changingSlide) {
         return;
      }
      settleSlideLayout();
   }

   onMount(() => {
      const handleVisibilityChange = () => {
         tooltip = null;
         if (!document.hidden && !changingSlide) settleSlideLayout();
      };
      void loadInterests();
      window.addEventListener("resize", syncCurrentHeight);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
         clearTimeout(settleTimeout);
         window.removeEventListener("resize", syncCurrentHeight);
         document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
   });
</script>

<div class="content-slider" bind:this={sliderRoot}>
   <div
      class="slide-scroll"
      data-changing-slide={changingSlide}
      inert={changingSlide}
      bind:this={scrollRegion}
      onscroll={hideTooltip}
   >
      <div class="slide-viewport" bind:this={slideViewport}>
         {#each renderedIndices as index (index)}
            {@const slide = contentSlides[index]}
            <div
               class="slide-panel"
               class:current={index === activeIndex}
               class:preparing={index !== activeIndex && index === renderedIndices.at(-1)}
               data-slide-index={index}
            >
               <div class="slide-motion">
                  <SlideContent
                     heading={slide.heading}
                     socials={slide.kind === "socials"}
                     {direction}
                     {enterDelay}
                  >
                     {#if slide.kind === "about"}
                        <AboutSlide {slide} />
                     {:else if slide.kind === "system"}
                        <SystemSlide {slide} />
                     {:else if slide.kind === "socials"}
                        <SocialsSlide {slide} {showTooltip} {hideTooltip} />
                     {:else if slide.kind === "interests"}
                        <InterestsSlide
                           {slide}
                           {interestsData}
                           {interestsLoading}
                           {interestsError}
                           {showTooltip}
                           {hideTooltip}
                        />
                     {:else}
                        <CreditsSlide {slide} />
                     {/if}
                  </SlideContent>
               </div>
               {#if slide.kind === "socials"}
                  <DiscordNote />
               {/if}
            </div>
         {/each}
      </div>
   </div>

   <ProfileTooltip {tooltip} arrowOffset={tooltipArrowOffset} />

   <SliderPagination slides={contentSlides} {activeIndex} {changeSlide} />
</div>

<style>
   .content-slider {
      position: relative;
      display: flex;
      flex-direction: column;
      width: 100%;
      min-height: 0;
   }

   .slide-viewport {
      position: relative;
      width: 100%;
      overflow: hidden;
      contain: layout;
   }

   .slide-scroll {
      flex: 0 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      overflow-anchor: none;
      -webkit-overflow-scrolling: touch;
      scrollbar-gutter: stable;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--fill) 45%, transparent) transparent;
      transition: height 520ms cubic-bezier(0.22, 1, 0.36, 1);
   }

   .slide-scroll::-webkit-scrollbar {
      width: 5px;
   }

   .slide-scroll::-webkit-scrollbar-track {
      background: transparent;
   }

   .slide-scroll::-webkit-scrollbar-thumb {
      background: color-mix(in srgb, var(--fill) 45%, transparent);
      border-radius: 999px;
   }

   @media (hover: hover) and (pointer: fine) {
      .slide-scroll::-webkit-scrollbar-thumb:hover {
         background: color-mix(in srgb, var(--fill) 70%, transparent);
      }
   }

   .slide-panel {
      position: absolute;
      inset: 0 0 auto;
      pointer-events: none;
   }

   .slide-panel.current {
      position: relative;
      pointer-events: auto;
   }

   .slide-panel.preparing {
      top: auto;
      bottom: 100%;
      visibility: hidden;
   }

   .slide-panel.preparing :global(*) {
      animation-name: none !important;
   }
</style>
