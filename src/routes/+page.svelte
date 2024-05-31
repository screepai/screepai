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
   import { star, github, twitter, youtube } from "../components/shapes.js";
   import { cards, credits, socialLinks, menu } from "../components/contents.js";

   import "../styles/global.css";
   import "../styles/swiper.css";

   import "swiper/css";
   import "swiper/css/navigation";
   import "swiper/css/pagination";

   let ready = false;
   let visible = false;

   onMount(async () => {
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
         (star as HTMLElement).style.setProperty("--star-left", `${rand(-20, 110)}%`);
         (star as HTMLElement).style.setProperty("--star-top", `${rand(-20, 100)}%`);

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
</script>

<svelte:head>
   <title>screepy</title>
   <meta property="og:title" content="screepy" />
   <meta name="description" content="about me" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="screepy" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="/og.png" />
   <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
</svelte:head>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" display="none" width="0" height="0">
   <symbol id="icon-969" viewBox="0 0 576 512"><path d={youtube} /></symbol>
   <symbol id="icon-910" viewBox="328 355 335 276"><path d={twitter} /></symbol>
   <symbol id="icon-905" viewBox="0 0 496 512"><path d={github} /></symbol>
</svg>

{#if visible}
   <div class="centered" out:fly="{{ y: -20, duration: 800, easing: backInOut }}">
      {#each "(´•ω•`)" as char, i}
         <span in:fade="{{ delay: i * 120, duration: 800, easing: backInOut }}">{char}</span>
      {/each}
   </div>
{/if}

{#if ready}
   <div id="background" transition:fade={{ delay: 2750, duration: 3500, easing: circOut }} class="parallax">
      <div data-depth="0.05" class="bg" />
   </div>
   <div id="scene" transition:fade={{ delay: 2750, duration: 3500, easing: circOut }} class="parallax">
      <div data-depth="0.2" class="profile">
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
                  setTimeout(setSwiperHeight, 500); // how
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