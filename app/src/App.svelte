<script lang="ts">
	import { map } from "./map";

	console.log();
</script>

<main>
	<h1>Map</h1>
	<div class="map" use:map></div>
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

	.map {
		height: 32rem;
	}
</style>