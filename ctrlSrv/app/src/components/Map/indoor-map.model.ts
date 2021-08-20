import type { IConfigurableIndoorMap } from "src/interfaces/indoor-map.interface";
import type { IIndoorMapMarker, IIndoorMapMarkerEntity, IIndoorPosition } from "src/interfaces/position.interface";
import type * as Leaflet from 'leaflet';
import type { MarkerIconOptions, MarkerIconSizeOptions } from "src/interfaces/marker-icon.interface";
import { IndoorMapMarker } from "./indoor-map-marker.model";
import { loadImage } from "../../utils/load-image.function";

const generateIcon = (leaflet: typeof Leaflet, {iconUrl, size, origin}: MarkerIconOptions) => leaflet.icon({
    iconUrl: iconUrl,
    iconSize: [size, size],
    iconAnchor: origin
})
export class IndoorMap<T extends IIndoorMapMarker> implements IConfigurableIndoorMap<T> {

    private readonly leafletMap: Leaflet.Map;
    private readonly markersMap: Map<T['id'], {
        markerEntity: IndoorMapMarker,
        leafletMarker: Leaflet.Marker
    }> = new Map();

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

    public addMarker({x, y, id, icon, type, name}: T): IIndoorMapMarkerEntity & T {
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
        const newMarker = new IndoorMapMarker(newLeafletMarker, () => this.removeMarker(id), type, id, name, x, y);
        this.markersMap.set(id, {markerEntity: newMarker, leafletMarker: newLeafletMarker});
        const entityMarker = newMarker as IIndoorMapMarkerEntity;
        return entityMarker as T & IIndoorMapMarkerEntity;
    }

    public removeMarker(markerOrMarkerId: T['id'] | IIndoorMapMarker): void {
        const markerId = typeof markerOrMarkerId === 'object' ? markerOrMarkerId.id : markerOrMarkerId;
        const marker = this.markersMap.get(markerId);
        if (marker) {
            this.markersMap.delete(markerId);
            marker.leafletMarker.off();
            marker.leafletMarker.remove();
        }
    }

    public setBounds({x: minMaxX, y: minMaxY}: IIndoorPosition, maxPosCoordinates?: IIndoorPosition): void {
        if (!minMaxX || !minMaxY || isNaN(minMaxX) || isNaN(minMaxY)) {
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
        this.currentBounds = {
            x: minMaxX,
            y: minMaxY
        };
        this.imageOverlay.setBounds(bounds);
        this.leafletMap.fitBounds(bounds);
    }

    public getBounds(): IIndoorPosition {
        return this.currentBounds;
    }

    public updateBackgroundImage(newImage: HTMLImageElement): IIndoorPosition;
    public async updateBackgroundImage(backgroundImage: string): Promise<IIndoorPosition>;
    public updateBackgroundImage(newImage: HTMLImageElement | string): Promise<IIndoorPosition> | IIndoorPosition {
        if (typeof newImage === 'string') {
            return loadImage(newImage).then(image => this.processBackgroundImage(image));
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
            const newImageAspectRatio = imageOverlayElement.naturalWidth / imageOverlayElement.naturalHeight;
            const newHeight = this.currentBounds.x / newImageAspectRatio;
            this.setBounds({
                ...this.currentBounds,
                y: newHeight
            });
        }
        return this.getBounds();
    }

    private createBackgroundOverlay() {
        this.imageOverlay = this.leaflet.imageOverlay('', [[0, 0], [100, 100]]);
        this.imageOverlay.addTo(this.leafletMap);
    }

    private updateExistingMarkersIconsSizes(iconSize: number, origin: [number, number] = [iconSize / 2, iconSize / 2]): void {
        this.markersMap.forEach(({leafletMarker}) => {
            const markerIcon = leafletMarker.getIcon();
            const iconOptions = markerIcon.options;
            iconOptions.iconSize = [iconSize, iconSize];
            iconOptions.iconAnchor = origin;
            leafletMarker.setIcon(markerIcon);
        });
    }
    
}