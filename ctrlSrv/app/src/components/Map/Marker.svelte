<script lang="ts">
	import { MarkerType } from '$src/streams/markers/types';
	import type { Marker, Position } from '$src/streams/markers/types';

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

	export let draggable = false;
	export let disabled = false;

	const map = MapContext.get();
	let marker: IndoorMapMarker;

	type MarkerEventData<T> = { id: Marker['id'] } & T;

	interface MarkerEvents {
		click: MarkerEventData<unknown>;
		drag: MarkerEventData<{ position: Position }>;
	}

	const dispatch = createEventDispatcher<MarkerEvents>();

	onMount(() => {
		marker = map.addMarker({ x, y, id, icon, type }, { draggable });
		marker.on('click', ({ id }) => dispatch('click', { id }));
		marker.on('drag', ({ id, x, y }) => dispatch('drag', { id, position: { x, y } }));
	});

	$: {
		if (marker) {
			if (!isNaN(x) && !isNaN(y)) marker.setPosition({ x, y });
			marker.setDisabled(disabled);
		}
	}

	onDestroy(() => map.removeMarker({ x, y, id, icon, type }));
</script>

<style>
	:global(.marker-icon--disabled) {
		opacity: 0.5;
	}
</style>
