<svelte:head>
   <title>screepy</title>
   <meta property="og:title" content="screepy" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="screepy" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="https://media.discordapp.net/attachments/1043074163004424203/1076733997427740682/FhbziKRVUAAmdiE.png" />
   <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
 </svelte:head>

<script>
   import ParallaxJS from "parallax-js"
   import j from "jquery"
   import aos from "aos"
   import {circOut} from "svelte/easing";
   import {onMount, tick} from "svelte";
   import { fade, fly } from "svelte/transition";
   import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
   import { Swiper, SwiperSlide } from "swiper/svelte";
   import { star, github, twitter, youtube } from "../components/shapes.js"
   import { cards, items, socialLinks } from "../components/contents.js"
   
   import "../styles/global.css"
   import "../styles/swiper.css"
   
   import "swiper/css";
   import "swiper/css/navigation";
   import "swiper/css/pagination";

   let ready = false;
   let visible = false;
   let parallaxInstance;
   let backgroundparallaxInstance;
   const menu = ["About", "Like & Hate", "Socials"];
  
   onMount(async () => {
      ready = true;
      visible = true;
      await tick();
      setTimeout(() => {
         console.log("init aos");
         aos.init({
            easing: "ease-out-back",
            offset: 0,
         });
      }, 3000);

      const scene = document.getElementById("scene");
      const background = document.getElementById("background");
      parallaxInstance = new ParallaxJS(scene);
      backgroundparallaxInstance = new ParallaxJS(background);

      let index = 0, interval = 2000;

      const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      const animate = star => {
         star.style.setProperty("--star-left", `${rand(-20, 110)}%`);
         star.style.setProperty("--star-top", `${rand(-20, 100)}%`);

         star.style.animation = "none";
         star.offsetHeight;
         star.style.animation = "";
      }

      for(const star of document.getElementsByClassName("magic-star")) {
         setTimeout(() => {
            animate(star);
            
            setInterval(() => animate(star), interval);
         }, index++ * (interval / 6))
      }

      const collapsibles = document.querySelectorAll(".collapsible-header");
      let swiper = document.querySelector(`.swiper`);
      let lastActiveCollapsibleBody = null;

      function expand(el) {
         el.style.maxHeight = el.scrollHeight + "px";
         el.classList.add("active");
         swiper.style.height = swiper.offsetHeight + el.scrollHeight + "px";
         lastActiveCollapsibleBody = el;
      }

      function unexpand(el) {
         el.style.maxHeight = null;
         swiper.style.height = swiper.offsetHeight - el.scrollHeight + "px";
         el.classList.remove("active");
      }

      collapsibles.forEach((collapsible) => {
         const collapsibleBody = collapsible.nextElementSibling;

         if (collapsibleBody.classList.contains("active")) {
            expand(collapsibleBody);
         }

         collapsible.addEventListener("click", function () {
            if (!!collapsibleBody.style.maxHeight) {
               unexpand(collapsibleBody);
            } else {
               expand(collapsibleBody);
            }

            j(collapsible).css({
               borderTopLeftRadius: 15, 
               borderTopRightRadius: 15, 
               borderBottomLeftRadius: collapsibleBody.style.maxHeight ? 15 : 0, 
               borderBottomRightRadius: collapsibleBody.style.maxHeight ? 15 : 0 
            })
            .animate({
               borderTopLeftRadius: 15, 
               borderTopRightRadius: 15, 
               borderBottomLeftRadius: collapsibleBody.style.maxHeight ? 0 : 15, 
               borderBottomRightRadius: collapsibleBody.style.maxHeight ? 0 : 15
            }, 500);
         });
      });
   });
   
   function setSwiperHeight() {
      const activeSlide = document.querySelector(".swiper-slide.swiper-slide-active");
      const contentDiv = activeSlide.querySelector("div");
      const height = contentDiv.offsetHeight + 35;
      const swiper = document.querySelector(".swiper");
      swiper.style.height = `${height}px`;
   }
