<script lang="ts">
	import Button from 'smelte/src/components/Button/Button.svelte';
	import Dialog from 'smelte/src/components/Dialog';
	import ProgressCircular from 'smelte/src/components/ProgressCircular';
	import { BeaconService } from '$src/streams/beacons/beacon-service';

	import type { BeaconInfo, MarkerOf } from '$src/streams/markers/types';

	enum DELETE_STATUS {
		INITIAL,
		CONFIRMING,
		CONFIRMED,
		DECLAINED,
		FETCHING,
		ERROR,
		DONE
	}

	export let beacon: MarkerOf<BeaconInfo> | null;

	$: {
		// Svelte not support guard or typing inside their html. So, we are forced to use this trick
		if (!beacon) throw Error('Beacon provided to BeaconDelete component is not valid');
	}

	let status = DELETE_STATUS.INITIAL;
	$: isConfirmDialogOpen = status === DELETE_STATUS.CONFIRMING;
	$: isFetching = status === DELETE_STATUS.FETCHING;
	$: isFailed = status === DELETE_STATUS.ERROR;

	function setStatus(newStatus: DELETE_STATUS) {
		status = newStatus;
		runSideEffects(status);
	}

	function onStatusChange(newStatus: DELETE_STATUS) {
		return () => setStatus(newStatus);
	}

	function runSideEffects(status: DELETE_STATUS) {
		switch (status) {
			case DELETE_STATUS.CONFIRMED:
				saveDeletedBeacon();
				return;
			case DELETE_STATUS.ERROR:
				// eslint-disable-next-line no-console
				console.error('Beacon deletion failed.');
				return;
			default:
				return;
		}
	}

	function saveDeletedBeacon() {
		if (!beacon) return;
		setStatus(DELETE_STATUS.FETCHING);
		const { x, y } = beacon;
		const { id: beaconId, ...beaconData } = beacon.data;
		const removedBeacon = { x, y, beaconId, ...beaconData };
		BeaconService.remove(removedBeacon).subscribe((success) => {
			if (success) {
				setStatus(DELETE_STATUS.DONE);
			} else {
				setStatus(DELETE_STATUS.ERROR);
			}
		});
	}
</script>

<Button color="error" on:click={onStatusChange(DELETE_STATUS.CONFIRMING)}>Delete Beacon</Button>

{#if isFetching}
	<ProgressCircular />
	<span role="alert" class="sr-only">Deleting the beacon...</span>
{/if}
{#if isFailed}
	<span role="alert" class="text-error-500">Error to delete the beacon. Try again!</span>
{/if}
<Dialog bind:value={isConfirmDialogOpen}>
	<div class="font-normal" slot="title">
		Are you sure you wish to delete this beacon?
		<br />
		This operation is <strong>irreversible</strong>.
		<br />
	</div>
	<div slot="actions">
		<Button color="primary" outlined on:click={onStatusChange(DELETE_STATUS.CONFIRMED)}>Yes</Button>
		<Button color="primary" on:click={onStatusChange(DELETE_STATUS.DECLAINED)}>No</Button>
	</div>
</Dialog>

<!-- markup (zero or more items) goes here -->
