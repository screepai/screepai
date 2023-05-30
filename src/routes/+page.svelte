<svelte:head>
   <title>screepy</title>
   <meta property="og:title" content="screepy" />
   <meta name="description" content="about me" />
   <meta property="og:description" content="about me" />
   <meta property="og:url" content="https://screepai.vercel.app/" />
   <meta property="og:type" content="website" />
   <meta property="og:site_name" content="screepy" />
   <meta property="twitter:card" content="summary_large_image" />
   <meta property="og:image" content="https://media.discordapp.net/attachments/1043074163004424203/1076733997427740682/FhbziKRVUAAmdiE.png" />
   <meta name="theme-color" content="#fe7585" />
   <link rel="stylesheet" href="https://unpkg.com/aos@next/dist/aos.css" />
</svelte:head>

<script lang="ts">
   import ParallaxJS from "parallax-js"
   import j from "jquery"
   import aos from "aos"
   import { circOut } from "svelte/easing";
   import { onMount, tick } from "svelte";
   import { fade, fly } from "svelte/transition";
   import { backInOut } from "svelte/easing";
   import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
   import { Swiper, SwiperSlide } from "swiper/svelte";
   import { star, github, twitter, youtube } from "../components/shapes.js"
   import { cards, items, socialLinks, menu } from "../components/contents.js"
   
   import "../styles/global.css"
   import "../styles/swiper.css"
   
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
      }

      const stars = document.getElementsByClassName("magic-star");
      for (let i = 0; i < stars.length; i++) {
         const star = stars[i];
         setTimeout(() => {
            animate(star);
            setInterval(() => animate(star), interval);
         }, i * (interval / stars.length))
      }

      const collapsibles = document.querySelectorAll(".collapsible-header");
      let swiper = document.querySelector(`.swiper`);
      let lastActiveCollapsibleBody = null;

      function expand(el: HTMLElement) {
         el.style.maxHeight = el.scrollHeight + "px";
         (swiper as HTMLElement).style.height = (swiper as HTMLElement).offsetHeight + el.scrollHeight + "px";
         el.classList.add("active");
         lastActiveCollapsibleBody = el;
      }

      function unexpand(el: HTMLElement) {
         el.style.maxHeight = "";
         (swiper as HTMLElement).style.height = (swiper as HTMLElement).offsetHeight - el.scrollHeight + "px";
         el.classList.remove("active");
      }

      collapsibles.forEach((collapsible) => {
         const collapsibleBody = collapsible.nextElementSibling;
         if (!collapsibleBody) return console.log("collapsibleBody is null");


         if (collapsibleBody.classList.contains("active")) {
            expand(collapsibleBody as HTMLElement);
         }

         collapsible.addEventListener("click", function () {
            if (!!(collapsibleBody as HTMLElement).style.maxHeight) {
               unexpand(collapsibleBody as HTMLElement);
            } else {
               expand(collapsibleBody as HTMLElement);
            }

            j(collapsible).css({
               borderTopLeftRadius: 15, 
               borderTopRightRadius: 15, 
               borderBottomLeftRadius: (collapsibleBody as HTMLElement).style.maxHeight ? 15 : 0, 
               borderBottomRightRadius: (collapsibleBody as HTMLElement).style.maxHeight ? 15 : 0 
            })
            .animate({
               borderTopLeftRadius: 15,
               borderTopRightRadius: 15,
               borderBottomLeftRadius: (collapsibleBody as HTMLElement).style.maxHeight ? 0 : 15, 
               borderBottomRightRadius: (collapsibleBody as HTMLElement).style.maxHeight ? 0 : 15
            }, 500);
         });
      });
   });
   
   function setSwiperHeight() {
      const activeSlide = document.querySelector(".swiper-slide.swiper-slide-active");
      const contentDiv = activeSlide?.querySelector("div");
      if (contentDiv) {
         const height = contentDiv.offsetHeight + 35;
         const swiper = document.querySelector(".swiper");
         (swiper as HTMLElement).style.height = `${height}px`;
      } else {
         location.reload();
      }
   }
</script>

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
               <a href="https://discord.com/users/534375062099460097"><img src="https://lanyard.cnrad.dev/api/534375062099460097?theme=light&bg=FBFBFB&idleMessage=( ´ ω ` )ノﾞ" alt="screepy"></a>
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
                  <div class="about">
                     <div class="card" data-aos="fade-down">
                        <h4>About me</h4>
                     </div>
                     {#each cards as card, i}
                        <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
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
                        <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
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
                           <div class="card" data-aos="fade-right" data-aos-delay={(i + 2) * 100}>
                              <li><a class="n03" href={socialLink.url} target="_blank" rel="noreferrer"><svg><use xlink:href={socialLink.icon}></use></svg><span class="label">{socialLink.label}</span></a></li>
                           </div>
                        {/each}
                     </ul>
                  </div>
               </SwiperSlide>
            </Swiper>
            <div class="about" style="text-align: center; border-top: 2px dashed #e1e1e1;">background art by <a href="https://twitter.com/tubarururu" target="_blank" rel="noreferrer">@tubarururu</a></div>
         </span>
      </div>
   </div>
{/if}