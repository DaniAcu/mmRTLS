<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { IIndoorMap } from '../../interfaces/indoor-map.interface';
  import type { IndoorMap } from "./indoor-map.model";
  import { createMap } from "./map";
  import MapContext from "./map-context";
  
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
    min-height: 32rem;
		height: 100%;
    width: 100%;;
	}
</style>
