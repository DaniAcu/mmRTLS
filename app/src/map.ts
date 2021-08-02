import * as L  from 'leaflet'
import 'leaflet/dist/leaflet.css';

const MOCK_IMAGE = "./img/indoor-map.png";

export function map(node: HTMLDivElement) {
	const map = L.map(node, {
      crs: L.CRS.Simple
  });

  const bounds: L.LatLngBoundsExpression = [[0,0], [1000,1000]];
  L.imageOverlay(MOCK_IMAGE, bounds).addTo(map);
  map.fitBounds(bounds);

	return {
		destroy() {
			map.off();
			map.remove();
		}
	};
}