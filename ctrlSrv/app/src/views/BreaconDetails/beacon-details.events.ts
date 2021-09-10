import type { BeaconInfo } from '$src/streams/beacons';
import type { MarkerOf } from '$src/streams/marker.types';

export interface BeaconDetailsEvent {
	delete: MarkerOf<BeaconInfo>;
}
