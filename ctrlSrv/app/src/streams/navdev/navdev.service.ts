import type { NavDevice } from '$src/interfaces/nav-device.interface';
import type { Observable } from 'rxjs';
import { of } from 'rxjs';
import { map } from 'rxjs/operators';
import type { MarkerOf, NavDeviceInfo } from '$src/streams/markers/types';
import createRequest from '$src/utils/request';
import { NavDevAdapter } from './navdev.adapter';

export class NavDeviceService {
	static get(): Observable<MarkerOf<NavDeviceInfo>[]> {
		const filter = {
			order: 'navId ASC',
			fields: {
				navId: true,
				macAddress: true,
				onboardingDate: true,
				lastConnected: true
			},
			include: [
				{
					relation: 'positions',
					scope: {
						order: 'positionId DESC',
						limit: 1
					}
				}
			]
		};

		const request = {
			endpoint: NavDeviceService.getURL('http://localhost:3000/nav-devs', filter),
			getDefault: () => of([] as NavDevice[]),
			getId: () => ''
		};

		return createRequest<NavDevice>(request, 'GET').pipe(map(NavDevAdapter.toMarkers));
	}

	private static getURL(endpoint: string, filter: unknown): string {
		const url = new URL(endpoint);

		url.search += new URLSearchParams({
			filter: JSON.stringify(filter)
		});

		return url.toString();
	}
}
