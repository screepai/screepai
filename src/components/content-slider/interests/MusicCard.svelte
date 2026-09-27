<script lang="ts">
   import type { MusicCollection } from "$lib/interests/types";
   import InterestCard from "./InterestCard.svelte";

   export let music: MusicCollection;
</script>

<InterestCard
   kind="music"
   title="music"
   kicker="lately looping"
   count="top 5"
   delay={520}
   sourceUrl={music.tracks.length ? music.profileUrl : ""}
   sourceLabel="last 30 days · Last.fm ↗"
>
   {#if music.tracks.length}
      <ol class="music-list">
         {#each music.tracks as track, i (track.url)}
            <li class="music-entry">
               <span class="music-rank">
                  {String(i + 1).padStart(2, "0")}
               </span>

               <a class="music-track" href={track.url} target="_blank" rel="noreferrer">
                  <span class="music-name">
                     {track.name}
                  </span>

                  <span class="music-artist">
                     {track.artist}
                  </span>
               </a>

               <span class="music-plays" title={`${track.playcount} scrobbles`}>
                  {track.playcount}×
               </span>
            </li>
         {/each}
      </ol>
   {:else}
      <p class="music-empty">waiting for the peaks to accumulate...</p>
   {/if}
</InterestCard>

<style>
   .music-list {
      display: grid;
      gap: 0.1em;
      margin: 0;
      padding: 0;
      list-style: none;
   }

   .music-entry {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 0.4em;
      align-items: center;
      padding: 0.28em 0.3em;
      border-radius: 0.5em;
      transition: background 180ms ease;
   }

   .music-entry + .music-entry {
      border-top: 1px solid color-mix(in srgb, var(--fill) 9%, transparent);
   }

   .music-entry:hover {
      background: color-mix(in srgb, white 48%, transparent);
   }

   .music-rank {
      color: var(--fill);
      opacity: 0.42;
      font-size: 0.6em;
      font-weight: 750;
   }

   .music-track {
      display: grid;
      min-width: 0;
      color: inherit;
      text-decoration: none;
   }

   .music-name {
      overflow: hidden;
      color: #777777;
      font-size: 0.72em;
      font-weight: 700;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
   }

   .music-artist {
      overflow: hidden;
      margin-top: 0.08em;
      color: #999999;
      font-size: 0.62em;
      line-height: 1.2;
      text-overflow: ellipsis;
      white-space: nowrap;
   }

   .music-plays {
      opacity: 0.45;
      font-size: 0.58em;
      font-weight: 650;
   }

   .music-empty {
      margin: 0.7em 0;
      color: #999999;
      font-size: 0.68em;
      line-height: 1.35;
   }
</style>
