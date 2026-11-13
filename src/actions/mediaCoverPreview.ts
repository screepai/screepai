import { mediaCoverKey, type MediaCover } from "#lib/interests/covers.js";
import type { ShowTooltip } from "../components/content-slider/ProfileTooltip.svelte";

type Options = {
   showTooltip: ShowTooltip;
   hideTooltip: () => void;
   href?: string;
   title?: string;
   trigger?: "press";
};

const covers = new Map<string, Promise<MediaCover | null>>();
let dismissActive: (() => void) | null = null;

function loadCover(key: string) {
   let pending = covers.get(key);
   if (!pending) {
      pending = fetch(`/api/covers/${encodeURIComponent(key)}`, {
         signal: AbortSignal.timeout(10000),
      })
         .then(async (response) => {
            if (!response.ok) throw new Error(`Cover returned ${response.status}`);
            return (await response.json()) as MediaCover | null;
         })
         .catch(() => {
            covers.delete(key);
            return null;
         });
      covers.set(key, pending);
   }
   return pending;
}

export function mediaCoverPreview(node: HTMLAnchorElement | HTMLButtonElement, options: Options) {
   const key = mediaCoverKey(options.href ?? (node instanceof HTMLAnchorElement ? node.href : ""));
   if (!key) return;
   const press = options.trigger === "press";

   let revision = 0;
   let timer: ReturnType<typeof setTimeout>;
   let scrollFrame = 0;
   let shown = false;

   function stop() {
      revision++;
      clearTimeout(timer);
      cancelAnimationFrame(scrollFrame);
      if (dismissActive === stop) dismissActive = null;
      if (shown) options.hideTooltip();
      shown = false;
      node.removeAttribute("aria-describedby");
      if (press) node.setAttribute("aria-expanded", "false");
      document.removeEventListener("scroll", stop, true);
      document.removeEventListener("visibilitychange", stop);
      document.removeEventListener("keydown", onKeydown);
      document.removeEventListener("pointerdown", onOutsidePointer, true);
      window.removeEventListener("resize", stop);
   }

   function start(event?: Event) {
      if (event instanceof MouseEvent && !window.matchMedia("(hover: hover)").matches) return;
      if (event instanceof FocusEvent && !node.matches(":focus-visible")) return;
      dismissActive?.();
      stop();
      dismissActive = stop;
      const current = revision;
      document.addEventListener("visibilitychange", stop);
      document.addEventListener("keydown", onKeydown);
      document.addEventListener("pointerdown", onOutsidePointer, true);
      window.addEventListener("resize", stop);
      async function reveal() {
         const title = options.title ?? node.textContent?.trim() ?? "";
         node.setAttribute("aria-describedby", "profile-tooltip");
         if (press) node.setAttribute("aria-expanded", "true");
         shown = true;
         options.showTooltip(node, title, "", { pinned: press });
         const cover = await loadCover(key!);
         if (current !== revision || !node.isConnected) return;
         options.showTooltip(
            node,
            title,
            "",
            cover
               ? { imageUrl: cover.imageUrl, pinned: press }
               : { unavailable: true, pinned: press }
         );
      }
      if (event instanceof FocusEvent || !event) {
         scrollFrame = requestAnimationFrame(() => {
            scrollFrame = requestAnimationFrame(() => {
               document.addEventListener("scroll", stop, true);
               void reveal();
            });
         });
      } else {
         document.addEventListener("scroll", stop, true);
         timer = setTimeout(() => void reveal(), 100);
      }
   }

   function onOutsidePointer(event: PointerEvent) {
      if (event.target instanceof Node && !node.contains(event.target)) stop();
   }

   function onClick() {
      if (dismissActive === stop) stop();
      else start();
   }

   function onKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") stop();
   }

   if (press) {
      node.setAttribute("aria-expanded", "false");
      node.setAttribute("aria-controls", "profile-tooltip");
      node.addEventListener("click", onClick);
   } else {
      node.addEventListener("mouseenter", start);
      node.addEventListener("mouseleave", stop);
      node.addEventListener("focus", start);
   }
   node.addEventListener("blur", stop);
   return {
      update(next: Options) {
         options = next;
      },
      destroy() {
         stop();
         node.removeEventListener("mouseenter", start);
         node.removeEventListener("mouseleave", stop);
         node.removeEventListener("focus", start);
         node.removeEventListener("blur", stop);
         node.removeEventListener("click", onClick);
         if (press) {
            node.removeAttribute("aria-expanded");
            node.removeAttribute("aria-controls");
         }
      },
   };
}
