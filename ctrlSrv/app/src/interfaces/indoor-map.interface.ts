import type LeafletLib from 'leaflet';
import type { IndoorMapMarker } from '$src/components/Map/indoor-map-marker.model';
import type { Marker } from '$src/streams/marker.types';
import type { IIndoorPosition } from './position.interface';
import type { MarkerIconSizeOptions } from './marker-icon.interface';

export interface MarkerConfig extends Omit<LeafletLib.MarkerOptions, 'icon'> {
	iconConfig: Partial<MarkerIconSizeOptions>;
}

export interface IIndoorMapMarkersInteractions<T extends Marker> {
	addMarker(marker: T, config?: Partial<MarkerConfig>): IndoorMapMarker;
	removeMarker(markerId: T['id']): void;
	removeMarker(markerCoordinates: T & IIndoorPosition): void;
}

export interface IIndoorMapActions {
	setBounds(maxPosition: IIndoorPosition): void;
	setBounds(minPosition: IIndoorPosition, maxPosition: IIndoorPosition): void;
}

export type IIndoorMap<T extends Marker> = IIndoorMapMarkersInteractions<T> & IIndoorMapActions;

export interface IConfigurableIndoorMap<T extends Marker> extends IIndoorMap<T> {
	updateBackgroundImage(
		backgroundImage: HTMLImageElement,
		useImageAspectRatio?: boolean
	): IIndoorPosition;
	updateBackgroundImage(
		backgroundImage: string,
		useImageAspectRatio?: boolean
	): Promise<IIndoorPosition>;
	updateBackgroundImage(
		backgroundImage: string | HTMLImageElement,
		useImageAspectRatio: boolean
	): Promise<IIndoorPosition> | IIndoorPosition;
}

export interface IndoorMapEvents {
	boundsUpdate: IIndoorPosition;
	mapUpdate: void;
}
