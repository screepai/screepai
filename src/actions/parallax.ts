import ParallaxJS from "parallax-js";

export function parallax(node: HTMLElement) {
   const instance = new ParallaxJS(node);

   return {
      destroy() {
         instance.destroy();
      },
   };
}
