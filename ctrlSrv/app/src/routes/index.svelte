<script lang="ts" context="module">
  import type { LoadInput, LoadOutput } from "@sveltejs/kit";
  import { mapBackgroundImage, mapMaxPosition } from "../store/map-background-image.store";

  const UPLOAD_MAP_ROUTE = '/upload-map';

  export const load: (input: LoadInput) => Promise<LoadOutput<{
    mapSize: IIndoorPosition;
    backgroundImage: string;
  }>> = async () => {
    const config = mapMaxPosition.value;
    const backgroundImage = mapBackgroundImage.value;
    const configIsLoaded = !!config;
		return new Promise((resolve) => {
      resolve(configIsLoaded && !!backgroundImage ? {
        status: 200,
        props: {
          mapSize: config as IIndoorPosition,
          backgroundImage
        }
      } : {
        status: 303,
        redirect: UPLOAD_MAP_ROUTE
      });
    })
	}
</script>

<script lang="ts">
  import Marker from "../components/Map/Marker.svelte";
  import Map from "../components/Map/Map.svelte";
  import { onMount$ } from "../utils/lifecycles"
  import { getMarkers } from "../streams/markers";
  import { startWith } from "rxjs";
  import type { IIndoorPosition } from "src/interfaces/position.interface";

  export let mapSize: IIndoorPosition;
  export let backgroundImage: string;

  const markers = onMount$.pipe(
    getMarkers,
    startWith([])
  );

</script>

<div class="container">
  <Map {backgroundImage} {mapSize}>
    {#each $markers as {lat, lng, id, icon} (id)}
      <Marker x={lat} y={lng} {id} {icon}/>
    {/each}
  </Map>
</div>
