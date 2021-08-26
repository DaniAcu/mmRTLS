export interface NavDevice {
	navId: number;
	macAddress: string;
	onboardingDate: string;
	lastConnected: string;
	positions: Position[];
}

export interface Position {
	positionId: number;
	x: number;
	y: number;
	time: string;
	navId: number;
}
