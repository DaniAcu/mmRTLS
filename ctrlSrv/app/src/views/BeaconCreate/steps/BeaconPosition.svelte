<script lang="ts">
	import { onMount } from 'svelte';
	import { createStepNavigationEvents } from './steps.events';
	import TextField from 'smelte/src/components/TextField';
	import Button from 'smelte/src/components/Button';
	import Marker from '$src/components/Map/Marker.svelte';
	import Dialog from '$src/components/Dialog/Dialog.svelte';
	import { creatingBeacon } from '$src/streams/beacons';
	import MapContext from '$src/components/Map/map-context';
	import type { Marker as IMarker, Position } from '$src/streams/marker.types';

	const { next, previous } = createStepNavigationEvents();

	const map = MapContext.get();

	let positionX = map.getCenter().x;
	let positionY = map.getCenter().y;

	onMount(() => {
		const beacon = creatingBeacon.getValue();
		if (beacon.x) {
			positionX = beacon.x;
		}

		if (beacon.y) {
			positionY = beacon.y;
		}
	});

	interface DragEventDetail {
		id: IMarker['id'];
		position: Pick<IMarker, 'x' | 'y'>;
	}

	function setPosition(position: Position) {
		positionX = position.x;
		positionY = position.y;
		creatingBeacon.next({ x: positionX, y: positionY });
	}

	function onDrag(e: CustomEvent<DragEventDetail>): void {
		const { position } = e.detail;
		setPosition(position);
	}

	function onChange(e: Event) {
		const inputHtml = e.target as HTMLInputElement;
		const name = inputHtml.name as 'x' | 'y';
		const value = parseFloat(inputHtml.value);

		if (name === 'x') {
			setPosition({ x: value, y: positionY });
		}

		if (name === 'y') {
			setPosition({ x: positionX, y: value });
		}
	}
</script>

<Marker
	x={positionX}
	y={positionY}
	id="create-beacon"
	icon="./static/markers/antenna.png"
	draggable
	on:drag={onDrag}
/>

<Dialog isVisible={true} on:close={previous}>
	<form action="#" class="flex flex-col" on:submit|preventDefault={next}>
		<fieldset class="auto-grid" id="postions">
			<legend class="text-xl">Set Beacon positions</legend>
			<TextField
				name="x"
				pattern={`[0-9]+(\\.[0-9]{1,2})?%?`}
				label="Postion X"
				value={positionX.toFixed(2)}
				on:change={onChange}
				require
			/>
			<TextField
				name="y"
				pattern={`[0-9]+(\\.[0-9]{1,2})?%?`}
				label="Postion Y"
				value={positionY.toFixed(2)}
				on:change={onChange}
				require
			/>
		</fieldset>
		<Button type="submit" class="self-end">Next</Button>
	</form>
</Dialog>

<style>
	:global(.auto-grid) {
		display: grid;
		gap: 0.5em;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
	}
</style>
