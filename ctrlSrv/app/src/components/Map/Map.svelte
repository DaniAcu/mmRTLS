<script lang="ts">
import type { IIndoorPosition } from "src/interfaces/position.interface";

  import { onDestroy, onMount } from "svelte";
  import type { IConfigurableIndoorMap, IIndoorMap } from '../../interfaces/indoor-map.interface';
  import type { IndoorMap } from "./indoor-map.model";
  import { createMap, loadImage } from "./map";
  import MapContext from "./map-context";
  
  let map: IConfigurableIndoorMap<any>;
  export let backgroundImage = './static/indoor-map.png';
  $: {
    if (map && backgroundImage) {
      loadImage(backgroundImage).then((image) => {
        map.updateBackgroundImage(image);
        map.setBounds(mapSize);
      });
    }
  }

  export let mapSize: IIndoorPosition = {
    x: NaN,
    y: NaN
  };

  $: {
      map?.setBounds(mapSize);
  }

  let mapNode: HTMLDivElement;

  MapContext.set(() => map);

  onMount(async () => {
      map = await createMap({imageOverlay: backgroundImage, target: mapNode});
  });

  onDestroy(() =>  {
    if(!map) return;

    (map as IndoorMap<any>).destroy();
  });

</script>

<div class="map" bind:this={mapNode}>
  {#if map}
    <slot></slot>
  {/if}
</div>

<style>
  .map {
    min-height: 32rem;
		height: 100%;
    width: 100%;;
	}
</style>
