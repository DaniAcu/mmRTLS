import type { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import { MarkerType } from './types';
import type { MarkerOf, MarkerInfo, BeaconInfo, NavDeviceInfo } from './types';

type Marker = MarkerOf<MarkerInfo>;

export const markersSubject = new BehaviorSubject<Marker[]>([]);
const markerClicked = new Subject<string | null>();

export const MapMarkerController = {
	get(): Observable<MarkerOf<MarkerInfo>[]> {
		return markersSubject.asObservable();
	},
	set(marker: Marker[]): void {
		markersSubject.next(marker);
	},
	update<T extends Marker>(marker: T): void {
		const markers = markersSubject.getValue();
		const newMarkers = markers.filter(({ id }) => id !== marker.id);

		markersSubject.next([...newMarkers, marker]);
	},
	remove<T extends Marker>(marker: T): void {
		const markers = markersSubject.getValue();
		const newMarkers = markers.filter(({ id }) => id !== marker.id);

		markersSubject.next(newMarkers);
		markerClicked.next(null);
	},
	select(marker: string): void {
		markerClicked.next(marker);
	},
	unselect(): void {
		markerClicked.next(null);
	},
	getBeaconSelected(): Observable<MarkerOf<BeaconInfo> | undefined> {
		return getMarkerClicked().pipe(
			filter(
				(marker): marker is MarkerOf<BeaconInfo> | undefined =>
					!marker || marker.type === MarkerType.BEACON
			)
		);
	},
	getNavDeviceSelected(): Observable<MarkerOf<NavDeviceInfo> | undefined> {
		return getMarkerClicked().pipe(
			filter(
				(marker): marker is MarkerOf<NavDeviceInfo> | undefined =>
					!marker || marker.type === MarkerType.NAVDEV
			)
		);
	}
};

function getMarkerClicked(): Observable<Marker | undefined> {
	return markerClicked.pipe(
		withLatestFrom(markersSubject.asObservable()),
		map(([markerId, markers]) => {
			return markers.find((marker) => marker.id === markerId);
		})
	);
}
