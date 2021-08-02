
<script lang="ts">
    import * as L  from 'leaflet'
    import { onDestroy, onMount, setContext } from "svelte";
    import 'leaflet/dist/leaflet.css';
    import { key } from './Map.context';

    const MOCK_IMAGE = "./img/indoor-map.png";

    let mapNode: HTMLDivElement;
    let map: L.Map;

    setContext(key, {
		getMap: () => map
	});

    onMount(() => {
        map = L.map(mapNode, {
            crs: L.CRS.Simple
        });

        const bounds: L.LatLngBoundsExpression = [[0,0], [1000,1000]];
        L.imageOverlay(MOCK_IMAGE, bounds).addTo(map);
        map.fitBounds(bounds);
    });

    onDestroy(() => {
        map.off();
        map.remove();
    });
</script>

<div class="map" bind:this={mapNode}>
    {#if map}
		<slot></slot>
	{/if}
</div>