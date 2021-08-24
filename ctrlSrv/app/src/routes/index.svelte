<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { audit, filter, Observable, startWith, Subject, take, tap } from "rxjs";
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

  const mapUpdated = new Subject<void>();

  const backgroundImage = mapBackgroundImage;

  const mapDimensions = (mapMaxPosition as Observable<IIndoorPosition>).pipe(
    tap(dimensions => {
      if (!dimensions) {
        navigateToMapSetup();
      }
    }),
    filter(dimensions => !!dimensions),
    audit(() => mapUpdated)
  )
</script>

<div class="container">
  <Map backgroundImage={$backgroundImage} mapSize={$mapDimensions} on:mapUpdate={() => mapUpdated.next()}>
    {#each $markers as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} {id} {icon}/>
    {/each}
  </Map>
</div>
