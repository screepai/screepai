<script lang="ts">
   import ParallaxJS from "parallax-js";
   import j from "jquery";
   import aos from "aos";
   import { circOut } from "svelte/easing";
   import { onMount, tick } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
   import { Swiper, SwiperSlide } from "swiper/svelte";
   import { star, github, x, youtube } from "../components/shapes.js";
   import { cards, credits, socialLinks, menu } from "../components/contents.js";

   import "../styles/global.css";
   import "../styles/swiper.css";
   import "../styles/checkbox.css";

   import "swiper/css";
   import "swiper/css/navigation";
   import "swiper/css/pagination";

   let ready = false;
   let visible = false;
   let darkMode = false;
   let transitionEnd = true;

   onMount(async () => {
      setThemeFromLocalStorage();
      ready = true;
      visible = true;
      await tick();
      setTimeout(() => {
         aos.init({
            easing: "ease-out-back",
            offset: -999,
         });
      }, 3000);

      setTimeout(() => {
         visible = false;
      }, 2000);

      const scene = document.getElementById("scene");
      const background = document.getElementById("background");
      new ParallaxJS(scene as HTMLElement);
      new ParallaxJS(background as HTMLElement);

      let interval = 2000;

      const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

      const animate = (star: Element) => {
         const colors = ["--color1", "--color2", "--color3", "--color4"];
         const randomColor = colors[Math.floor(Math.random() * colors.length)];
         (star as HTMLElement).style.setProperty("--star-left", `${rand(-5, 95)}%`);
         (star as HTMLElement).style.setProperty("--star-top", `${rand(-5, 95)}%`);
         (star as HTMLElement).style.setProperty("--star-color", `var(${randomColor})`);
         (star as HTMLElement).querySelector("path")!.style.fill = `var(${randomColor})`;

         (star as HTMLElement).style.animation = "none";
         (star as HTMLElement).offsetHeight;
         (star as HTMLElement).style.animation = "";
      };

      const stars = document.getElementsByClassName("magic-star");
      for (let i = 0; i < stars.length; i++) {
         const star = stars[i];
         setTimeout(() => {
               animate(star);
               setInterval(() => animate(star), interval);
            },
            i * (interval / stars.length),
         );
      }
   });

   function setSwiperHeight() {
      const activeSlide = document.getElementsByClassName("swiper-slide swiper-slide-active",)[0] as HTMLElement;
      const contentDiv = activeSlide.querySelector("div") as HTMLElement;
      const height = contentDiv.offsetHeight + 35;
      const swiper = document.getElementsByClassName("swiper",)[0] as HTMLElement;
      swiper.style.height = `${height}px`;
   }

   function calculateSettingAsThemeString({ localStorageTheme, systemSettingDark }: { localStorageTheme: string | null, systemSettingDark: MediaQueryList }) {
      if (localStorageTheme !== null) {
         darkMode = localStorageTheme === "dark";
      } else {
         darkMode = systemSettingDark.matches;
      }
   }

   function setThemeFromLocalStorage() {
      const systemSettingDark = window.matchMedia("(prefers-color-scheme: dark)");
      const localStorageTheme = localStorage.getItem("theme");
      calculateSettingAsThemeString({ localStorageTheme, systemSettingDark });

      systemSettingDark.addEventListener("change", e => {
         darkMode = e.matches;
         saveThemeToLocalStorage(darkMode ? "dark" : "light");
      });
   }

   function toggleTheme() {
      transitionEnd = false;
      darkMode = !darkMode;
      saveThemeToLocalStorage(darkMode ? "dark" : "light");
      setTimeout(() => {
         transitionEnd = true;
      }, 500);
   }

   function saveThemeToLocalStorage(theme: string) {
      localStorage.setItem("theme", theme);
   }
</script>

