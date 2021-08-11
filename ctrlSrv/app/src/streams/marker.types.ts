export enum MarkerType {
  BEACON = "BEACON",
  NAVDEV = "NAVDEV"
}

export interface Marker {
  id: string;
  type: MarkerType;
  icon?: string;
  lat: number;
  lng: number;
}