import { onDestroy, onMount } from 'svelte';
import type { Subscription } from 'rxjs';
import { zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { poll } from '$src/utils/poll';
import { BeaconService } from '$src/streams/beacons/beacon-service';
import { MarkersController } from './markers.controller';
import { NavDeviceService } from '$src/streams/navdev/navdev.service';

const flat = <T>(x: T[]) => x.flat();

export function useMarkers(): void {
	let subscription: Subscription;

	onMount(() => {
		subscription = zip(BeaconService.get(), NavDeviceService.get())
			.pipe(
				poll(10000), // Polling interval is 10 seconds
				map(flat)
			)
			.subscribe((markers) => MarkersController.set(markers));
	});

	onDestroy(() => {
		subscription.unsubscribe();
	});
}
