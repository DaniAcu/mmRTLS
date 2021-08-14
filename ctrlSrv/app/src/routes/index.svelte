<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import Menu from "../components/Menu/Menu.svelte";
  import Dialog from "../components/Dialog/Dialog.svelte";
  import Button from "smelte/src/components/Button";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { startWith } from "rxjs";

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );

  let showDialog = false;

  function onMapClick() {
    console.log("onMapClick", showDialog);
    showDialog = !showDialog;
  }

</script>

<main class="container overflow-hidden">
  <section class="container-map">
    <Map on:click={onMapClick}>
      {#each $markers as {lat, lng, id, icon} (id)}
        <Marker {lat} {lng} {icon}/>
      {/each}
    </Map>
  </section>
  <Dialog isVisible={showDialog}>
    <h1>Slot</h1>
  </Dialog>
  <Menu>
    <ul>
      <li>
        <Button>Create Beacons</Button>
      </li>
      <li>
        <Button>Update Beacons</Button>
      </li>
    </ul>
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
