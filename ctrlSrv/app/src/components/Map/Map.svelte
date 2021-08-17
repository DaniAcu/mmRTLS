<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import MapContext from "./map-context";
  import { createMap } from './map';
  import type { IndoorMap } from "./indoor-map.model";
  import type { IIndoorMap } from '../../interfaces/indoor-map.interface';
  
  export const config = {
    imageOverlay: "./static/indoor-map.png"
  };

  let mapNode: HTMLDivElement;
  let map: IIndoorMap<any>;

  MapContext.set(() => map);

  onMount(async () => {
      map = await createMap({imageOverlay: config.imageOverlay, target: mapNode});
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
		height: 100%;
    width: 100%;;
	}
</style>
