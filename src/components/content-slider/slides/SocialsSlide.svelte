<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   export let slide: Extract<
      ContentSlide,
      {
         kind: "socials";
      }
   >;
   export let showSocialTooltip: (
      event: MouseEvent | FocusEvent,
      name: string,
      text: string
   ) => void;
   export let hideSocialTooltip: () => void;
</script>

<ul class="social-icons">
   {#each slide.links as socialLink, i (socialLink.url)}
      <li class="item-card" use:animateOnScroll style={`--in-delay:${180 + i * 85}ms;`}>
         <a
            href={socialLink.url}
            target="_blank"
            rel="noreferrer"
            aria-label={socialLink.label}
            on:mouseenter={(event) =>
               showSocialTooltip(event, socialLink.label, socialLink.tooltip || "")}
            on:mouseleave={hideSocialTooltip}
            on:focus={(event) =>
               showSocialTooltip(event, socialLink.label, socialLink.tooltip || "")}
            on:blur={hideSocialTooltip}
            on:pointerup={(event) => {
               (event.currentTarget as HTMLElement).blur();

               hideSocialTooltip();
            }}
         >
            <svg aria-hidden="true">
               <use href={socialLink.icon}></use>
            </svg>

            <span class="label">
               {socialLink.label}
            </span>
         </a>
      </li>
   {/each}
</ul>
{#if slide.findMe.length}
   <section class="social-find-card item-card" use:animateOnScroll style="--in-delay:435ms;">
      <h5>find me here</h5>

      <div class="social-find-items">
         {#each slide.findMe as item (item.label)}
            <a class="social-find-item" href={item.url} target="_blank" rel="noopener noreferrer">
               <span class="social-find-label">
                  {item.label}
               </span>

               <span class="social-find-value">
                  {item.value}
               </span>
            </a>
         {/each}
      </div>
   </section>
{/if}
<div class="note-card">
   <p class="social-note">
      {slide.note}
   </p>
</div>

<style>
   .social-note {
      margin: 0;
      min-height: 1.25em;
      opacity: 0.65;
      font-size: 0.82em;
      line-height: 1.25;
      text-align: center;
   }

   .social-icons {
      display: flex;
      flex-wrap: wrap;
      padding: 0;
      justify-content: center;
      align-items: center;
      text-align: center;
      font-size: 1.75em;
      gap: 1.375rem;
   }

   .social-icons li {
      position: relative;
      z-index: 1;
   }

   .social-icons li a {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2em;
      height: 2em;
      border: solid 1px #777777;
      border-radius: 100%;
      color: #777777;
      transition:
         transform 0.375s ease,
         color 0.375s ease,
         background-color 0.375s ease,
         border-color 0.375s ease;
   }

   .social-icons li a svg {
      position: relative;
      display: block;
      width: 60%;
      height: 60%;
      fill: #777777;
      transition: fill 0.375s ease;
   }

   .social-icons a:hover {
      border-color: var(--fill);
      color: var(--fill);
   }

   .social-icons a:hover svg {
      fill: var(--fill);
   }

   .social-icons li a:hover {
      transform: scale(1.1125);
   }

   .label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
   }

   .note-card {
      padding-top: 15px;
      padding-bottom: 0;
      opacity: 1;
      animation: note-enter 700ms cubic-bezier(0.16, 1, 0.3, 1) 500ms both;
   }

   @keyframes note-enter {
      0% {
         opacity: 0;
         transform: translateY(42px) scale(0.94);
      }
      60% {
         opacity: 1;
         transform: translateY(-4px) scale(1.01);
      }
      82% {
         transform: translateY(1.5px) scale(0.998);
      }
      100% {
         opacity: 1;
         transform: translateY(0) scale(1);
      }
   }

   .social-find-card {
      margin-top: 0.9em;
      padding: 0.8em 0.9em;
      border: 1px solid color-mix(in srgb, var(--fill) 22%, transparent);
      border-radius: 0.85em;
      background: color-mix(in srgb, var(--fill) 4%, transparent);
      box-shadow: 0 4px 14px rgb(0 0 0 / 0.035);
      text-align: left;
      transition:
         border-color 250ms ease,
         background 250ms ease,
         box-shadow 250ms ease;
   }

   .social-find-card:hover {
      border-color: color-mix(in srgb, var(--fill) 40%, transparent);
      background: color-mix(in srgb, var(--fill) 7%, transparent);
      box-shadow: 0 5px 16px rgb(0 0 0 / 0.055);
   }

   .social-find-card h5 {
      margin: 0 0 0.65em;
      color: var(--fill);
      font-size: 0.88em;
      font-weight: 700;
      letter-spacing: 0.04em;
   }

   .social-find-items {
      display: grid;
      gap: 0.18em;
   }

   .social-find-item {
      display: grid;
      grid-template-columns: minmax(5.5em, 0.65fr) 1fr;
      gap: 0.8em;
      align-items: baseline;
      padding: 0.3em 0.35em;
      border-radius: 0.5em;
      color: inherit;
      text-decoration: none;
      transition:
         background 180ms ease,
         transform 180ms ease;
   }

   .social-find-item:hover {
      background: color-mix(in srgb, var(--fill) 7%, transparent);
      transform: translateX(2px);
   }

   .social-find-label {
      opacity: 0.62;
      font-size: 0.9em;
      font-weight: 600;
   }

   .social-find-value {
      min-width: 0;
      color: #777777;
      font-size: 0.9em;
      overflow-wrap: anywhere;
      transition: color 180ms ease;
   }

   .social-find-item:hover .social-find-value {
      color: var(--fill);
   }
</style>
