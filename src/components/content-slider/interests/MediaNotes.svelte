<script lang="ts">
   import type { MemoryWipePick } from "../../../config/contents";
   import type { MediaDetails } from "#lib/interests/types.js";
   import { mediaReferenceKey } from "#lib/interests/covers.js";
   import type { ShowTooltip } from "../ProfileTooltip.svelte";
   import MediaTitleLink from "./MediaTitleLink.svelte";

   interface Props {
      note: NonNullable<MemoryWipePick["note"]>;
      media: Readonly<Record<string, MediaDetails>>;
      showTooltip: ShowTooltip;
      hideTooltip: () => void;
   }
   let { note, media, showTooltip, hideTooltip }: Props = $props();
</script>

<p class="media-note">
   {#if typeof note === "string"}
      {note}
   {:else}
      {#each note as part, i (i)}
         {#if typeof part === "string"}
            {part}
         {:else if "url" in part}
            <MediaTitleLink
               href={part.url}
               label={part.text}
               details={media[mediaReferenceKey(part.url) ?? ""]}
               variant="note"
               {showTooltip}
               {hideTooltip}
            />
         {:else}
            <strong>{part.text}</strong>
         {/if}
      {/each}
   {/if}
</p>

<style>
   p {
      grid-column: 2;
      margin: 0;
      padding-left: 0.65em;
      border-left: 1px solid color-mix(in srgb, var(--fill) 20%, transparent);
      color: #74747e;
      font-size: 0.7em;
      line-height: 1.6;
      overflow-wrap: anywhere;
   }
   strong {
      color: #555560;
      font-weight: 650;
   }
</style>
