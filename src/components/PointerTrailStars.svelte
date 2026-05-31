<script lang="ts">
   import { onMount } from "svelte";

   export let darkMode = false;

   type Position = {
      x: number;
      y: number;
   };

   const originPosition = { x: 0, y: 0 };
   const config = {
      starAnimationDuration: 1500,
      minimumTimeBetweenStars: 250,
      minimumDistanceBetweenStars: 75,
      sizes: ["1.4rem", "1rem", "0.6rem"],
      animations: ["fall-1", "fall-2", "fall-3"]
   };

   const withUnit = (value: number, unit: string) => `${value}${unit}`;
   const px = (value: number) => withUnit(value, "px");
   const ms = (value: number) => withUnit(value, "ms");
   const rand = (max: number) => Math.floor(Math.random() * max);
   const calcElapsedTime = (start: number, end: number) => end - start;

   function calcDistance(a: Position, b: Position) {
      const diffX = b.x - a.x;
      const diffY = b.y - a.y;
      return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
   }

   onMount(() => {
      const removeTimers: ReturnType<typeof setTimeout>[] = [];
      const trailStars: HTMLElement[] = [];
      let count = 0;
      const last = {
         starTimestamp: Date.now(),
         starPosition: originPosition,
         mousePosition: originPosition
      };

      function removeStar(element: HTMLElement) {
         element.remove();
         const index = trailStars.indexOf(element);
         if (index !== -1) {
            trailStars.splice(index, 1);
         }
      }

      function appendStar(element: HTMLElement) {
         document.body.appendChild(element);
         trailStars.push(element);
         const removeTimer = setTimeout(() => removeStar(element), config.starAnimationDuration);
         removeTimers.push(removeTimer);
      }

      function createStar(position: Position) {
         const star = document.createElement("span");
         const themeClass = darkMode ? "dark-mode" : "light-mode";
         const colorVars = ["var(--color1)", "var(--color2)", "var(--color3)", "var(--color4)"];
         const color = colorVars[rand(colorVars.length)];

         star.className = `star fa-solid fa-star ${themeClass}`;
         star.style.left = px(position.x);
         star.style.top = px(position.y);
         star.style.fontSize = config.sizes[rand(config.sizes.length)];
         star.style.color = color;
         star.style.filter = `drop-shadow(0px 0px 0.625rem ${color})`;
         star.style.animationName = config.animations[count++ % config.animations.length];
         star.style.animationDuration = ms(config.starAnimationDuration);

         appendStar(star);
      }

      function updateLastStar(position: Position) {
         last.starTimestamp = Date.now();
         last.starPosition = position;
      }

      function updateLastMousePosition(position: Position) {
         last.mousePosition = position;
      }

      function adjustLastMousePosition(position: Position) {
         if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
            last.mousePosition = position;
         }
      }

      function handleOnMove(position: Position) {
         adjustLastMousePosition(position);

         const now = Date.now();
         const hasMovedFarEnough = calcDistance(last.starPosition, position) >= config.minimumDistanceBetweenStars;
         const hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;

         if (hasMovedFarEnough || hasBeenLongEnough) {
            createStar(position);
            updateLastStar(position);
         }

         updateLastMousePosition(position);
      }

      const handleMouseMove = (event: MouseEvent) => handleOnMove({ x: event.clientX, y: event.clientY });
      const handleTouchMove = (event: TouchEvent) => {
         const touch = event.touches[0];
         if (touch) {
            handleOnMove({ x: touch.clientX, y: touch.clientY });
         }
      };
      const handleMouseLeave = () => updateLastMousePosition(originPosition);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);

      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
         window.removeEventListener("touchmove", handleTouchMove);
         document.body.removeEventListener("mouseleave", handleMouseLeave);
         removeTimers.forEach(timer => clearTimeout(timer));
         trailStars.forEach(star => star.remove());
      };
   });
</script>
