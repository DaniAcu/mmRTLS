<script lang="ts">
    import type { IIndoorMapMarker } from "src/interfaces/position.interface";

    import { onDestroy, onMount } from "svelte";
    import MapContext from "./map-context";

    export let {
        x,
        y,
        name,
        id,
        type,
        icon,
        onClick
    } = {
        x: NaN,
        y: NaN,
        name: '',
        id: -1,
        type: -1
    } as IIndoorMapMarker;


    const map = MapContext.get();

    onMount(() => map.addMarker({ x, y, id, name, icon, type, onClick }));

    onDestroy(() => map.removeMarker({ x, y, id, name, icon, type }));
</script>