<script lang="ts">
	import { MarkerType } from '$src/streams/marker.types';
	import type { Marker } from '$src/streams/marker.types';

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { IndoorMapMarker } from './indoor-map-marker.model';
	import MapContext from './map-context';

	export let { x, y, id, type, icon }: Marker = {
		x: NaN,
		y: NaN,
		id: '1',
		type: MarkerType.DEFAULT,
		icon: undefined
	} as Marker;

	const map = MapContext.get();
	let markerEntity: IndoorMapMarker;

	const dispatch = createEventDispatcher();

	const onClick = (id: Marker['id']) => dispatch('click', id);

	onMount(() => {
		markerEntity = map.addMarker({ x, y, id, icon, type, onClick });
	});

	$: {
		if (x && y && markerEntity) {
			markerEntity.setPosition({ x, y });
		}
	}

	onDestroy(() => map.removeMarker({ x, y, id, icon, type }));
</script>
