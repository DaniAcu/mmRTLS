<script lang="ts">
import type { LatLng } from "leaflet";

    import type { IIndoorMapMarker } from "src/interfaces/position.interface";

    import { onDestroy, onMount, createEventDispatcher } from "svelte";
    import MapContext from "./map-context";

    const dispatch = createEventDispatcher();
    export let draggable: IIndoorMapMarker["draggable"] = false;
    export let center: boolean = false;

    export let {
        x,
        y,
        name,
        id,
        type,
        icon,
    }: IIndoorMapMarker = {
        x: NaN,
        y: NaN,
        name: '',
        id: '',
        type: -1
    };


    const map = MapContext.get();

    onMount(() => {
        if(center) {
            const { lat, lng } = map.getCenter();
            map.addMarker({ x: lat, y: lng, id, name, icon, type, draggable })
        } else {
            map.addMarker({ x, y, id, name, icon, type, draggable })
        }

        map.addMarkerDargEndListener(
            id, 
            (position: LatLng) => dispatch("dragend", position)
        )
    });

    onDestroy(() => map.removeMarker({ x, y, id, name, icon, type }));
</script>