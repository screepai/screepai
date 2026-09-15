<script lang="ts">
   export let darkMode: boolean;
   export let onToggle: () => void =
      () => undefined;
</script>

<style>
   .theme-toggle {
      position: absolute;
      top: -5em;
      left: 50%;
      transform: translateX(-50%);
      z-index: 10;
      cursor: pointer;
   }

   .toggle-checkbox {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
   }

   .toggle-slot {
      position: relative;
      height: 2em;
      width: 5em;
      border: 2px solid #e4e7ec;
      border-radius: 2em;
      background-color: white;
      transition:
         background-color 250ms;
   }

   .toggle-checkbox:focus-visible
      ~ .toggle-slot {
      outline: 2px solid var(--fill);
      outline-offset: 3px;
   }

   .toggle-checkbox:checked
      ~ .toggle-slot {
      background-color: #232a44;
   }

   .toggle-button {
      position: absolute;
      height: 1.5em;
      width: 1.5em;

      transform: translate(
         3.05em,
         0.25em
      );
      border-radius: 50%;
      background-color: #e98e8c;
      box-shadow:
         inset 0 0 0 0.25em #f58b98;
      transition:
         background-color 250ms,
         border-color 250ms,
         transform 500ms
            cubic-bezier(
               .26,
               1.5,
               .46,
               1
            );
   }

   .toggle-checkbox:checked
      ~ .toggle-slot
      .toggle-button {
      background-color: #485367;
      box-shadow:
         inset 0 0 0 0.75em white;
      transform:
         translate(0.3em, 0.25em);
   }

   .sun-icon,
   .moon-icon {
      position: absolute;
      width: 1.5em;
      height: 1.5em;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
   }

   .sun-icon {
      color: #fe7585;
   }

   .moon-icon {
      color: white;
   }

   .sun-icon-wrapper,
   .moon-icon-wrapper {
      position: absolute;
      width: 1.5em;
      height: 1.5em;
      transform-origin: 50% 50%;
   }

   .sun-icon-wrapper {
      transform:
         translate(0.5em, 0.25em)
         rotate(15deg);
      opacity: 1;
      transition:
         opacity 150ms,
         transform 500ms
            cubic-bezier(
               .26,
               1.5,
               .46,
               1
            );
   }

   .toggle-checkbox:checked
      ~ .toggle-slot
      .sun-icon-wrapper {
      opacity: 0;
      transform:
         translate(0.75em, 0.25em)
         rotate(0deg);
   }

   .moon-icon-wrapper {
      transform:
         translate(3.05em, 0.25em)
         rotate(0deg);
      opacity: 0;
      transition:
         opacity 150ms,
         transform 500ms
            cubic-bezier(
               .26,
               2,
               .46,
               1
            );
   }

   .toggle-checkbox:checked
      ~ .toggle-slot
      .moon-icon-wrapper {
      opacity: 1;
      transform:
         translate(3.05em, 0.25em)
         rotate(-15deg);
   }
</style>

<label class="theme-toggle">
   <input
      class="toggle-checkbox"
      type="checkbox"
      checked={darkMode}
      on:change={onToggle}
      aria-label="Toggle dark mode"
   />

   <div class="toggle-slot">
      <div class="sun-icon-wrapper">
         <svg
            class="sun-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
         >
            <circle cx="12" cy="12" r="4" />

            <path
               d="
                  M12 2v2
                  M12 20v2
                  M4.93 4.93l1.41 1.41
                  M17.66 17.66l1.41 1.41
                  M2 12h2
                  M20 12h2
                  M4.93 19.07l1.41-1.41
                  M17.66 6.34l1.41-1.41
               "
            />
         </svg>
      </div>

      <div class="toggle-button"></div>

      <div class="moon-icon-wrapper">
         <svg
            class="moon-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
         >
            <path
               d="
                  M21 12.79
                  A9 9 0 1 1
                  11.21 3
                  7 7 0 0 0
                  21 12.79
               "
            />
         </svg>
      </div>
   </div>
</label>