</script>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 40 40" display="none" width="0" height="0">
   <symbol id="icon-969" viewBox="0 0 576 512"><path d={youtube} /></symbol>
   <symbol id="icon-910" viewBox="328 355 335 276"><path d={twitter} /></symbol>
   <symbol id="icon-905" viewBox="0 0 496 512"><path d={github} /></symbol>
</svg>

{#if visible}
   <div class="centered" out:fly="{{y: -20, duration: 800}}">
      {#each "hey there" as char, i}
         <span in:fade="{{delay: i * 120, duration: 800}}">{char}</span>
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
            {#each Array(6) as _, i}
               <span class="magic-star">
                  <svg viewBox="0 0 512 512">
                     <path d={star} />
                  </svg>
               </span>
            {/each}
            <div class="discord">
               <a href="https://discord.com/users/534375062099460097"><img src="https://lanyard.cnrad.dev/api/534375062099460097?theme=light&bg=FBFBFB" alt="screepy"></a>
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
                  setSwiperHeight();
               }}
            >
               <SwiperSlide>
                  <div class="about">
                     <div class="card" data-aos="fade-down">
                        <h4>About me</h4>
                     </div>
                     {#each cards as card, index}
                        <div class="card" data-aos="fade-right" data-aos-delay={(index + 2) * 100}>
                           <p>{card.text}</p>
                        </div>
                     {/each}
                  </div>
               </SwiperSlide>
               <SwiperSlide>
                  <div class="about">
                     <div class="card" data-aos="fade-down">
                        <h4>Like &amp; Hate</h4>
                     </div>
                     {#each items as item, i}
                        <div class="card" data-aos="fade-right" data-aos-delay={200 + (i * 100)}>
                           <button class="collapsible-header">{item.header}</button>
                           <div>
                              <div class="collapsible-content">
                                 {#each item.content as contentItem}
                                    <p class="collapsible-content">{@html contentItem.replace(/\n/g, "<br>")}</p>
                                 {/each}
                              </div>
                           </div>
                        </div>
                     {/each}
                  </div>
               </SwiperSlide>
               <SwiperSlide>
                  <div class="about">
                     <div class="card" data-aos="fade-down">
                        <h4 style="text-align: center;">Socials</h4>
                     </div>
                     <ul id="icons02" class="style1 icons">
                        {#each socialLinks as socialLink, i}
                           <div class="card" data-aos="fade-right" data-aos-delay={200 + i*100}>
                              <li><a class="n03" href={socialLink.url} target="_blank" rel="noreferrer"><svg><use xlink:href={socialLink.icon}></use></svg><span class="label">{socialLink.label}</span></a></li>
                           </div>
                        {/each}
                     </ul>
                  </div>
               </SwiperSlide>
            </Swiper>
            <div class="about" style="text-align: center; border-top: 2px dashed #e1e1e1;">background from <a href="https://twitter.com/tubarururu" target="_blank" rel="noreferrer">@tubarururu</a></div>
         </span>
      </div>
   </div>
{/if}

<style>
   :global(body) {
      background: #f7f8f3;
      background-size: auto;
      background-attachment: fixed;
      height: 100%;
      overflow: hidden;
   }

   ul {
      list-style: none;
   }

   li {
      margin: 0;
      padding: 0;
      border: 0;
      font-size: 100%;
      font: inherit;
      vertical-align: baseline;
   }

   .icons {
      display: flex;
      flex-wrap: wrap;
      justify-content: var(--flex-alignment);
      letter-spacing: 0;
      padding: 0;
      justify-content: center;
      align-items: center;
      text-align: center;
   }

   .icons li {
      position: relative;
      z-index: 1;
   }

   .icons li a {
      align-items: center;
      display: flex;
      justify-content: center;
   }

   .icons li a svg {
      display: block;
      position: relative;
   }

   .icons li a + svg {
      display: block;
      height: 100%;
      left: 0;
      pointer-events: none;
      position: absolute;
      top: 0;
      width: 100%;
      z-index: -1;
   }

   .icons li a .label {
      display: none;
   }

   .icons.style1 {
      font-size: 1.75em;
      gap: 1.375rem;
   }

   .icons.style1 .n04 {
      width: 10rem;
      border-radius: 60px;
      font-size: 20px;
   }

   .icons.style1 li a {
      border-radius: 100%;
      height: 2em;
      width: 2em;
      transition: transform 0.375s ease, color 0.375s ease,
         background-color 0.375s ease, border-color 0.375s ease;
   }

   .icons.style1 li a svg {
      height: 60%;
      width: 60%;
      transition: fill 0.375s ease;
   }

   .icons.style1 a svg {
      fill: #777777;
   }

   .icons.style1 a {
      border: solid 1px #777777;
      color: solid 1px #777777;
   }

   .icons.style1 a:hover {
      border-color: #e98e8c !important;
      color: #e98e8c !important;
   }

   .icons.style1 a:hover svg {
      fill: #e98e8c !important;
   }

   .icons.style1 li a + svg {
      transition: transform 0.375s ease, fill 0.375s ease, stroke 0.375s ease;
   }

   .icons.style1 li a:hover {
      transform: scale(1.1125);
   }

   .icons.style1 li a:hover + svg {
      transform: scale(1.1125);
   }

   .bg {
      height: 110vh !important;
      background: #f7f8f3;
      content: url("https://media.discordapp.net/attachments/623893403339587624/1075435379970293871/background2.webp") !important;
      background-repeat: no-repeat;
   }

   .parallax {
      display: block;
      justify-content: center;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) !important;
   }

   .profile {
      position: relative !important;
      left: -80% !important;
      top: 50% !important;
      max-width: 25.625rem;
      background: #FBFBFB;
      animation: float 2.7s infinite;
      box-shadow: 20px 20px 20px rgba(56, 56, 56, 0.306);
      border-radius: 20px;
      pointer-events: auto !important;
   }

   .profile > .magic {
      display: inline-block;
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 999;
   }

   .profile > .magic > .magic-star {
      --size: clamp(20px, 1.5vw, 30px);
      animation: scale 1000ms ease forwards;
      display: block;
      height: var(--size);
      left: var(--star-left);
      position: absolute;
      top: var(--star-top);
      width: var(--size);
   }

   .profile > .magic > .magic-star > svg {
      animation: rotate 1000ms linear infinite;
      display: block;
      opacity: 0.5;
   }

   .profile > .magic > .magic-star > svg > path {
      fill: #e98e8c;
   }

   .profile::before {
      content: "☆~";
      position: absolute;
      top: -55px;
      left: -15%;
      font-size: 49px;
      rotate: -45deg;
      color: #e98e8c;
   }

   .profile::after {
      content: "";
      position: absolute;
      border: 2px dashed #e98e8c;
      width: 100%;
      height: 100%;
      padding: 10px 10px 10px 10px;
      left: -12px;
      top: -12px;
      align-items: center;
      justify-content: center;
      border-radius: 20px;
   }

   .discord {
      pointer-events: none;
      border-bottom: 2px dashed #e1e1e1;
   }

   .about {
      display: block;
      text-align: justify;
      padding: 20px;
      color: #777777;
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 400;
      font-display: swap;
      /* letter-spacing: 0.04em; */
   }

   .about p {
      margin: 0;
   }

   .about h4 {
      color: #e98e8c;
      margin-top: 0;
   }

   .centered {
      animation: 3s fadeInfadeOut;
      animation-fill-mode: forwards;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%,-50%);
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 200;
      font-display: swap;
      font-size: 46px;
      letter-spacing: 0.04em;
   }

   .centered span {
      will-change: filter;
   }

  @media only screen and (max-width: 767px) {
      .profile {
         left: 0% !important;
         top: 50% !important;
      }
   }
</style>