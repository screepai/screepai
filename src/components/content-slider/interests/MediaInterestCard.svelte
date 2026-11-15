<script lang="ts">
   import type { InterestCollection, RankedInterest } from "#lib/interests/types.js";
   import type { MemoryWipePick } from "../../../config/contents";
   import InterestCard from "./InterestCard.svelte";
   import MediaTitleLink from "./MediaTitleLink.svelte";
   import type { ShowTooltip } from "../ProfileTooltip.svelte";

   interface Props {
      kind: "vn" | "anime" | "manga";
      title: string;
      kicker: string;
      delay: number;
      collection: InterestCollection;
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
            // Begin under the card's entrance once its initial fade is underway.
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
         {#each picks as pick (pick.title)}
            <li class="memory-wipe-entry" class:has-note={pick.note}>
               <div class="memory-wipe-heading">
                  {#if pick.url}
                     <MediaTitleLink
                        href={pick.url}
                        label={pick.title}
                        {showTooltip}
                        {hideTooltip}
                     />
                  {:else}
                     <span class="memory-wipe-title">{pick.title}</span>
                  {/if}
               </div>
               {#if pick.note}
                  <p>
                     {#if typeof pick.note === "string"}
                        {pick.note}
                     {:else}
                        {#each pick.note as part, i (i)}
                           {#if typeof part === "string"}
                              {part}
                           {:else if "url" in part}
                              <MediaTitleLink
                                 href={part.url}
                                 label={part.text}
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
      display: grid;
      grid-template-columns: 0.65em minmax(0, 1fr);
      gap: 0.18em 0.35em;
   }

   @media (prefers-reduced-motion: no-preference) {
      .memory-wipe-entry:global([data-row-pending]):not(:focus-within) {
         opacity: 0.35;
         transform: translateY(12px);
      }
   }

   .memory-wipe-entry::before {
      content: "✦";
      grid-column: 1;
      grid-row: 1;
      align-self: center;
      color: var(--fill);
      opacity: 0.55;
      font-size: 0.56em;
      line-height: 1;
   }

   .memory-wipe-heading {
      grid-column: 2;
      min-width: 0;
      align-content: center;
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

   .cover-preview-hint {
      margin: 0 0 0.65em;
      color: #6f6f78;
      font-size: 0.64em;
      line-height: 1.5;
   }

   @media (hover: none), (pointer: coarse), (max-width: 600px) {
      .hover-hint {
         display: none;
      }
   }

   .memory-wipe-entry p {
      grid-column: 2;
      margin: 0;
      padding-left: 0.6em;
      border-left: 1.5px solid color-mix(in srgb, var(--fill) 22%, transparent);
      color: #6f6f78;
      font-size: 0.7em;
      line-height: 1.5;
      overflow-wrap: anywhere;
   }

   .memory-wipe-entry p strong {
      color: #555560;
      font-weight: 650;
   }
</style>
