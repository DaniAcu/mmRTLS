<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { startWith } from "rxjs";

  const isClientRender = typeof window !== "undefined";
  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );
</script>

<div class="container">
  {#if isClientRender}
    <Map>
      {#each $markers as {lat, lng, id, icon} (id)}
        <Marker {lat} {lng} {icon}/>
      {/each}
    </Map>
  {/if}
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
  }
  .container {
    padding: 0;
    height: 100vh;
    width: 100;
  }
</style>
