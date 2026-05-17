<script lang="ts">
   import { onMount, tick } from "svelte";
   import aos from "aos";
   import { cards, credits, socialLinks, menu } from "../config/contents";

   type SwiperContainerElement = HTMLElement & {
      initialize: () => void;
   };

   const swiperElementStyles = `
      .swiper-pagination {
         position: absolute !important;
      }

      .swiper {
         transition: 200ms ease-in-out;
      }

      .swiper-pagination-bullet {
         position: relative !important;
         padding: 5px 10px !important;
         border-radius: 10px !important;
         width: auto !important;
         height: 20px !important;
         text-align: center !important;
         line-height: 20px !important;
         font-size: 12px !important;
         color: var(--bullet-color) !important;
         border: solid var(--bullet-color) 2px !important;
         opacity: 1 !important;
         background: var(--bullet-background-color) !important;
         font-family: "Inter Tight", sans-serif !important;
         transition: 500ms;
      }

      .swiper-pagination-bullet-active {
         background: var(--bullet-active-color) !important;
         text-decoration: none !important;
         transition: 500ms;
         box-shadow: 0 0 10px var(--bullet-active-color);
      }

      .swiper-pagination-bullet:hover {
         background: var(--bullet-active-color) !important;
         text-decoration: none !important;
         transition: 500ms;
         transform: translateY(-2px);
         box-shadow: 0 0 15px var(--bullet-active-color);
      }

      .swiper-pagination-bullet::before {
         content: "★";
         position: absolute;
         top: -14px;
         right: -10px;
         font-size: 16px;
         color: var(--bullet-color);
         opacity: 0;
         transition: all 0.3s ease;
         transform: scale(0) rotate(-45deg);
         pointer-events: none;
         z-index: 10;
         -webkit-font-smoothing: antialiased;
         -moz-osx-font-smoothing: grayscale;
         backface-visibility: hidden;
      }

      .swiper-pagination-bullet::after {
         content: "✦";
         position: absolute;
         bottom: -14px;
         left: -10px;
         font-size: 14px;
         color: var(--bullet-color);
         opacity: 0;
         transition: all 0.3s ease 0.1s;
         transform: scale(0) rotate(45deg);
         pointer-events: none;
         z-index: 10;
         -webkit-font-smoothing: antialiased;
         -moz-osx-font-smoothing: grayscale;
         backface-visibility: hidden;
      }

      .swiper-pagination-bullet:hover::before,
      .swiper-pagination-bullet-active::before {
         opacity: 1;
         transform: scale(1) rotate(var(--r1));
         top: -14px;
         right: -10px;
      }

      .swiper-pagination-bullet:hover::after,
      .swiper-pagination-bullet-active::after {
         opacity: 1;
         transform: scale(1) rotate(var(--r2));
         bottom: -14px;
         left: -8px;
      }
   `;

   let swiperElement: SwiperContainerElement;

   function renderPaginationBullet(index: number, className: string) {
      const r1 = Math.floor(Math.random() * 40) - 10;
      const r2 = Math.floor(Math.random() * 40) - 30;
      return `<span class="${className}" style="--r1: ${r1}deg; --r2: ${r2}deg">${menu[index]}</span>`;
   }

   function setSwiperHeight() {
      const activeSlide = swiperElement.querySelector("swiper-slide.swiper-slide-active") as HTMLElement | null;
      if (!activeSlide) return;

      const contentDiv = activeSlide.querySelector("div") as HTMLElement;
      const height = contentDiv.offsetHeight + 35;
      swiperElement.style.height = `${height}px`;
   }

   onMount(() => {
      let mounted = true;
      let removeSwiperListeners = () => undefined;

      void (async () => {
         const { register } = await import("swiper/element/bundle");
         register();
         await customElements.whenDefined("swiper-container");
         await tick();
         if (!mounted) return;

         Object.assign(swiperElement, {
            spaceBetween: 150,
            slidesPerView: 1,
            pagination: {
               clickable: true,
               renderBullet: renderPaginationBullet,
            },
            speed: 700,
            allowTouchMove: false,
            watchOverflow: true,
            injectStyles: [swiperElementStyles],
         });

         const handleSlideChangeTransitionStart = () => {
            setSwiperHeight();
            document.querySelectorAll('.card').forEach(card => {
               card.classList.remove('aos-init', 'aos-animate');
            });
         };
         const handleSlideChangeTransitionEnd = () => aos.refresh();

         swiperElement.addEventListener("swiperslidechangetransitionstart", handleSlideChangeTransitionStart);
         swiperElement.addEventListener("swiperslidechangetransitionend", handleSlideChangeTransitionEnd);
         removeSwiperListeners = () => {
            swiperElement.removeEventListener("swiperslidechangetransitionstart", handleSlideChangeTransitionStart);
            swiperElement.removeEventListener("swiperslidechangetransitionend", handleSlideChangeTransitionEnd);
         };

         swiperElement.initialize();
         setTimeout(setSwiperHeight, 250);
      })();

      return () => {
         mounted = false;
         removeSwiperListeners();
      };
   });
</script>

<swiper-container bind:this={swiperElement} init="false">
   <swiper-slide>
      <div class="about" style="text-align: center;">
         <div class="card" data-aos="fade-down">
            <h4>About me</h4>
         </div>
         <ul style="padding-inline-start: 0;">
            {#each cards as card, i (card)}
               <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                  <p>{card}</p>
               </div>
            {/each}
         </ul>
      </div>
   </swiper-slide>
   <swiper-slide>
      <div class="about">
         <div class="card" data-aos="fade-down">
            <h4 style="text-align: center;">Socials</h4>
         </div>
         <ul id="icons02" class="style1 icons">
            {#each socialLinks as socialLink, i (socialLink.url)}
               <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                  <li><a class="n03" href={socialLink.url} target="_blank" rel="noreferrer"><svg><use xlink:href={socialLink.icon}></use></svg><span class="label">{socialLink.label}</span></a></li>
               </div>
            {/each}
         </ul>
         <div class="card" data-aos="fade-up" data-aos-delay={600}>
            <p style="font-size: 12px; text-align: center;">(i dont post anything, just here for the fancy)</p>
         </div>
      </div>
   </swiper-slide>
   <swiper-slide>
      <div class="about" style="text-align: center;">
         <div class="card" data-aos="fade-down">
            <h4>Credits</h4>
         </div>
         <ul style="padding-inline-start: 0;">
            {#each credits as credit, i (credit.url)}
               <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                  <p><a href={credit.url} target="_blank" rel="noreferrer">{credit.at}</a> - {credit.name}</p>
               </div>
            {/each}
         </ul>
      </div>
   </swiper-slide>
</swiper-container> 
