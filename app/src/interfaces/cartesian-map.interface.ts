import type { ICartesianMapMarker, ICartesianPosition } from "./position.interface";

export interface ICartesianMapMarkersInteractions<T extends ICartesianMapMarker> {
    addMarker(marker: T): void;
    removeMarker(markerId: T['id']): void;
    removeMarker(markerCoordinates: T & ICartesianPosition): void;
}

export interface ICartesianMapActions {
    updateBackgroundImage(imageUrl: string): void;
    setBounds(maxPosition: ICartesianPosition): void;
    setBounds(minPosition: ICartesianPosition, maxPosition: ICartesianPosition): void;
}

export type ICartesianMap<T extends ICartesianMapMarker> = ICartesianMapMarkersInteractions<T> & ICartesianMapActions;