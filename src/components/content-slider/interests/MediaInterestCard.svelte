<script lang="ts">
   import type { InterestCollection, RankedInterest } from "$lib/interests/types";
   import type { MemoryWipePick } from "../../../config/contents";
   import InterestCard from "./InterestCard.svelte";

   export let kind: "vn" | "anime" | "manga";
   export let title: string;
   export let kicker: string;
   export let delay: number;
   export let collection: InterestCollection;
   export let picks: readonly MemoryWipePick[];
   export let memoryLabel: string;
   export let sourceLabel: string;

   function interestTooltip(interest: RankedInterest) {
      const examples = interest.examples.map((example) => example.title).join(" · ");
      return examples
         ? interest.titleCount + " titles · e.g. " + examples
         : interest.titleCount + " titles";
   }
</script>

<InterestCard
   {kind}
   {title}
   {kicker}
   {delay}
   count={collection.analyzedEntries}
   sourceUrl={collection.profileUrl}
   {sourceLabel}
>
   <div class="interest-tags" class:interest-tags-vn={kind === "vn"}>
      {#each collection.top.slice(0, 5) as interest, i (interest.id)}
         <span
            class="interest-tag"
            class:interest-tag-main={i === 0}
            title={interestTooltip(interest)}
         >
            {interest.name}
         </span>
      {/each}
   </div>
   <div class="memory-wipe">
      <span class="memory-wipe-label">{memoryLabel}</span>
      {#each picks as pick (pick.title)}
         <div class="memory-wipe-entry">
            {#if pick.url}
               <a class="memory-wipe-title" href={pick.url} target="_blank" rel="noreferrer"
                  >{pick.title}</a
               >
            {:else}
               <span class="memory-wipe-title">{pick.title}</span>
            {/if}
            <p>{pick.note}</p>
         </div>
      {/each}
   </div>
</InterestCard>

<style>
   .interest-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.42em 0.38em;
   }

   .interest-tag {
      padding: 0.3em 0.58em;
      border: 1px dashed color-mix(in srgb, var(--fill) 22%, transparent);
      border-radius: 0.55em 0.68em 0.52em 0.7em;
      background: color-mix(in srgb, white 68%, transparent);
      color: #777777;
      font-size: 0.77em;
      font-weight: 600;
      line-height: 1.2;
      transform: rotate(-0.4deg);
      transition:
         transform 180ms ease,
         color 180ms ease,
         background 180ms ease;
   }

   .interest-tag:nth-child(even) {
      transform: rotate(0.55deg);
   }

   .interest-tag:nth-child(3n) {
      transform: rotate(-0.7deg);
   }

   .interest-tag-main {
      color: var(--fill);
      font-size: 0.88em;
      font-weight: 750;
      background: color-mix(in srgb, var(--fill) 8%, white);
   }

   .interest-tag:hover {
      color: var(--fill);
      background: color-mix(in srgb, var(--fill) 8%, white);
      transform: rotate(0deg) translateY(-1px);
   }

   .interest-tags-vn {
      gap: 0.48em;
   }

   .memory-wipe {
      margin-top: 0.65em;
      padding: 0.5em 0.6em 0.55em;
      border-left: 2px solid color-mix(in srgb, var(--fill) 24%, transparent);
      background: color-mix(in srgb, white 42%, transparent);
   }

   .memory-wipe-label {
      display: block;
      margin-bottom: 0.28em;
      color: var(--fill);
      opacity: 0.72;
      font-size: 0.64em;
      font-weight: 700;
      letter-spacing: 0.03em;
   }

   .memory-wipe-entry {
      display: grid;
      gap: 0.12em;
   }

   .memory-wipe-entry + .memory-wipe-entry {
      margin-top: 0.45em;
   }

   .memory-wipe-title {
      width: fit-content;
      color: #777777;
      font-size: 0.78em;
      font-weight: 700;
      text-decoration: none;
      transition: color 180ms ease;
   }

   a.memory-wipe-title:hover {
      color: var(--fill);
   }

   .memory-wipe-entry p {
      margin: 0;
      color: #8b8b8b;
      font-size: 0.7em;
      line-height: 1.32;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
   }
</style>
