<script lang="ts">
	import Dialog from '$src/components/Dialog/Dialog.svelte';

	import type { MarkerOf, NavDeviceInfo } from '$src/streams/markers/types';
	import { MapMarkerController } from '$src/streams/markers/markers.controller';

	export let navDevice: MarkerOf<NavDeviceInfo> | null = null;

	function onClose() {
		MapMarkerController.unselect();
	}
</script>

<Dialog isVisible={!!navDevice} fullHeight={true} on:close={onClose}>
	<h3>Nav device</h3>
	<p>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec consectetur, nisl eget
		consectetur tempor, nisl nunc ultrices eros, eu porttitor nisl nunc eget nisl.
	</p>
</Dialog>
