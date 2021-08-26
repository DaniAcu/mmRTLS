<script lang="ts">
	import type { IIndoorPosition } from '$src/interfaces/position.interface';
	import { isSamePosition } from '../../utils/position-helpers.function';

	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import type { IndoorMapEvents } from '../../interfaces/indoor-map.interface';
	import type { IndoorMap } from './indoor-map.model';
	import { createMap } from './map';
	import MapContext from './map-context';
	import type { Marker } from '$src/streams/marker.types';

	const dispatch = createEventDispatcher<IndoorMapEvents>();

	const notifyBoundsUpdate = (newDimentions: IIndoorPosition) => {
		dispatch('boundsUpdate', newDimentions);
	};

	const notifyMapUpdate = () => {
		dispatch('mapUpdate');
	};

	let map: IndoorMap<Marker>;
	export let backgroundImage = './static/indoor-map.png';
	$: {
		map?.updateBackgroundImage(backgroundImage).then((newSize) => {
			notifyMapUpdate();
			updateMapBounds(newSize);
		});
	}

	export let mapSize: IIndoorPosition = {
		x: NaN,
		y: NaN
	};
	let internalMapSize: IIndoorPosition = mapSize;

	$: {
		updateMapBounds(mapSize);
	}

	const updateMapBounds = (newBounds: IIndoorPosition) => {
		if (isSamePosition(internalMapSize, newBounds)) {
			return;
		}
		map?.setBounds(newBounds);
		internalMapSize = newBounds;
		mapSize = newBounds;
		notifyBoundsUpdate(newBounds);
	};

	let mapNode: HTMLDivElement;

	MapContext.set(() => map);

	onMount(async () => {
		map = await createMap({ imageOverlay: backgroundImage, target: mapNode });
	});

	onDestroy(() => {
		if (!map) return;

		map.destroy();
	});
</script>

<div class="map" bind:this={mapNode}>
	{#if map}
		<slot />
	{/if}
</div>

<style>
	.map {
		min-height: 32rem;
		height: 100%;
		width: 100%;
	}
</style>
