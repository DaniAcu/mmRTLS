import { Observable, zip } from 'rxjs';
import { catchError, map, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import type { Beacon } from 'src/interfaces/beacon.interface';
import type { NavDevice } from 'src/interfaces/nav-device.interface';

export enum MarkerType {
  BEACON = "BEACON",
  NAVDEV = "NAVDEV"
}

interface Marker {
  id: string;
  type: MarkerType;
  icon?: string;
  lat: number;
  lng: number;
}

export const getMarkers = (): Observable<Marker[]> => 
  zip(
    beaconsStream,
    navDevicesStream
  ).pipe(map(x => x.flat()))

const beaconsStream:  Observable<Marker[]> = 
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

const navDevicesStream:  Observable<Marker[]> = 
  fromFetch(
    generateGetNavDeviceURL("http://localhost:3000/nav-devs"), 
    {
      selector: response => response.json() as Promise<NavDevice[]>
    }
  ).pipe(
    catchError(err => {
      console.error(err);
      return of([])
    }),
    map(navDevs => 
      navDevs
        .filter(nav => nav.positions)
        .map(fromNavDeviceToMarker)
    )
  );

function generateGetNavDeviceURL(path: string) {
  const params = {
    "order": "navId ASC",
    "fields": {
      "navId": true,
      "macAddress": true,
      "onboardingDate": true,
      "lastConnected": true
    },
    "include": [
      {
        "relation": "positions",
        "scope": {
          "order": "positionId DESC",
          "limit": 1
        }
      }
    ]
  };

  const url = new URL(path);

  url.search += new URLSearchParams({
    filter: JSON.stringify(params)
  }).toString();

  return url.toString();
}

function fromNavDeviceToMarker(navDevice: NavDevice): Marker {
  return {
    id: `navDevice-${navDevice.navId}`,
    type: MarkerType.NAVDEV,
    icon: './static/markers/location.png',
    lat: navDevice.positions[0].x,
    lng: navDevice.positions[0].y
  }
}