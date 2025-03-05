<script lang="ts">
   import { Navigation, Pagination, Scrollbar, A11y } from "swiper";
   import { Swiper, SwiperSlide } from "swiper/svelte";
   import aos from "aos";
   import j from "jquery";
   import { cards, credits, socialLinks, menu } from "../config/contents";

   function setSwiperHeight() {
      const activeSlide = document.getElementsByClassName("swiper-slide swiper-slide-active",)[0] as HTMLElement;
      const contentDiv = activeSlide.querySelector("div") as HTMLElement;
      const height = contentDiv.offsetHeight + 35;
      const swiper = document.getElementsByClassName("swiper",)[0] as HTMLElement;
      swiper.style.height = `${height}px`;
   }
</script>

<Swiper
   modules={[Navigation, Pagination, Scrollbar, A11y]}
   spaceBetween={150}
   slidesPerView={1}
   pagination={{
      clickable: true,
      // @ts-ignore
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
      setTimeout(setSwiperHeight, 250);
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