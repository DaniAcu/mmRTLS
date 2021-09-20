import type { Beacon } from '$src/interfaces/beacon.interface';
import type { NavDevice } from '$src/interfaces/nav-device.interface';

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

export type Position = Pick<Marker, 'x' | 'y'>;

type WithId<T> = { id: number } & T;

export type NavDeviceInfo = WithId<Omit<NavDevice, 'navId' | 'positions'>>;

export type BeaconInfo = WithId<Omit<Beacon, 'beaconId' | 'x' | 'y'>>;

export type MarkerInfo = BeaconInfo | NavDeviceInfo;

export interface MarkerOf<T extends MarkerInfo> extends Marker {
	data: T;
}

export interface MarkerEvents {
	onClick?(id: Marker['id']): void;
	onDrag?(id: Marker['id'], postion: Pick<Marker, 'x' | 'y'>): void;
}
