import { tick } from "svelte";
import aos from "aos";

export type SwiperContainerElement = HTMLElement & {
   initialize: () => void;
};

type RenderPaginationBullet = (index: number, className: string) => string;

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

function setSwiperHeight(swiperElement: SwiperContainerElement) {
   const content = swiperElement.querySelector("swiper-slide.swiper-slide-active .slide-content") as HTMLElement | null;
   if (!content) return;

   swiperElement.style.height = `${content.offsetHeight + 35}px`;
}

function resetLocalAosCards(swiperElement: SwiperContainerElement) {
   swiperElement.querySelectorAll(".card").forEach(card => {
      card.classList.remove("aos-init", "aos-animate");
   });
}

export async function setupContentSlider(swiperElement: SwiperContainerElement, renderPaginationBullet: RenderPaginationBullet) {
   const { register } = await import("swiper/element/bundle");
   register();
   await customElements.whenDefined("swiper-container");
   await tick();

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
      setSwiperHeight(swiperElement);
      resetLocalAosCards(swiperElement);
   };
   const handleSlideChangeTransitionEnd = () => aos.refresh();

   swiperElement.addEventListener("swiperslidechangetransitionstart", handleSlideChangeTransitionStart);
   swiperElement.addEventListener("swiperslidechangetransitionend", handleSlideChangeTransitionEnd);

   swiperElement.initialize();
   const heightTimer = setTimeout(() => setSwiperHeight(swiperElement), 250);

   return () => {
      clearTimeout(heightTimer);
      swiperElement.removeEventListener("swiperslidechangetransitionstart", handleSlideChangeTransitionStart);
      swiperElement.removeEventListener("swiperslidechangetransitionend", handleSlideChangeTransitionEnd);
   };
}
