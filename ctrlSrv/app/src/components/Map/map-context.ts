import { setContext, getContext } from 'svelte';
import type { IIndoorMap } from '$src/interfaces/indoor-map.interface';
import type { Marker, MarkerEvents } from '$src/streams/marker.types';

const key = Symbol('map');

type InteractiveMarker = Marker & MarkerEvents;

type MapGetter<T extends InteractiveMarker> = () => IIndoorMap<T>;

export const MapContext = {
	get: <T extends InteractiveMarker>(): IIndoorMap<T> => getContext<MapGetter<T>>(key)(),
	set: <T extends InteractiveMarker>(map: MapGetter<T>): void => setContext(key, map)
};

export default MapContext;
