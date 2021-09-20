import { onDestroy, onMount } from 'svelte';

import type { Subscription } from 'rxjs';
import { BeaconController } from '$src/streams/beacons/beacons.controller';

export const useSaveBeacon = (): (() => void) => {
	let subscription: Subscription;

	onMount(() => {
		subscription = BeaconController.subscribe((isSaved) => {
			if (!isSaved) alert('Fail! Try again!');
		});
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});

	return BeaconController.save;
};
