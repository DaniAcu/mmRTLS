import { Observable, Subject } from 'rxjs';
import {  filter, map, withLatestFrom } from 'rxjs/operators';
import type { NavDevice } from 'src/interfaces/nav-device.interface';
import type { Beacon } from '../interfaces/beacon.interface';
import type { Marker } from './marker.types';
import { MarkerType } from './marker.types';
import type { MarkerInfo } from './markers';

export const markerSubject = new Subject<string | null>();

type MarkersObservable<T> = Observable<Marker<T>[]>;
type MarkerClickedObservable<T> = Observable<Marker<T>  | undefined>;


export const getMarkerClicked = <T>(markers$: MarkersObservable<T>): MarkerClickedObservable<T> => {
  const markerClicked = markerSubject.asObservable();

  return markerClicked.pipe(
    withLatestFrom(markers$),
    map(([markerId, markers]) => {
      return markers.find(marker => marker.id === markerId);
    })
  )
}

export const getBeaconClicked = (markers$: MarkersObservable<MarkerInfo>): MarkerClickedObservable<Beacon> => 
  getMarkerClicked(markers$).pipe(
    filter(
      (marker): marker is Marker<Beacon> | undefined => {
        if(marker) return marker.type === MarkerType.BEACON;
        return true;
      }
    )
  );

export const getNavDeviceClicked = (markers$: MarkersObservable<MarkerInfo>): MarkerClickedObservable<NavDevice> => 
  getMarkerClicked(markers$).pipe(
    filter(
      (marker): marker is Marker<NavDevice> | undefined => {
        if(marker) return marker.type === MarkerType.NAVDEV;
        return true;
      }
    )
  );
