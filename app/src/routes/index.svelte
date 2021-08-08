<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { startWith } from "rxjs";

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );
</script>

<div class="container">
  <Map>
    {#each $markers as {lat, lng, id, icon} (id)}
      <Marker {lat} {lng} {icon}/>
    {/each}
  </Map>
</div>

<style>
  .container {
    padding: 0;
    height: 100vh;
    width: 100;
  }
</style>
