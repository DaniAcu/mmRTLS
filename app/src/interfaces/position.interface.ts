import type { IEntity } from "./entity.interface";

export interface ICartesianPosition {
    x: number;
    y: number;
}

export interface ICartesianMapMarker extends IEntity, ICartesianPosition {
    icon?: string;
    type: number;
}
