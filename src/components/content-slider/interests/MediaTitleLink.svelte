<script lang="ts">
   import { mediaCoverPreview } from "../../../actions/mediaCoverPreview";
   import { mediaCoverKey } from "#lib/interests/covers.js";
   import type { ShowTooltip } from "../ProfileTooltip.svelte";

   interface Props {
      href: string;
      label: string;
      variant?: "title" | "note";
      showTooltip: ShowTooltip;
      hideTooltip: () => void;
   }

   let { href, label, variant = "title", showTooltip, hideTooltip }: Props = $props();
   let previewable = $derived(mediaCoverKey(href) !== null);
</script>

<span class="media-reference" class:main-title={variant === "title"}>
   <a
      {href}
      target="_blank"
      rel="noreferrer"
      class:has-preview={previewable}
      use:mediaCoverPreview={{ showTooltip, hideTooltip }}>{label}</a
   >{#if previewable}<button
         type="button"
         class="cover-button"
         aria-label={`Preview cover: ${label.trim()}`}
         use:mediaCoverPreview={{
            href,
            title: label.trim(),
            trigger: "press",
            showTooltip,
            hideTooltip,
         }}
      >
         <svg
            viewBox="0 0 16 16"
            width="10"
            height="10"
            fill="none"
            stroke="currentColor"
            stroke-width="1.3"
            aria-hidden="true"
         >
            <rect x="1.5" y="1.5" width="13" height="13" rx="2" />
            <circle cx="5" cy="5" r="1.2" />
            <path d="m2 12 4-4 3 3 2-2 3 3" />
         </svg>
      </button>{/if}
</span>

<style>
   .media-reference {
      color: #555560;
      font-weight: 650;
   }

   .main-title {
      display: flex;
      align-items: center;
      gap: 0.25em;
      min-width: 0;
      color: #777777;
      font-size: 0.78em;
      font-weight: 700;
      line-height: 1.35;
   }

   a {
      color: inherit;
      text-decoration: underline;
      text-decoration-color: color-mix(in srgb, currentColor 45%, transparent);
      text-decoration-thickness: 0.075em;
      text-underline-offset: 0.16em;
      transition: color 180ms ease;
   }

   .main-title a {
      min-width: 0;
      overflow-wrap: anywhere;
      text-decoration: none;
   }

   .main-title .cover-button {
      flex-shrink: 0;
      margin: -3px 0;
   }

   .main-title a.has-preview {
      text-decoration: underline dotted;
      text-decoration-color: color-mix(in srgb, currentColor 40%, transparent);
      text-underline-offset: 0.2em;
   }

   .cover-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      margin: -3px 0 -3px 2px;
      border: 0;
      border-radius: 5px;
      background: transparent;
      color: color-mix(in srgb, var(--fill) 40%, #555560);
      vertical-align: middle;
      cursor: pointer;
      touch-action: manipulation;
      transition: transform 120ms cubic-bezier(0.23, 1, 0.32, 1);
   }

   .cover-button:active {
      transform: scale(0.97);
   }

   .cover-button::before {
      content: "";
      position: absolute;
      inset: 3px;
      border: 1px solid color-mix(in srgb, var(--fill) 32%, transparent);
      border-radius: 4px;
      background: color-mix(in srgb, var(--fill) 7%, white);
   }

   .cover-button svg {
      position: relative;
   }

   .cover-button:global([aria-expanded="true"])::before {
      background: color-mix(in srgb, var(--fill) 18%, white);
      border-color: currentColor;
   }

   @media (hover: hover) and (pointer: fine) {
      a:hover {
         color: color-mix(in srgb, var(--fill) 40%, #34343c);
         text-decoration-color: currentColor;
      }

      .cover-button:hover::before {
         background: color-mix(in srgb, var(--fill) 18%, white);
         border-color: currentColor;
      }
   }

   @media (prefers-reduced-motion: reduce) {
      .cover-button:active {
         transform: none;
      }
   }

   a:focus-visible,
   .cover-button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
      border-radius: 3px;
   }

   @media (hover: none), (pointer: coarse), (max-width: 600px) {
      .main-title .cover-button {
         margin: 0;
      }

      .cover-button {
         width: 28px;
         height: 28px;
         margin: 1px 0 1px 4px;
      }

      .cover-button::before {
         inset: 5px;
      }

      .media-reference:not(.main-title) .cover-button {
         width: 24px;
         height: 24px;
         margin: -3px 0 -3px 2px;
      }

      .media-reference:not(.main-title) .cover-button::before {
         inset: 3px;
      }
   }
</style>
