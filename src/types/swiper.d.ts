declare module 'swiper' {
   export const Navigation: any;
   export const Pagination: any;
   export const Scrollbar: any;
   export const A11y: any;
}

declare module 'swiper/svelte' {
   import { SvelteComponentTyped } from 'svelte';
   
   export class Swiper extends SvelteComponentTyped<{
      modules?: any[];
      spaceBetween?: number;
      slidesPerView?: number;
      pagination?: any;
      speed?: number;
      allowTouchMove?: boolean;
      watchOverflow?: boolean;
      on?: {
         slideChangeTransitionStart?: () => void;
         slideChangeTransitionEnd?: () => void;
         swiper?: () => void;
      };
   }> {}
   
   export class SwiperSlide extends SvelteComponentTyped<Record<string, never>> {}
} 