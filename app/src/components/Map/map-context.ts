import { setContext, getContext } from "svelte";
import type { CartesianMap } from 'src/models/cartesian-map.model';
import type { ICartesianMapMarker } from 'src/interfaces/position.interface';

const key = Symbol('map');

type MapGetter<T extends ICartesianMapMarker> = () => CartesianMap<T>

export const MapContext = {
  get: <T extends ICartesianMapMarker>(): CartesianMap<T> => getContext<MapGetter<T>>(key)(),
  set: <T extends ICartesianMapMarker>(map: MapGetter<T>): void => setContext(key, map)
}

export default MapContext;