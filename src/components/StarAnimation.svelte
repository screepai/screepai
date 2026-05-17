<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes.js";

   export let darkMode = false;
   
   let starAnimationIntervals: Array<ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>> = [];
   const magicStars = Array.from({ length: 6 }, (_, index) => index);

   onMount(() => {
      const stars = document.getElementsByClassName("magic-star");
      const interval = 1500;

      for (let i = 0; i < stars.length; i++) {
         const star = stars[i];
         const initialDelay = setTimeout(() => {
            animate(star);
            const intervalId = setInterval(() => animate(star), interval);
            starAnimationIntervals.push(intervalId);
         }, i * (interval / stars.length));
         starAnimationIntervals.push(initialDelay);
      }

      const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

      const animate = (star: Element) => {
         const starElement = star as HTMLElement;
         const starPath = starElement.querySelector("path");
         const starSvg = starElement.querySelector("svg");
         if (!starPath || !starSvg) return;

         const colors = ["--color1", "--color2", "--color3", "--color4"];
         const randomColor = colors[Math.floor(Math.random() * colors.length)];
         starElement.style.setProperty("--star-left", `${rand(-30, 130)}%`);
         starElement.style.setProperty("--star-top", `${rand(-30, 130)}%`);
         starElement.style.setProperty("--star-color", `var(${randomColor})`);
         starPath.style.fill = `var(${randomColor})`;

         // Randomize scale
         starElement.style.setProperty("--star-scale", `${rand(70, 100) / 100}`);

         // Randomize rotation speed
         const rotationDuration = rand(1000, 3000);
         starSvg.style.animationDuration = `${rotationDuration}ms`;

         starElement.style.animation = "none";
         void starElement.offsetHeight;
         
         // Randomize animation duration
         const duration = rand(800, 1600);
         starElement.style.animation = `scale ${duration}ms ease forwards`;
      };

      let start = new Date().getTime();
      const originPosition = { x: 0, y: 0 };
      const last = {
         starTimestamp: start,
         starPosition: originPosition,
         mousePosition: originPosition
      };

      const config = {
         starAnimationDuration: 1500,
         minimumTimeBetweenStars: 250,
         minimumDistanceBetweenStars: 75,
         sizes: ["1.4rem", "1rem", "0.6rem"],
         animations: ["fall-1", "fall-2", "fall-3"]
      };

      let count = 0;

      const withUnit = (value: number, unit: string) => `${value}${unit}`;
      const px = (value: number) => withUnit(value, "px");
      const ms = (value: number) => withUnit(value, "ms");

      const calcDistance = (a: { x: number, y: number }, b: { x: number, y: number }) => {
         const diffX = b.x - a.x,
               diffY = b.y - a.y;
         return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
      };

      const calcElapsedTime = (start: number, end: number) => end - start;

      const appendElement = (element: HTMLElement) => document.body.appendChild(element);
      const removeElement = (element: HTMLElement, delay: number) => setTimeout(() => document.body.removeChild(element), delay);

      const createStar = (position: { x: number, y: number }) => {
         const star = document.createElement("span");
         
         const themeClass = darkMode ? "dark-mode" : "light-mode";
         star.classList.add(themeClass);
         
         const colorVars = ["var(--color1)", "var(--color2)", "var(--color3)", "var(--color4)"];
         const color = colorVars[Math.floor(Math.random() * colorVars.length)];
         
         star.className = `star fa-solid fa-star ${themeClass}`;
         star.style.left = px(position.x);
         star.style.top = px(position.y);
         star.style.fontSize = config.sizes[Math.floor(Math.random() * config.sizes.length)];
         star.style.color = color;
         star.style.filter = `drop-shadow(0px 0px 0.625rem ${color})`;
         star.style.animationName = config.animations[count++ % 3];
         star.style.animationDuration = ms(config.starAnimationDuration);
         
         appendElement(star);
         removeElement(star, config.starAnimationDuration);
      };

      const updateLastStar = (position: { x: number, y: number }) => {
         last.starTimestamp = new Date().getTime();
         last.starPosition = position;
      };

      const updateLastMousePosition = (position: { x: number, y: number }) => last.mousePosition = position;

      const adjustLastMousePosition = (position: { x: number, y: number }) => {
         if(last.mousePosition.x === 0 && last.mousePosition.y === 0) {
            last.mousePosition = position;
         }
      };

      const handleOnMove = (e: MouseEvent | Touch) => {
         const mousePosition = { x: e.clientX, y: e.clientY };
         
         adjustLastMousePosition(mousePosition);
         
         const now = new Date().getTime(),
               hasMovedFarEnough = calcDistance(last.starPosition, mousePosition) >= config.minimumDistanceBetweenStars,
               hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;
         
         if (hasMovedFarEnough || hasBeenLongEnough) {
            createStar(mousePosition);
            updateLastStar(mousePosition);
         }
         
         updateLastMousePosition(mousePosition);
      };

      const handleMouseMove = (e: MouseEvent) => handleOnMove(e);
      const handleTouchMove = (e: TouchEvent) => handleOnMove(e.touches[0]);
      const handleMouseLeave = () => updateLastMousePosition(originPosition);

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("touchmove", handleTouchMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);

      return () => {
         window.removeEventListener("mousemove", handleMouseMove);
         window.removeEventListener("touchmove", handleTouchMove);
         document.body.removeEventListener("mouseleave", handleMouseLeave);
         starAnimationIntervals.forEach(id => {
            clearInterval(id);
            clearTimeout(id);
         });
         starAnimationIntervals = [];
      };
   });
</script>

{#each magicStars as starId (starId)}
   <span class="magic-star" class:dark-mode={darkMode} class:light-mode={!darkMode}>
      <svg viewBox="0 0 512 512">
         <path d={star} />
      </svg>
   </span>
{/each} 
