import Leaflet from './leaflet/leaflet';
import type {
	Marker as LeafletMarker,
	MarkerOptions as LeafletMarkerOptions,
	Map as LeafletMap
} from 'leaflet';
import type { Marker, Position } from '$src/streams/marker.types';
import type { MarkerIconSizeOptions } from '$src/interfaces/marker-icon.interface';
import type { MarkerConfig } from '$src/interfaces/indoor-map.interface';
import type { Observer, Subscription } from 'rxjs';
import { fromEvent } from 'rxjs';
import { map, tap } from 'rxjs/operators';

type IconConfig = Partial<MarkerIconSizeOptions>;

export class IndoorMapMarker {
	private readonly leaflet = Leaflet.get();
	private leafletRef: LeafletMarker;
	private events = new Map<string, Subscription>();

	constructor(private marker: Marker, config: Partial<MarkerConfig> = {}) {
		const { x: lat, y: lng, icon } = marker;
		const { iconConfig = {}, ...leafletMarkerConfig } = config;
		const customIconConfigs = this.generateIconConfig(icon, iconConfig);

		this.leafletRef = new this.leaflet.Marker(
			{ lat, lng },
			{
				...leafletMarkerConfig,
				...customIconConfigs
			}
		);
	}

	public on(event: string, callback: (value: Marker) => void | Observer<Marker>): void {
		const subscription = fromEvent(this.leafletRef, event)
			.pipe(
				tap(() => {
					const { lat, lng } = this.leafletRef.getLatLng();
					const position = { x: lng, y: lat };
					this.setMarkerPosition(position);
				}),
				map(() => this.marker)
			)
			.subscribe(callback);

		this.events.set(event, subscription);
	}

	public putIn(map: LeafletMap): void {
		map.addLayer(this.leafletRef);
	}

	public setPosition({ x, y }: Position): void {
		this.setMarkerPosition({ x, y });
		this.leafletRef.setLatLng([y, x]);
	}

	public destroy(): void {
		this.leafletRef.off();
		this.leafletRef.remove();

		for (const eventName of this.events.keys()) {
			this.events.get(eventName)?.unsubscribe();
			this.events.delete(eventName);
		}
	}

	private setMarkerPosition({ x, y }: Position): void {
		this.marker.x = x;
		this.marker.y = y;
	}

	private generateIconConfig(icon?: string, config?: IconConfig): LeafletMarkerOptions {
		if (!config || !icon || !config.size) return {};

		return {
			icon: this.leaflet.icon({
				iconUrl: icon,
				iconSize: [config.size, config.size],
				iconAnchor: config.origin
			})
		};
	}
}
