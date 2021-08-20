import { map, Observable, zip } from 'rxjs';
import { beacons$ } from './beacons';
import { navDevices$ } from './navdev';
import type { Marker } from './marker.types'
import { poll } from '../utils/operators';

export const getMarkers = (): Observable<Marker[]> => 
  zip(
    beacons$,
    navDevices$
  ).pipe(
    poll(10000), // Polling interval is 10 seconds
    map(x => x.flat())
  )
