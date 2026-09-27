<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   export let slide: Extract<
      ContentSlide,
      {
         kind: "about";
      }
   >;
</script>

<ul class="content-list">
   {#each slide.items as item, i (item)}
      <li class="item-card" use:animateOnScroll style={`--in-delay:${180 + i * 85}ms;`}>
         <p>{item}</p>
      </li>
   {/each}
</ul>
