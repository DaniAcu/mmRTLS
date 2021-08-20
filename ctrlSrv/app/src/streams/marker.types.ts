export enum MarkerType {
  BEACON = "BEACON",
  NAVDEV = "NAVDEV"
}

export interface Marker<T> {
  id: string | number;
  type: MarkerType;
  icon?: string;
  lat: number;
  lng: number;
  data: T;
}