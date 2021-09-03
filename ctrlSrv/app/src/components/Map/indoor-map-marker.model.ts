import type { Marker, MarkerEvents, Position } from '$src/streams/marker.types';
import type LeafletLib from 'leaflet';
import type { MarkerIconSizeOptions } from '$src/interfaces/marker-icon.interface';
import type { MarkerConfig } from '$src/interfaces/indoor-map.interface';

type Leaflet = typeof LeafletLib;

type IconConfig = Partial<MarkerIconSizeOptions>;

export class IndoorMapMarker {
	private leafletRef: LeafletLib.Marker;

	constructor(
		private readonly leaflet: Leaflet,
		private marker: Marker & MarkerEvents,
		config: Partial<MarkerConfig> = {}
	) {
		const { x: lat, y: lng, icon, onClick, onDrag } = marker;
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
		if (onDrag)
			this.leafletRef.on('dragend', () => {
				const { lat, lng } = this.leafletRef.getLatLng();
				const position = { x: lng, y: lat };
				this.setMarkerPosition(position);
				onDrag(marker.id, position);
			});
	}

	public putIn(map: LeafletLib.Map): void {
		map.addLayer(this.leafletRef);
	}

	public setPosition({ x, y }: Position): void {
		this.setMarkerPosition({ x, y });
		this.leafletRef.setLatLng([y, x]);
	}

	private setMarkerPosition({ x, y }: Position): void {
		this.marker.x = x;
		this.marker.y = y;
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
