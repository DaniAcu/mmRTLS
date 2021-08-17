import { setContext, getContext } from "svelte";
import type { IIndoorMapMarker } from "src/interfaces/position.interface";
import type { IIndoorMap } from "src/interfaces/indoor-map.interface";


const key = Symbol('map');

type MapGetter<T extends IIndoorMapMarker> = () => IIndoorMap<T>

export const MapContext = {
  get: <T extends IIndoorMapMarker>(): IIndoorMap<T> => getContext<MapGetter<T>>(key)(),
  set: <T extends IIndoorMapMarker>(map: MapGetter<T>): void => setContext(key, map)
}

export default MapContext;