<svelte:head>
   <title>⸜( ´ ꒳ ` )⸝</title>
   <meta property="og:title" content="⸜( ´ ꒳ ` )⸝" />
   <meta name="description" content="about me" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="seepie" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="/og.png" />
   <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
   <script src="https://code.iconify.design/1/1.0.4/iconify.min.js"></script>
   {#if darkMode}
      <style>
         :root {
            --bg: #232a44;
         }
      </style>
   {:else}
      <style>
         :root {
            --bg: #f7f8f3;
         }
      </style>
   {/if}
</svelte:head>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" display="none" width="0" height="0">
   <symbol id="icon-969" viewBox="0 0 576 512"><path d={youtube} /></symbol>
   <symbol id="icon-910" viewBox="0 0 16 16"><path d={x} /></symbol>
   <symbol id="icon-905" viewBox="0 0 496 512"><path d={github} /></symbol>
</svg>

{#if visible}
   <div class="centered" out:fly="{{ y: -20, duration: 800, easing: backInOut }}" class:light-mode={!darkMode} class:dark-mode={darkMode}>
      {#each "(´•ω•`)" as char, i}
         <span in:fade="{{ delay: i * 120, duration: 800, easing: backInOut }}">{char}</span>
      {/each}
   </div>
{/if}

{#if ready}
   <div id="background" transition:fade={{ delay: 2750, duration: 3500, easing: circOut }} class="parallax">
      <div data-depth="0.05" class="bg dark-mode" style:opacity="{darkMode ? 1 : 0}" style:z-index="{!darkMode && transitionEnd ? 0 : 1}"></div>
      <div data-depth="0.05" class="bg light-mode" style:opacity="{darkMode ? 0 : 1}" style:z-index="{darkMode && transitionEnd ? 0 : 2}"></div>
   </div>
   <div id="scene" transition:fade={{ delay: 2750, duration: 3500, easing: circOut }} class="parallax">
      <div data-depth="0.15" class:light-mode={!darkMode} class:dark-mode={darkMode} class="profile">
         <label>
            <input class="toggle-checkbox" type="checkbox" bind:checked={darkMode} on:click={toggleTheme}>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div class="toggle-slot">
               <div class="sun-icon-wrapper">
                  <div class="iconify sun-icon" data-icon="feather-sun" data-inline="false"></div>
               </div>
               <div class="toggle-button"></div>
               <div class="moon-icon-wrapper">
                  <div class="iconify moon-icon" data-icon="feather-moon" data-inline="false"></div>
               </div>
            </div>
         </label>
         <span class="magic">
            {#each Array(6) as _}
               <span class="magic-star">
                  <svg viewBox="0 0 512 512">
                     <path d={star} />
                  </svg>
               </span>
            {/each}
            <div class="discord">
               <a href="https://discord.com/users/534375062099460097"><img src="https://lanyard.cnrad.dev/api/534375062099460097?theme=light&bg=FBFBFB&idleMessage=( ´ ω ` )ノﾞ&hideDiscrim=true&showDisplayName=true&hideBadges=true" alt="screepy"/></a>
            </div>
            <Swiper
               modules={[Navigation, Pagination, Scrollbar, A11y]}
               spaceBetween={150}
               slidesPerView={1}
               pagination={{
                  clickable: true,
                  renderBullet: function (index, className) {
                     return `<span class=${className}>${menu[index]}</span>`;
                  },
               }}
               speed={700}
               allowTouchMove={false}
               watchOverflow={true}
               on:slideChangeTransitionStart={() => {
                  setSwiperHeight();
                  j(".card").removeClass("aos-init").removeClass("aos-animate");
               }}
               on:slideChangeTransitionEnd={() => {
                  aos.refresh();
               }}
               on:swiper={() => {
                  setTimeout(setSwiperHeight, 250); // how
               }}
            >
               <SwiperSlide>
                  <div class="about" style="text-align: center;">
                     <div class="card" data-aos="fade-down">
                        <h4>About me</h4>
                     </div>
                     <ul style="padding-inline-start: 0;">
                        {#each cards as card, i}
                           <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                              <p>{card}</p>
                           </div>
                        {/each}
                     </ul>
                  </div>
               </SwiperSlide>
               <SwiperSlide>
                  <div class="about">
                     <div class="card" data-aos="fade-down">
                        <h4 style="text-align: center;">Socials</h4>
                     </div>
                     <ul id="icons02" class="style1 icons">
                        {#each socialLinks as socialLink, i}
                           <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                              <li><a class="n03" href={socialLink.url} target="_blank" rel="noreferrer"><svg><use xlink:href={socialLink.icon}></use></svg><span class="label">{socialLink.label}</span></a></li>
                           </div>
                        {/each}
                     </ul>
                     <div class="card" data-aos="fade-up" data-aos-delay={600}>
                        <p style="font-size: 12px; text-align: center;">( i dont post anything, just here for the fancy )</p>
                     </div>
                  </div>
               </SwiperSlide>
               <SwiperSlide>
                  <div class="about" style="text-align: center;">
                     <div class="card" data-aos="fade-down">
                        <h4>Credits</h4>
                     </div>
                     <ul style="padding-inline-start: 0;">
                        {#each credits as credit, i}
                           <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                              <p><a href={credit.url} target="_blank" rel="noreferrer">{credit.at}</a> - {credit.name}</p>
                           </div>
                        {/each}
                     </ul>
                  </div>
               </SwiperSlide>
            </Swiper>
         </span>
      </div>
   </div>
{/if}