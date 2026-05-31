<script lang="ts">
   import AmbientStars from "./AmbientStars.svelte";
   import PointerTrailStars from "./PointerTrailStars.svelte";

   export let darkMode = false;
</script>

<AmbientStars {darkMode} />
<PointerTrailStars {darkMode} />
