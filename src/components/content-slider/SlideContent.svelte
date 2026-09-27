<script lang="ts">
   export let heading: string;
   export let socials: boolean;
   export let direction: number;
</script>

<div
   class="slide-content"
   style={`
      --item-start-x:${52 * direction}px;
      --item-bounce-1:${-5 * direction}px;
      --item-bounce-2:${2.2 * direction}px;
      --item-bounce-3:${-0.8 * direction}px;
      --item-bounce-4:${0.25 * direction}px;
   `}
   class:centered-content={!socials}
>
   <div class="heading-card">
      <h4 class:centered-heading={socials}>
         {heading}
      </h4>
   </div>

   <slot />
</div>

<style>
   .slide-content {
      display: block;
      width: 100%;
      box-sizing: border-box;
      padding: 20px;
      color: #777777;
      font-family: "Inter Tight", sans-serif;
      font-style: normal;
      font-weight: 400;
      font-size: clamp(10px, calc(5.5px + 1.35vw), 16px);
      line-height: 1.3;
   }

   .centered-content {
      text-align: center;
   }

   :where(.slide-content) :global(.content-list) {
      padding-inline-start: 0;
   }

   :where(.slide-content) :global(p) {
      margin: 0;
   }

   h4 {
      color: var(--fill);
      margin-top: 0;
      margin-bottom: 1.2em;
      font-size: 1.1em;
      line-height: 1.2;
   }

   .centered-heading {
      text-align: center;
   }

   .heading-card {
      opacity: 1;
      animation: heading-enter 700ms cubic-bezier(0.16, 1, 0.3, 1) 100ms both;
   }

   :where(.slide-content) :global(.item-card) {
      opacity: 1;
      animation-name: item-enter;
      animation-duration: 820ms;
      animation-timing-function: linear;
      animation-delay: var(--in-delay, 0ms);
      animation-fill-mode: both;
      will-change: transform, opacity;
   }

   @keyframes heading-enter {
      0% {
         opacity: 0;
         transform: translateY(-48px) scale(0.94);
      }
      60% {
         opacity: 1;
         transform: translateY(4px) scale(1.01);
      }
      82% {
         transform: translateY(-1.5px) scale(0.998);
      }
      100% {
         opacity: 1;
         transform: translateY(0) scale(1);
      }
   }

   @keyframes item-enter {
      0% {
         opacity: 0;
         transform: translate3d(var(--item-start-x), 0, 0) scale(0.95);
         animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
      }
      52% {
         opacity: 1;
         transform: translate3d(var(--item-bounce-1), 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }
      68% {
         transform: translate3d(var(--item-bounce-2), 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }
      81% {
         transform: translate3d(var(--item-bounce-3), 0, 0) scale(1);
         animation-timing-function: cubic-bezier(0.25, 0.7, 0.35, 1);
      }
      91% {
         transform: translate3d(var(--item-bounce-4), 0, 0) scale(1);
         animation-timing-function: ease-out;
      }
      100% {
         opacity: 1;
         transform: translate3d(0, 0, 0) scale(1);
      }
   }
</style>
