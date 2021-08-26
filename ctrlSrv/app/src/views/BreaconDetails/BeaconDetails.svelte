<script lang="ts">
	import type { Beacon } from '../../interfaces/beacon.interface';

	import type { MarkerOf } from '../../streams/marker.types';
	import Dialog from '../../components/Dialog/Dialog.svelte';
	import { markerSubject } from '../../streams/markers-interactions';

	export let beacon: MarkerOf<Beacon> | null = null;

	function onClose() {
		markerSubject.next(null);
	}
</script>

<Dialog isVisible={!!(beacon && beacon.data)} on:close={onClose}>
	<h3>{beacon?.data.name}</h3>
	<section class="flex items-center gap-4 py-8">
		<img class="h-16 w-16" src={beacon?.icon} alt="beacon icon" />
		<ul class="leading-loose flex-1">
			<li>
				<strong><abbr title="Media Access Control">MAC</abbr> address:</strong>
				<span>{beacon?.data.mac}</span>
			</li>
			<li>
				<strong>Channel:</strong>
				<span>{beacon?.data.channel}</span>
			</li>
			<li>
				<strong><abbr title="TSSI">TSSI</abbr>:</strong>
				<span>{beacon?.data.tssi}</span>
			</li>
			<li>
				<strong>Position:</strong>
				<span>x: {beacon?.x}, y: {beacon?.y}</span>
			</li>
		</ul>
	</section>
</Dialog>
