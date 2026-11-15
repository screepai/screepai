<script lang="ts">
   import type { InterestCollection, RankedInterest, MediaDetails } from "#lib/interests/types.js";
   import { mediaReferenceKey } from "#lib/interests/covers.js";
   import type { MemoryWipePick } from "../../../config/contents";
   import InterestCard from "./InterestCard.svelte";
   import MediaTitleLink from "./MediaTitleLink.svelte";
   import MediaSeries from "./MediaSeries.svelte";
   import MediaNotes from "./MediaNotes.svelte";
   import { groupMediaPicks } from "#lib/interests/series.js";
   import type { ShowTooltip } from "../ProfileTooltip.svelte";

   interface Props {
      kind: "vn" | "anime" | "manga" | "light-novel";
      title: string;
      kicker: string;
      delay: number;
      collection: InterestCollection;
      media: Readonly<Record<string, MediaDetails>>;
      picks: readonly MemoryWipePick[];
      memoryLabel: string;
      sourceLabel: string;
      showTooltip: ShowTooltip;
      hideTooltip: (event?: Event) => void;
   }

   let {
      kind,
      title,
      kicker,
      delay,
      collection,
      media,
      picks,
      memoryLabel,
      sourceLabel,
      showTooltip,
      hideTooltip,
   }: Props = $props();

   let displayedPicks = $derived(groupMediaPicks(picks, media));

   function interestTooltip(interest: RankedInterest) {
      const examples = interest.examples.map((example) => example.title).join(" · ");
      return examples
         ? interest.titleCount + " titles · e.g. " + examples
         : interest.titleCount + " titles";
   }

   function revealRows(list: HTMLUListElement) {
      const root = list.closest(".slide-scroll");
      const card = list.closest(".interest-piece-wrap");
      if (!root || !card) return;

      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const rowStagger = [0, 48, 84, 110];
      const observer = new IntersectionObserver(
         (entries) => {
            const visibleRows = entries.filter((entry) => entry.isIntersecting);
            if (!visibleRows.length) return;

            const entrance = card.getAnimations()[0]?.effect?.getComputedTiming();
            const leadDelay = entrance
               ? Math.max(0, (entrance.delay ?? 0) + 125 - Number(entrance.localTime))
               : 0;

            visibleRows.forEach(({ target }, index) => {
               observer.unobserve(target);
               target.removeAttribute("data-row-pending");
               if (reducedMotion.matches || target.matches(":focus-within")) return;
               target.animate(
                  [
                     { opacity: 0.35, transform: "translateY(12px)" },
                     { opacity: 1, transform: "translateY(0)" },
                  ],
                  {
                     duration: 360,
                     delay: leadDelay + rowStagger[Math.min(index, rowStagger.length - 1)],
                     easing: "cubic-bezier(0.22, 0.65, 0.36, 1)",
                     fill: "backwards",
                  }
               );
            });
         },
         { root, rootMargin: "-16px 0px" }
      );
      for (const row of list.children) {
         row.setAttribute("data-row-pending", "");
         observer.observe(row);
      }

      return { destroy: () => observer.disconnect() };
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
      <p class="cover-preview-hint">
         <span class="hover-hint">hover marked titles or&nbsp;</span>tap the image icon to preview a
         cover
      </p>
      <ul class="memory-wipe-list" use:revealRows>
         {#each displayedPicks as { pick, parts } (pick.url)}
            <li class="memory-wipe-entry">
               <div class="memory-wipe-heading">
                  {#if parts?.length}
                     <MediaSeries {parts} {media} {showTooltip} {hideTooltip} />
                  {:else}
                     <MediaTitleLink
                        href={pick.url}
                        details={media[mediaReferenceKey(pick.url) ?? ""]}
                        {showTooltip}
                        {hideTooltip}
                     />
                  {/if}
               </div>
               {#if pick.note}
                  <MediaNotes note={pick.note} {media} {showTooltip} {hideTooltip} />
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

   @media (hover: hover) and (pointer: fine) {
      .interest-tag:hover {
         color: var(--fill);
         background: color-mix(in srgb, var(--fill) 8%, white);
         transform: rotate(0deg) translateY(-1px);
      }
   }

   .interest-tag:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
   }

   .interest-tag:active {
      scale: 0.97;
      background: color-mix(in srgb, var(--fill) 12%, white);
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
      margin-bottom: 0.35em;
      color: var(--fill);
      opacity: 0.72;
      font-size: 0.64em;
      font-weight: 700;
      line-height: 1.5;
   }

   .memory-wipe-list {
      display: grid;
      gap: 0.6em;
      margin: 0;
      padding: 0;
   }

   .memory-wipe-entry {
      display: grid;
      grid-template-columns: 0.62em minmax(0, 1fr);
      row-gap: 0.3em;
   }

   @media (prefers-reduced-motion: no-preference) {
      .memory-wipe-entry:global([data-row-pending]):not(:focus-within) {
         opacity: 0.35;
         transform: translateY(12px);
      }
   }

   .memory-wipe-heading {
      grid-column: 1 / -1;
      min-width: 0;
      align-content: center;
   }

   .cover-preview-hint {
      margin: 0 0 0.8em;
      color: #7c7c87;
      font-size: 0.6em;
      line-height: 1.5;
   }

   @media (hover: none), (pointer: coarse), (max-width: 600px) {
      .hover-hint {
         display: none;
      }
   }
</style>
