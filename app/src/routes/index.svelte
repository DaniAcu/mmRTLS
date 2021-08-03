<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { filter } from "rxjs";

  const isClientRender = typeof window !== "undefined";
  const markers = onMount$.pipe(
    filter(() => isClientRender),
    getMarkers
  )
</script>

<div class="container">
  <Map>
    {#each $markers as {lat, lng, id} (id)}
      <Marker {lat} {lng} />
    {/each}
  </Map>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
  }
  .container {
    height: 100vh;
    width: 100;
  }
</style>
