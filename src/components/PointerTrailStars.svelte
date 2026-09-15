<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes";

   type Position = {
      x: number;
      y: number;
   };

   const POOL_SIZE = 12;

   const config = {
      duration: 1500,
      minimumTimeBetweenStars: 250,
      minimumDistanceBetweenStars: 75,

      sizes: [
         "1.4rem",
         "1rem",
         "0.6rem",
      ],
   };

   const colors = [
      "var(--color1)",
      "var(--color2)",
      "var(--color3)",
      "var(--color4)",
   ];

   const animations: Keyframe[][] = [
      [
         {
            opacity: 0,
            transform:
               "translate3d(0, 0, 0) rotateX(45deg) rotateY(30deg) rotateZ(0deg) scale(0.25)",
         },
         {
            opacity: 1,
            offset: 0.05,
            transform:
               "translate3d(10px, -10px, 0) rotateX(45deg) rotateY(30deg) rotateZ(0deg) scale(1)",
         },
         {
            opacity: 0,
            transform:
               "translate3d(25px, 200px, 0) rotateX(180deg) rotateY(270deg) rotateZ(90deg) scale(1)",
         },
      ],

      [
         {
            opacity: 0,
            transform:
               "translate3d(0, 0, 0) rotateX(-20deg) rotateY(10deg) scale(0.25)",
         },
         {
            opacity: 1,
            offset: 0.1,
            transform:
               "translate3d(-10px, -5px, 0) rotateX(-20deg) rotateY(10deg) scale(1)",
         },
         {
            opacity: 0,
            transform:
               "translate3d(-10px, 160px, 0) rotateX(-90deg) rotateY(45deg) scale(0.25)",
         },
      ],

      [
         {
            opacity: 0,
            transform:
               "translate3d(0, 0, 0) rotateX(0deg) rotateY(45deg) scale(0.5)",
         },
         {
            opacity: 1,
            offset: 0.15,
            transform:
               "translate3d(7px, 5px, 0) rotateX(0deg) rotateY(45deg) scale(1)",
         },
         {
            opacity: 0,
            transform:
               "translate3d(20px, 120px, 0) rotateX(-180deg) rotateY(-90deg) scale(0.5)",
         },
      ],
   ];

   let poolIndex = 0;
   let animationIndex = 0;

   const rand = (max: number) =>
      Math.floor(Math.random() * max);

   function distanceSquared(
      a: Position,
      b: Position
   ) {
      const dx = b.x - a.x;
      const dy = b.y - a.y;

      return dx * dx + dy * dy;
   }

   onMount(() => {
      const layer =
         window.document.createElement("div");

      layer.className =
         "pointer-trail-layer";

      Object.assign(layer.style, {
         position: "fixed",
         inset: "0",
         width: "100vw",
         height: "100vh",
         pointerEvents: "none",
         overflow: "visible",
         zIndex: "999999",
      });

      window.document.body.appendChild(layer);

      const starElements:
         HTMLSpanElement[] = [];

      const runningAnimations:
         (Animation | undefined)[] =
            Array(POOL_SIZE);

      for (
         let index = 0;
         index < POOL_SIZE;
         index++
      ) {
         const element =
            window.document.createElement(
               "span"
            );

         element.setAttribute(
            "aria-hidden",
            "true"
         );

         Object.assign(
            element.style,
            {
               position: "fixed",
               left: "0",
               top: "0",
               display: "block",
               width: "1rem",
               height: "1rem",
               translate: "-50% -50%",
               opacity: "0",
               pointerEvents: "none",
               willChange:
                  "transform, opacity",
            }
         );

         const svg =
            window.document.createElementNS(
               "http://www.w3.org/2000/svg",
               "svg"
            );

         svg.setAttribute(
            "viewBox",
            "0 0 512 512"
         );

         svg.style.display = "block";
         svg.style.width = "100%";
         svg.style.height = "100%";

         const path =
            window.document.createElementNS(
               "http://www.w3.org/2000/svg",
               "path"
            );

         path.setAttribute("d", star);
         path.setAttribute(
            "fill",
            "currentColor"
         );

         svg.appendChild(path);
         element.appendChild(svg);

         layer.appendChild(element);
         starElements.push(element);
      }

      function launchStar(
         position: Position
      ) {
         const index =
            poolIndex++ % POOL_SIZE;

         const element =
            starElements[index];

         if (!element) return;

         runningAnimations[
            index
         ]?.cancel();

         const color =
            colors[
               rand(colors.length)
            ];

         const size =
            config.sizes[
               rand(
                  config.sizes.length
               )
            ];

         element.style.left =
            `${position.x}px`;

         element.style.top =
            `${position.y}px`;

         element.style.width = size;
         element.style.height = size;

         element.style.color =
            color;

         element.style.filter =
            `drop-shadow(0 0 0.625rem ${color})`;

         const keyframes =
            animations[
               animationIndex++ %
               animations.length
            ];

         const animation =
            element.animate(
               keyframes,
               {
                  duration:
                     config.duration,

                  easing:
                     "ease-out",

                  fill:
                     "forwards",
               }
            );

         runningAnimations[
            index
         ] = animation;

         animation.onfinish =
            () => {
               if (
                  runningAnimations[
                     index
                  ] === animation
               ) {
                  runningAnimations[
                     index
                  ] = undefined;
               }
            };
      }

      let lastStarPosition:
         Position | null = null;

      let lastStarTimestamp =
         window.performance.now();

      const minimumDistanceSquared =
         config
            .minimumDistanceBetweenStars *
         config
            .minimumDistanceBetweenStars;

      function handlePointerMove(
         event: PointerEvent
      ) {
         const position: Position = {
            x: event.clientX,
            y: event.clientY,
         };

         const now =
            window.performance.now();

         if (!lastStarPosition) {
            lastStarPosition =
               position;

            lastStarTimestamp =
               now;

            return;
         }

         const movedFarEnough =
            distanceSquared(
               lastStarPosition,
               position
            ) >=
            minimumDistanceSquared;

         const waitedLongEnough =
            now -
               lastStarTimestamp >=
            config
               .minimumTimeBetweenStars;

         if (
            movedFarEnough ||
            waitedLongEnough
         ) {
            launchStar(position);

            lastStarPosition =
               position;

            lastStarTimestamp =
               now;
         }
      }

      window.addEventListener(
         "pointermove",
         handlePointerMove,
         {
            passive: true,
         }
      );

      return () => {
         window.removeEventListener(
            "pointermove",
            handlePointerMove
         );

         runningAnimations.forEach(
            (animation) =>
               animation?.cancel()
         );

         layer.remove();
      };
   });
</script>
