import { Map } from "leaflet";
import type { ICartesianMap } from "src/interfaces/cartesian-map.interface";

export class CartesianMap implements ICartesianMap {

    private readonly leafletMap: Map;

    constructor(
        nativeElement: HTMLElement
    ) {
        this.leafletMap = new Map(nativeElement);
    }

    addMarker(): void {
        throw new Error("Method not implemented.");
    }
    removeMarker(): void {
        throw new Error("Method not implemented.");
    }
    setUpHover(): void {
        throw new Error("Method not implemented.");
    }
    setUpClick(): void {
        throw new Error("Method not implemented.");
    }
    updateBackgroundImage(): void {
        throw new Error("Method not implemented.");
    }
    setDimentions(): void {
        throw new Error("Method not implemented.");
    }
    
}