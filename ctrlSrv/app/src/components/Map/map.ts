import type { IConfigurableIndoorMap } from 'src/interfaces/indoor-map.interface';
import type { MarkerIconSizeOptions } from 'src/interfaces/marker-icon.interface';
import { loadImage } from '../../utils/load-image.function';
import { IndoorMap } from './indoor-map.model';
interface MapConfig {
  imageOverlay: string;
  target: HTMLElement;
  defaultIconConfig?: MarkerIconSizeOptions;
}

/**Loads leaflet and the default background image in parallel */
export async function createMap({ imageOverlay, target, defaultIconConfig }: MapConfig): Promise<IConfigurableIndoorMap<never>> {
  return Promise.all([
		import('leaflet'),
		loadImage(imageOverlay)
	]).then(
    ([{ default: L }, mapImage ]) => new IndoorMap(L, target, mapImage, defaultIconConfig))
}
