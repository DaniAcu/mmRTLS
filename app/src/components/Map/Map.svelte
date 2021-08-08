
<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import MapContext from "./map-context";
  import { createMap } from './map';
  import type { Map } from './map';
  
  export const config = {
    imageOverlay: "./static/indoor-map.png"
  };

  let mapNode: HTMLDivElement;
  let map: Map;

  MapContext.set(() => map);

  onMount(() => {
    const skipSSR = typeof window === "undefined";  
    if(skipSSR) return;
    
    createMap(mapNode, config.imageOverlay)
      .then(m => map = m);
  });

  onDestroy(() =>  {
    if(!map) return;

    map.delete()
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
