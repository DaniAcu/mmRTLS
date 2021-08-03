import type { Map, LatLngBoundsExpression, LeafletMouseEvent, LatLngTuple, Marker } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MOCK_IMAGE = "./indoor-map.png";

interface ActionMap {
	destroy(): void
}

export function map(node: HTMLElement): ActionMap | Record<string, never> {

	if(typeof window === "undefined") return {};

	node.innerHTML = "";

	const Map = createMap(node, MOCK_IMAGE);

	return {
		destroy() {
			Map.delete();
		}
	};

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

function createMap(node: HTMLElement, image: string) {
	let map: Map;
	const markers: Marker[] = []

	Promise.all([
		import('leaflet'),
		loadImage(image)
	]).then(([ { default: L }, mapImage ]) => {
		map = L.map(node, {
				crs: L.CRS.Simple,
				minZoom: -1
		});

		console.log([mapImage.naturalHeight, mapImage.naturalWidth])
		
		const [height, width] = [mapImage.naturalHeight, mapImage.naturalWidth];

		const bounds: LatLngBoundsExpression = [[0,0], [height, width]];

		L.imageOverlay(image, bounds).addTo(map);

		const Layer = L.layerGroup().addTo(map);

		map.fitBounds(bounds);

		map.on('click', ({latlng}: LeafletMouseEvent) => {
			const coord: LatLngTuple = [latlng.lat, latlng.lng];
			const marker = L.marker(coord).addTo(Layer);
			markers.push(marker);
			L.polyline(markers.map(m => [m.getLatLng().lat, m.getLatLng().lng])).addTo(Layer)
		})

	})

	return {
		delete () {
			if(!map) return;
			map.off();
			map.remove();
		}
	}
}
