export const REQUEST_TIMEOUT_MS = 8000;

export const MAX_PAGES = 20;

export function clamp01(value: number) {
   return Math.min(1, Math.max(0, value));
}
