<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { filter, Observable, startWith, take, tap } from "rxjs";
  import { mapBackgroundImage } from "../store/map-background-image.store";
  import { goto } from "$app/navigation";

  const UPLOAD_MAP_ROUTE = '/upload-map';

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );

  const backgroundImage = (mapBackgroundImage as Observable<string>).pipe(
    tap(image => {
      if (!image) {
        goto(UPLOAD_MAP_ROUTE)
      }
    }),
    filter(image => !!image),
    take(1)
  );
</script>

<div class="container">
  <Map backgroundImage={$backgroundImage}>
    {#each $markers as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} {id} {icon}/>
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
