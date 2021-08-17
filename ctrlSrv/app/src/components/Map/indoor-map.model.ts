import type { IIndoorMap } from "src/interfaces/indoor-map.interface";
import type { IIndoorMapMarker, IIndoorPosition } from "src/interfaces/position.interface";
import type * as Leaflet from 'leaflet';
import type { MarkerIconOptions, MarkerIconSizeOptions } from "src/interfaces/marker-icon.interface";

const generateIcon = (leaflet: typeof Leaflet, {iconUrl, size, origin}: MarkerIconOptions) => leaflet.icon({
    iconUrl: iconUrl,
    iconSize: [size, size],
    iconAnchor: origin
})
export class IndoorMap<T extends IIndoorMapMarker> implements IIndoorMap<T> {

    private readonly leafletMap: Leaflet.Map;
    private readonly markersMap: Map<T['id'], Leaflet.Marker> = new Map();

    constructor(
        private readonly leaflet: typeof Leaflet,
        nativeElement: HTMLElement,
        backgroundImage: HTMLImageElement,
        private defaultIconConfig: MarkerIconSizeOptions = {
            origin: [0, 16],
            size: 32
        }
    ) {

        this.leafletMap = this.leaflet.map(nativeElement, {
            crs: this.leaflet.CRS.Simple,
            minZoom: -1,
        });

        const imageUrl = backgroundImage.src;
        const bounds: Leaflet.LatLngBoundsExpression = [
            [0, 0],
            [backgroundImage.naturalHeight, backgroundImage.naturalWidth]
        ];
        
        this.leaflet.imageOverlay(imageUrl, bounds).addTo(this.leafletMap);

        this.leafletMap.fitBounds(bounds);
    }

    public updateIconSize(iconSize: number, origin: [number, number] = [iconSize / 2, iconSize / 2]): void {
        this.defaultIconConfig.size = iconSize;
        this.defaultIconConfig.origin = origin;
        this.updateExistingMarkersIconsSizes(iconSize, origin);
    }

    public getCenter(): Leaflet.LatLng {
        return this.leafletMap.getCenter();
    }

    public addMarker({x, y, id, icon, draggable}: T): void {
        const newMarker = new this.leaflet.Marker({
            lat: x,
            lng: y
        }, { draggable });
        const iconConfig: MarkerIconOptions = {
            ...this.defaultIconConfig,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            iconUrl: icon || this.leaflet.Icon.Default.imagePath!
        }
        newMarker.setIcon(generateIcon(this.leaflet, iconConfig));
        this.markersMap.set(id, newMarker);
        this.leafletMap.addLayer(newMarker);
    }

    public addMarkerDargEndListener(id: T["id"], callback: (marker: Leaflet.LatLng) => void): void {
        const marker = this.markersMap.get(id);

        if (!marker) return;

        marker.on('dragend', () => {
            callback(marker.getLatLng());
        })
    }

    public removeMarker(markerOrMarkerId: T['id'] | IIndoorMapMarker): void {
        const markerId = typeof markerOrMarkerId === 'object' ? markerOrMarkerId.id : markerOrMarkerId;
        const marker = this.markersMap.get(markerId);
        if (marker) {
            this.markersMap.delete(markerId);
            marker.remove();
        }
    }

    public setBounds(minOrMaxPosCoordinates: IIndoorPosition, maxPosCoordinates?: IIndoorPosition): void {
        let minPos: Leaflet.LatLngTuple;
        let maxPos: Leaflet.LatLngTuple;
        if (maxPosCoordinates) {
            minPos = [minOrMaxPosCoordinates.x, minOrMaxPosCoordinates.y];
            maxPos = [maxPosCoordinates.x, maxPosCoordinates.y];
        } else {
            minPos = [0, 0];
            maxPos = [minOrMaxPosCoordinates.x, minOrMaxPosCoordinates.y];
        }
        this.leafletMap.setMaxBounds([minPos, maxPos]);
    }

    private updateBackgroundImage(imageElement: HTMLImageElement, fitBoundsToImageSize = false): void {
        const imageUrl = imageElement.src;
        const bounds: Leaflet.LatLngBoundsExpression = [
            [0, 0],
            [imageElement.naturalHeight, imageElement.naturalWidth]
        ];
        const imageOverlay = this.leaflet.imageOverlay(imageUrl, bounds);
        imageOverlay.addTo(this.leafletMap);
        if (fitBoundsToImageSize) {
            this.leafletMap.fitBounds(bounds);
        }
    }

    public destroy(): void {
        this.leafletMap.off();
        this.leafletMap.remove();
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