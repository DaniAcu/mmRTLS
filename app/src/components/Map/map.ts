import type {
  MapOptions as LeafletMapOptions,
} from 'leaflet';
import type { IIndoorMap } from 'src/interfaces/indoor-map.interface';
import { IndoorMap } from './indoor-map.model';


export async function createMap(target: HTMLElement, imageOverlay: string): Promise<IIndoorMap<never>> {
	return await initMap({ target, imageOverlay });
}

interface MapConfig extends Pick<LeafletMapOptions, 'minZoom'> {
  imageOverlay: string;
  target: HTMLElement;
}

/**Loads leaflet and the default background image in parallel */
async function initMap({ imageOverlay, target }: MapConfig) {
  return Promise.all([
		import('leaflet'),
		loadImage(imageOverlay)
	]).then(
    ([{ default: L }, mapImage ]) => new IndoorMap(L, target, mapImage))
}

function loadImage(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve) => {
		const image = new Image(0, 0);
		image.src = src;
		image.hidden = true;

		image.addEventListener("load", () => resolve(image))

		document.body.appendChild(image);
		document.body.removeChild(image);
	});
}