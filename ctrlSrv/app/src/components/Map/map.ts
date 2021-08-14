import type {
  MapOptions as LeafletMapOptions,
  LatLngBoundsExpression, 
  LatLngLiteral,
  Marker,
  IconOptions,
  LeafletEventHandlerFn
} from 'leaflet';

import 'leaflet/dist/leaflet.css';

interface MarkerOptions extends LatLngLiteral {
  icon?: string;
}

export interface Map {
  addEventListener(eventName: string, callback: LeafletEventHandlerFn): void;
  addMarker(latLng: MarkerOptions): void;
  removeMarker(latLng: MarkerOptions): void;
  delete(): void;
}

const generateMarkerKey = ({ lat, lng }: LatLngLiteral) => `${lat}-${lng}`

export async function createMap(target: HTMLElement, imageOverlay: string): Promise<Map> {
  const MarkerMap = new Map<string, Marker>();

	const [L, map] = await initMap({ target, imageOverlay });

	return {
    addEventListener(eventName: string, callback: LeafletEventHandlerFn) {
      map.on(eventName, callback);
    },
    addMarker({ icon: iconUrl, ...latLng}: MarkerOptions){
      const key = generateMarkerKey(latLng);
      const iconOptions = createIcon(iconUrl);

      const marker = L.marker(latLng, iconOptions && {
        icon: L.icon(iconOptions)
      }).addTo(map);
      
      MarkerMap.set(key, marker)
    },
    removeMarker(latLng: LatLngLiteral){
      const key = generateMarkerKey(latLng);
      const marker = MarkerMap.get(key);

      if(!marker) return;

      marker.remove()   
    },
		delete() {
			map.off();
			map.remove();
		}
	}
}

const createIcon: (iconUrl?: string) => IconOptions | undefined = (iconUrl?: string) => {
  if (!iconUrl) return undefined;
  
  return {
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [0, 16]
  };
}

interface MapConfig extends Pick<LeafletMapOptions, 'minZoom'> {
  imageOverlay: string;
  target: HTMLElement;
}

function initMap({ imageOverlay, target, minZoom = -1 }: MapConfig) {
  return Promise.all([
		import('leaflet'),
		loadImage(imageOverlay)
	]).then(
    ([{ default: L }, mapImage ]) => [L, mapImage] as const
  ).then(
    ([L, image]) => {
      const map = L.map(target, {
        crs: L.CRS.Simple,
        minZoom
      });

      /* Defined the bounds to have the same ratio that the image */
      const bounds: LatLngBoundsExpression = [
        [0,0], 
        [image.naturalHeight, image.naturalWidth]
      ];

      L.imageOverlay(imageOverlay, bounds).addTo(map);

      map.fitBounds(bounds);

      return [L, map] as const;
    }
  )
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