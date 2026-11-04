<script lang="ts">
   import AmbientStars from "./AmbientStars.svelte";
   import PointerTrailStars from "./PointerTrailStars.svelte";
   interface Props {
      darkMode?: boolean;
   }

   let { darkMode = false }: Props = $props();
</script>

<AmbientStars {darkMode} />
<PointerTrailStars />
