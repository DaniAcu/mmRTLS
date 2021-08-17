<script lang="ts">
  import { goto } from "$app/navigation";
  import TextField from "smelte/src/components/TextField";

  import { NEVER, Observable, Subject, switchMap, takeUntil, tap } from "rxjs";

  import Map from "../components/Map/Map.svelte";
  import Button from "smelte/src/components/Button";
  import { mapBackgroundImage } from "../store/map-background-image.store";
  import { onDestroy, onMount } from "svelte";
  import { FileUploader, getBase64 } from "./file-uploader.model";
  import Marker from "../components/Map/Marker.svelte";
  import { BEACON_ICON_URL } from "../streams/beacons";
import type { IIndoorPosition } from "src/interfaces/position.interface";

  let fileUploader: FileUploader;

  const MAP_ROUTE = '/';

  const openUploadWindow = () => {
    fileUploader.openUploadWindow();
  };

  const unsubscribe = new Subject<void>();
  let imageUrl: Observable<string> = NEVER;
  let currentImageUrl: string | null = null;
  let mapSize: IIndoorPosition;

  let xDimension = '1';
  let yDimension = '1';

  $: {
    if (xDimension || yDimension) {
      mapSize = {
        x: +xDimension,
        y: +yDimension
      }
    }
  }

  const listenForUploadedImages = (file: Observable<File>) => {
    imageUrl = file.pipe(
      takeUntil(unsubscribe),
      switchMap(getBase64),
      tap(image => {
        currentImageUrl = image;
      })
    );
  };

  const saveMap = () => {
    mapBackgroundImage.next(currentImageUrl);
    goto(MAP_ROUTE);
  }

  onMount(() => {
    fileUploader = new FileUploader();
    listenForUploadedImages(fileUploader.fileUpload);
  });

  onDestroy(() => {
    unsubscribe.next();
  });
</script>
<div class="container">
  <Button variant="raised" on:click={openUploadWindow}>
    Upload a Map
  </Button>
  <!-- svelte-ignore a11y-missing-attribute -->
  <div class="map-wrapper">
    <Map backgroundImage={$imageUrl} {mapSize}>
      <Marker x={1} y={1} id={1} icon={BEACON_ICON_URL}></Marker>
      <Marker x={5} y={3} id={2} icon={BEACON_ICON_URL}></Marker>
    </Map>
  </div>
  <div class="controls">
    <TextField label="X Dimension" bind:value={xDimension}/>
    <TextField label="Y Dimension" bind:value={yDimension}/>
  </div>
  <Button variant="raised" on:click={saveMap}>
    Save
  </Button>
</div>

<style>
  .container {
    padding: 0;
    height: 100vh;
    width: 100;
  }
</style>
  