<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import Menu from "../components/Menu/Menu.svelte";
  import Dialog from "../components/Dialog/Dialog.svelte";
  import Button from "smelte/src/components/Button";
  import CreateBeacons from "../views/Beacons/Create/CreateBeacons.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { startWith } from "rxjs";
  import Card from "smelte/src/components/Card";
import type { LatLng } from "leaflet";

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );

  let showDialog = false;
  let createBeaconExp = false;

  /* dragable */

  let lat: number = 0;
  let lng: number = 0;

  const onDrag = (e: CustomEvent<LatLng>) => {
    const newPosition = e.detail;
    lat = newPosition.lat;
    lng = newPosition.lng;
  }

  function closeDialog() {
    showDialog = false;
  }

  function openDialog() {
    showDialog = true;
  }

  function toggleBeaconExp() {
    createBeaconExp = !createBeaconExp;
  }

</script>

<main class="container overflow-hidden">
  
  <section class="container-map">
    <Map>
      {#each $markers as {lat, lng, id, icon} (id)}
        <Marker x={lat} y={lng} {id} {icon}/>
      {/each}
      {#if createBeaconExp}
        <Marker x={lat} y={lng} id="createBeaconExp" icon="./static/markers/antenna.png" draggable center on:dragend={onDrag}/>
      {/if}
      
    </Map>
  </section>
  <Dialog isVisible={showDialog} on:close={closeDialog}>
    <CreateBeacons />
  </Dialog>
  <Menu>
    {#if createBeaconExp}
      <h4>Create a new beacon</h4>
      <p>Lat: <span>{lat}</span> Lng:<span>{lng}</span></p>
      <Button on:click={toggleBeaconExp} outlined>Cancel</Button>
      <Button on:click={openDialog}>Create</Button>
    {:else}
      <ul>
        <li>
          <Button on:click={toggleBeaconExp}>Create Beacons</Button>
        </li>
        <li>
          <Button>Update Beacons</Button>
        </li>
      </ul>
    {/if}    
  </Menu>
</main>

<style>
  .container {
    padding: 0;
    height: 100vh;
    width: 100;

    display: flex;
    flex-direction: column;
  }

  .container-map {
    flex: 3;
  }
</style>
