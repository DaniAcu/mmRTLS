import { Subject, BehaviorSubject } from 'rxjs';
import { filter, map, switchMap, tap, withLatestFrom } from 'rxjs/operators';
import type { Beacon } from '$src/interfaces/beacon.interface';
import { menuActions } from '$src/components/Menu/menu.stream';
import Actions from '$src/components/Menu/Actions';
import { BeaconService } from './beacon-service';
import { MarkersController } from '../markers/markers.controller';

export const BeaconController = (function () {
	/* Creation beaconstream */
	const buildingBeacon = new BehaviorSubject<Partial<Beacon>>({});
	const beaconIsReadyToSave$ = buildingBeacon.pipe(filter(isValidBeacon));

	/* Save beacon action*/
	const saveBeacon = new Subject<void>();
	const savedBeacon$ = saveBeacon.pipe(
		withLatestFrom(beaconIsReadyToSave$),
		switchMap(([, beacon]) => BeaconService.save(beacon)),
		map((beacon) => !!beacon.id),
		tap((isSaved) => {
			if (!isSaved) return;
			MarkersController.unselect();
			BeaconController.reset();
			menuActions.next(null);
		})
	);

	return {
		getObservable() {
			return buildingBeacon.asObservable();
		},
		get() {
			return buildingBeacon.getValue();
		},
		reset() {
			buildingBeacon.next({});
		},
		add(beacon: Partial<Beacon>) {
			buildingBeacon.next(beacon);
		},
		save() {
			saveBeacon.next();
		},
		subscribe(next: (value: boolean) => void) {
			return savedBeacon$.subscribe(next);
		}
	};
})();

/* 

  utils

*/

function isValidBeacon(beacon: Partial<Beacon>): beacon is Beacon {
	const activeAction = menuActions.getValue();
	const isComplete = !!(
		beacon.mac &&
		beacon.name &&
		beacon.tssi &&
		beacon.channel &&
		beacon.x &&
		beacon.y
	);
	if (activeAction === Actions.EDIT) return isComplete && !!beacon.beaconId;
	return isComplete;
}
