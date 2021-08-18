import type { IConfigurableIndoorMap } from "src/interfaces/indoor-map.interface";
import type { IIndoorMapMarker, IIndoorMapMarkerEntity, IIndoorPosition } from "src/interfaces/position.interface";
import type * as Leaflet from 'leaflet';
import type { MarkerIconOptions, MarkerIconSizeOptions } from "src/interfaces/marker-icon.interface";
import { IndoorMapMarker } from "./indoor-map-marker.model";

const generateIcon = (leaflet: typeof Leaflet, {iconUrl, size, origin}: MarkerIconOptions) => leaflet.icon({
    iconUrl: iconUrl,
    iconSize: [size, size],
    iconAnchor: origin
})
export class IndoorMap<T extends IIndoorMapMarker> implements IConfigurableIndoorMap<T> {

    private readonly leafletMap: Leaflet.Map;
    private readonly markersMap: Map<T['id'], IndoorMapMarker> = new Map();

    private imageOverlay!: Leaflet.ImageOverlay;

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
            zoom: 0,
        });

        this.createBackgroundOverlay();

        if (backgroundImage) {
            this.updateBackgroundImage(backgroundImage);
        }
    }

    public updateIconSize(iconSize: number, origin: [number, number] = [iconSize / 2, iconSize / 2]): void {
        this.defaultIconConfig.size = iconSize;
        this.defaultIconConfig.origin = origin;
        this.updateExistingMarkersIconsSizes(iconSize, origin);
    }

    public addMarker({x, y, id, icon, type, name}: T): IIndoorMapMarkerEntity {
        const newLeafletMarker = new this.leaflet.Marker({
            lat: y,
            lng: x
        });
        const iconConfig: MarkerIconOptions = {
            ...this.defaultIconConfig,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            iconUrl: icon || this.leaflet.Icon.Default.imagePath!
        }
        newLeafletMarker.setIcon(generateIcon(this.leaflet, iconConfig));
        this.leafletMap.addLayer(newLeafletMarker);
        const newMarker = new IndoorMapMarker(newLeafletMarker, type, id, name, x, y);
        this.markersMap.set(id, newMarker);
        return newMarker;
    }

    public removeMarker(markerOrMarkerId: T['id'] | IIndoorMapMarker): void {
        const markerId = typeof markerOrMarkerId === 'object' ? markerOrMarkerId.id : markerOrMarkerId;
        const marker = this.markersMap.get(markerId);
        if (marker) {
            this.markersMap.delete(markerId);
            marker.destroy();
        }
    }

    public setBounds({x: minMaxX, y: minMaxY}: IIndoorPosition, maxPosCoordinates?: IIndoorPosition): void {
        if (!minMaxX || !minMaxY) {
            return
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
        this.imageOverlay.setBounds(bounds);
        this.leafletMap.fitBounds(bounds);
        // this.leafletMap.setMinZoom(this.leafletMap.getZoom());
    }

    public updateBackgroundImage(imageElement: HTMLImageElement, fitBoundsToImageSize = true): void {
        const imageUrl = imageElement.src;
        const imageOverlayElement = this.imageOverlay.getElement();
        if (imageOverlayElement) {
            imageOverlayElement.src = imageUrl;
        }
        const bounds: Leaflet.LatLngBoundsExpression = [
            [0, 0],
            [imageElement.naturalHeight, imageElement.naturalWidth]
        ];
        this.imageOverlay.setBounds(this.leaflet.latLngBounds(bounds));
        if (fitBoundsToImageSize) {
            this.leafletMap.fitBounds(bounds);
        }
    }

    public destroy(): void {
        this.leafletMap.off();
        this.leafletMap.remove();
    }

    private createBackgroundOverlay() {
        this.imageOverlay = this.leaflet.imageOverlay('', [[0, 0], [100, 100]]);
        this.imageOverlay.addTo(this.leafletMap);
    }

    private updateExistingMarkersIconsSizes(iconSize: number, origin: [number, number] = [iconSize / 2, iconSize / 2]): void {
        this.markersMap.forEach((marker) => {
            const markerIcon = marker.getIcon();
            const iconOptions = markerIcon.options;
            iconOptions.iconSize = [iconSize, iconSize];
            iconOptions.iconAnchor = origin;
            marker.setIcon(markerIcon);
        });
    }
    
}