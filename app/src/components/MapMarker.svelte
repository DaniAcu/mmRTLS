<script lang="ts">
    import { getContext, onDestroy, onMount } from "svelte";
    import { key } from "./Map.context";
    import * as L  from 'leaflet'
    import { createMaterialIcon } from "../utils/functions/maps-helpers";

    export let x: number;
    export let y: number;

    const { getMap }: { getMap: () => L.Map } = getContext(key);
    const map = getMap();
    
    let markerInstance: L.Marker;

    onMount(() => {
        markerInstance = L.marker([x, y], {
            icon: createMaterialIcon()
        });
        markerInstance.addTo(map);
    });

    onDestroy(() => {
        markerInstance.remove();
    });
</script>