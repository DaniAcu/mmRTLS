import { catchError, map, Observable, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import type { Beacon } from "src/interfaces/beacon.interface";
import { Marker, MarkerType } from "./marker.types";

export const beacons$:  Observable<Marker[]> = 
  fromFetch('http://localhost:3000/beacons', {
    selector: response => response.json() as Promise<Beacon[]>
  }).pipe(
    catchError(err => {
      console.error(err);
      return of([] as Beacon[])
    }),
    map(beacons => beacons.map(fromBeaconToMarker))
  );

function fromBeaconToMarker(beacon: Beacon): Marker {
  return {
    id: `beacon-${beacon.beaconId}`,
    type: MarkerType.BEACON,
    icon: './static/markers/antenna.png',
    lat: beacon.x,
    lng: beacon.y
  }
}