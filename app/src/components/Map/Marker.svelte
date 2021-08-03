<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import MapContext from "./map-context";

    export let lat: number;
    export let lng: number;

    const map = MapContext.get();

    onMount(() => map.addMarker({ lat, lng }));

    onDestroy(() => map.removeMarker({ lat, lng }));
</script>