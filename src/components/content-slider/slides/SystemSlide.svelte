<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   export let slide: Extract<
      ContentSlide,
      {
         kind: "system";
      }
   >;
</script>

<div class="system-groups">
   {#each slide.groups as group, i (group.title)}
      <section
         class="system-group item-card"
         use:animateOnScroll
         style={`--in-delay:${180 + i * 85}ms;`}
      >
         <h5>{group.title}</h5>

         {#if group.kind === "rows"}
            <div class="system-items">
               {#each group.items as item (item.label)}
                  <div class="system-item">
                     <span class="system-label">
                        {item.label}
                     </span>
                     {#if item.url}
                        <a
                           class="system-value system-link"
                           href={item.url}
                           target="_blank"
                           rel="noopener noreferrer"
                        >
                           {item.value}
                        </a>
                     {:else}
                        <span class="system-value">
                           {item.value}
                        </span>
                     {/if}
                  </div>
               {/each}
            </div>
         {:else if group.kind === "stack"}
            <div class="stack-levels">
               {#each group.levels as level (level.label)}
                  <div class="stack-section" data-level={level.label}>
                     <span class="stack-label">
                        {level.label}
                     </span>

                     <div class="stack-pills">
                        {#each level.items as tech (tech)}
                           <span class="stack-pill">
                              {tech}
                           </span>
                        {/each}
                     </div>
                  </div>
               {/each}
            </div>
         {/if}
      </section>
   {/each}
</div>

<style>
   .system-groups {
      display: grid;
      gap: 0.75em;
      text-align: left;
   }

   .system-group {
      padding: 0.8em 0.9em;
      border: 1px solid color-mix(in srgb, var(--fill) 22%, transparent);
      border-radius: 0.85em;
      background: color-mix(in srgb, var(--fill) 4%, transparent);
      box-shadow: 0 4px 14px rgb(0 0 0 / 0.035);
      transition:
         border-color 250ms ease,
         background 250ms ease,
         box-shadow 250ms ease;
   }

   .system-group:hover {
      border-color: color-mix(in srgb, var(--fill) 40%, transparent);
      background: color-mix(in srgb, var(--fill) 7%, transparent);
      box-shadow: 0 5px 16px rgb(0 0 0 / 0.055);
   }

   .system-group h5 {
      margin: 0 0 0.65em;
      color: var(--fill);
      font-size: 0.88em;
      font-weight: 700;
      letter-spacing: 0.04em;
   }

   .system-items {
      display: grid;
      gap: 0.4em;
   }

   .system-item {
      display: grid;
      grid-template-columns: minmax(4.5em, 0.6fr) 1fr;
      gap: 0.8em;
      align-items: baseline;
   }

   .system-label {
      opacity: 0.62;
      font-size: 0.9em;
      font-weight: 600;
   }

   .system-value {
      min-width: 0;
      color: #777777;
      font-size: 0.9em;
      overflow-wrap: anywhere;
   }

   .stack-levels {
      display: grid;
      gap: 0.8em;
   }

   .stack-section {
      display: grid;
      gap: 0.45em;
   }

   .stack-label {
      opacity: 0.58;
      font-size: 0.82em;
      font-weight: 600;
      letter-spacing: 0.025em;
   }

   .stack-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4em;
   }

   .stack-pill {
      padding: 0.28em 0.58em;
      border: 1px solid color-mix(in srgb, var(--fill) 20%, transparent);
      border-radius: 0.55em;
      background: color-mix(in srgb, var(--fill) 5%, transparent);
      color: #777777;
      font-size: 0.82em;
      font-weight: 550;
      line-height: 1.2;
      cursor: default;
      transition:
         background 180ms ease,
         border-color 180ms ease,
         transform 180ms ease;
   }

   .stack-pill:hover {
      border-color: color-mix(in srgb, var(--fill) 38%, transparent);
      background: color-mix(in srgb, var(--fill) 9%, transparent);
      transform: translateY(-1px);
   }

   .stack-section[data-level="creative"] .stack-pill {
      background: color-mix(in srgb, var(--color2) 9%, transparent);
      border-color: color-mix(in srgb, var(--color2) 28%, transparent);
   }

   .system-link {
      width: fit-content;
      text-decoration: none;
      transition:
         color 180ms ease,
         opacity 180ms ease;
   }

   .system-link:hover {
      color: var(--fill);
      text-decoration: underline;
      text-underline-offset: 0.18em;
   }
</style>
