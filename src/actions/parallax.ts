import ParallaxJS from "parallax-js";

export function parallax(node: HTMLElement) {
   const instance = new ParallaxJS(node, {
      precision: 0,
   });

   return {
      destroy() {
         instance.destroy();
      },
   };
}
