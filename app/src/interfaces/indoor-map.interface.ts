import type { IIndoorMapMarker, IIndoorPosition } from "./position.interface";

export interface IIndoorMapMarkersInteractions<T extends IIndoorMapMarker> {
    addMarker(marker: T): void;
    removeMarker(markerId: T['id']): void;
    removeMarker(markerCoordinates: T & IIndoorPosition): void;
}

export interface IIndoorMapActions {
    updateBackgroundImage(imageUrl: string, updateBounds: boolean): void;
    setBounds(maxPosition: IIndoorPosition): void;
    setBounds(minPosition: IIndoorPosition, maxPosition: IIndoorPosition): void;
}

export type IIndoorMap<T extends IIndoorMapMarker> = IIndoorMapMarkersInteractions<T> & IIndoorMapActions;