<script lang="ts">
   import type { InterestCollection, RankedInterest } from "#lib/interests/types.js";
   import type { MemoryWipePick } from "../../../config/contents";
   import InterestCard from "./InterestCard.svelte";

   interface Props {
      kind: "vn" | "anime" | "manga";
      title: string;
      kicker: string;
      delay: number;
      collection: InterestCollection;
      picks: readonly MemoryWipePick[];
      memoryLabel: string;
      sourceLabel: string;
      showTooltip: (event: MouseEvent | FocusEvent, name: string, text: string) => void;
      hideTooltip: (event?: Event) => void;
   }

   let {
      kind,
      title,
      kicker,
      delay,
      collection,
      picks,
      memoryLabel,
      sourceLabel,
      showTooltip,
      hideTooltip,
   }: Props = $props();

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
         <button
            type="button"
            class="interest-tag"
            class:interest-tag-main={i === 0}
            aria-describedby="profile-tooltip"
            onmouseenter={(event) => showTooltip(event, interest.name, interestTooltip(interest))}
            onmousemove={(event) => showTooltip(event, interest.name, interestTooltip(interest))}
            onmouseleave={hideTooltip}
            onfocus={(event) => showTooltip(event, interest.name, interestTooltip(interest))}
            onblur={hideTooltip}
            onclick={(event) => showTooltip(event, interest.name, interestTooltip(interest))}
         >
            {interest.name}
         </button>
      {/each}
   </div>
   <div class="memory-wipe">
      <span class="memory-wipe-label">{memoryLabel}</span>
      <ul class="memory-wipe-list">
         {#each picks as pick (pick.title)}
            <li class="memory-wipe-entry" class:has-note={pick.note}>
               {#if pick.url}
                  <a class="memory-wipe-title" href={pick.url} target="_blank" rel="noreferrer"
                     >{pick.title}</a
                  >
               {:else}
                  <span class="memory-wipe-title">{pick.title}</span>
               {/if}
               {#if pick.note}
                  <p>{pick.note}</p>
               {/if}
            </li>
         {/each}
      </ul>
   </div>
</InterestCard>

<style>
   .interest-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.42em 0.38em;
   }

   .interest-tag {
      appearance: none;
      padding: 0.3em 0.58em;
      border: 1px dashed color-mix(in srgb, var(--fill) 22%, transparent);
      border-radius: 0.55em 0.68em 0.52em 0.7em;
      background: color-mix(in srgb, white 68%, transparent);
      color: #777777;
      font-size: 0.77em;
      font-family: inherit;
      font-weight: 600;
      line-height: 1.2;
      cursor: help;
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

   .interest-tag:focus-visible {
      outline: 2px solid color-mix(in srgb, var(--fill) 45%, transparent);
      outline-offset: 2px;
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

   .memory-wipe-list {
      display: grid;
      gap: 0.3em;
      margin: 0;
      padding: 0;
   }

   .memory-wipe-entry {
      position: relative;
      display: grid;
      gap: 0.18em;
      padding-left: 1em;
   }

   .memory-wipe-entry::before {
      content: "✦";
      position: absolute;
      left: 0;
      top: 0.32em;
      color: var(--fill);
      opacity: 0.55;
      font-size: 0.56em;
      line-height: 1;
   }

   .memory-wipe-entry.has-note:not(:first-child),
   .memory-wipe-entry.has-note + .memory-wipe-entry {
      margin-top: 0.3em;
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
      padding-left: 0.6em;
      border-left: 1.5px solid color-mix(in srgb, var(--fill) 22%, transparent);
      color: #8b8b8b;
      font-size: 0.7em;
      line-height: 1.32;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      overflow: hidden;
   }
</style>
