<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$, onDestroy$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { markerSubject, getBeaconClicked, getNavDeviceClicked } from "../streams/markers-interactions";
  import type { IIndoorMapMarker } from "../interfaces/position.interface";
  import BeaconDetails from "../views/BreaconDetails/BeaconDetails.svelte";
  import NavDeviceDetails from "../views/NavDeviceDetails/NavDeviceDetails.svelte";
    

  const markers$ = onMount$.pipe(getMarkers);

  const beaconsMarkerClicked$ = getBeaconClicked(markers$);
  const navDeviceMarkerClicked$ = getNavDeviceClicked(markers$);

  const onMarkerClick = ({ id }: IIndoorMapMarker) => {
    markerSubject.next(id);
  }
  
</script>

<div class="container">
  <Map>
    {#each $markers$ as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} id={id} icon={icon} onClick={onMarkerClick}/>
    {/each}
  </Map>
  <BeaconDetails beacon={$beaconsMarkerClicked$}/>
  <NavDeviceDetails navDevice={$navDeviceMarkerClicked$}/>
</div>

<style>
  .container {
    padding: 0;
    height: 100vh;
    width: 100;
  }
</style>
