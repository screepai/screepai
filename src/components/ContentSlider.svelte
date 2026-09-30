<script lang="ts">
   import type { InterestsResponse } from "$lib/interests/types";
   import { swipeIn, swipeOut, playOutAnimations } from "../utils/sliderAnimations";
   import {
      nextFrame,
      getSlidePanel,
      measureVisibleTargetHeight,
      resetScrollSmoothly,
   } from "../utils/sliderLayout";
   import AboutSlide from "./content-slider/slides/AboutSlide.svelte";
   import SystemSlide from "./content-slider/slides/SystemSlide.svelte";
   import SocialsSlide from "./content-slider/slides/SocialsSlide.svelte";
   import InterestsSlide from "./content-slider/slides/InterestsSlide.svelte";
   import CreditsSlide from "./content-slider/slides/CreditsSlide.svelte";
   import SlideContent from "./content-slider/SlideContent.svelte";
   import DiscordNote from "./content-slider/DiscordNote.svelte";
   import ProfileTooltip from "./content-slider/ProfileTooltip.svelte";
   import SliderPagination from "./content-slider/SliderPagination.svelte";
   import { onMount, tick } from "svelte";
   import { contentSlides } from "../config/contents";
   import { preloadInterests } from "$lib/interests/client";

   type TooltipState = {
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
   let tooltip: TooltipState | null = null;
   let scrollRegion: HTMLDivElement | null = null;
   let interestsData: InterestsResponse | null = null;
   let interestsLoading = false;
   let interestsError = "";

   $: activeSlide = contentSlides[activeIndex];

   function showTooltip(event: MouseEvent | FocusEvent, name: string, text: string) {
      if (!sliderRoot) return;
      const button = event.currentTarget as HTMLElement;
      const buttonRect = button.getBoundingClientRect();
      const rootRect = sliderRoot.getBoundingClientRect();
      tooltip = {
         name,
         text,
         x: buttonRect.left + buttonRect.width / 2 - rootRect.left,
         y: buttonRect.top - rootRect.top,
      };
   }

   function hideTooltip() {
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
            syncActiveSlideLayout();
         }
      }
   }

   function syncActiveSlideLayout() {
      if (!slideViewport || !scrollRegion) {
         return;
      }
      const viewport = slideViewport;
      const activeScrollRegion = scrollRegion;
      const activePanel = getSlidePanel(viewport, activeIndex);
      if (!activePanel) return;
      const activeContent = activePanel.querySelector<HTMLElement>(".slide-content");
      if (!activeContent) return;
      viewport.style.minHeight = "";
      const targetHeight = activeContent.offsetHeight;
      const previousViewportTransition = viewport.style.transition;
      const previousScrollTransition = activeScrollRegion.style.transition;
      viewport.style.transition = "none";
      activeScrollRegion.style.transition = "none";
      viewport.style.height = `${targetHeight}px`;
      activeScrollRegion.style.height = "";
      void viewport.offsetHeight;
      void activeScrollRegion.offsetHeight;
      viewport.style.transition = previousViewportTransition;
      activeScrollRegion.style.transition = previousScrollTransition;
      changingSlide = false;
   }

   function normalizeCurrentSlideLayout() {
      if (!slideViewport || !scrollRegion) {
         return;
      }
      const viewport = slideViewport;
      const activeScrollRegion = scrollRegion;
      const panels = viewport.querySelectorAll<HTMLElement>(".slide-panel");
      const activePanel = panels[panels.length - 1];
      if (!activePanel) return;
      const activeContent = activePanel.querySelector<HTMLElement>(".slide-content");
      if (!activeContent) return;
      const previousViewportTransition = viewport.style.transition;
      const previousScrollTransition = activeScrollRegion.style.transition;
      viewport.style.transition = "none";
      activeScrollRegion.style.transition = "none";
      viewport.style.height = `${activeContent.offsetHeight}px`;
      activeScrollRegion.style.height = "";
      viewport.style.minHeight = "";
      void viewport.offsetHeight;
      viewport.style.transition = previousViewportTransition;
      activeScrollRegion.style.transition = previousScrollTransition;
   }

   async function changeSlide(nextIndex: number) {
      if (nextIndex === activeIndex || !slideViewport || changingSlide) {
         return;
      }
      changingSlide = true;
      tooltip = null;
      const viewport = slideViewport;
      const currentHeight = viewport.getBoundingClientRect().height;
      const currentScrollRegion = scrollRegion;
      const previousScrollTop = currentScrollRegion?.scrollTop ?? 0;
      const previousMinHeight = viewport.style.minHeight;
      if (currentScrollRegion && previousScrollTop > 0) {
         viewport.style.minHeight = `${viewport.scrollHeight}px`;
      }
      viewport.style.height = `${currentHeight}px`;
      direction = nextIndex > activeIndex ? 1 : -1;
      const outgoingPanel = getSlidePanel(viewport, activeIndex);
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
      const incomingPanel = getSlidePanel(viewport, nextIndex);
      if (!incomingPanel) {
         changingSlide = false;
         return;
      }
      const incomingContent = incomingPanel.querySelector<HTMLElement>(".slide-content");
      if (!incomingContent) {
         changingSlide = false;
         return;
      }
      const targetHeight = incomingContent.offsetHeight;
      const currentVisibleHeight = activeScrollRegion.getBoundingClientRect().height;
      const targetVisibleHeight = measureVisibleTargetHeight(incomingContent, activeScrollRegion);
      activeScrollRegion.style.height = `${currentVisibleHeight}px`;
      resetScrollSmoothly(activeScrollRegion);
      await nextFrame();
      requestAnimationFrame(() => {
         viewport.style.height = `${targetHeight}px`;
         activeScrollRegion.style.height = `${targetVisibleHeight}px`;
      });
      window.setTimeout(() => {
         viewport.style.minHeight = previousMinHeight;
         activeScrollRegion.style.height = "";
         normalizeCurrentSlideLayout();
         changingSlide = false;
      }, 440);
   }

   function syncCurrentHeight() {
      tooltip = null;
      if (changingSlide) {
         return;
      }
      syncActiveSlideLayout();
   }

   onMount(() => {
      let mounted = true;
      async function init() {
         await tick();
         if (!mounted || !slideViewport) return;
         const viewport = slideViewport;
         const panel = viewport.querySelector<HTMLElement>(".slide-panel");
         if (!panel) return;
         const content = panel.querySelector<HTMLElement>(".slide-content");
         if (!content) return;
         viewport.style.transition = "none";
         viewport.style.height = `${content.offsetHeight}px`;
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               if (!mounted) return;
               viewport.style.transition = "";
            });
         });
      }
      const handleVisibilityChange = () => {
         tooltip = null;
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
      void loadInterests();
      window.addEventListener("resize", syncCurrentHeight);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () => {
         mounted = false;
         window.removeEventListener("resize", syncCurrentHeight);
         document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
   });
