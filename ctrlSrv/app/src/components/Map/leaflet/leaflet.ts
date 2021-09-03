import type LeafletNamespace from 'leaflet';

type L = typeof LeafletNamespace;

export class Leaflet {
	private static instance: Leaflet | null = null;

	private constructor(private leaflet: L) {}

	static async resolve(): Promise<L> {
		const { default: L } = await import('leaflet');

		this.instance = new Leaflet(L);

		return L;
	}

	static get(): L {
		if (!this.instance) {
			throw new Error('You called to Leaflet.get whitout calling to Leaflet.resolve first');
		}

		return this.instance.leaflet;
	}
}

export default Leaflet;
