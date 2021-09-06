import type { Marker } from '$src/streams/marker.types';
import type { MarkerIconSizeOptions } from 'src/interfaces/marker-icon.interface';
import { loadImage } from '../../utils/load-image.function';
import { IndoorMap } from './indoor-map.model';
import Leaflet from './leaflet/leaflet';
interface MapConfig {
	imageOverlay: string;
	target: HTMLElement;
	defaultIconConfig?: MarkerIconSizeOptions;
}

/**Loads leaflet and the default background image in parallel */
export async function createMap({
	imageOverlay,
	target,
	defaultIconConfig
}: MapConfig): Promise<IndoorMap<Marker>> {
	return Promise.all([Leaflet.resolve(), loadImage(imageOverlay)]).then(
		([, mapImage]) => new IndoorMap(target, mapImage, defaultIconConfig)
	);
}
