import type { IConfigurableIndoorMap } from 'src/interfaces/indoor-map.interface';
import type { MarkerIconSizeOptions } from 'src/interfaces/marker-icon.interface';
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

export function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve) => {
		const image = new Image(0, 0);
		image.src = src;
		image.hidden = true;

		image.addEventListener("load", () => {
			resolve(image);
		});

		image.addEventListener('error', () => {
			image.width = 1;
			image.height = 1;
			resolve(image);
		})


		document.body.appendChild(image);
		document.body.removeChild(image);
	});
}