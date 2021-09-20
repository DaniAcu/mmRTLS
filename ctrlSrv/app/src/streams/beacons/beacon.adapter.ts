import Actions from '$src/components/Menu/Actions';
import { menuActions } from '$src/components/Menu/menu.stream';
import type { Beacon } from '$src/interfaces/beacon.interface';
import type { BeaconInfo, MarkerOf } from '$src/streams/markers/types';
import { MarkerType } from '$src/streams/markers/types';

export class BeaconAdapter {
	static toMarker(beacon: Beacon): MarkerOf<BeaconInfo> {
		const { beaconId, x, y, ...data } = beacon;
		return {
			id: `beacon-${beaconId}`,
			type: MarkerType.BEACON,
			icon: './static/markers/antenna.png',
			x,
			y,
			data: {
				...data,
				id: beaconId
			}
		};
	}

	static toMarkers(beacons: Beacon[]): MarkerOf<BeaconInfo>[] {
		return beacons.map(BeaconAdapter.toMarker);
	}

	static isValidBeacon(beacon: Partial<Beacon>): beacon is Beacon {
		const activeAction = menuActions.getValue();
		const isComplete = !!(
			beacon.mac &&
			beacon.name &&
			beacon.tssi &&
			beacon.channel &&
			beacon.x &&
			beacon.y
		);
		if (activeAction === Actions.EDIT) return isComplete && !!beacon.beaconId;
		return isComplete;
	}
}
