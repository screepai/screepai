<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   export let slide: Extract<
      ContentSlide,
      {
         kind: "credits";
      }
   >;
</script>

<ul class="content-list">
   {#each slide.credits as credit, i (credit.url)}
      <li class="item-card" use:animateOnScroll style={`--in-delay:${180 + i * 85}ms;`}>
         <p>
            <a href={credit.url} target="_blank" rel="noreferrer">
               {credit.at}
            </a>
            - {credit.name}
         </p>
      </li>
   {/each}
</ul>
