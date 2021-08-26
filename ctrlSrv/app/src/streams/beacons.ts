import { catchError, map, Observable, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import type { Beacon } from '$src/interfaces/beacon.interface';
import { MarkerOf, MarkerType } from './marker.types';

export const BEACON_ICON_URL = './static/markers/antenna.png';

export type BeaconInfo = Omit<Beacon, 'beaconId' | 'x' | 'y'>;

export const beacons$: Observable<MarkerOf<BeaconInfo>[]> = fromFetch(
	'http://localhost:3000/beacons',
	{
		selector: (response) => response.json() as Promise<Beacon[]>
	}
).pipe(
	catchError((err) => {
		console.error(err);
		return of([] as Beacon[]);
	}),
	map((beacons) => beacons.map(fromBeaconToMarker))
);

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
