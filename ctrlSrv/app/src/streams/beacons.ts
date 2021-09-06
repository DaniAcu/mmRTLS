import type { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import {
	catchError,
	map,
	scan,
	withLatestFrom,
	filter,
	switchMap,
	startWith
} from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import type { Beacon } from '$src/interfaces/beacon.interface';
import { MarkerType } from './marker.types';
import type { MarkerOf } from './marker.types';

/**
 * GET BEACONS
 */

export const BEACON_ICON_URL = './static/markers/antenna.png';

export type BeaconInfo = Omit<Beacon, 'beaconId' | 'x' | 'y'>;

export const beacons$: Observable<MarkerOf<BeaconInfo>[]> = fromFetch(
	'http://localhost:3000/beacons',
	{
		selector: (response) => response.json() as Promise<Beacon[]>
	}
).pipe(
	catchError((err) => {
		// eslint-disable-next-line no-console
		console.error(err);
		return of([] as Beacon[]);
	}),
	map((beacons) => beacons.map(fromBeaconToMarker))
);

/**
 * SAVE BEACONS
 */

export const creatingBeacon = new BehaviorSubject<Partial<Beacon>>({});
export const saveBeacon = new BehaviorSubject<void>(void 0);

const beaconReadyToSave$ = creatingBeacon.pipe(
	scan((acum, value) => ({ ...acum, ...value })),
	filter(isValidBeacon)
);

const createdBeacon$ = saveBeacon.pipe(
	withLatestFrom(beaconReadyToSave$),
	map(([, beacon]) => beacon)
);

export const newBeaconMarkerCreated$ = createdBeacon$.pipe(
	map(fromBeaconToMarker),
	startWith(null)
);

export const savedBeacon$ = createdBeacon$.pipe(switchMap(createBeacon));

export function createBeacon(beacon: Omit<Beacon, 'beaconId'>): Observable<MarkerOf<BeaconInfo>> {
	const requestConfig = {
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify(beacon)
	};

	return fromFetch(new Request('http://localhost:3000/beacons', requestConfig), {
		selector: (response) => response.json() as Promise<Beacon>
	}).pipe(
		catchError((err) => {
			// eslint-disable-next-line no-console
			console.error(err);
			return of({} as Beacon);
		}),
		map(fromBeaconToMarker)
	);
}

/**
 * Beacon Utils
 */

function isValidBeacon(beacon: Partial<Beacon>): beacon is Beacon {
	return !!(beacon.mac && beacon.name && beacon.tssi && beacon.channel && beacon.x && beacon.y);
}

function fromBeaconToMarker({ beaconId, x, y, ...beacon }: Beacon): MarkerOf<BeaconInfo> {
	return {
		id: `beacon-${beaconId}`,
		type: MarkerType.BEACON,
		icon: './static/markers/antenna.png',
		x,
		y,
		data: beacon
	};
}
