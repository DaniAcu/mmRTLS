export interface ICartesianMapMarkersInteractions {
    addMarker(): void;
    removeMarker(): void;
    setUpHover(): void;
    setUpClick(): void;
}

export interface ICartesianMapActions {
    updateBackgroundImage(): void;
    setDimentions(): void;
}

export type ICartesianMap = ICartesianMapMarkersInteractions & ICartesianMapActions;