</script>

<div class="content-slider" bind:this={sliderRoot}>
   <DiscordNote visible={activeSlide.kind === "socials"} />

   <div class="slide-scroll" bind:this={scrollRegion} on:scroll={hideTooltip}>
      <div class="slide-viewport" bind:this={slideViewport}>
         {#key activeIndex}
            <div
               class="slide-panel"
               data-slide-index={activeIndex}
               in:swipeIn={{ direction }}
               out:swipeOut={{ direction }}
            >
               <SlideContent
                  heading={activeSlide.heading}
                  socials={activeSlide.kind === "socials"}
                  {direction}
               >
                  {#if activeSlide.kind === "about"}
                     <AboutSlide slide={activeSlide} />
                  {:else if activeSlide.kind === "system"}
                     <SystemSlide slide={activeSlide} />
                  {:else if activeSlide.kind === "socials"}
                     <SocialsSlide slide={activeSlide} {showTooltip} {hideTooltip} />
                  {:else if activeSlide.kind === "interests"}
                     <InterestsSlide
                        slide={activeSlide}
                        {interestsData}
                        {interestsLoading}
                        {interestsError}
                        {showTooltip}
                        {hideTooltip}
                     />
                  {:else}
                     <CreditsSlide slide={activeSlide} />
                  {/if}
               </SlideContent>
            </div>
         {/key}
      </div>
   </div>

   {#if tooltip}
      <ProfileTooltip {...tooltip} />
   {/if}

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
      display: grid;
      position: relative;
      width: 100%;
      overflow: hidden;
      transition: height 420ms cubic-bezier(0.22, 1, 0.36, 1);
   }

   .slide-scroll {
      flex: 0 1 auto;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      -webkit-overflow-scrolling: touch;
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

   .slide-scroll::-webkit-scrollbar-thumb:hover {
      background: color-mix(in srgb, var(--fill) 70%, transparent);
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
</style>
