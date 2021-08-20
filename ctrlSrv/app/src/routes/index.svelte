<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { beaconsMarkerSubject, getBeaconsMarkerClicked } from "../streams/beacons-interaction";
  import type { IIndoorMapMarker } from "../interfaces/position.interface";
  import { startWith } from "rxjs/operators";

  const markers$ = onMount$.pipe(
    getMarkers,
    startWith([])
  );

  const beaconsMarkerClicked$ = getBeaconsMarkerClicked(markers$)

  const onMarkerClick = ({ id }: IIndoorMapMarker) => {
    console.log("id", id);
    beaconsMarkerSubject.next(id);
  }

</script>

<div class="container">
  <Map>
    {#each $markers$ as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} id={id} icon={icon} onClick={onMarkerClick}/>
    {/each}
  </Map>
</div>

<span>beaconsMarkerSubject {$beaconsMarkerClicked$}</span>

<style>
  .container {
    padding: 0;
    height: 100vh;
    width: 100;
  }
</style>
