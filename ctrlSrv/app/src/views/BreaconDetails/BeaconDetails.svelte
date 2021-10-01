<script lang="ts">
	import Button from 'smelte/src/components/Button/Button.svelte';
	import Dialog from '$src/components/Dialog/Dialog.svelte';

	import type { BeaconInfo, MarkerOf } from '$src/streams/markers/types';
	import { BeaconController } from '$src/streams/beacons/beacons.controller';
	import BeaconDelete from '../BeaconDelete/BeaconDelete.svelte';
	import Actions from '$src/components/Menu/Actions';
	import { createMenuActionsStream, menuActions } from '$src/components/Menu/menu.stream';
	import { MarkersController } from '$src/streams/markers/markers.controller';

	const isEditBeaconEnabled$ = createMenuActionsStream(Actions.EDIT);

	export let beacon: MarkerOf<BeaconInfo> | null = null;

	function onClose(): void {
		MarkersController.unselect();
	}

	function onEdit(): void {
		if (!beacon) return;

		menuActions.next(Actions.EDIT);

		const {
			x,
			y,
			data: { id, ...markerData }
		} = beacon;

		BeaconController.add({
			beaconId: id,
			x,
			y,
			...markerData
		});
	}
</script>

<Dialog
	isVisible={!$isEditBeaconEnabled$ && !!(beacon && beacon.data)}
	fullHeight={true}
	on:close={onClose}
>
	<h3>{beacon?.data.name}</h3>
	<section class="flex items-center gap-4 py-8">
		<img class="h-16 w-16" src={beacon?.icon} alt="beacon icon" />
		<ul class="leading-loose flex-1">
			<li>
				<strong><abbr title="Media Access Control">MAC</abbr> address:</strong>
				<span>{beacon?.data.mac}</span>
			</li>
			<li>
				<strong>Channel:</strong>
				<span>{beacon?.data.channel}</span>
			</li>
			<li>
				<strong><abbr title="TSSI">TSSI</abbr>:</strong>
				<span>{beacon?.data.tssi}</span>
			</li>
			<li>
				<strong>Position:</strong>
				<span>x: {beacon?.x}, y: {beacon?.y}</span>
			</li>
		</ul>
	</section>
	<BeaconDelete {beacon} />
	<Button on:click={onEdit}>Edit</Button>
</Dialog>
