<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import { animateOnScroll } from "../../../actions/animateOnScroll";
   interface Props {
      slide: Extract<
         ContentSlide,
         {
            kind: "socials";
         }
      >;
      showTooltip: (event: MouseEvent | FocusEvent, name: string, text: string) => void;
      hideTooltip: (event?: Event) => void;
   }

   let { slide, showTooltip, hideTooltip }: Props = $props();
</script>

<ul class="social-icons">
   {#each slide.links as socialLink, i (socialLink.url)}
      <li class="item-card" use:animateOnScroll style={`--in-delay:${180 + i * 85}ms;`}>
         <a
            href={socialLink.url}
            target="_blank"
            rel="noreferrer"
            aria-label={socialLink.label}
            aria-describedby="profile-tooltip"
            onmouseenter={(event) => showTooltip(event, socialLink.label, socialLink.tooltip || "")}
            onmousemove={(event) => showTooltip(event, socialLink.label, socialLink.tooltip || "")}
            onmouseleave={hideTooltip}
            onfocus={(event) => showTooltip(event, socialLink.label, socialLink.tooltip || "")}
            onblur={hideTooltip}
            onpointerup={(event) => {
               (event.currentTarget as HTMLElement).blur();

               hideTooltip();
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
<section class="social-contact item-card" use:animateOnScroll style="--in-delay:520ms;">
   <div class="contact-heading">
      <h5>contact me at</h5>
      <span aria-hidden="true">✧</span>
   </div>
   <a
      class="contact-link"
      href={slide.contact.discordUrl}
      target="_blank"
      rel="noopener noreferrer"
   >
      <span class="contact-icon" aria-hidden="true">
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
         >
            <path
               d="M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-3.5-.7L4 20l1.2-4.5a9 9 0 0 1-.7-3.5 8 8 0 0 1 8-8H13a7 7 0 0 1 7 7z"
            />
            <path d="M9 11.5h.01M12.5 11.5h.01M16 11.5h.01" stroke-width="2.5" />
         </svg>
      </span>
      <span class="contact-copy"><strong>discord</strong><span>drop me a message</span></span>
      <span class="contact-arrow" aria-hidden="true">↗</span>
   </a>
   <a class="contact-link" href={`mailto:${slide.contact.email}`}>
      <span class="contact-icon" aria-hidden="true">
         <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.6"
            stroke-linecap="round"
            stroke-linejoin="round"
         >
            <rect x="3" y="5" width="18" height="14" rx="3" />
            <path d="m4 7 8 6 8-6" />
         </svg>
      </span>
      <span class="contact-copy"><strong>email</strong><span>{slide.contact.email}</span></span>
      <span class="contact-arrow" aria-hidden="true">→</span>
   </a>
</section>
<div class="note-card">
   <p class="social-note">
      {slide.note}
   </p>
</div>

<style>
   .social-contact {
      background: linear-gradient(
         135deg,
         color-mix(in srgb, var(--fill) 9%, transparent),
         color-mix(in srgb, var(--fill) 2%, transparent)
      );
   }

   .contact-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      color: var(--fill);
   }

   .contact-link {
      display: grid;
      grid-template-columns: 2em minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.65em;
      padding: 0.5em 0.35em;
      border-radius: 0.55em;
      color: inherit;
      text-decoration: none;
      touch-action: manipulation;
      transition:
         background-color 180ms ease,
         transform 140ms cubic-bezier(0.23, 1, 0.32, 1);
   }

   .contact-link + .contact-link {
      margin-top: 0.2em;
   }

   .contact-icon {
      display: grid;
      place-items: center;
      width: 2em;
      height: 2em;
      border-radius: 0.6em;
      background: color-mix(in srgb, var(--fill) 10%, transparent);
      color: var(--fill);
   }

   .contact-icon svg {
      width: 1.15em;
      height: 1.15em;
   }

   .contact-copy {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.15em;
      min-width: 0;
      line-height: 1.3;
   }

   .contact-copy strong {
      font-size: 0.9em;
      font-weight: 600;
   }

   .contact-copy > span {
      font-size: 0.8em;
      opacity: 0.75;
      overflow-wrap: anywhere;
   }

   .contact-arrow {
      color: var(--fill);
      opacity: 0.7;
   }

   .contact-link:active {
      transform: scale(0.98);
   }

   .contact-link:focus-visible {
      outline: 2px solid var(--focus-ring);
      outline-offset: 2px;
   }

   @media (hover: hover) and (pointer: fine) {
      .contact-link:hover {
         background-color: color-mix(in srgb, var(--fill) 8%, transparent);
      }
   }

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

   .social-icons li a:active {
      scale: 0.97;
   }

   .social-find-item:active {
      scale: 0.98;
      background: color-mix(in srgb, var(--fill) 7%, transparent);
   }

   @media (hover: hover) and (pointer: fine) {
      .social-icons a:hover {
         border-color: var(--fill);
         color: var(--fill);
      }
   }

   @media (hover: hover) and (pointer: fine) {
      .social-icons a:hover svg {
         fill: var(--fill);
      }
   }

   @media (hover: hover) and (pointer: fine) {
      .social-icons li a:hover {
         transform: scale(1.1125);
      }
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
      animation: note-enter 700ms cubic-bezier(0.16, 1, 0.3, 1)
         calc(605ms + var(--entry-delay, 0ms)) both;
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

   .social-find-card,
   .social-contact {
      margin-top: 0.9em;
      padding: 0.8em 0.9em;
      border: 1px solid color-mix(in srgb, var(--fill) 22%, transparent);
      border-radius: 0.85em;
      box-shadow: 0 4px 14px rgb(0 0 0 / 0.035);
      text-align: left;
      transition:
         border-color 250ms ease,
         background 250ms ease,
         box-shadow 250ms ease;
   }

   .social-find-card {
      background: color-mix(in srgb, var(--fill) 4%, transparent);
   }

   @media (hover: hover) and (pointer: fine) {
      .social-find-card:hover {
         border-color: color-mix(in srgb, var(--fill) 40%, transparent);
         background: color-mix(in srgb, var(--fill) 7%, transparent);
         box-shadow: 0 5px 16px rgb(0 0 0 / 0.055);
      }
   }

   .social-find-card h5,
   .contact-heading h5 {
      margin: 0 0 0.65em;
      color: var(--fill);
      font-size: 0.88em;
      font-weight: 700;
      letter-spacing: 0.04em;
   }

   .social-find-items {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0.18em;
   }

   .social-find-item {
      display: grid;
      grid-template-columns: minmax(5.5em, 0.65fr) minmax(0, 1fr);
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

   @media (hover: hover) and (pointer: fine) {
      .social-find-item:hover {
         background: color-mix(in srgb, var(--fill) 7%, transparent);
         transform: translateX(2px);
      }
   }

   .social-find-label {
      color: var(--text-muted);
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

   @media (hover: hover) and (pointer: fine) {
      .social-find-item:hover .social-find-value {
         color: var(--fill);
      }
   }
</style>
