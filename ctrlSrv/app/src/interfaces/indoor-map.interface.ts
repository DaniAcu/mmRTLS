import type { LatLng } from "leaflet";
import type { IIndoorMapMarker, IIndoorPosition } from "./position.interface";

export interface IIndoorMapMarkersInteractions<T extends IIndoorMapMarker> {
    addMarker(marker: T): void;
    addMarkerDargEndListener(id: T["id"], callback: (marker: LatLng) => void): void;
    removeMarker(markerId: T['id']): void;
    removeMarker(markerCoordinates: T & IIndoorPosition): void;
    getCenter(): LatLng;
}

export interface IIndoorMapActions {
    setBounds(maxPosition: IIndoorPosition): void;
    setBounds(minPosition: IIndoorPosition, maxPosition: IIndoorPosition): void;
}

export type IIndoorMap<T extends IIndoorMapMarker> = IIndoorMapMarkersInteractions<T> & IIndoorMapActions;