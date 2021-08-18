import type { Marker } from "leaflet";
import type { IIndoorMapMarkerEntity, IIndoorPosition } from "src/interfaces/position.interface";

export class IndoorMapMarker implements IIndoorMapMarkerEntity {
    
    constructor(
        private leafletMarker: Marker,
        public type: number,
        public id: string | number,
        public name: string,
        public x: number,
        public y: number,
        public icon?: string | undefined
    ) { }

    public updatePosition({x, y}: IIndoorPosition): void {
        this.x = x;
        this.y = y;
        this.leafletMarker.setLatLng([y, x]);
    }

    public destroy(): void {
        this.leafletMarker.off();
        this.leafletMarker.remove();
    }
        
}