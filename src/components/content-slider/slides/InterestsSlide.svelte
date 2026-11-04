<script lang="ts">
   import type { ContentSlide } from "../../../config/contents";
   import type { InterestsResponse } from "#lib/interests/types.js";
   import GamesCard from "../interests/GamesCard.svelte";
   import MusicCard from "../interests/MusicCard.svelte";
   import MediaInterestCard from "../interests/MediaInterestCard.svelte";

   interface Props {
      slide: Extract<ContentSlide, { kind: "interests" }>;
      interestsData: InterestsResponse | null;
      interestsLoading: boolean;
      interestsError: string;
      showTooltip: (event: MouseEvent | FocusEvent, name: string, text: string) => void;
      hideTooltip: (event?: Event) => void;
   }

   let { slide, interestsData, interestsLoading, interestsError, showTooltip, hideTooltip }: Props =
      $props();
</script>

<div class="interest-board">
   {#if interestsLoading}
      <div class="interest-loading">digging through my questionable taste...</div>
   {:else if interestsError}
      <div class="interest-loading">{interestsError}</div>
   {:else if interestsData}
      <div class="interest-pair interest-small-pair">
         <GamesCard games={slide.games} />
         <MusicCard music={interestsData.music} />
      </div>
      <MediaInterestCard
         kind="vn"
         title="visual novels"
         kicker="my antidepressant"
         delay={350}
         collection={interestsData.visualNovels}
         picks={slide.memoryPicks.visualNovels}
         memoryLabel="would wipe my memory to read these again"
         sourceLabel="pulled from VNDB ↗"
         {showTooltip}
         {hideTooltip}
      />
      <MediaInterestCard
         kind="anime"
         title="anime"
         kicker="mostly watching"
         delay={180}
         collection={interestsData.anime}
         picks={slide.memoryPicks.anime}
         memoryLabel="would wipe my memory to watch these again"
         sourceLabel="from MyAnimeList ↗"
         {showTooltip}
         {hideTooltip}
      />
      <MediaInterestCard
         kind="manga"
         title="manga"
         kicker="apparently reading"
         delay={265}
         collection={interestsData.manga}
         picks={slide.memoryPicks.manga}
         memoryLabel="still rereading these"
         sourceLabel="from MyAnimeList ↗"
         {showTooltip}
         {hideTooltip}
      />
      {#if interestsData.warnings.length > 0}
         <p class="interest-warning">some sources are currently unavailable</p>
      {/if}
   {/if}
</div>

<style>
   .interest-board {
      display: grid;
      gap: 0.9em;
      padding: 0.15em 0.2em 0.35em;
      text-align: left;
      margin-bottom: 3em;
   }

   .interest-pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(12.5em, 1fr));
      gap: 0.8em;
   }

   .interest-loading {
      padding: 2em 1em;
      opacity: 0.6;
      font-size: 0.85em;
      text-align: center;
   }

   .interest-warning {
      margin: 0;
      opacity: 0.5;
      font-size: 0.7em;
      text-align: center;
   }

   .interest-small-pair {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
   }
</style>
