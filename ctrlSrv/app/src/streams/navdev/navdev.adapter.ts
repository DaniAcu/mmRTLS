import type { NavDevice } from '$src/interfaces/nav-device.interface';
import type { MarkerOf, NavDeviceInfo } from '$src/streams/markers/types';
import { MarkerType } from '$src/streams/markers/types';

export class NavDevAdapter {
	static toMarker(navDev: NavDevice): MarkerOf<NavDeviceInfo> {
		const { navId, positions, ...navDevice } = navDev;

		return {
			id: `navDevice-${navId}`,
			type: MarkerType.NAVDEV,
			icon: './static/markers/location.png',
			x: positions[0].x,
			y: positions[0].y,
			data: {
				id: navId,
				...navDevice
			}
		};
	}

	static toMarkers(navDevs: NavDevice[]): MarkerOf<NavDeviceInfo>[] {
		return navDevs.filter((nav) => nav.positions).map(NavDevAdapter.toMarker);
	}
}
