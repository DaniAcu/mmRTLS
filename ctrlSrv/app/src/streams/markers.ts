import type { Observable } from 'rxjs';
import { BehaviorSubject, zip } from 'rxjs';
import { map } from 'rxjs/operators';
import { beacons$ } from './beacons';
import { navDevices$ } from './navdev';
import type { MarkerOf } from './marker.types';
import { poll } from '../utils/operators';
import type { BeaconInfo } from './beacons';
import type { NavDeviceInfo } from './navdev';

export type MarkerInfo = BeaconInfo | NavDeviceInfo;

type Marker = MarkerOf<BeaconInfo> | MarkerOf<NavDeviceInfo>;

export const markersSubject = new BehaviorSubject<Marker[]>([]);

const flat = <T>(x: T[]) => x.flat();

zip(beacons$, navDevices$)
	.pipe(
		poll(10000), // Polling interval is 10 seconds
		map(flat)
	)
	.subscribe((markers) => {
		markersSubject.next(markers);
	});

export const getMarkers = (): Observable<MarkerOf<MarkerInfo>[]> => markersSubject.asObservable();
