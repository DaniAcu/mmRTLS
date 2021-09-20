<script lang="ts">
	import BeaconPosition from './steps/BeaconPosition.svelte';
	import BeaconInfo from './steps/BeaconInfo.svelte';
	import { menuActions } from '$src/components/Menu/menu.stream';
	import { useSaveBeacon } from './beacon.hook';

	let step = 1;
	const saveBeacon = useSaveBeacon();

	const next = () => step++;
	const prev = () => step--;
	const reset = () => (step = 1);

	const onClose = () => {
		menuActions.next(null);
	};

	const onSave = () => {
		saveBeacon();
		reset();
	};
</script>

{#if step === 1}
	<BeaconPosition on:previous={onClose} on:next={next} />
{:else if step === 2}
	<BeaconInfo on:previous={prev} on:next={onSave} />
{/if}
