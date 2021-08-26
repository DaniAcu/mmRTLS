export enum MarkerType {
	BEACON = 'BEACON',
	NAVDEV = 'NAVDEV',
	DEFAULT = 'DEFAULT'
}

export interface Marker {
	id: string;
	type: MarkerType;
	icon?: string;
	x: number;
	y: number;
}

export interface MarkerOf<T> extends Marker {
	data: T;
}

export interface MarkerEvents {
	onClick?(id: Marker['id']): void;
}
