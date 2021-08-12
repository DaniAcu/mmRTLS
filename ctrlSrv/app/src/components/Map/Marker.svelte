<script lang="ts">
    import type { ICartesianMapMarker } from "src/interfaces/position.interface";

    import { onDestroy, onMount } from "svelte";
    import MapContext from "./map-context";

    export let {
        x,
        y,
        id,
        name,
        icon,
        type
    }: ICartesianMapMarker = {
        x: NaN,
        y: NaN,
        name: '',
        id: -1,
        type: -1,
        icon: undefined
    };


    const map = MapContext.get();

    onMount(() => map.addMarker({ x, y, id, name, icon, type }));

    onDestroy(() => map.removeMarker({ x, y, id, name, icon, type }));
</script>