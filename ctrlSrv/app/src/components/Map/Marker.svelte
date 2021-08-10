<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import MapContext from "./map-context";

    export let lat: number;
    export let lng: number;
    export let icon: string | undefined;


    const map = MapContext.get();

    onMount(() => map.addMarker({ lat, lng, icon }));

    onDestroy(() => map.removeMarker({ lat, lng, icon }));
</script>