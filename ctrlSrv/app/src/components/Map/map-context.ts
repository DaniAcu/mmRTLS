import { setContext, getContext } from 'svelte';
import type { IndoorMap } from './indoor-map.model';
import type { Marker, MarkerEvents } from '$src/streams/markers/types';

const key = Symbol('map');

type InteractiveMarker = Marker & MarkerEvents;

type MapGetter<T extends InteractiveMarker> = () => IndoorMap<T>;

export const MapContext = {
	get: <T extends InteractiveMarker>(): IndoorMap<T> => getContext<MapGetter<T>>(key)(),
	set: <T extends InteractiveMarker>(map: MapGetter<T>): void => setContext(key, map)
};

export default MapContext;
