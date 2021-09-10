<script lang="ts">
	import Button from 'smelte/src/components/Button';
	import Dialog from '../../components/Dialog/Dialog.svelte';
	import SmelteDialog from 'smelte/src/components/Dialog';

	import { markerSubject } from '../../streams/markers-interactions';
	import type { MarkerOf } from '../../streams/marker.types';
	import { createEventDispatcher } from 'svelte';
	import type { BeaconDetailsEvent } from './beacon-details.events';
	import type { BeaconInfo } from '$src/streams/beacons';

	export let beacon: MarkerOf<BeaconInfo> | null = null;

	const dispatch = createEventDispatcher<BeaconDetailsEvent>();

	const deleteBeacon = (beacon: MarkerOf<BeaconInfo>) => dispatch('delete', beacon);

	let deleteDialogOpen = false;

	function onClose(): void {
		markerSubject.next(null);
	}

	function deleteCurrentBeacon(): void {
		deleteDialogOpen = true;
	}

	const closeDeleteDialog = (confirmed: boolean) => {
		deleteDialogOpen = false;
		if (confirmed) {
			deleteBeacon(beacon as MarkerOf<BeaconInfo>);
			onClose();
		}
	};
</script>

<Dialog isVisible={!!(beacon && beacon.data)} fullHeight={true} on:close={onClose}>
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
	<Button color="error" on:click={deleteCurrentBeacon}>Delete Beacon</Button>
</Dialog>

<SmelteDialog bind:value={deleteDialogOpen}>
	<div class="delete-beacon-title" slot="title">
		Are you sure you wish to delete this beacon?
		<br />
		This operation is <strong>irreversible</strong>.
		<br />
	</div>
	<div slot="actions">
		<Button color="primary" outlined on:click={() => closeDeleteDialog(true)}>Yes</Button>
		<Button color="primary" on:click={() => closeDeleteDialog(false)}>No</Button>
	</div>
</SmelteDialog>

<style>
	:global(.z-30) {
		z-index: var(--map-z-index);
	}
	.delete-beacon-title {
		font-weight: initial;
	}
</style>
