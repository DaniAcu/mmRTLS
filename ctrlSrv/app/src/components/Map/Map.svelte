
<script lang="ts">
  import { onDestroy, onMount, createEventDispatcher } from "svelte";

  import MapContext from "./map-context";
  import { createMap } from './map';
  import type { Map } from './map';

  const dispatch = createEventDispatcher();
  
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
      .then(m => {
        map = m;

        map.addEventListener("click", () => dispatch("click"));
      });
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
		height: 100%;
    width: 100%;;
	}
</style>
