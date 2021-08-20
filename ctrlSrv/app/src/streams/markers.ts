import { map, Observable, startWith, Subject, timer, zip } from 'rxjs';
import { beacons$ } from './beacons';
import { navDevices$ } from './navdev';
import type { Marker } from './marker.types'
import { poll } from '../utils/operators';

const markersSubject = new Subject<Marker[]>();

zip(
  beacons$,
  navDevices$
).pipe( 
  poll(10000),// Polling interval is 10 seconds
  map(x => x.flat())
).subscribe(markers => {
  markersSubject.next(markers);
})
    
export const getMarkers = (): Observable<Marker[]> => 
  markersSubject.asObservable().pipe(startWith([]));