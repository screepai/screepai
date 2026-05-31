<script lang="ts">
   import { onMount } from "svelte";
   import { contentSlides } from "../config/contents";
   import { setupContentSlider, type SwiperContainerElement } from "./contentSliderSwiper";

   let swiperElement: SwiperContainerElement;

   function renderPaginationBullet(index: number, className: string) {
      const r1 = Math.floor(Math.random() * 40) - 10;
      const r2 = Math.floor(Math.random() * 40) - 30;
      return `<span class="${className}" style="--r1: ${r1}deg; --r2: ${r2}deg">${contentSlides[index]?.label ?? ""}</span>`;
   }

   onMount(() => {
      let cleanup: () => void = () => undefined;
      let cancelled = false;

      void setupContentSlider(swiperElement, renderPaginationBullet).then(removeSwiperListeners => {
         if (cancelled) {
            removeSwiperListeners();
            return;
         }

         cleanup = removeSwiperListeners;
      });

      return () => {
         cancelled = true;
         cleanup();
      };
   });
</script>

<style>
   .slide-content {
      display: block;
      padding: 20px;
      color: #777777;
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 400;
      font-display: swap;
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
      letter-spacing: 0;
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
      align-items: center;
      display: flex;
      justify-content: center;
      border-radius: 100%;
      height: 2em;
      width: 2em;
      transition: transform 0.375s ease, color 0.375s ease,
         background-color 0.375s ease, border-color 0.375s ease;
      border: solid 1px #777777;
      color: #777777;
   }

   .social-icons li a svg {
      display: block;
      position: relative;
      height: 60%;
      width: 60%;
      transition: fill 0.375s ease;
      fill: #777777;
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

   .label {
      display: none;
   }
</style>

<swiper-container bind:this={swiperElement} init="false">
   {#each contentSlides as slide (slide.label)}
      <swiper-slide>
         <div class="slide-content" class:centered-content={slide.kind !== "socials"}>
            <div class="card" data-aos="fade-down">
               <h4 class:centered-heading={slide.kind === "socials"}>{slide.heading}</h4>
            </div>
            {#if slide.kind === "about"}
               <ul class="content-list">
                  {#each slide.items as item, i (item)}
                     <li class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                        <p>{item}</p>
                     </li>
                  {/each}
               </ul>
            {:else if slide.kind === "socials"}
               <ul class="social-icons">
                  {#each slide.links as socialLink, i (socialLink.url)}
                     <li class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                        <a href={socialLink.url} target="_blank" rel="noreferrer"><svg><use xlink:href={socialLink.icon}></use></svg><span class="label">{socialLink.label}</span></a>
                     </li>
                  {/each}
               </ul>
               <div class="card" data-aos="fade-up" data-aos-delay={600}>
                  <p class="social-note">{slide.note}</p>
               </div>
            {:else}
               <ul class="content-list">
                  {#each slide.credits as credit, i (credit.url)}
                     <li class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                        <p><a href={credit.url} target="_blank" rel="noreferrer">{credit.at}</a> - {credit.name}</p>
                     </li>
                  {/each}
               </ul>
            {/if}
         </div>
      </swiper-slide>
   {/each}
</swiper-container>
