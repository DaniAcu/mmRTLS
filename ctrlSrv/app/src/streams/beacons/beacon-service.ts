import type { Beacon } from '$src/interfaces/beacon.interface';
import type { Observable } from 'rxjs';
import type { BeaconInfo, MarkerOf } from '../markers/types';

import { of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { menuActions } from '$src/components/Menu/menu.stream';
import Actions from '$src/components/Menu/Actions';
import { MapMarkerController } from '../markers/markers.controller';
import createRequest from '$src/utils/request';
import { BeaconAdapter } from './beacon.adapter';

export class BeaconService {
	static get(): Observable<MarkerOf<BeaconInfo>[]> {
		const request = {
			endpoint: 'http://localhost:3000/beacons',
			getDefault: () => of([] as Beacon[]),
			getId: () => ''
		};

		return createRequest<Beacon>(request, 'GET').pipe(map(BeaconAdapter.toMarkers));
	}

	static create(beacon: Omit<Beacon, 'beaconId'>): Observable<MarkerOf<BeaconInfo>> {
		const request = {
			endpoint: 'http://localhost:3000/beacons',
			getDefault: () => of({} as Beacon),
			getId: () => ''
		};

		return createRequest<Beacon>(request, 'POST', beacon as Beacon).pipe(
			map(BeaconAdapter.toMarker),
			tap(MapMarkerController.update)
		);
	}

	static update(beacon: Beacon): Observable<MarkerOf<BeaconInfo>> {
		const request = {
			endpoint: 'http://localhost:3000/beacons',
			getDefault: () => of(false),
			getId: (item?: Beacon) => (item?.beaconId || '') + ''
		};

		return createRequest<Beacon>(request, 'PUT', beacon).pipe(
			map((status) => (status ? beacon : ({} as Beacon))),
			map(BeaconAdapter.toMarker),
			tap(MapMarkerController.update)
		);
	}

	static remove(beacon: Beacon): Observable<boolean> {
		const request = {
			endpoint: 'http://localhost:3000/beacons',
			getDefault: () => of(false),
			getId: (item?: Beacon) => (item?.beaconId || '') + ''
		};

		return createRequest(request, 'DELETE', beacon).pipe(
			tap(() => {
				MapMarkerController.remove(BeaconAdapter.toMarker(beacon));
			})
		);
	}

	static save(beacon: Beacon): Observable<MarkerOf<BeaconInfo>> {
		const activeAction = menuActions.getValue();
		switch (activeAction) {
			case Actions.CREATE:
				return this.create(beacon);
			case Actions.EDIT:
				return this.update(beacon);
			default:
				return of({} as MarkerOf<BeaconInfo>);
		}
	}
}
