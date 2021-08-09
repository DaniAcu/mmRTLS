export interface MarkerIconSizeOptions {
    size: number;
    origin: [number, number];
}

export interface MarkerIconOptions extends MarkerIconSizeOptions {
    iconUrl: string;
}