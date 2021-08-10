import type { Map } from './map'
import { setContext, getContext } from "svelte";

const key = Symbol('map');

type MapGetter = () => Map

export const MapContext = {
  get: (): Map => getContext<MapGetter>(key)(),
  set: (map: MapGetter): void => setContext(key, map)
}

export default MapContext;