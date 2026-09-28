<script lang="ts">
   export let name: string;
   export let text: string;
   export let x: number;
   export let y: number;
</script>

<div
   id="profile-tooltip"
   class="profile-tip"
   style={`--tooltip-x:${x}px;--tooltip-y:${y}px;`}
   role="tooltip"
>
   <span class="tooltip-name" aria-hidden="true">
      {name}
   </span>

   <span class="tooltip-text">
      {text}
   </span>
</div>

<style>
   .profile-tip {
      position: absolute;
      left: var(--tooltip-x);
      top: var(--tooltip-y);
      width: 280px;
      max-width: calc(100vw - 24px);
      padding: 9px 12px;
      box-sizing: border-box;
      border-radius: 8px;
      background: var(--fill);
      color: #ffffff;
      text-align: center;
      pointer-events: none;
      transform: translate(-50%, calc(-100% - 14px));
      transform-origin: bottom center;
      box-shadow: 0 5px 14px rgb(0 0 0 / 0.14);
      z-index: 10000;
      animation: tooltip-in 220ms cubic-bezier(0.16, 1, 0.3, 1) both;
   }

   .profile-tip::after {
      content: "";
      position: absolute;
      left: 50%;
      top: 100%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid var(--fill);
   }

   .tooltip-name {
      display: block;
      font-family: "Inter Tight", sans-serif;
      font-size: 11px;
      font-weight: 700;
      line-height: 1.2;
      white-space: nowrap;
   }

   .tooltip-text {
      display: block;
      margin-top: 3px;
      font-family: "Inter Tight", sans-serif;
      font-size: 11px;
      font-weight: 400;
      line-height: 1.35;
      white-space: normal;
      overflow-wrap: break-word;
      opacity: 0.85;
   }

   @keyframes tooltip-in {
      from {
         opacity: 0;
         transform: translate(-50%, calc(-100% - 7px)) scale(0.92);
      }
      to {
         opacity: 1;
         transform: translate(-50%, calc(-100% - 14px)) scale(1);
      }
   }
</style>
