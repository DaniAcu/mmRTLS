import { MarkerType } from "./marker.types";
import type { Marker } from "./marker.types";
import type { NavDevice } from 'src/interfaces/nav-device.interface';
import { catchError, map, Observable, of } from "rxjs";
import { fromFetch } from "rxjs/fetch";

export type NavDeviceInfo = Omit<NavDevice, "navId" | "positions">;

export const navDevices$:  Observable<Marker<NavDeviceInfo>[]> = 
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

function fromNavDeviceToMarker({ navId, positions, ...navDevice }: NavDevice): Marker<NavDeviceInfo> {
  return {
    id: `navDevice-${navId}`,
    type: MarkerType.NAVDEV,
    icon: './static/markers/location.png',
    lat: positions[0].x,
    lng: positions[0].y,
    data: navDevice
  }
}