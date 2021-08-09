
<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import MapContext from "./map-context";
  import { CartesianMap } from "../../models/cartesian-map.model";
  
  export const config = {
    imageOverlay: "./static/indoor-map.png"
  };

  let mapNode: HTMLDivElement;
  let map: CartesianMap<any>;

  MapContext.set(() => map);

  onMount(async () => {
      const leaflet = await import('leaflet');
      map = new CartesianMap(leaflet, mapNode);
      map.updateBackgroundImage(config.imageOverlay, true);
  });

  onDestroy(() =>  {
    if(!map) return;

    map.destroy()
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
