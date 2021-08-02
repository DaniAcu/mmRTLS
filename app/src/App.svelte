<script lang="ts">
	import type { Beacon } from "./interfaces/beacon.interface";

	import Map from './components/Map.svelte';
	import MapMarker from './MapMarker.svelte';
	import { fetchStore } from "./stores";

	const beacons = fetchStore<Beacon[]>('http://localhost:3000/beacons', []);
</script>

<svelte:head>
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons"
		rel="stylesheet">
</svelte:head>

<main>
	<h1>Map</h1>
	<Map>
		{#each $beacons as {x, y, beaconId} (beaconId)}
			<MapMarker {x} {y}></MapMarker>
		{/each}
	</Map>
</main>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 240px;
		margin: 0 auto;
	}

	h1 {
		color: #ff3e00;
		text-transform: uppercase;
		font-size: 4em;
		font-weight: 100;
		margin: 0;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}

	main :global(.map) {
		height: 32rem;
	}

	:global(.circle-icon) {
		background-color: #0097a7;
		color: black;
		border-radius: 50%;
		padding: 10px;
	}
</style>