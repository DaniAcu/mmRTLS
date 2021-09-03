import type { IConfigurableIndoorMap, MarkerConfig } from '$src/interfaces/indoor-map.interface';
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
			origin: [16, 32],
			size: 32
		}
	) {
		this.leafletMap = this.leaflet.map(nativeElement, {
			crs: this.leaflet.CRS.Simple,
			center: [0, 0],
			zoom: 0,
			zoomControl: false
		});

		this.leaflet.control
			.zoom({
				position: 'bottomright'
			})
			.addTo(this.leafletMap);

		this.createBackgroundOverlay();

		if (backgroundImage) {
			this.updateBackgroundImage(backgroundImage);
		}
	}

	public addMarker(marker: T, config?: Partial<MarkerConfig>): IndoorMapMarker {
		const { id } = marker;
		const newMarker = new IndoorMapMarker(this.leaflet, marker, {
			...config,
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

	public updateBackgroundImage(
		newImage: HTMLImageElement,
		useImageAspectRatio?: boolean
	): IIndoorPosition;
	public async updateBackgroundImage(
		backgroundImage: string,
		useImageAspectRatio?: boolean
	): Promise<IIndoorPosition>;
	public updateBackgroundImage(
		newImage: HTMLImageElement | string,
		useImageAspectRatio = false
	): Promise<IIndoorPosition> | IIndoorPosition {
		if (typeof newImage === 'string') {
			return loadImage(newImage).then((image) =>
				this.processBackgroundImage(image, useImageAspectRatio)
			);
		}
		return this.processBackgroundImage(newImage, useImageAspectRatio);
	}

	public destroy(): void {
		this.leafletMap.off();
		this.leafletMap.remove();
	}

	private processBackgroundImage(
		image: HTMLImageElement,
		useImageAspectRatio: boolean
	): IIndoorPosition {
		const imageUrl = image.src;
		const imageOverlayElement = this.imageOverlay.getElement();
		if (imageUrl && imageOverlayElement) {
			imageOverlayElement.src = imageUrl;
			const newImageAspectRatio =
				imageOverlayElement.naturalWidth / imageOverlayElement.naturalHeight;
			this.setBounds({
				...this.currentBounds,
				y: useImageAspectRatio ? this.currentBounds.x / newImageAspectRatio : this.currentBounds.y
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

	public getCenter(): IIndoorPosition {
		const { lat, lng } = this.leafletMap.getCenter();
		return { x: lat, y: lng };
	}
}
