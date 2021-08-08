import { map, Observable, zip } from 'rxjs';
import { beacons$ } from './beacons';
import { navDevices$ } from './navdev';
import type { Marker } from './marker.types'

export const getMarkers = (): Observable<Marker[]> => 
  zip(
    beacons$,
    navDevices$
  ).pipe(map(x => x.flat()))
