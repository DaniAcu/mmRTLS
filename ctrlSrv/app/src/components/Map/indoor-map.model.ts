import type { IConfigurableIndoorMap } from '$src/interfaces/indoor-map.interface';
import type { IIndoorPosition } from '$src/interfaces/position.interface';
import type * as Leaflet from 'leaflet';
import type { MarkerIconSizeOptions } from '$src/interfaces/marker-icon.interface';
import { IndoorMapMarker } from './indoor-map-marker.model';
import { loadImage } from '../../utils/load-image.function';
import type { Marker, MarkerEvents } from '$src/streams/marker.types';

type InteractiveMarker = Marker & MarkerEvents;

export class IndoorMap<T extends InteractiveMarker> implements IConfigurableIndoorMap<T> {
	private readonly leafletMap: Leaflet.Map;
	private readonly markersMap: Map<T['id'], IndoorMapMarker> = new Map();

	private imageOverlay!: Leaflet.ImageOverlay;
	private currentBounds: IIndoorPosition = {
		x: 100,
		y: 100
	};

	constructor(
		private readonly leaflet: typeof Leaflet,
		nativeElement: HTMLElement,
		backgroundImage?: HTMLImageElement,
		private defaultIconConfig: MarkerIconSizeOptions = {
			origin: [0, 16],
			size: 32
		}
	) {
		this.leafletMap = this.leaflet.map(nativeElement, {
			crs: this.leaflet.CRS.Simple,
			center: [0, 0],
			zoom: 0
		});

		this.createBackgroundOverlay();

		if (backgroundImage) {
			this.updateBackgroundImage(backgroundImage);
		}
	}

	public addMarker(marker: T): IndoorMapMarker {
		const { id } = marker;
		const newMarker = new IndoorMapMarker(this.leaflet, marker, {
			iconConfig: this.defaultIconConfig
		});

		newMarker.putIn(this.leafletMap);

		this.markersMap.set(id, newMarker);

		return newMarker;
	}

	public removeMarker(markerOrMarkerId: T['id'] | T): void {
		const markerId = typeof markerOrMarkerId === 'object' ? markerOrMarkerId.id : markerOrMarkerId;

		const marker = this.markersMap.get(markerId);

		if (!marker) return;

		this.markersMap.delete(markerId);
		marker.destroy();
	}

	public setBounds(
		{ x: minMaxX, y: minMaxY }: IIndoorPosition,
		maxPosCoordinates?: IIndoorPosition
	): void {
		if (!minMaxX || !minMaxY || isNaN(minMaxX) || isNaN(minMaxY)) {
			return;
		}
		let minPos: Leaflet.LatLngTuple;
		let maxPos: Leaflet.LatLngTuple;
		if (maxPosCoordinates) {
			minPos = [minMaxY, minMaxX];
			maxPos = [maxPosCoordinates.y, maxPosCoordinates.x];
		} else {
			minPos = [0, 0];
			maxPos = [minMaxY, minMaxX];
		}
		const bounds = this.leaflet.latLngBounds([minPos, maxPos]);
		this.currentBounds = {
			x: minMaxX,
			y: minMaxY
		};
		this.imageOverlay.setBounds(bounds);
		this.leafletMap.fitBounds(bounds);
		this.leafletMap.setView(bounds.getCenter(), this.leafletMap.getBoundsZoom(bounds));
	}

	public getBounds(): IIndoorPosition {
		return this.currentBounds;
	}

	public updateBackgroundImage(newImage: HTMLImageElement): IIndoorPosition;
	public async updateBackgroundImage(backgroundImage: string): Promise<IIndoorPosition>;
	public updateBackgroundImage(
		newImage: HTMLImageElement | string
	): Promise<IIndoorPosition> | IIndoorPosition {
		if (typeof newImage === 'string') {
			return loadImage(newImage).then((image) => this.processBackgroundImage(image));
		}
		return this.processBackgroundImage(newImage);
	}

	public destroy(): void {
		this.leafletMap.off();
		this.leafletMap.remove();
	}

	private processBackgroundImage(image: HTMLImageElement): IIndoorPosition {
		const imageUrl = image.src;
		const imageOverlayElement = this.imageOverlay.getElement();
		if (imageUrl && imageOverlayElement) {
			imageOverlayElement.src = imageUrl;
			const newImageAspectRatio =
				imageOverlayElement.naturalWidth / imageOverlayElement.naturalHeight;
			const newHeight = this.currentBounds.x / newImageAspectRatio;
			this.setBounds({
				...this.currentBounds,
				y: newHeight
			});
		}
		return this.getBounds();
	}

	private createBackgroundOverlay() {
		this.imageOverlay = this.leaflet.imageOverlay('', [
			[0, 0],
			[100, 100]
		]);
		this.imageOverlay.addTo(this.leafletMap);
	}
}
