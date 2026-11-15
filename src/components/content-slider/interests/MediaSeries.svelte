<script lang="ts">
   import { mediaReferenceKey } from "#lib/interests/covers.js";
   import type { MediaDetails } from "#lib/interests/types.js";
   import type { MemoryWipePick } from "../../../config/contents";
   import type { ShowTooltip } from "../ProfileTooltip.svelte";
   import MediaTitleLink from "./MediaTitleLink.svelte";
   import MediaNotes from "./MediaNotes.svelte";
   import { mediaSeriesTitle } from "#lib/interests/series.js";
   import { animateDisclosure } from "../../../actions/animateDisclosure";

   interface Props {
      parts: readonly MemoryWipePick[];
      media: Readonly<Record<string, MediaDetails>>;
      showTooltip: ShowTooltip;
      hideTooltip: () => void;
   }

   let { parts, media, showTooltip, hideTooltip }: Props = $props();
   let title = $derived(mediaSeriesTitle(parts, media));
</script>

<details class="media-series" use:animateDisclosure>
   <summary>
      <span class="series-title">{title}</span>
      <span class="parts-count">
         {parts.length}
         {parts.length === 1 ? "title" : "titles"}
         <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
            <path
               d="m4.5 2.5 3.5 3.5-3.5 3.5"
               fill="none"
               stroke="currentColor"
               stroke-width="1.4"
            />
         </svg>
      </span>
   </summary>
   <div class="series-parts">
      {#each parts as part (part.url)}
         <div class="series-part">
            <MediaTitleLink
               href={part.url}
               details={media[mediaReferenceKey(part.url) ?? ""]}
               {showTooltip}
               {hideTooltip}
            />
            {#if part.note}<MediaNotes note={part.note} {media} {showTooltip} {hideTooltip} />{/if}
         </div>
      {/each}
   </div>
</details>

<style>
   .media-series {
      min-width: 0;
   }

   summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.25em;
      min-height: 28px;
      padding: 0.12em 0;
      border-radius: 5px;
      color: color-mix(in srgb, var(--fill) 24%, #777777);
      font-size: 0.8em;
      cursor: pointer;
      list-style: none;
      touch-action: manipulation;
   }

   @media (hover: hover) and (pointer: fine) {
      summary:hover .series-title {
         color: color-mix(in srgb, var(--fill) 50%, #777777);
      }
   }

   summary::-webkit-details-marker {
      display: none;
   }

   summary:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
   }

   .series-title {
      flex: 1;
      min-width: 0;
      font-weight: 700;
      line-height: 1.4;
      overflow-wrap: anywhere;
   }

   .parts-count {
      display: flex;
      align-items: center;
      gap: 0.35em;
      flex-shrink: 0;
      color: var(--text-muted);
      font-size: 0.8em;
      font-variant-numeric: tabular-nums;
   }

   .parts-count svg {
      transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1);
   }

   .media-series:global([data-expanded="true"]) .parts-count svg {
      transform: rotate(90deg);
   }

   .series-parts {
      display: grid;
      gap: 0.25em;
      margin: 0.4em 0 0.35em 0.12em;
      padding: 0 0 0 0.65em;
      border-left: 1.5px solid color-mix(in srgb, var(--fill) 22%, transparent);
   }

   .series-part {
      min-width: 0;
      padding: 0.5em 0 0.6em;
   }

   .series-part :global(.media-note) {
      margin-top: 0.4em;
   }
</style>
