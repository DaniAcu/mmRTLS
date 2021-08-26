import { Observable, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import type { NavDevice } from 'src/interfaces/nav-device.interface';
import type { Beacon } from '../interfaces/beacon.interface';
import type { MarkerOf } from './marker.types';
import { MarkerType } from './marker.types';
import type { MarkerInfo } from './markers';

export const markerSubject = new Subject<string | null>();

type MarkersObservableOf<T> = Observable<MarkerOf<T>[]>;
type MarkerClickedObservableOf<T> = Observable<MarkerOf<T> | undefined>;

export const getMarkerClicked = <T>(
	markers$: MarkersObservableOf<T>
): MarkerClickedObservableOf<T> => {
	const markerClicked = markerSubject.asObservable();

	return markerClicked.pipe(
		withLatestFrom(markers$),
		map(([markerId, markers]) => {
			return markers.find((marker) => marker.id === markerId);
		})
	);
};

export const getBeaconClicked = (
	markers$: MarkersObservableOf<MarkerInfo>
): MarkerClickedObservableOf<Beacon> =>
	getMarkerClicked(markers$).pipe(
		filter((marker): marker is MarkerOf<Beacon> | undefined => {
			if (marker) return marker.type === MarkerType.BEACON;
			return true;
		})
	);

export const getNavDeviceClicked = (
	markers$: MarkersObservableOf<MarkerInfo>
): MarkerClickedObservableOf<NavDevice> =>
	getMarkerClicked(markers$).pipe(
		filter((marker): marker is MarkerOf<NavDevice> | undefined => {
			if (marker) return marker.type === MarkerType.NAVDEV;
			return true;
		})
	);
