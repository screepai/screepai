<script lang="ts">
   import { onMount } from "svelte";
   import { installConsoleEasterEgg } from "#lib/backstage.js";
   import { getInitialTheme, getThemeDefinition } from "../config/theme";

   onMount(() => installConsoleEasterEgg(getThemeDefinition(getInitialTheme()).cssVars["--fill"]));
</script>
