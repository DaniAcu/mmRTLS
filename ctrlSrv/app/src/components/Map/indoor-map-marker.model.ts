import type { Marker, MarkerEvents } from '$src/streams/marker.types';
import type LeafletLib from 'leaflet';
import type { MarkerIconSizeOptions } from '$src/interfaces/marker-icon.interface';

type Leaflet = typeof LeafletLib;

type Position = Pick<Marker, 'x' | 'y'>;

type IconConfig = Partial<MarkerIconSizeOptions>;

interface MarkerConfig extends Omit<LeafletLib.MarkerOptions, 'icon'> {
	iconConfig: IconConfig;
}

export class IndoorMapMarker {
	private leafletRef: LeafletLib.Marker;

	constructor(
		private readonly leaflet: Leaflet,
		private marker: Marker & MarkerEvents,
		config: Partial<MarkerConfig> = {}
	) {
		const { x: lat, y: lng, icon, onClick } = marker;
		const { iconConfig = {}, ...leafletMarkerConfig } = config;
		const customIconConfigs = this.generateIconConfig(icon, iconConfig);

		this.leafletRef = new this.leaflet.Marker(
			{ lat, lng },
			{
				...leafletMarkerConfig,
				...customIconConfigs
			}
		);

		if (onClick) this.leafletRef.on('click', () => onClick(marker.id));
	}

	public putIn(map: LeafletLib.Map): void {
		map.addLayer(this.leafletRef);
	}

	public setPosition({ x, y }: Position): void {
		this.marker.x = x;
		this.marker.y = y;
		this.leafletRef.setLatLng([y, x]);
	}

	private generateIconConfig(icon?: string, config?: IconConfig): LeafletLib.MarkerOptions {
		if (!config || !icon || !config.size) return {};

		return {
			icon: this.leaflet.icon({
				iconUrl: icon,
				iconSize: [config.size, config.size],
				iconAnchor: config.origin
			})
		};
	}

	public destroy(): void {
		this.leafletRef.off();
		this.leafletRef.remove();
	}
}
