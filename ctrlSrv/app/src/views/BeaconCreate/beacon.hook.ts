import { menuActions } from '$src/components/Menu/menu.stream';
import { creatingBeacon, saveBeacon, savedBeacon$ } from '$src/streams/beacons';
import { markersSubject } from '$src/streams/markers';
import type { Subscription } from 'rxjs';
import { onDestroy, onMount } from 'svelte';

export const useSaveBeacon = (): (() => void) => {
	let subscription: Subscription;

	onMount(() => {
		subscription = savedBeacon$.subscribe((beacon) => {
			const isSaved = !!beacon.id;
			if (isSaved) {
				markersSubject.next([...markersSubject.getValue(), beacon]);
				creatingBeacon.next({});
				menuActions.next(null);
			} else alert('Fail! Try again!');
		});
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});

	return () => saveBeacon.next();
};
