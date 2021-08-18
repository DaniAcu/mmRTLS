import type { IIndoorMapMarker, IIndoorMapMarkerEntity, IIndoorPosition } from "./position.interface";

export interface IIndoorMapMarkersInteractions<T extends IIndoorMapMarker> {
    addMarker(marker: T): T & IIndoorMapMarkerEntity;
    removeMarker(markerId: T['id']): void;
    removeMarker(markerCoordinates: T & IIndoorPosition): void;
}

export interface IIndoorMapActions {
    setBounds(maxPosition: IIndoorPosition): void;
    setBounds(minPosition: IIndoorPosition, maxPosition: IIndoorPosition): void;
}

export type IIndoorMap<T extends IIndoorMapMarker> = IIndoorMapMarkersInteractions<T> & IIndoorMapActions;

export interface IConfigurableIndoorMap<T extends IIndoorMapMarker> extends IIndoorMap<T> {
    updateBackgroundImage: (backgroundImage: HTMLImageElement) => void;
}