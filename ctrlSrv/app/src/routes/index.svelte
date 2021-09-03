<script lang="ts" context="module">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import { mapBackgroundImage, mapMaxPosition } from '../store/map-background-image.store';

	const UPLOAD_MAP_ROUTE = '/upload-map';

	export const load: (
		input: LoadInput
	) => Promise<
		LoadOutput<{
			mapSize: IIndoorPosition;
			backgroundImage: string;
		}>
	> = async () => {
		const config = mapMaxPosition.value;
		const backgroundImage = mapBackgroundImage.value;
		const configIsLoaded = !!config;
		return new Promise((resolve) => {
			resolve(
				configIsLoaded && !!backgroundImage
					? {
							status: 200,
							props: {
								mapSize: config as IIndoorPosition,
								backgroundImage
							}
					  }
					: {
							status: 303,
							redirect: UPLOAD_MAP_ROUTE
					  }
			);
		});
	};
</script>

<script lang="ts">
	import Marker from '../components/Map/Marker.svelte';
	import Map from '../components/Map/Map.svelte';
	import { Menu } from '$src/components/Menu/Menu';
	import type { MenuActions } from '$src/components/Menu/Menu';
	import BeaconDetails from '../views/BreaconDetails/BeaconDetails.svelte';
	import NavDeviceDetails from '../views/NavDeviceDetails/NavDeviceDetails.svelte';
	import BeaconCreate from '../views/BeaconCreate/BeaconCreate.svelte';
	import { onMount$ } from '../utils/lifecycles';
	import { getMarkers } from '../streams/markers';
	import type { IIndoorPosition } from '$src/interfaces/position.interface';
	import {
		getBeaconClicked,
		getNavDeviceClicked,
		markerSubject
	} from '$src/streams/markers-interactions';
	import { menuActions } from '$src/components/Menu/menu.stream';
	import type { Marker as IMarker } from '$src/streams/marker.types';

	export let mapSize: IIndoorPosition;
	export let backgroundImage: string;

	const markers$ = onMount$.pipe(getMarkers);

	const beaconsMarkerClicked$ = getBeaconClicked(markers$);
	const navDeviceMarkerClicked$ = getNavDeviceClicked(markers$);

	const onMarkerClick = (e: CustomEvent<{ id: IMarker['id'] }>) => {
		const { id } = e.detail;
		markerSubject.next(id);
	};

	const onChange = (e: CustomEvent<MenuActions>) => {
		menuActions.next(e.detail);
	};
</script>

<div class="container">
	<Map {backgroundImage} {mapSize} editMode={false}>
		<Menu on:choose={onChange} />
		<BeaconCreate />
		{#each $markers$ as { x, y, id, icon } (id)}
			<Marker {x} {y} {id} {icon} on:click={onMarkerClick} />
		{/each}
	</Map>
	<BeaconDetails beacon={$beaconsMarkerClicked$} />
	<NavDeviceDetails navDevice={$navDeviceMarkerClicked$} />
</div>
