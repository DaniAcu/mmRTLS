<script lang="ts">
    import type { IIndoorMapMarker, IIndoorMapMarkerEntity } from "src/interfaces/position.interface";

    import { onDestroy, onMount } from "svelte";
    import MapContext from "./map-context";

    export let {
        x,
        y,
        name,
        id,
        type,
        icon
    }: IIndoorMapMarker = {
        x: NaN,
        y: NaN,
        name: '',
        id: -1,
        type: -1,
        icon: undefined
    } as IIndoorMapMarker;

    $: {
        if (x && y && markerEntity) {
            markerEntity.updatePosition({x, y});
        }
    }


    const map = MapContext.get();
    let markerEntity: IIndoorMapMarkerEntity;

    onMount(() => {
        markerEntity = map.addMarker({ x, y, id, name, icon, type });
    });

    onDestroy(() => map.removeMarker({ x, y, id, name, icon, type }));
</script>