import { setContext, getContext } from 'svelte';
import type { IndoorMap } from './indoor-map.model';

const key = Symbol('map');

type MapGetter = () => IndoorMap;

export const MapContext = {
	get: (): IndoorMap => getContext<MapGetter>(key)(),
	set: (map: MapGetter): void => setContext(key, map)
};

export default MapContext;
