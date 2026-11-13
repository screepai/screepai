export function nextFrame() {
   return new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
   });
}

export function getSlidePanel(viewport: HTMLElement, index: number) {
   return viewport.querySelector<HTMLElement>(`.slide-panel[data-slide-index="${index}"]`);
}

export function measureVisibleTargetHeight(
   incomingContent: HTMLElement,
   scrollRegion: HTMLElement
) {
   const naturalHeight = incomingContent.offsetHeight;
   const magic = scrollRegion.closest<HTMLElement>(".magic");
   if (!magic) {
      return naturalHeight;
   }
   const profileHeader = magic.querySelector<HTMLElement>(":scope > .profile-header");
   const pagination =
      scrollRegion.parentElement?.querySelector<HTMLElement>(":scope > .pagination");
   const computedMagic = getComputedStyle(magic);
   const maxMagicHeight = parseFloat(computedMagic.maxHeight);
   if (!Number.isFinite(maxMagicHeight)) {
      return naturalHeight;
   }
   const headerHeight = profileHeader?.getBoundingClientRect().height ?? 0;
   const paginationHeight = pagination?.getBoundingClientRect().height ?? 0;
   const maxVisibleHeight = Math.max(0, maxMagicHeight - headerHeight - paginationHeight);
   return Math.min(naturalHeight, maxVisibleHeight);
}
