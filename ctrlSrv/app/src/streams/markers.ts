import { map, BehaviorSubject, zip } from 'rxjs';
import type { Observable } from 'rxjs';
import { beacons$ } from './beacons';
import { navDevices$ } from './navdev';
import type { MarkerOf } from './marker.types';
import { poll } from '../utils/operators';
import type { BeaconInfo } from './beacons';
import type { NavDeviceInfo } from './navdev';

export type MarkerInfo = BeaconInfo | NavDeviceInfo;

const markersSubject = new BehaviorSubject<MarkerOf<MarkerInfo>[]>([]);

zip(beacons$, navDevices$)
	.pipe(
		poll(10000), // Polling interval is 10 seconds
		map((x) => x.flat())
	)
	.subscribe((markers) => {
		markersSubject.next(markers);
	});

export const getMarkers = (): Observable<MarkerOf<MarkerInfo>[]> => markersSubject.asObservable();
