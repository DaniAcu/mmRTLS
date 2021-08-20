import { Observable, Subject } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';
import type { Marker } from './marker.types';

export const beaconsMarkerSubject = new Subject<Marker["id"]>();


export const getBeaconsMarkerClicked = (markers$: Observable<Marker[]>): Observable<Marker> => {
  const beaconsMarkerClicked = beaconsMarkerSubject.asObservable();

  return beaconsMarkerClicked.pipe(
    withLatestFrom(markers$),
    map(([beaconId, markers]) => {
      console.log(beaconId, markers);
      return markers.find(m => m.id === beaconId);
    }),
    filter((m): m is Marker => !!m)
  )
}
