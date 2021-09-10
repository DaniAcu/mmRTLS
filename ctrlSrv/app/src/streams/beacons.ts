import type { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, map, scan, filter, switchMap, switchMapTo } from 'rxjs/operators';
import { fromFetch } from 'rxjs/fetch';
import type { Beacon } from '$src/interfaces/beacon.interface';
import { MarkerType } from './marker.types';
import type { MarkerOf } from './marker.types';

const DEFAULT_HEADERS = {
	Accept: 'application/json',
	'Content-Type': 'application/json'
};

const DELETE_BEACON_URL = 'http://localhost:3000/beacons/';

/**
 * GET BEACONS
 */

export const BEACON_ICON_URL = './static/markers/antenna.png';

export interface BeaconInfo extends Omit<Beacon, 'beaconId' | 'x' | 'y'> {
	id: number;
}

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

const createdBeacon$ = saveBeacon.pipe(switchMapTo(beaconReadyToSave$));

export const savedBeacon$ = createdBeacon$.pipe(switchMap(createBeacon));

export function createBeacon(beacon: Omit<Beacon, 'beaconId'>): Observable<MarkerOf<BeaconInfo>> {
	const requestConfig = {
		headers: DEFAULT_HEADERS,
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
		data: {
			...beacon,
			id: beaconId
		}
	};
}

export const deleteBeacon: (beaconId: number) => Observable<boolean> = (beaconId) => {
	const requestConfig: RequestInit = {
		headers: DEFAULT_HEADERS,
		method: 'DELETE'
	};

	return fromFetch(new Request(DELETE_BEACON_URL + beaconId, requestConfig), {
		selector: (response) => of(response.ok)
	}).pipe(catchError(() => of(false))) as Observable<boolean>;
};
