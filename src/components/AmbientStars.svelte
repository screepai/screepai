<script lang="ts">
   import { onMount } from "svelte";
   import { star } from "../config/shapes";

   export let darkMode = false;

   const magicStars = Array.from({ length: 6 }, (_, index) => index);
   let starElements: HTMLElement[] = [];
   let animationTimers: Array<ReturnType<typeof setInterval> | ReturnType<typeof setTimeout>> = [];

   const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

   function animate(starElement: HTMLElement) {
      const starPath = starElement.querySelector("path");
      const starSvg = starElement.querySelector("svg");
      if (!starPath || !starSvg) return;

      const colors = ["--color1", "--color2", "--color3", "--color4"];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      starElement.style.setProperty("--star-left", `${rand(-30, 130)}%`);
      starElement.style.setProperty("--star-top", `${rand(-30, 130)}%`);
      starElement.style.setProperty("--star-color", `var(${randomColor})`);
      starPath.style.fill = `var(${randomColor})`;
      starElement.style.setProperty("--star-scale", `${rand(70, 100) / 100}`);
      starSvg.style.animationDuration = `${rand(1000, 3000)}ms`;
      starElement.style.animation = "none";
      void starElement.offsetHeight;
      starElement.style.animation = `scale ${rand(800, 1600)}ms ease forwards`;
   }

   onMount(() => {
      const interval = 1500;

      starElements.forEach((starElement, index) => {
         const initialDelay = setTimeout(() => {
            animate(starElement);
            const intervalId = setInterval(() => animate(starElement), interval);
            animationTimers = [...animationTimers, intervalId];
         }, index * (interval / starElements.length));
         animationTimers = [...animationTimers, initialDelay];
      });

      return () => {
         animationTimers.forEach(timer => {
            clearInterval(timer);
            clearTimeout(timer);
         });
         animationTimers = [];
      };
   });
</script>

{#each magicStars as starId (starId)}
   <span bind:this={starElements[starId]} class="magic-star" class:dark-mode={darkMode} class:light-mode={!darkMode}>
      <svg viewBox="0 0 512 512">
         <path d={star} />
      </svg>
   </span>
{/each}
