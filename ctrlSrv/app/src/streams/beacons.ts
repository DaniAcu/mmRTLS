import { catchError, map, Observable, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";
import type { Beacon } from "src/interfaces/beacon.interface";
import { MarkerType } from "./marker.types";
import type { Marker } from "./marker.types";

export const BEACON_ICON_URL = './static/markers/antenna.png';

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
    icon: BEACON_ICON_URL,
    lat: beacon.x,
    lng: beacon.y
  }
}