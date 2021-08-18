<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { filter, Observable, startWith, take, tap } from "rxjs";
  import { mapBackgroundImage, mapMaxPosition } from "../store/map-background-image.store";
  import { goto } from "$app/navigation";
  import type { IIndoorPosition } from "src/interfaces/position.interface";

  const UPLOAD_MAP_ROUTE = '/upload-map';

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );

  const navigateToMapSetup = () => {
    goto(UPLOAD_MAP_ROUTE);
  }

  const backgroundImage = (mapBackgroundImage as Observable<string>).pipe(
    tap(image => {
      if (!image) {
        navigateToMapSetup();
      }
    }),
    filter(image => !!image),
    take(1)
  );

  const mapDimensions = (mapMaxPosition as Observable<IIndoorPosition>).pipe(
    tap(dimensions => {
      if (!dimensions) {
        navigateToMapSetup();
      }
    }),
    filter(dimensions => !!dimensions),

  )
</script>

<div class="main-container">
  <Map backgroundImage={$backgroundImage} mapSize={$mapDimensions}>
    {#each $markers as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} {id} {icon}/>
    {/each}
  </Map>
</div>
